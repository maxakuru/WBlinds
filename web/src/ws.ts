import { EventFlagStringIndices, OrderedEventFlags } from "./eventFlags";
import { debug } from "./util";

export interface WSController {
  ws: WebSocket;
  push(event: WSEventType.UpdateSettings, data: WSUpdateSettingsEvent): void;
  push(event: WSEventType.UpdateState, data: WSUpdateStateEvent): void;
}

export const enum WSEventType {
  UpdateSettings = 0,
  UpdateState = 1,
}

export interface WSUpdateSettingsEvent {
  test?: boolean;
}

export interface WSUpdateStateEvent {
  test?: boolean;
}

export interface WSIncomingStateEvent {
  type: WSEventType.UpdateState;
  mac: string;
  data: {
    tPos?: number;
    pos?: number;
    accel?: number;
    speed?: number;
    [key: string]: number;
  };
}
export interface WSIncomingSettingsEvent {
  type: WSEventType.UpdateSettings;
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

export interface WSOptions {
  onDisconnect?(e: CloseEvent, reconnectAttempt: number): void;
  onConnect?(e: Event, reconnectAttempt: number): void;
  onMessage?(e: WSIncomingEvent): void;
  onError?(e: any, reconnectAttempt: number): void;
}

export function makeWebsocket(opts: WSOptions = {}): WSController {
  let ws: WebSocket;
  let _enabled = false;
  let _reconnectAttempt = 0;

  connect();

  function connect() {
    ws = new WebSocket(
      `ws://${process.env.WS_ENDPOINT || window.location.hostname}/ws`
    );
    ws.onopen = (e: Event) => {
      debug("[ws] onOpen(): ", e);
      _enabled = true;
      _reconnectAttempt = 0;
      // TODO: reconnected event
      opts.onConnect && opts.onConnect(e, _reconnectAttempt);
    };

    ws.onclose = (e: CloseEvent) => {
      debug("[ws] onClose(): ", e);
      _enabled = false;

      // TODO: disconnect event
      // TODO: reconnect
      opts.onDisconnect && opts.onDisconnect(e, _reconnectAttempt);
      setTimeout(connect, Math.min(5000 * ++_reconnectAttempt, 60000));
    };

    ws.onmessage = (e: MessageEvent<any>) => {
      debug("[ws] onMessage(): ", e, e.data);
      // TODO: parse packed message
      const unpacked = unpackMessages(e.data);
      if (opts.onMessage) {
        unpacked.map((m) => opts.onMessage(m));
      }
    };

    ws.onerror = (e: any) => {
      debug("[ws] onError(): ", e);
      _enabled = false;
      opts.onError && opts.onError(e, _reconnectAttempt);
    };
  }

  const push = (
    ev: WSEventType,
    data: WSUpdateSettingsEvent | WSUpdateStateEvent
  ) => {
    debug("[ws] push(): ", ev, data);
    if (_enabled) {
      ws.send(packMessage(ev, data));
    }
  };

  function packMessage(ev: any, data: any): string {
    // TODO: create ArrayBuffer from data
    return "";
  }

  function unpackMessages(data: string): WSIncomingEvent[] {
    // TODO: convert string message to object
    debug("unpackMessages: ", data);
    const spl = data.split("/");
    const mac = spl.shift();
    const mask = parseInt(spl.shift());
    // for each event flag, add to event
    const stateEvData: WSIncomingStateEvent["data"] = {};
    const settingsEvData: WSIncomingSettingsEvent["data"] = {};

    let j = 1;
    for (
      let i = 0, len = OrderedEventFlags.length;
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
        type: WSEventType.UpdateState,
        mac,
        data: stateEvData,
      });
    }
    if (Object.keys(settingsEvData).length > 0) {
      evs.push({
        type: WSEventType.UpdateSettings,
        mac,
        data: settingsEvData,
      });
    }

    return evs;
  }

  return { ws, push };
}
