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

export interface WSIncomingEvent {
  test?: boolean;
}

export interface WSOptions {
  onDisconnect?(e: CloseEvent, reconnectAttempt: number): void;
  onConnect?(e: Event, reconnectAttempt: number): void;
  onMessage?(msg: WSIncomingEvent, reconnectAttempt: number): void;
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
      const unpacked = unpackMessage(e.data);
      opts.onMessage && opts.onMessage(e as any, _reconnectAttempt);
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

  function unpackMessage(data: string): any {
    // TODO: convert string message to object
  }

  return { ws, push };
}
