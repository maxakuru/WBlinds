import { ComponentFunction, Component } from "@Components";
import {
  addClass,
  appendChild,
  createElement,
  getElement,
  getElementsByTagName,
  nextTick,
  querySelector,
  removeClass,
  setStyle,
} from "min";
import template from "./Calibration.html";
import "./Calibration.css";

export type SaveHandler = () => void;
export interface CalibrationAPI {
  destroy(): void;
  setDisabled(val: boolean): void;
  onSave(h: SaveHandler): void;
}

// speed to clear steps on cancel
const FLOW_SPEED = 0.4;
const WIPE_SPEED = FLOW_SPEED / 2;

interface StepContext {
  div: HTMLElement;
  preNext?: () => void | Promise<void>;
  preBack?: () => void | Promise<void>;
}

const _Calibration: ComponentFunction<CalibrationAPI> = function () {
  let _cancelBtn: HTMLButtonElement;
  let _initBtn: HTMLButtonElement;
  let _active = false;
  let _saveHandlers: SaveHandler[] = [];
  let _container: HTMLElement;
  let _stepIndex = 0;

  const makeStep = (): StepContext => {
    const div = createElement("div");
    addClass(div, "fC");

    const content = createElement("div");
    setStyle(content, "height", "90%");
    appendChild(div, content);

    const acts = createElement("div");
    addClass(acts, "fR");
    appendChild(div, acts);

    const nextBtn = createElement("button");
    nextBtn.innerText = "Next >";
    const backBtn = createElement("button");
    backBtn.innerText = "< Back";

    appendChild(acts, backBtn);
    appendChild(acts, nextBtn);

    const ctx: StepContext = {
      div,
    };

    const goFwdOrBack = (isNext: boolean) => {
      return async () => {
        const preFn = isNext ? "preNext" : "preBack";
        try {
          if (ctx[preFn]) await ctx[preFn]();
        } catch (e) {
          console.error("[Calib] Error in pre: ", e);
        }

        _stepIndex += isNext ? 1 : -1;
        console.log("step index: ", _stepIndex);
        setStyle(_container, "left", `calc( 100vw * -${_stepIndex} )`);
      };
    };
    nextBtn.onclick = goFwdOrBack(true);
    backBtn.onclick = goFwdOrBack(false);

    return ctx;
  };

  const beginCalibFlow = () => {
    console.log("calibFlow");
    const stepCount = 5;

    for (let i = 0; i < stepCount; i++) {
      const s = makeStep();
      appendChild(_container, s.div);
    }

    setStyle(_container, "left", "0%");
    setStyle(_container, "width", `calc( 100vw * ${stepCount} )`);

    setStyle(_cancelBtn, "left", "0%");
  };

  this.init = (elem) => {
    _container = querySelector("div", elem);
    const btns = getElementsByTagName("button", elem);
    _initBtn = btns.item(0);
    _cancelBtn = btns.item(1);

    _initBtn.onclick = () => {
      if (_active) return;

      _active = true;
      removeClass(_cancelBtn, "hide");
      removeClass(_container, "hide");
      nextTick(beginCalibFlow);
    };

    _cancelBtn.onclick = () => {
      // speed up animations
      const wipeDuration = (_stepIndex + 1) * WIPE_SPEED;
      setStyle(_container, "transitionDuration", `${wipeDuration}s`);
      setStyle(_cancelBtn, "transitionDelay", `${_stepIndex * WIPE_SPEED}s`);
      setStyle(_cancelBtn, "transitionDuration", `${WIPE_SPEED}s`);

      setStyle(_container, "left", "100%");
      setStyle(_cancelBtn, "left", "100%");

      setTimeout(() => {
        _stepIndex = 0;

        // reset styles
        setStyle(_container, "transitionDuration", `${FLOW_SPEED}s`);
        setStyle(_cancelBtn, "transitionDuration", `${FLOW_SPEED}s`);

        setStyle(_cancelBtn, "transitionDelay", "0s");

        // clear the container
        _container.innerHTML = "";

        // hide
        addClass(_container, "hide");

        _active = false;
      }, wipeDuration * 1000);
    };

    return {
      destroy: () => {
        _saveHandlers = [];
        elem.remove();
      },
      setDisabled: (v) => {
        _initBtn.disabled = v;
      },
      onSave: (h) => {
        _saveHandlers.push(h);
      },
    };
  };

  return template;
};

export type Calibration = Component<CalibrationAPI>;
export const Calibration = Component(_Calibration);
