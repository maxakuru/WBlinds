import { ComponentFunction, Component } from "../Component";
import template from "./Input.html";
import "./Input.css";
import {
  addClass,
  appendChild,
  createElement,
  querySelector,
  toggleClass,
} from "@Util";

type ChangeHandler = (newVal: any) => unknown;
export interface InputAPI {
  onChange: (handler: ChangeHandler) => void;
  setDisabled(v: boolean): void;
  destroy(): void;
}

export const InputType_Number = 0;
export const InputType_String = 1;
export const InputType_Boolean = 2;
export const InputType_Enum = 3;
export const InputType_Password = 4;
export type InputType = 0 | 1 | 2 | 3 | 4;

const InputTypeMap: Record<InputType, string> = {
  [InputType_String]: "text",
  [InputType_Boolean]: "checkbox",
  [InputType_Number]: "number",
  [InputType_Enum]: "select",
  [InputType_Password]: "password",
};

type InputProps =
  | {
      label: string;
      type: typeof InputType_Enum;
      enumOpts: any[];
      value: any;
    }
  | {
      label: string;
      type: Exclude<InputType, typeof InputType_Enum>;
      enumOpts?: any[];
      value: any;
    };

const _Input: ComponentFunction<InputAPI, InputProps> = function ({
  label,
  type,
  enumOpts,
  value,
}: InputProps) {
  const _valid = true;
  let _onChangeHandlers: ChangeHandler[] = [];

  this.init = (elem: HTMLElement) => {
    const id = `cb-${label.split(" ").join("-")}`;
    const l = elem.firstChild as HTMLLabelElement;
    l.innerText = label;
    l.htmlFor = id;

    const input = createElement("input");
    input.type = InputTypeMap[type];
    input.placeholder = "placeholder";
    input.id = id;
    input.value = value;
    value && addClass(input, "on");
    if (type === InputType_Boolean) {
      input.checked = value;
      input.onchange = (e) => {
        toggleClass(input, "on");
        _onChange(e);
      };
    } else {
      // input.on
      input.oninput = _onChange;
    }

    const _showError = (err: string) => {
      // TODO:
    };

    function _onChange(e: Event) {
      const err = _validate();
      if (err) {
        return _showError(err);
      }
      _onChangeHandlers.map((h) => h((e.target as any).value));
    }

    const setDisabled = (val: boolean) => {
      input.disabled = val;
    };

    function _validate(): string | undefined {
      // TODO: show error hint
      return;
    }

    appendChild(elem, input);
    return {
      onChange: (h) => {
        _onChangeHandlers.push(h);
      },
      setDisabled,
      destroy: () => {
        _onChangeHandlers = [];
      },
    };
  };
  return template;
};

export type Input = Component<InputAPI>;
export const Input = Component(_Input);
