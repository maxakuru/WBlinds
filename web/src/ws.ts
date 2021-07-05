import { EventFlagStringIndices, OrderedEventFlags } from "./eventFlags";
import { debug } from "./util";

/**
 * Matches `wsmessage_t` enum in src/state.h
 */
export const enum WSEventType {
  State = 0,
  Setting = 1,
  Calibration = 2,
}

interface WSEventBase {
  mac: string;
}
export interface WSUpdateSettingsEvent extends WSEventBase {
  todo?: true;
}

export interface WSUpdateStateEvent extends WSEventBase {
  tPos?: number;
  pos?: number;
  speed?: number;
  accel?: number;
}

/**
 * 0 = stop after current move completes
 * 1 = stop immediate
 */
type MoveStopType = 0 | 1;

export interface WSCalibrationEvent extends WSEventBase {
  moveBy?: number;
  stop?: MoveStopType;
}

export interface WSEventMap {
  [WSEventType.State]: WSUpdateStateEvent;
  [WSEventType.Setting]: WSUpdateSettingsEvent;
  [WSEventType.Calibration]: WSCalibrationEvent;
}

/**
 * Message from ESP to web UI telling of state update.
 *
 * Used right now to inform of changes of position,
 * when moving to target position from current position.
 */
export interface WSIncomingStateEvent {
  type: WSEventType.State;
  mac: string;
  data: {
    tPos?: number;
    pos?: number;
    accel?: number;
    speed?: number;
    [key: string]: number;
  };
}

/**
 * Incoming settings event
 * Not currently used
 */
export interface WSIncomingSettingsEvent {
  type: WSEventType.Setting;
  mac: string;
  data: {
    deviceName?: string;
    mDnsName?: string;
    emitSyncData?: boolean;
    pinStep?: number;
    [key: string]: string | boolean | number;
  };
}
export type WSIncomingEvent = WSIncomingStateEvent | WSIncomingSettingsEvent;

/**
 * WSController
 */
export interface WSController {
  ws: WebSocket;
  // push(event: WSEventType.UpdateSettings, data: WSUpdateSettingsEvent): void;
  push(event: WSEventType.State, data: WSUpdateStateEvent): void;
}

/**
 * WSOptions
 */
export interface WSOptions {
  onDisconnect?(e: CloseEvent, reconnectAttempt: number): void;
  onConnect?(e: Event, reconnectAttempt: number): void;
  onMessage?(e: WSIncomingEvent): void;
  onError?(e: any, reconnectAttempt: number): void;
}

export const makeWebsocket = (opts: WSOptions = {}): WSController => {
  let ws: WebSocket;
  let _enabled = false;
  let _reconnectAttempt = 0;
  const { onMessage: oM, onDisconnect: oD, onConnect: oC, onError: oE } = opts;
  const _hasOnError = !!oE;
  const _hasOnConnect = !!oC;
  const _hasOnMessage = !!oM;
  const _hasOnDisconnect = !!oD;

  const connect = () => {
    ws = new WebSocket(
      `ws://${process.env.WS_ENDPOINT || location.hostname}/ws`
    );
    ws.onopen = (e: Event) => {
      debug("[ws] onOpen(): ", e);
      _enabled = true;
      _reconnectAttempt = 0;
      if (_hasOnConnect) oC(e, _reconnectAttempt);
    };

    ws.onclose = (e: CloseEvent) => {
      debug("[ws] onClose(): ", e);
      _enabled = false;

      if (_hasOnDisconnect) oD(e, _reconnectAttempt);
      setTimeout(connect, Math.min(5000 * ++_reconnectAttempt, 60000));
    };

    ws.onmessage = (e: MessageEvent<any>) => {
      debug("[ws] onMessage(): ", e, e.data);
      const unpacked = unpackMessages(e.data);
      if (_hasOnMessage) {
        unpacked.forEach(oM);
      }
    };

    ws.onerror = (e: any) => {
      debug("[ws] onError(): ", e);
      _enabled = false;
      _hasOnError && oE(e, _reconnectAttempt);
    };
  };

  connect();

  /**
   * Order matters for events, this is the expected data.
   * If undefined, it becomes a 0 in the event flags mask.
   * @param data
   * @returns
   */
  const sortData = <K extends WSEventType, D extends WSEventMap[K]>(
    ev: K,
    data: D
  ): number[] => {
    if (ev === WSEventType.State) {
      const d = data as WSUpdateStateEvent;
      return [d.pos, d.tPos, d.speed, d.accel];
    }
    if (ev === WSEventType.Calibration) {
      const d = data as WSCalibrationEvent;
      return [d.moveBy, d.stop];
    }
    return [];
  };

  const push = <K extends WSEventType, D extends WSEventMap[K]>(
    ev: K,
    data: D
  ) => {
    debug("[ws] push(): ", ev, data);
    if (_enabled) {
      const s = packMessage(ev, data.mac, sortData(ev, data));
      debug("[ws] push() str: ", s);
      ws.send(s);
    }
  };

  function packMessage(ev: WSEventType, mac: string, data: number[]): string {
    switch (ev) {
      case WSEventType.State: {
        const f: (0 | 1)[] = [];
        let s = "";
        for (const k in data) {
          const d = data[k];
          if (d != null) {
            s += `${d}/`;
            f.push(1);
          } else {
            f.push(0);
          }
        }
        debug("[packMessage] f: ", f);
        const flags = parseInt(f.reverse().join(""), 2);
        return `${mac}/${ev}/${flags}/${s}`;
      }
      default: {
        const e = "Unexpected event type";
        if (_hasOnError) oE(e, 0);
        else console.error(e);
      }
    }
  }

  function unpackMessages(data: string): WSIncomingEvent[] {
    // TODO: convert string message to object
    debug("unpackMessages: ", data);
    const spl = data.split("/");
    // eslint-disable-next-line prefer-const
    let [mac, type, mask]: [string, number, number] = spl as [
      string,
      number,
      number
    ];
    type = parseInt(type as unknown as string);
    mask = parseInt(mask as unknown as string);

    // Check the message contents before unpacking.
    // It should have the same number of data segments
    // as bits flipped in the mask.
    const bits = mask.toString(2).split("1").length - 1;
    if (bits !== spl.length - 4) {
      if (_hasOnError) oE("Event flags and data don't match", 0);
    }

    // const type = parseInt(spl.shift());
    // const mask = parseInt(spl.shift());

    // for each event flag, add to corresponding event
    const stateEvData: WSIncomingStateEvent["data"] = {};
    const settingsEvData: WSIncomingSettingsEvent["data"] = {};

    // Right now this loop handles any incoming event.
    // In the future, may be better to drop the ordered flags list
    // and use the event type & a switch.
    let j = 1;
    for (
      let i = 3, len = OrderedEventFlags.length;
      i < len && spl.length > 0;
      i++
    ) {
      if (j & mask) {
        const k = OrderedEventFlags[i];
        const v = spl.shift();
        if (i < 4) {
          // All state updates are numbers
          stateEvData[k] = parseInt(v);
        } else {
          // Some settings are strings, most are numbers.
          // Some are also bools, but will be parsed as
          // ints and used as 0/1, just can't do strict
          // equivalence checks.
          settingsEvData[k] = i in EventFlagStringIndices ? v : parseInt(v);
        }
      }
      j = j << 1;
    }

    const evs: WSIncomingEvent[] = [];
    if (Object.keys(stateEvData).length > 0) {
      evs.push({
        type: WSEventType.State,
        mac,
        data: stateEvData,
      });
    }
    if (Object.keys(settingsEvData).length > 0) {
      evs.push({
        type: WSEventType.Setting,
        mac,
        data: settingsEvData,
      });
    }

    return evs;
  }

  return { ws, push };
};
