import _home from "./home";
import _clock from "./clock";
import _cog from "./cog";
import { SVGDef } from "./type";
import { addClass, appendChild, createElement } from "min";

const makeSvg = (d: SVGDef): any => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("fill", "currentColor");
  path.setAttribute("d", d.data);
  svg.setAttribute("viewBox", d.box);

  appendChild(svg as any, path as any);
  //   addClass(svg as any, "ic-w");
  svg.style.width = `${d.w}px`;
  return svg;
};
export const home = makeSvg(_home);
export const clock = makeSvg(_clock);
export const cog = makeSvg(_cog);
