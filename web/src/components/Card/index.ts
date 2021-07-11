import { ComponentFunction, Component } from "../Component";
import { Slider, CLOSED_COLOR, OPEN_COLOR, setGradientStyle } from "../Slider";
import template from "./Card.html";
import "./Card.css";
import { addClass, appendChild, debug, isNullish, removeClass } from "@Util";
import { getElement, querySelector, setStyle } from "min";
import { Input, InputType_Range } from "components/Input";
import { DeviceRecord } from "@State";

export type OnChangeHandler = (data: DeviceRecord) => void;
export interface CardAPI {
  onChange: (h: OnChangeHandler) => void;
  destroy(): void;
  show(): void;
}

type CardProps = DeviceRecord;

interface Coords {
  x: number;
  y: number;
}

const MIN_TOP = 8;
const ACT_Y_OFFSET = 12;

const INPUT_SPEED = 0;
const INPUT_ACCEL = 1;
type INPUT = typeof INPUT_SPEED | typeof INPUT_ACCEL;
const INPUT_LABEL_MAP = ["Speed", "Acceleration"];
const INPUT_LIMIT_MAP = [
  [1, 5000],
  [1, 4294967294],
];

const _Card: ComponentFunction<CardAPI, CardProps> = function ({
  ["pos"]: pos,
  ["accel"]: accel,
  ["speed"]: speed,
  ...data
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

    debug("card data: ", data);

    const notify = (d: any) => {
      _onChangeHandlers.forEach((h) => h(d));
    };

    const makeRangeInput = (input: INPUT) => {
      const value = input === INPUT_SPEED ? speed : accel;
      debug("input value: ", input, value);

      const range = Input({
        type: InputType_Range,
        label: INPUT_LABEL_MAP[input],
        value,
        embed: false,
        min: INPUT_LIMIT_MAP[input][0],
        max: INPUT_LIMIT_MAP[input][1],
      });
      const node: HTMLInputElement = range.node as HTMLInputElement;
      const inp = querySelector<HTMLInputElement>("input", node);
      removeClass(range.node, "fR");
      addClass(range.node, "cR");
      const parse = parseInt;
      const min = parse(inp.min);
      const max = parse(inp.max);

      inp.oninput = () => {
        const val = parse(inp.value);
        setGradientStyle(inp, val, min, max, OPEN_COLOR, CLOSED_COLOR);
      };

      const _handleChange = (val: number) => {
        // let accel, speed;
        if (input === INPUT_SPEED) {
          notify({ ...data, speed: val });
        } else if (input === INPUT_ACCEL) {
          // accel = val;
          notify({ ...data, accel: val });
        }
      };
      range.onChange(_handleChange);

      appendChild(container, range.node);
      setGradientStyle(inp, value, min, max, OPEN_COLOR, CLOSED_COLOR);
      _inputs.push(range);
    };
    makeRangeInput(INPUT_SPEED);
    makeRangeInput(INPUT_ACCEL);

    const slider = Slider({ value: pos });
    slider.onChange((val) => {
      notify({ ...data, tPos: val });
    });

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
      slider.destroy();
      _inputs.forEach((inp) => inp.destroy());
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
