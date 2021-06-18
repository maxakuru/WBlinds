import { ComponentFunction, Component } from "../Component";
import template from "./Nav.html";
import "./Nav.css";

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
    console.log("elem: ", elem);
    const buttons = elem.querySelectorAll("li");
    console.log("buttons: ", buttons);
    buttons.forEach((b, index) => {
      b.addEventListener("click", () => {
        _i = index;
        buttons.forEach((b2, i2) => {
          if (i2 === _i) {
            b2.classList.add("sel");
          } else {
            b2.classList.remove("sel");
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
