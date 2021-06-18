import { State } from "./state";

export interface WBlindsNamespace {
  state?: State;
}

export function addToNamespace<
  K extends keyof WBlindsNamespace,
  V extends WBlindsNamespace[K]
>(key: K, value: V): void {
  window.wblinds[key] = value;
}
