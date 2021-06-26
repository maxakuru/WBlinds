import { ComponentFunction, Component } from "../Component";
import { Slider, CLOSED_COLOR, OPEN_COLOR } from "../Slider";
import template from "./Card.html";
import "./Card.css";
import { addClass, appendChild, isNullish, removeClass } from "@Util";
import { getElement, querySelector, setStyle } from "min";
import { Input, InputType_Range } from "components/Input";

export type OnChangeHandler = (data: any) => void;
export interface CardAPI {
  onChange: (h: OnChangeHandler) => void;
  destroy(): void;
  show(): void;
}

interface CardProps {
  temp?: any;
}

interface Coords {
  x: number;
  y: number;
}

const MIN_TOP = 8;
const ACT_Y_OFFSET = 8;

const _Card: ComponentFunction<CardAPI, CardProps> = function ({
  temp,
}: CardProps) {
  let _onChangeHandlers: OnChangeHandler[] = [];
  let draggingCard = false;
  let yOffset = 0;
  let yStart = 0;
  let animated = false;
  let lastCoords: Coords = {} as Coords;
  let _inputs: Input[] = [];

  this.init = (elem: HTMLElement) => {
    const container = querySelector(".ca-con" as any, elem);
    const act = querySelector(".act" as any, elem);
    toggleAnimations(true);

    const notify = (d: any) => {
      _onChangeHandlers.forEach((h) => h(d));
    };

    const makeRangeInput = (label: "Speed" | "Acceleration") => {
      const range = Input({
        type: InputType_Range,
        label: label,
        value: 50,
        embed: false,
      });
      const node: HTMLInputElement = range.node as HTMLInputElement;
      const inp = querySelector("input", node);
      removeClass(range.node, "fR");
      addClass(range.node, "cR");
      range.onChange((val) => {
        setStyle(
          inp,
          "background",
          `linear-gradient(to right, ${OPEN_COLOR} 0%, ${OPEN_COLOR} ${val}%, ${CLOSED_COLOR} ${val}%, ${CLOSED_COLOR} 100%`
        );
        let pos, accel, speed, tPos;
        if (label === "Speed") {
          speed = val;
        } else {
          accel = val;
        }
        notify({ pos, tPos, accel, speed });
      });
      appendChild(container, range.node);
      _inputs.push(range);
    };
    makeRangeInput("Speed");
    makeRangeInput("Acceleration");

    const slider = Slider({ id: "position", label: "Position", value: "50" });
    appendChild(container, slider.node);

    const onPress = (coords: Coords) => {
      lastCoords = coords;
      yStart = coords.y;
      draggingCard = true;
      toggleAnimations(false);
    };

    const closeAndDestroy = () => {
      toggleAnimations(true);
      elem.ontransitionend = destroy;
      const o = elem.clientHeight;
      setStyle(elem, "top", `${o}px`);
      setStyle(act, "top", `${o + ACT_Y_OFFSET}px`);
    };

    act.onclick = closeAndDestroy;

    const onRelease = () => {
      if (!draggingCard) return;
      draggingCard = false;
      toggleAnimations(true);
      if (yOffset > elem.clientHeight / 2) {
        return closeAndDestroy();
      }
      setStyle(elem, "top", `${MIN_TOP}px`);
      setStyle(act, "top", `${MIN_TOP + ACT_Y_OFFSET}px`);
      yOffset = yStart = MIN_TOP;
    };

    const onMove = (coords: Coords) => {
      if (!draggingCard) return;
      if (coords.y - yStart < MIN_TOP) {
        lastCoords = coords;
        return;
      }
      const movedY = coords.y - lastCoords.y;
      yOffset += movedY;
      lastCoords = coords;
      setStyle(elem, "top", `${yOffset}px`);
      setStyle(act, "top", `${yOffset + ACT_Y_OFFSET}px`);
    };

    function toggleAnimations(newState?: boolean) {
      if (isNullish(newState)) newState = false;
      if (newState === animated) return;
      newState ? addClass(elem, "an") : removeClass(elem, "an");
      newState ? addClass(act, "an") : removeClass(act, "an");

      animated = newState;
    }

    const destroy = () => {
      _onChangeHandlers = [];
      _inputs = [];
      elem.remove();
    };

    const firstTouchXY = (e: TouchEvent | MouseEvent): Coords => {
      let { x, y } = e as MouseEvent;
      if (x == null) {
        // touch event
        x = (e as TouchEvent).touches[0].clientX;
        y = (e as TouchEvent).touches[0].clientY;
      }
      return {
        x,
        y,
      };
    };
    elem.onmousedown = elem.ontouchstart = (e: TouchEvent | MouseEvent) =>
      onPress(firstTouchXY(e));
    elem.onmouseup = elem.onmouseout = elem.ontouchend = onRelease;
    elem.onmousemove = elem.ontouchmove = (e: TouchEvent | MouseEvent) =>
      onMove(firstTouchXY(e));
    return {
      destroy,
      onChange: (h) => {
        _onChangeHandlers.push(h);
      },
      show: () => {
        setStyle(elem, "top", `${MIN_TOP}px`);
        setStyle(act, "top", `${MIN_TOP + ACT_Y_OFFSET}px`);
      },
    };
  };
  return template;
};

export type Card = Component<CardAPI>;
export const Card = Component(_Card);
