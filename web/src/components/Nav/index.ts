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

interface NavLabel {
  /**
   * Title
   */
  t: string;
  /**
   * Icon
   */
  i: string;
}

interface NavProps {
  labels: NavLabel[];
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
      addClass(l, "fC");

      if (i === _i) {
        addClass(l, "sel");
      }

      // Add icon
      const ic = createElement("i");
      ic.innerHTML = label.i;
      appendChild(l, ic);

      // Add label
      const p = createElement("p");
      addClass(p, "l");
      p.innerText = label.t;
      appendChild(l, p);

      _lis.push(l);
      appendChild(elem, l);
      l.onclick = () => setIndex(i);
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
