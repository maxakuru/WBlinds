// import run from "./src";
// import { inject } from "./style-inject";
// window.stynj = inject;
import { appendChild, createElement, getElement } from "min";
import { initNamespace } from "namespace";
import "./index.css";

const ns = initNamespace(window);
window.onload = async () => {
  // #_fr shows a mock screen in css until app.js loads
  const { run } = await import("./src/app.js");
  console.log("run: ", run);
  run(ns);
};
