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
  WINDOW,
} from "min";
import template from "./Calibration.html";
import "./Calibration.css";

export type SaveHandler = () => void;
export interface CalibrationAPI {
  destroy(): void;
  setDisabled(val: boolean): void;
  onSave(h: SaveHandler): void;
}

interface StepContext {
  div: HTMLElement;
  preNext?: () => void | Promise<void>;
  preBack?: () => void | Promise<void>;
}

interface CalibrationStep {
  /**
   * Title
   */
  t: string;
  /**
   * Description
   */
  d?: string;
}

// speed to clear steps on cancel
const FLOW_SPEED = 0.4;
const WIPE_SPEED = FLOW_SPEED / 2;

const VWIDTH = WINDOW.innerWidth;

const CALIBRATION_STEPS: CalibrationStep[] = [
  {
    t: "Find home position",
    d: "Move to the fully open position. \nBe careful not to wind the cord too tight.",
  },
  { t: "Find closed position", d: "Move to the fully closed position." },
  {
    t: "Repeat",
    d: "Alternate between open and closed, clicking the corresponding button in between. \n I’m Repeat this as many times as you like. \n\nDue to the differences in how the cord may wrap around the axis, this may or may not be needed.",
  },
];

const _Calibration: ComponentFunction<CalibrationAPI> = function () {
  let _cancelBtn: HTMLButtonElement;
  let _initBtn: HTMLButtonElement;
  let _active = false;
  let _saveHandlers: SaveHandler[] = [];
  let _container: HTMLElement;
  let _stepIndex = 0;

  const makeStep = (data: CalibrationStep, index: number): StepContext => {
    const div = createElement("div");
    addClass(div, "fC");

    const title = createElement("h2");
    title.innerText = `${index}. ${data.t}`;
    appendChild(div, title);

    const content = createElement("div");
    setStyle(content, "height", "90%");
    appendChild(div, content);

    const acts = createElement("div");
    addClass(acts, "fR");
    appendChild(div, acts);

    const nextBtn = createElement("button");
    nextBtn.innerText = "Next";
    const backBtn = createElement("button");
    backBtn.innerText = "Back";

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
          // TODO: show toast
          console.error("[Calib] Error in pre: ", e);
        }

        _stepIndex += isNext ? 1 : -1;
        setStyle(_container, "left", `-${VWIDTH * _stepIndex}px`);
      };
    };
    nextBtn.onclick = goFwdOrBack(true);
    backBtn.onclick = goFwdOrBack(false);

    return ctx;
  };

  const beginCalibFlow = () => {
    const stepCount = 5;

    CALIBRATION_STEPS.forEach((d, i) => {
      const s = makeStep(d, i);
      appendChild(_container, s.div);
    });

    setStyle(_container, "left", "0");
    setStyle(_container, "width", `${VWIDTH * stepCount}px`);

    setStyle(_cancelBtn, "left", `${VWIDTH - 200}px`);
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
      // some fudge here for the delay to make
      // the button move with the last step
      setStyle(
        _cancelBtn,
        "transitionDelay",
        `${(_stepIndex - 0.5) * WIPE_SPEED}s`
      );
      setStyle(_cancelBtn, "transitionDuration", `${WIPE_SPEED}s`);

      setStyle(_container, "left", `${VWIDTH}px`);
      setStyle(_cancelBtn, "left", `${VWIDTH}px`);

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
