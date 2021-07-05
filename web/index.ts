// import run from "./src";
// import { inject } from "./style-inject";
// window.stynj = inject;
import { initNamespace } from "namespace";
import "./index.css";

const ns = initNamespace(window);
window.onload = async () => {
  const { run } = await import("./src/app.js");
  console.log("run: ", run);
  run(ns);
};
