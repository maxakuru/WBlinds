import run from "./src";
import { WBlindsNamespace } from "./src/namespace";
import "./index.css";

const ns = (window.wblinds = {});
window.onload = () => run(ns);
