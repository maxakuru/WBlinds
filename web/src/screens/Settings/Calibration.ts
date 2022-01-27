import { ComponentFunction, Component, Input } from "@Components";
import {
  addClass,
  appendChild,
  createElement,
  getElement,
  getElementsByTagName,
  innerWidth,
  nextTick,
  querySelector,
  removeClass,
  setStyle,
  WINDOW,
} from "min";
import template from "./Calibration.html";
import "./Calibration.css";
import { getFromNamespace } from "@Util";
import { InputType_Number, InputType_String } from "components/Input";
import { WSCalibrationEvent } from "ws";
import { doFetch, HTTP_POST } from "@Api";

export type SaveHandler = () => void;
export type CalibrationHandler = (ev: WSCalibrationEvent) => void;
export interface CalibrationAPI {
  destroy(): void;
  setDisabled(val: boolean): void;
  onSave(h: SaveHandler): void;
  onCalib(h: CalibrationHandler): void;
}

interface StepContext {
  /**
   * Entire step element
   */
  div: HTMLElement;
  /**
   * Content container element
   */
  c: HTMLElement;
  /**
   * Fn to call before going next
   */
  preNext?: () => void | Promise<void>;
  /**
   * Fn to call before going back
   */
  preBack?: () => void | Promise<void>;
  /**
   * Unhide next button
   */
  showNext: (loading?: boolean) => void;
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
  /**
   * Optional step
   */
  o?: boolean;
}

// speed to clear steps on cancel
const FLOW_SPEED = 0.4;
const WIPE_SPEED = FLOW_SPEED / 2;

const CALIBRATION_STEPS: CalibrationStep[] = [
  {
    t: "Find home position",
    d: "Move to the fully open position then tap 'Done'. \nBe careful not to wind the cord too tight.",
  },
  {
    t: "Find closed position",
    d: "Move to the fully closed position then tap 'Done'",
  },
  // {
  //   o: true,
  //   t: "Repeat",
  //   d: "Alternate between open and closed, tap the corresponding button in between. Repeat as many times as you like. \n\nDue to the differences in how the cord may wrap around the axis, this may or may not be needed.",
  // },
];

const _Calibration: ComponentFunction<CalibrationAPI> = function () {
  let _cancelBtn: HTMLButtonElement;
  let _initBtn: HTMLButtonElement;
  let _active = false;
  let _saveHandlers: SaveHandler[] = [];
  let _calibHandlers: CalibrationHandler[] = [];
  let _container: HTMLElement;
  let _stepIndex = 0;
  const _tc = getFromNamespace("tc");

  const notify = (data: Partial<WSCalibrationEvent>) => {
    _calibHandlers.forEach((h) => {
      h && h({ mac: "-", ...data });
    });
  };

  const wipe = () => {
    const TRANSITION_DUR = "transitionDuration";
    const TRANSITION_DELAY = "transitionDelay";
    // speed up animations
    const wipeDuration = (_stepIndex + 1) * WIPE_SPEED;
    setStyle(_container, TRANSITION_DUR, `${wipeDuration}s`);
    // some fudge here for the delay to make
    // the button move with the last step
    setStyle(
      _cancelBtn,
      TRANSITION_DELAY,
      `${(_stepIndex - 0.5) * WIPE_SPEED}s`
    );
    setStyle(_cancelBtn, TRANSITION_DUR, `${WIPE_SPEED}s`);
    setStyle(_container, "left", `${innerWidth()}px`);
    setStyle(_cancelBtn, "left", `${innerWidth()}px`);

    setTimeout(() => {
      _stepIndex = 0;
      // reset styles
      setStyle(_container, TRANSITION_DUR, `${FLOW_SPEED}s`);
      setStyle(_cancelBtn, TRANSITION_DUR, `${FLOW_SPEED}s`);
      setStyle(_cancelBtn, TRANSITION_DELAY, "0s");
      // clear the container
      _container.innerHTML = "";
      // hide
      addClass(_container, "hide");
      _active = false;
    }, wipeDuration * 1000);
  };

  const makeStep = (
    data: CalibrationStep,
    index: number,
    totalStepCount: number
  ): StepContext => {
    const div = createElement("div");
    addClass(div, "fC");

    const title = createElement("h2");
    title.innerText = `${index + 1}. ${data.t}`;
    appendChild(div, title);

    const desc = createElement("p");
    desc.innerText = `${data.d}`;
    appendChild(div, desc);

    const content = createElement("div");
    setStyle(content, "height", "50vh");
    addClass(content, "fC");
    appendChild(div, content);

    const acts = createElement("div");
    addClass(acts, "fR");
    appendChild(div, acts);

    const ctx: StepContext = {
      div,
      c: content,
    } as unknown as StepContext;

    const goFwdOrBack = (isNext: boolean, isLastStep?: boolean) => {
      return async () => {
        const preFn = isNext ? "preNext" : "preBack";
        try {
          if (ctx[preFn]) await ctx[preFn]();
        } catch (e) {
          _tc.pushToast(`"[Calib] Error in pre: ${e}"`);
        }

        _stepIndex += isNext ? 1 : -1;
        if (isNext && isLastStep) {
          // last one, wipe it
          wipe();
        } else {
          setStyle(_container, "left", `-${innerWidth() * _stepIndex}px`);
        }
      };
    };

    if (index > 0) {
      const backBtn = createElement("button");
      backBtn.innerText = "Back";
      appendChild(acts, backBtn);
      backBtn.onclick = goFwdOrBack(false);
    }

    const nextBtn = createElement("button");
    const isLastStep = index === totalStepCount - 1;
    const nextText = isLastStep ? "Done" : "Next";

    if (!data.o) nextBtn.disabled = true;
    ctx.showNext = (loading?: boolean) => {
      if (loading) {
        nextBtn.innerText = "";
        const loader = createElement("div");
        addClass(loader, "loader");
        appendChild(nextBtn, loader);
      } else {
        // remove loading div and add back text
        nextBtn.innerText = nextText;
        nextBtn.disabled = false;
      }
    };

    nextBtn.innerText = nextText;
    nextBtn.onclick = goFwdOrBack(true, isLastStep);
    appendChild(acts, nextBtn);

    return ctx;
  };

  const makePositionControls = () => {
    let stepIncrement = 10;

    const controlsDiv = createElement("div");
    addClass(controlsDiv, "cal-conc");
    // speed controls
    const speedControls = createElement("div");
    let btn = createElement("button");
    btn.innerText = "speed ▲";
    addClass(btn, "btn-up");
    appendChild(speedControls, btn);
    btn = createElement("button");
    btn.innerText = "speed ▼";
    addClass(btn, "btn-down");
    appendChild(speedControls, btn);
    appendChild(controlsDiv, speedControls);

    // motion controls
    const motionControls = createElement("div");
    btn = createElement("button");
    btn.innerText = "move ▲";
    btn.onclick = () => {
      notify({ moveBy: -stepIncrement });
    };
    // addClass(btn, "btn-up");
    appendChild(motionControls, btn);

    // step control row
    const stepLabel = Input({
      label: "by",
      unit: "steps",
      type: InputType_Number,
      value: 10,
    });
    // override some styles, hacky but oh well
    removeClass(stepLabel.node, "fR");
    addClass(stepLabel.node, "step-inc");
    stepLabel.onChange((v: number) => {
      if (v < 1) {
        stepLabel.setValue(1);
      } else stepIncrement = v;
    });

    const incDecSteps = (down?: boolean) => {
      if (down && stepIncrement === 1) return;
      let incrementIncrement = 1;

      const breakptMod = down ? 1 : 0;
      if (stepIncrement >= 10 + breakptMod) incrementIncrement *= 10;
      if (stepIncrement >= 100 + breakptMod) incrementIncrement *= 10;
      if (stepIncrement >= 1000 + breakptMod) incrementIncrement *= 10;
      incrementIncrement *= -breakptMod || 1;

      stepIncrement += incrementIncrement;
      stepLabel.setValue(stepIncrement);
    };
    const stepsRow = createElement("div");
    const decBtn = createElement("div");
    decBtn.innerText = "-";
    addClass(decBtn, "s-pm");
    decBtn.onclick = () => incDecSteps(true);
    const incBtn = createElement("div");
    incBtn.innerText = "+";
    addClass(incBtn, "s-pm");
    incBtn.onclick = () => incDecSteps();

    appendChild(stepsRow, decBtn);
    appendChild(stepsRow, stepLabel.node);
    appendChild(stepsRow, incBtn);
    appendChild(motionControls, stepsRow);

    btn = createElement("button");
    btn.innerText = "move ▼";
    btn.onclick = () => {
      notify({ moveBy: stepIncrement });
    };
    // addClass(btn, "btn-down");
    appendChild(motionControls, btn);

    // add the motion control row
    appendChild(controlsDiv, motionControls);

    // ["speed ▲", "move ▲", "speed ▼", "move ▼"].forEach((l) => {
    //   const btn = createElement("button");
    //   btn.innerText = l;
    //   if (l.indexOf("up") > -1) addClass(btn, "btn-up");
    //   else addClass(btn, "btn-down");
    //   appendChild(div, btn);
    // });
    return controlsDiv;
  };

  const beginCalibFlow = () => {
    CALIBRATION_STEPS.forEach((d, i) => {
      const s = makeStep(d, i, CALIBRATION_STEPS.length);
      // add step specific content
      // right now, each step has the same controls
      // but different actions on commit
      const controls = makePositionControls();
      appendChild(s.c, controls);

      const btn = createElement("button");
      btn.innerText = "Ok";
      appendChild(s.c, btn);
      btn.onclick = async () => {
        s.showNext(true);
        if (i === 0) {
          // first it finding home
          await doFetch("calibration/home", HTTP_POST);
        } else {
          // second is finding closed
          await doFetch("calibration/closed", HTTP_POST);
        }
        s.showNext();
      };

      appendChild(_container, s.div);
    });

    setStyle(
      _container,
      "width",
      `${innerWidth() * CALIBRATION_STEPS.length}px`
    );
    setStyle(_container, "left", "0");
    setStyle(_cancelBtn, "left", "0");
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

    _cancelBtn.onclick = wipe;

    return {
      destroy: () => {
        _saveHandlers = [];
        _calibHandlers = [];
        elem.remove();
      },
      setDisabled: (v) => {
        _initBtn.disabled = v;
      },
      onSave: (h) => {
        _saveHandlers.push(h);
      },
      onCalib: (h) => {
        _calibHandlers.push(h);
      },
    };
  };

  return template;
};

export type Calibration = Component<CalibrationAPI>;
export const Calibration = Component(_Calibration);
