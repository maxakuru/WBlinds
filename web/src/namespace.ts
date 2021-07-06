import type { ToastContainer } from "@Components";
import type { State, StateData } from "./state";

export interface WBlindsNamespace {
  state: State;
  tc: ToastContainer;
  inj: InjectedNamespace;
}

export interface InjectedNamespace {
  state?: Partial<StateData>;
  mac?: string;
  ip?: string;
}

export const initNamespace = (w: Window): WBlindsNamespace => {
  // TODO: Make inital load slimmer, load chunks after initial load,
  // embed script that allows namespace to be seeded from ESP web server.
  // This would allow skipping the call to get general settings (mac, ip, etc.)
  // but would mean no gzipping, so it would have to be slim as possible.
  // const inject: InjectedNamespace = JSON.parse((w.wblinds as string) || "{}");
  // debug("injecting namespace: ", inject);
  // const ns = (w.wblinds = inject);

  const ns = (w.wblinds = w.wblinds || ({} as any));
  return ns;
};
