// import run from "./src";
import { inject } from "./style-inject";
window.stynj = inject;
import "./index.css";
import { initNamespace } from "namespace";

const ns = initNamespace(window);
window.onload = async () => {
  const { default: run } = await import("./src/app.js");
  run(ns);
};
