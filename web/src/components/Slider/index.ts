import { ComponentFunction, Component } from "../Component";
import template from "./Slider.html";
import "./Slider.css";
import { querySelector, stopPropagation } from "@Util";
import { setStyle } from "min";

export interface SliderAPI {
  destroy(): void;
}

export const OPEN_COLOR = "#1d95db";
export const CLOSED_COLOR = "#606060";

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
    // querySelector("h4", elem).innerText = label;

    const slider = querySelector<HTMLInputElement>("input", elem);
    slider.onmousedown = (slider.ontouchstart = stopPropagation) as any;
    // slider.ontouchstart = stopPropagation;
    // slider.ontouchmove = stopPropagation;

    slider.oninput = (e) => {
      const value =
        ((parseInt(slider.value) - parseInt(slider.min)) /
          (parseInt(slider.max) - parseInt(slider.min))) *
        100;
      setStyle(
        slider,
        "background",
        `linear-gradient(to right, ${CLOSED_COLOR} 0%, ${CLOSED_COLOR} ${value}%, ${OPEN_COLOR} ${value}%, ${OPEN_COLOR} 100%`
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
