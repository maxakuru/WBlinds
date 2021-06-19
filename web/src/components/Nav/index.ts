import { ComponentFunction, Component } from "../Component";
import template from "./Nav.html";
import "./Nav.css";
import { addClass, removeClass } from "@Util";
import { appendChild, createDiv, createElement } from "min";

type ClickHandler = (index: number) => unknown;
interface NavAPI {
  onClick: (handler: ClickHandler) => void;
  currentIndex(): number;
  setIndex: (index: number) => void;
  destroy(): void;
}

interface NavProps {
  labels: string[];
}

const _Nav: ComponentFunction<NavAPI, NavProps> = function ({ labels }) {
  let _i = 0;
  let _clickHandlers: ClickHandler[] = [];
  const _lis: HTMLElement[] = [];

  this.init = (elem: HTMLElement) => {
    const setIndex = (index: number) => {
      _i = index;
      _lis.forEach((l2, i2) => {
        if (i2 === _i) addClass(l2, "sel");
        else removeClass(l2, "sel");
      });
      _clickHandlers.map((c) => c(index));
    };

    labels.map((label, i) => {
      const l = createElement("li");
      if (i === _i) {
        addClass(l, "sel");
      }
      l.innerText = label;
      _lis.push(l);
      appendChild(elem, l);

      l.addEventListener("click", () => {
        setIndex(i);
      });
    });

    return {
      onClick: (h) => {
        _clickHandlers.push(h);
      },
      currentIndex: () => _i,
      destroy: () => {
        _clickHandlers = [];
      },
      setIndex,
    };
  };
  return template;
};

export type Nav = Component<NavAPI>;
export const Nav = Component(_Nav);
