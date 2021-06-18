import { ComponentFunction, Component } from "../Component";
import template from "./Selector.html";
import "./Selector.css";
import { appendChild, createDiv } from "../../util";

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
      index === _index && e.classList.add("sel");
      e.onclick = () => {
        _items[_index].classList.remove("sel");
        _index = index;
        e.classList.add("sel");
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
