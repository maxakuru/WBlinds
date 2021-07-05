import { ComponentFunction, Component } from "@Components";
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

export type SaveHandler = () => void;
export interface CalibrationAPI {
  destroy(): void;
  setDisabled(val: boolean): void;
  onSave(h: SaveHandler): void;
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
  {
    o: true,
    t: "Repeat",
    d: "Alternate between open and closed, tap the corresponding button in between. Repeat as many times as you like. \n\nDue to the differences in how the cord may wrap around the axis, this may or may not be needed.",
  },
];

const _Calibration: ComponentFunction<CalibrationAPI> = function () {
  let _cancelBtn: HTMLButtonElement;
  let _initBtn: HTMLButtonElement;
  let _active = false;
  let _saveHandlers: SaveHandler[] = [];
  let _container: HTMLElement;
  let _stepIndex = 0;
  const _tc = getFromNamespace("tc");

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
    setStyle(content, "height", "90%");
    addClass(content, "fC");
    appendChild(div, content);

    const acts = createElement("div");
    addClass(acts, "fR");
    appendChild(div, acts);

    const ctx: StepContext = {
      div,
      c: content,
    } as unknown as StepContext;

    const goFwdOrBack = (isNext: boolean) => {
      return async () => {
        const preFn = isNext ? "preNext" : "preBack";
        try {
          if (ctx[preFn]) await ctx[preFn]();
        } catch (e) {
          _tc.pushToast(`"[Calib] Error in pre: ${e}"`);
        }

        _stepIndex += isNext ? 1 : -1;
        setStyle(_container, "left", `-${innerWidth() * _stepIndex}px`);
      };
    };

    if (index > 0) {
      const backBtn = createElement("button");
      backBtn.innerText = "Back";
      appendChild(acts, backBtn);
      backBtn.onclick = goFwdOrBack(false);
    }

    const nextBtn = createElement("button");
    const lastStep = index === totalStepCount - 1;
    const nextText = lastStep ? "Done" : "Next";

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
    nextBtn.onclick = goFwdOrBack(true);
    appendChild(acts, nextBtn);

    return ctx;
  };

  const makeControls = () => {
    const div = createElement("div");
    addClass(div, "cal-conc");
    ["speed ▲", "move ▲", "speed ▼", "move ▼"].forEach((l) => {
      const btn = createElement("button");
      btn.innerText = l;
      if (l.indexOf("up") > -1) addClass(btn, "btn-up");
      else addClass(btn, "btn-down");
      appendChild(div, btn);
    });
    return div;
  };

  const beginCalibFlow = () => {
    CALIBRATION_STEPS.forEach((d, i) => {
      const s = makeStep(d, i, CALIBRATION_STEPS.length);
      // add step specific content
      // right now, each step has the same controls
      // but different actions on commit
      const controls = makeControls();
      appendChild(s.c, controls);

      const btn = createElement("button");
      btn.innerText = "Done";
      appendChild(s.c, btn);
      btn.onclick = async () => {
        s.showNext(true);
        // TODO: call API
        setTimeout(() => {
          s.showNext();
        }, 4000);
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

    const TRANSITION_DUR = "transitionDuration";
    const TRANSITION_DELAY = "transitionDelay";
    _cancelBtn.onclick = () => {
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
