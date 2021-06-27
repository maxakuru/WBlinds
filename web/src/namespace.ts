import { debug } from "@Util";
import { State } from "./state";

export interface WBlindsNamespace {
  state?: State;
}

interface InjectedNamespace {
  state?: any;
}

export const initNamespace = (w: Window): WBlindsNamespace => {
  const inject: InjectedNamespace = JSON.parse((w.wblinds as string) || "{}");
  debug("injecting namespace: ", inject);
  const ns = (w.wblinds = inject);
  console.log("window: ", w);
  return ns;
};
