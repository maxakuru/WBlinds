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
  isDirty(): boolean;
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

interface EnumOption {
  // label
  l: string;
  // value
  v: any;
}

type InputProps = { min?: number; max?: number; step?: number } & (
  | {
      label: string;
      type: typeof InputType_Enum;
      enumOpts: EnumOption[];
      value: any;
      placeholder?: string;
    }
  | {
      label: string;
      type: Exclude<InputType, typeof InputType_Enum>;
      enumOpts?: EnumOption[];
      value: any;
      placeholder?: string;
    }
);

const _Input: ComponentFunction<InputAPI, InputProps> = function ({
  label,
  type,
  enumOpts,
  placeholder,
  value,
}: InputProps) {
  const _valid = true;
  let _currentValue = value;
  const _firstValue = value;
  let _onChangeHandlers: ChangeHandler[] = [];

  this.init = (elem: HTMLElement) => {
    const id = `cb-${label.split(" ").join("-")}`;
    const l = elem.firstChild as HTMLLabelElement;
    l.innerText = label;
    l.htmlFor = id;

    // const input =
    //   type === InputType_Enum
    //     ? createElement("select")
    //     : createElement("input");
    let input: HTMLInputElement | HTMLSelectElement;
    if (type === InputType_Enum) {
      // make select with options
      input = createElement("select");
      enumOpts.forEach((o) => {
        const opt = createElement("option");
        opt.value = o.v;
        opt.innerText = o.l;
        appendChild(input, opt);
      });
    } else {
      input = createElement("input");
      input.type = InputTypeMap[type];
      input.placeholder = placeholder || "xxxxx";
    }

    if (type === InputType_Boolean || type === InputType_Enum) {
      // checkbox/select inputs, use checked for bool, value for enum
      (input as HTMLInputElement).checked = value;
      value && addClass(input, "on");
      input.onchange = (e) => {
        toggleClass(input, "on");
        if (type === InputType_Boolean)
          _onChange((input as HTMLInputElement).checked);
        else _onChange(input.value);
      };
    } else {
      // text/number inputs
      input.oninput = () => _onChange(input.value);
      // set initial value
      if (value != null) input.value = value;
    }

    input.id = id;

    const _showError = (err: string) => {
      // TODO:
    };

    function _onChange(v: any) {
      if (v === "") v = undefined;
      _currentValue = v;
      const err = _validate();
      if (err) {
        return _showError(err);
      }
      _onChangeHandlers.forEach((h) => h(_currentValue));
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
      isDirty: () => {
        console.log(
          "input is dirty? ",
          _firstValue,
          input.value,
          _currentValue,
          _firstValue !== _currentValue
        );
        return _firstValue !== _currentValue;
      },
    };
  };
  return template;
};

export type Input = Component<InputAPI>;
export const Input = Component(_Input);
