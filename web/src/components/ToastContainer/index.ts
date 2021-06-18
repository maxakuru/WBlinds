import { ComponentFunction, Component, Toast } from "@Components";
import template from "./ToastContainer.html";
import "./ToastContainer.css";
import { appendChild } from "@Util";

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

  this.init = function (elem: HTMLElement) {
    console.log("toast container: ", elem);

    function pushToast(
      message: string,
      isError?: boolean,
      isPersistent?: boolean,
      timeout = 2500
    ) {
      const t = Toast({ message, isError, id: _index++ });
      t.node.style.bottom = `-${63 + 200 * (_toasts.length + 1)}px`;
      t.onClick(remove);
      _toasts.push(t);
      appendChild(elem, t.node);

      function remove() {
        t.node.style.bottom = `-${63 + 200 * (_toasts.length + 1)}px`;
        setTimeout(() => {
          t.node.remove();
        }, 500);
      }

      setTimeout(() => {
        t.node.style.bottom = `0px`;
        !isPersistent && setTimeout(remove, timeout);
      });
    }
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
