import { ComponentFunction, Component } from "../Component";
import { Toast } from "../Toast";
import template from "./ToastContainer.html";
import "./ToastContainer.css";
import { appendChild } from "@Util";
import { setStyle } from "min";

type ClickHandler = (data: ToastContainerProps) => unknown;
export interface ToastContainerAPI {
  pushToast: (
    message: string,
    isError?: boolean,
    isPersistent?: boolean,
    timeout?: number
  ) => void;
  destroy(): void;
}

interface ToastContainerProps {
  name?: string;
  id?: string;
}

const _ToastContainer: ComponentFunction<
  ToastContainerAPI,
  ToastContainerProps
> = function ({ name, id }: ToastContainerProps) {
  let _index = 0;
  let _toasts: Toast[] = [];

  this.init = (elem: HTMLElement) => {
    const pushToast = (
      message: string,
      isError?: boolean,
      isPersistent?: boolean,
      timeout?: number
    ) => {
      const setBottomStyle = () => {
        setStyle(t.node, "bottom", `-${50 + 200 * (_toasts.length + 1)}px`);
      };

      const remove = () => {
        setBottomStyle();
        setTimeout(() => {
          t.node.remove();
        }, 500);
      };

      const t = Toast({ message, isError, id: _index++ });
      setBottomStyle();
      t.onClick(remove);
      _toasts.push(t);
      appendChild(elem, t.node);

      setTimeout(() => {
        setStyle(t.node, "bottom", "0px");
        !isPersistent && setTimeout(remove, timeout || isError ? 5000 : 2500);
      });
    };
    return {
      destroy: () => {
        _toasts.map((t) => t.destroy());
        _toasts = [];
        _index = 0;
      },
      pushToast,
    };
  };
  return template;
};

export type ToastContainer = Component<ToastContainerAPI>;
export const ToastContainer = Component(_ToastContainer);
