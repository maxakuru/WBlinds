import { WBlindsNamespace } from "../src/namespace";

declare global {
  interface Window {
    wblinds: WBlindsNamespace;
    sty: (id: string, options?: any) => void;
  }
}

export {};
