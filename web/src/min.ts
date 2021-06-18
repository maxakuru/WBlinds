export function addClass(elem: HTMLElement, ...tokens: string[]): void {
  elem.classList.add(...tokens);
}

export function removeClass(elem: HTMLElement, ...tokens: string[]): void {
  elem.classList.remove(...tokens);
}

export function toggleClass(elem: HTMLElement, token: string): void {
  elem.classList.toggle(token);
}

export const nextTick = setTimeout;

export const createElement: <K extends keyof HTMLElementTagNameMap>(
  tagName: K
) => HTMLElementTagNameMap[K] = document.createElement.bind(document);

export const createDiv: <T = HTMLElement>() => T = document.createElement.bind(
  document,
  "div"
);

/**
 * Alias to document.getElementById,
 * so closure can trim a few extra characters.
 */
export const getElement: (id: string) => HTMLElement =
  document.getElementById.bind(document);

export const querySelector = <T = HTMLElement>(
  selectors: keyof HTMLElementTagNameMap,
  elem: HTMLElement | Document = document
): T => elem.querySelector.call(elem, selectors);

export const stopPropagation = (e: Event): void => e.stopPropagation();

export const displayNone = (elem: HTMLElement) => {
  elem.style.display = "none";
};

export const appendChild = <T extends HTMLElement>(
  parent: HTMLElement,
  child: HTMLElement
): T => {
  return _appendChild.call(parent, child) as T;
};

const _appendChild = document.appendChild;

export const prependChild = <T extends HTMLElement>(
  parent: HTMLElement,
  child: HTMLElement
): T => {
  return _prependChild.call(parent, child) as T;
};

const _prependChild = document.prepend;
