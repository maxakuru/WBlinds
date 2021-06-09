import run from "./src/index";
import { WBlindsNamespace } from "./src/types";
import "./index.css";

const ns: WBlindsNamespace = {
  test: true,
};
(window as any).wblinds = ns;
window.onload = () => run(ns);

const elem = document.querySelector<HTMLElement>("#card");
let draggingCard = false;
elem.onmousedown = (e) => {
  console.log("dragstart: ", e);
  draggingCard = true;
};
elem.onmouseup = () => {
  draggingCard = false;
};
elem.onmouseout = () => {
  draggingCard = false;
};
elem.onmouseleave = () => {
  draggingCard = false;
};
elem.onmousemove = (e) => {
  if (draggingCard) console.log("drag move: ", e);
};

elem.ontouchstart = (e) => {
  console.log("touch start: ", e);
};
elem.ontouchmove = (e) => {
  console.log("touch move: ", e);
};
elem.ontouchend = (e) => {
  console.log("touch end: ", e);
};
