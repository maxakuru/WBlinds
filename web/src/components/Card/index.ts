import { ComponentFunction, Component } from "../Component";
import { Slider } from "../Slider";
import template from "./Card.html";
import "./Card.css";
import { addClass, appendChild, isNullish, removeClass } from "@Util";
import { querySelector, setStyle } from "min";
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

const _Card: ComponentFunction<CardAPI, CardProps> = function ({
  temp,
}: CardProps) {
  let _onChangeHandlers: OnChangeHandler[] = [];
  let draggingCard = false;
  let yOffset = 0;
  let yStart = 0;
  let animated = false;
  let lastCoords: Coords = {} as Coords;

  this.init = (elem: HTMLElement) => {
    toggleAnimations(true);

    const notify = (d: any) => {
      _onChangeHandlers.forEach((h) => h(d));
    };

    const posRange = Input({
      type: InputType_Range,
      label: "Position",
      value: 50,
      embed: false,
    });
    const node: HTMLInputElement = posRange.node as HTMLInputElement;
    const inp = querySelector("input", node);
    removeClass(posRange.node, "fR");
    posRange.onChange((tPos) => {
      console.log("onchange: ", node);
      setStyle(
        inp,
        "background",
        `linear-gradient(to right, #DB8B1D 0%, #DB8B1D ${tPos}%, #606060 ${tPos}%, #606060 100%`
      );
      let pos, accel, speed;
      notify({ pos, tPos, accel, speed });
    });
    // const slider = Slider({ id: "position", label: "Position", value: "50" });
    appendChild(elem, posRange.node);

    const onPress = (coords: Coords) => {
      lastCoords = coords;
      yStart = coords.y;
      draggingCard = true;
      toggleAnimations(false);
    };

    const onRelease = () => {
      if (!draggingCard) return;
      draggingCard = false;
      toggleAnimations(true);
      // TODO: decide if it should be discarded
      let o = 0;
      if (yOffset > elem.clientHeight / 2) {
        o = elem.clientHeight;
        // TODO: use onDiscard from parent
        elem.ontransitionend = destroy;
      }
      setStyle(elem, "top", `${o}px`);
      yOffset = yStart = 0;
    };

    const onMove = (coords: Coords) => {
      if (!draggingCard) return;
      if (coords.y - yStart < 0) {
        lastCoords = coords;
        return;
      }
      const movedY = coords.y - lastCoords.y;
      yOffset += movedY;
      lastCoords = coords;
      setStyle(elem, "top", `${yOffset}px`);
    };

    function toggleAnimations(newState?: boolean) {
      if (isNullish(newState)) newState = false;
      if (newState === animated) return;
      newState ? addClass(elem, "an") : removeClass(elem, "an");
      animated = newState;
    }

    const destroy = () => {
      _onChangeHandlers = [];
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
        setStyle(elem, "top", "0px");
      },
    };
  };
  return template;
};

export type Card = Component<CardAPI>;
export const Card = Component(_Card);
