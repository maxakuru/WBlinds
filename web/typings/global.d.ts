import { WBlindsNamespace } from "../src/namespace";

declare global {
  interface Window {
    wblinds: WBlindsNamespace;
    stynj: (id: string, options?: any) => void;
    x: (path: string) => any;
  }
}

export {};
