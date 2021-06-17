import { _Component, Component } from "../Component";
import template from "./Toast.html";
import "./Toast.css";
import { querySelector } from "../../util";

type ClickHandler = (data: Pick<ToastProps, "id">) => unknown;
export interface ToastAPI {
  onClick: (handler: ClickHandler) => void;
  destroy(): void;
}

interface ToastProps {
  message: string;
  id: number;
  isError?: boolean;
}

const _Toast: Component<ToastAPI, ToastProps> = function ({
  message,
  id,
  isError = false,
}: ToastProps) {
  let _clickHandlers: ClickHandler[] = [];

  this.init = function (elem: HTMLElement) {
    elem.onclick = (e) => {
      _clickHandlers.forEach((h) => h({ id }));
    };
    querySelector("p", elem).innerText = message;
    return {
      onClick: (h) => {
        _clickHandlers.push(h);
      },
      destroy: () => {
        _clickHandlers = [];
      },
    };
  };
  return template;
};

export type Toast = _Component<ToastAPI>;
export const Toast = _Component(_Toast);
