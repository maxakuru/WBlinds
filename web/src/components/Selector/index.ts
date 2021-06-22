import { ComponentFunction, Component } from "../Component";
import template from "./Selector.html";
import "./Selector.css";
import {
  addClass,
  appendChild,
  createDiv,
  getQueryParam,
  onQueryChange,
  pushToHistory,
  removeClass,
} from "@Util";
import { UNDEF } from "min";

export type ChangeHandler = (index: number) => unknown;
export interface SelectorAPI {
  onChange(h: ChangeHandler): void;
  destroy(): void;
  index(): number;
  setIndex(ind: number): void;
}

interface SelectorProps {
  items: string[];
  queries: string[];
}

const _Selector: ComponentFunction<SelectorAPI, SelectorProps> = function ({
  items,
  queries,
}: SelectorProps) {
  let _index = 0;
  let _changeHandlers: ChangeHandler[] = [];
  let _items: HTMLElement[] = [];

  this.init = (elem: HTMLElement) => {
    const onChange = (h: ChangeHandler) => {
      _changeHandlers.push(h);
    };

    const handleQueryChange = () => {
      if (queries.length < 1) return;
      let tab = getQueryParam("tab");
      tab = tab && tab.toLowerCase();
      let ind = queries.indexOf(tab);
      console.log("handleQueryChange: ", ind);
      if (ind < 0) ind = 0;
      if (_index !== ind) _onChange(ind);
    };

    const removeQh = onQueryChange(handleQueryChange);

    const _onClick = (index: number) => {
      queries[index] && pushToHistory(undefined, { tab: queries[index] });
      _onChange(index);
    };

    const _onChange = (index: number) => {
      removeClass(_items[_index], "sel");
      _index = index;
      addClass(_items[_index], "sel");
      _changeHandlers.map((c) => c(index));
    };

    items.map((i, index) => {
      const e = createDiv();
      e.innerText = i;
      index === _index && addClass(e, "sel");
      e.onclick = () => _onClick(index);
      _items.push(e);
      appendChild(elem, e);
    });

    handleQueryChange();

    return {
      destroy: () => {
        removeQh();
        _changeHandlers = [];
        _index = 0;
        _items = [];
      },
      index: () => {
        return _index;
      },
      onChange,
      setIndex: (index: number) => {
        _onClick(index);
      },
    };
  };
  return template;
};

export type Selector = Component<SelectorAPI>;
export const Selector = Component(_Selector);
