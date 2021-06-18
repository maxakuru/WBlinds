import { ComponentFunction, Component } from "@Components";
import template from "./Selector.html";
import "./Selector.css";
import { addClass, appendChild, createDiv, removeClass } from "@Util";

export type ChangeHandler = (index: number) => unknown;
export interface SelectorAPI {
  onChange(h: ChangeHandler): void;
  destroy(): void;
  index(): number;
}

interface SelectorProps {
  items: string[];
}

const _Selector: ComponentFunction<SelectorAPI, SelectorProps> = function ({
  items,
}: SelectorProps) {
  let _index = 0;
  let _changeHandlers: ChangeHandler[] = [];
  let _items: HTMLElement[] = [];

  this.init = function (elem: HTMLElement) {
    function onChange(h: ChangeHandler) {
      _changeHandlers.push(h);
    }

    items.map((i, index) => {
      const e = createDiv();
      e.innerText = i;
      index === _index && addClass(e, "sel");
      e.onclick = () => {
        removeClass(_items[_index], "sel");
        _index = index;
        addClass(e, "sel");
        _changeHandlers.map((c) => c(index));
      };
      _items.push(e);
      appendChild(elem, e);
    });

    return {
      destroy: () => {
        _changeHandlers = [];
        _index = 0;
        _items = [];
      },
      index: () => {
        return _index;
      },
      onChange,
    };
  };
  return template;
};

export type Selector = Component<SelectorAPI>;
export const Selector = Component(_Selector);
