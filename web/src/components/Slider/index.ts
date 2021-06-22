import { ComponentFunction, Component } from "../Component";
import template from "./Slider.html";
import "./Slider.css";
import { querySelector, stopPropagation } from "@Util";
import { setStyle } from "min";

export interface SliderAPI {
  destroy(): void;
}

interface SliderProps {
  label: string;
  value: string;
  id: string;
}

const _Slider: ComponentFunction<SliderAPI, SliderProps> = function ({
  label,
  value,
  id,
}: SliderProps) {
  this.init = (elem: HTMLElement) => {
    elem.id = id;
    querySelector("h4", elem).innerText = label;

    const slider = querySelector<HTMLInputElement>("input", elem);
    slider.onmousedown = stopPropagation;
    slider.ontouchstart = stopPropagation;

    slider.oninput = () => {
      const value =
        ((parseInt(slider.value) - parseInt(slider.min)) /
          (parseInt(slider.max) - parseInt(slider.min))) *
        100;
      setStyle(
        slider,
        "background",
        `linear-gradient(to right, #DB8B1D 0%, #DB8B1D ${value}%, #606060 ${value}%, #606060 100%`
      );
    };
    slider.value = value;

    return {
      destroy: () => {
        // todo
      },
    };
  };
  return template;
};

export type Slider = Component<SliderAPI>;
export const Slider = Component(_Slider);
