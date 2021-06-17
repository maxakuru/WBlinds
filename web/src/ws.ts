import { OrderedEventFlags } from "./eventFlags";
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
  tPos?: number;
  pos?: number;
  accel?: number;
  speed?: number;
}
export interface WSIncomingSettingsEvent {
  type: WSEventType.UpdateSettings;
  mac: string;
  deviceName?: number;
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
    ws = new WebSocket(`ws://${window.location.hostname}/ws`);
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
    console.log("unpackMessages: ", data);
    const spl = data.split("/");
    const mac = spl.shift();
    const mask = parseInt(spl.shift());
    // for each event flag, add to event
    const stateEv: WSIncomingStateEvent = {
      type: WSEventType.UpdateState,
      mac,
    };
    const settingsEv: WSIncomingSettingsEvent = {
      type: WSEventType.UpdateSettings,
      mac,
    };

    let j = 1;
    for (let i = 0, len = OrderedEventFlags.length; i < len; i++) {
      if (j & mask) {
        const v = spl.shift();
        if (i < 4) {
          const k = OrderedEventFlags[i];
          stateEv[k as "pos"] = parseInt(v);
        } else {
          const k = OrderedEventFlags[i];
          settingsEv[k as "deviceName"] = parseInt(v);
        }
      }
      j = j << 1;
    }

    return [stateEv, settingsEv].filter((e) => Object.keys(e).length > 2);
  }

  return { ws, push };
}
