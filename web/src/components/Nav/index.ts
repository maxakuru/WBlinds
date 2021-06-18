import { ComponentFunction, Component } from "../Component";
import template from "./Nav.html";
import "./Nav.css";
import { addClass, removeClass } from "@Util";

type ClickHandler = (index: number) => unknown;
interface NavAPI {
  onClick: (handler: ClickHandler) => void;
  currentIndex(): number;
  destroy(): void;
}

const _Nav: ComponentFunction<NavAPI> = function () {
  let _i = 0;
  let _clickHandlers: ClickHandler[] = [];

  this.init = function (elem: HTMLElement) {
    const buttons = elem.querySelectorAll("li");
    buttons.forEach((b, index) => {
      b.addEventListener("click", () => {
        _i = index;
        buttons.forEach((b2, i2) => {
          if (i2 === _i) {
            addClass(b2, "sel");
          } else {
            removeClass(b2, "sel");
          }
        });
        _clickHandlers.map((c) => c.call(undefined, index));
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
    };
  };
  return template;
};

export type Nav = Component<NavAPI>;
export const Nav = Component(_Nav);
