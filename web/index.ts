import run from "./src/index";
import { WBlindsNamespace } from "./src/types";
import "./index.css";

const ns: WBlindsNamespace = {
  test: true,
};
(window as any).wblinds = ns;
window.onload = () => run(ns);
