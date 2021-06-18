import { getComponentContainer, getElement } from "../util";

export function Component<T, U>(
  c: ComponentFunction<T, U>
): (args: U) => Component<T> {
  return (...args: any[]) => {
    const ctx: Partial<ComponentCtx<T>> = {};
    const toRender = c.call(ctx, ...args);
    const elem = new DOMParser().parseFromString(toRender, "text/html");
    console.log("ctx: ", ctx);
    const node = elem.getElementsByTagName("body").item(0).firstChild;
    const api: Component<T> = ctx.init.call(ctx, node) as Component<T>;
    api.node = node as HTMLElement;
    return api;
  };
}

export type Component<T> = {
  node: HTMLElement;
  // TODO: add onClick(), destroy() to share
} & T;

export type ComponentFunction<T, U = void> = (
  this: ComponentCtx<T>,
  props: U
) => string;

export type ComponentCtx<T> = {
  init: (elem: HTMLElement) => T;
} & T;
