import { getComponentContainer, getElement } from "../util";

export function _Component<T, U>(
  c: Component<T, U>
): (args: U) => _Component<T> {
  return (...args: any[]) => {
    const ctx: Partial<ComponentCtx<T>> = {};
    const toRender = c.call(ctx, ...args);
    const elem = new DOMParser().parseFromString(toRender, "text/html");
    console.log("ctx: ", ctx);
    const node = elem.getElementsByTagName("body").item(0).firstChild;
    const api: _Component<T> = ctx.init.call(ctx, node) as _Component<T>;
    api.node = node;
    return api;
  };
}

export type _Component<T> = {
  // template: () => string;
  node: ChildNode;
} & T;

export type Component<T, U = void> = (
  this: ComponentCtx<T>,
  props: U
) => string;

export type ComponentCtx<T> = {
  init: (elem: HTMLElement) => T;
} & T;
