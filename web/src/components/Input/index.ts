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
    }
  | {
      label: string;
      type: Exclude<InputType, InputType.Enum>;
      enumOpts?: any[];
    };

const _Input: ComponentFunction<InputAPI, InputProps> = function ({
  label,
  type,
  enumOpts,
}: InputProps) {
  let _clickHandlers: ClickHandler[] = [];

  this.init = function (elem: HTMLElement) {
    (elem.firstChild as HTMLElement).innerText = label;

    const input = createElement("input");
    input.type = InputTypeMap[type];
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
