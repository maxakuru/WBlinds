import { ComponentFunction, Component } from "../Component";
import template from "./Input.html";
import "./Input.css";
import {
  addClass,
  appendChild,
  createElement,
  debug,
  isNullish,
  querySelector,
  toggleClass,
} from "@Util";

type ChangeHandler = (newVal: any) => unknown;
export interface InputAPI {
  onChange: (handler: ChangeHandler) => void;
  setDisabled(v: boolean): void;
  reset(): void;
  destroy(): void;
  isDirty(): boolean;
  setValue(value: any): void;
}

export const InputType_Number = 0;
export const InputType_String = 1;
export const InputType_Boolean = 2;
export const InputType_Enum = 3;
export const InputType_Password = 4;
export const InputType_Range = 5;

export type InputType = 0 | 1 | 2 | 3 | 4 | 5;

const InputTypeMap: Record<InputType, string> = {
  [InputType_String]: "text",
  [InputType_Boolean]: "checkbox",
  [InputType_Number]: "number",
  [InputType_Enum]: "select",
  [InputType_Password]: "password",
  [InputType_Range]: "range",
};

interface EnumOption {
  // label
  l: string;
  // value
  v: any;
}

type InputProps = {
  min?: number;
  max?: number;
  unit?: string;
  // Embed label and input in a single line
  embed?: boolean;
  prevDefault?: boolean;
} & (
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
  unit,
  embed = true,
  prevDefault = false,
  min,
  max,
}: InputProps) {
  const _valid = true;
  let _currentValue = value;
  const _firstValue = value;
  let _input: HTMLInputElement | HTMLSelectElement;
  let _onChangeHandlers: ChangeHandler[] = [];

  const setup = (elem: HTMLElement) => {
    debug(
      "input data: ",
      label,
      type,
      enumOpts,
      placeholder,
      value,
      unit,
      embed,
      prevDefault,
      min,
      max
    );
    elem.innerHTML = "";
    if (embed) {
      addClass(elem, "in");
    }
    const l = createElement("label");
    l.innerText = label;
    appendChild(elem, l);

    if (type === InputType_Enum) {
      // make select with options
      _input = createElement("select");
      addClass(elem, "in-s");
      enumOpts.forEach((o) => {
        const opt = createElement("option");
        opt.value = o.v;
        opt.innerText = o.l;
        appendChild(_input, opt);
      });
      _input.onchange = (e) => {
        if (prevDefault) e.preventDefault();
        _onChange(
          enumOpts[(_input as HTMLSelectElement).options.selectedIndex].v
        );
      };
    } else {
      // all others are input type
      _input = createElement("input");
      _input.type = InputTypeMap[type];
      _input.placeholder = placeholder || "xxxxx";
      if (!isNullish(min)) _input.min = `${min}`;
      if (!isNullish(max)) _input.max = `${max}`;

      if (type === InputType_Range) {
        addClass(_input, "in-r");
      }

      if (type === InputType_Boolean) {
        // checkbox/select inputs, use checked for bool, value for enum
        (_input as HTMLInputElement).checked = value;
        value && addClass(_input, "on");
        _input.onchange = (e) => {
          if (prevDefault) e.preventDefault();
          toggleClass(_input, "on");
          _onChange((_input as HTMLInputElement).checked);
        };
      } else {
        // text/number inputs
        _input.onchange = (e) => {
          if (prevDefault) e.preventDefault();
          _onChange(_input.value);
        };
      }
    }
    // set initial value
    if (value != null) _input.value = value;

    _input.id = l.htmlFor = `in-${label.split(" ").join("-")}`;
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

    function _validate(): string | undefined {
      // TODO: show error hint
      return;
    }

    appendChild(elem, _input);

    // Add unit if it exists,
    // or an arrow for selects.
    if (type === InputType_Enum || unit) {
      const suf = createElement("span");
      suf.innerText = unit ? unit : "v";
      appendChild(elem, suf);
    }
  };

  this.init = (elem: HTMLElement) => {
    setup(elem);
    return {
      onChange: (h) => {
        _onChangeHandlers.push(h);
      },
      setDisabled: (val: boolean) => {
        toggleClass(elem, "disabled");
        _input.disabled = val;
      },
      destroy: () => {
        _onChangeHandlers = [];
      },
      reset: () => {
        setup(elem);
      },
      isDirty: () => {
        return _firstValue !== _currentValue;
      },
      setValue: (value: any) => {
        _currentValue = value;
        _input.value = _currentValue;
      },
    };
  };
  return template;
};

export type Input = Component<InputAPI>;
export const Input = Component(_Input);
