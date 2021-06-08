import { _Component, Component } from "./Component";
import html from "./Nav.html";

type ClickHandler = (index: number) => unknown;
interface NavAPI {
  onClick: (handler: ClickHandler) => void;
  currentIndex(): number;
}

const Nav: Component<NavAPI> = function () {
  const clickHandlers: ClickHandler[] = [];
  let i = 0;

  this.init = function (elem: HTMLElement) {
    console.log("elem: ", elem);
    const buttons = elem.querySelectorAll("li");
    console.log("buttons: ", buttons);
    buttons.forEach((b, index) => {
      b.addEventListener("click", () => {
        i = index;
        buttons.forEach((b2, i2) => {
          if (i2 === i) {
            b2.classList.add("sel");
          } else {
            b2.classList.remove("sel");
          }
        });
        clickHandlers.map((c) => c.call(undefined, index));
      });
    });

    return {
      onClick: (h) => {
        clickHandlers.push(h);
      },
      currentIndex: () => i,
    };
  };
  return html;
};

export default _Component(Nav);
