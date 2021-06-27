import run from "./src";
import "./index.css";
import { initNamespace } from "namespace";

const ns = initNamespace(window);
window.onload = () => run(ns);
