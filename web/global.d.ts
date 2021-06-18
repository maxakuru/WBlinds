import { WBlindsNamespace } from "./src/namespace";

declare global {
  interface Window {
    wblinds: WBlindsNamespace;
  }
}

export {};
