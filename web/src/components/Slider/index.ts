import { ComponentFunction, Component } from "../Component";
import template from "./Slider.html";
import "./Slider.css";
import { querySelector, stopPropagation } from "@Util";
import { setStyle } from "min";

export const OPEN_COLOR = "#1d95db";
export const CLOSED_COLOR = "#606060";

export const setGradientStyle = (
  input: HTMLElement,
  val: number,
  min: number,
  max: number,
  activeColor: string,
  inactiveColor: string
): void => {
  const pVal = ((val - min) / (max - min)) * 100;
  setStyle(
    input,
    "background",
    `linear-gradient(to right, ${activeColor} 0%, ${activeColor} ${pVal}%, ${inactiveColor} ${pVal}%, ${inactiveColor} 100%`
  );
};

type OnChangeHandler = (newVal: number) => unknown;
export interface SliderAPI {
  onChange: (handler: OnChangeHandler) => void;
  destroy(): void;
}

interface SliderProps {
  value: number;
}

const _Slider: ComponentFunction<SliderAPI, SliderProps> = function ({
  value,
}: SliderProps) {
  let _onChangeHandlers: OnChangeHandler[] = [];
  this.init = (elem: HTMLElement) => {
    const slider = querySelector<HTMLInputElement>("input", elem);
    slider.onmousedown = (slider.ontouchstart = stopPropagation) as any;

    const parse = parseInt;
    const min = parse(slider.min);
    const max = parse(slider.max);

    slider.oninput = () => {
      const val = parse(slider.value);
      setGradientStyle(slider, val, min, max, CLOSED_COLOR, OPEN_COLOR);
      // _onChangeHandlers.forEach((h) => h(val));
    };
    slider.onchange = () => {
      const val = parse(slider.value);
      _onChangeHandlers.forEach((h) => h(val));
    };
    slider.value = `${value}`;
    // initial gradient
    setGradientStyle(slider, value, min, max, CLOSED_COLOR, OPEN_COLOR);

    return {
      destroy: () => {
        _onChangeHandlers = [];
        // todo
      },
      onChange: (h) => {
        _onChangeHandlers.push(h);
      },
    };
  };
  return template;
};

export type Slider = Component<SliderAPI>;
export const Slider = Component(_Slider);
