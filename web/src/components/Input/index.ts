import { ComponentFunction, Component } from "../Component";
import template from "./Input.html";
import "./Input.css";
import { appendChild, createElement, querySelector } from "../../util";

type ClickHandler = (data: InputProps) => unknown;
export interface InputAPI {
  onClick: (handler: ClickHandler) => void;
  destroy(): void;
}

export const enum InputType {
  String = 0,
  Boolean = 1,
  Number = 2,
  Enum = 3,
}

const InputTypeMap: Record<InputType, string> = {
  [InputType.String]: "text",
  [InputType.Boolean]: "checkbox",
  [InputType.Number]: "number",
  [InputType.Enum]: "select",
};

type InputProps =
  | {
      label: string;
      type: InputType.Enum;
      enumOpts: any[];
      value: any;
    }
  | {
      label: string;
      type: Exclude<InputType, InputType.Enum>;
      enumOpts?: any[];
      value: any;
    };

const _Input: ComponentFunction<InputAPI, InputProps> = function ({
  label,
  type,
  enumOpts,
  value,
}: InputProps) {
  let _clickHandlers: ClickHandler[] = [];

  this.init = function (elem: HTMLElement) {
    const id = `cb-${label.split(" ").join("-")}`;
    const l = elem.firstChild as HTMLLabelElement;
    l.innerText = label;
    l.htmlFor = id;

    const input = createElement("input");
    input.type = InputTypeMap[type];
    input.placeholder = "placeholder";
    input.id = id;
    if (type === InputType.Boolean) {
      input.checked = value;
      value && input.classList.add("on");
      input.onchange = () => {
        input.classList.toggle("on");
      };
    }

    appendChild(elem, input);
    return {
      onClick: (h) => {
        _clickHandlers.push(h);
      },
      destroy: () => {
        _clickHandlers = [];
      },
    };
  };
  return template;
};

export type Input = Component<InputAPI>;
export const Input = Component(_Input);
