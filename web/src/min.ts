const DomTokenProto = DOMTokenList.prototype;

export function addClass(elem: HTMLElement, ...tokens: string[]): void {
  DomTokenProto.add.call(elem.classList, ...tokens);
}

export function removeClass(elem: HTMLElement, ...tokens: string[]): void {
  DomTokenProto.remove.call(elem.classList, ...tokens);
}

export const toggleClass = (elem: HTMLElement, token: string): void => {
  DomTokenProto.toggle.call(elem.classList, token);

  // elem.classList.toggle.call(elem, token);
};

export const nextTick = setTimeout;

export const DOCUMENT = document;

export const WINDOW = window;

export const createElement: <K extends keyof HTMLElementTagNameMap>(
  tagName: K
) => HTMLElementTagNameMap[K] = DOCUMENT.createElement.bind(DOCUMENT);

export const createDiv: <T = HTMLElement>() => T = DOCUMENT.createElement.bind(
  DOCUMENT,
  "div"
);

export const innerWidth = (): number => {
  return WINDOW.innerWidth;
};

/**
 * Alias to document.getElementById,
 * so closure can trim a few extra characters.
 */
export const getElement: (id: string) => HTMLElement =
  DOCUMENT.getElementById.bind(DOCUMENT);

export const getElementsByTagName = <K extends keyof HTMLElementTagNameMap>(
  tags: K,
  elem: HTMLElement | Document = DOCUMENT
): HTMLCollectionOf<HTMLElementTagNameMap[K]> =>
  elem.getElementsByTagName.call(elem, tags);

export const querySelector = <T = HTMLElement>(
  selectors: keyof HTMLElementTagNameMap,
  elem: HTMLElement | Document = DOCUMENT
): T => elem.querySelector.call(elem, selectors);

export const stopPropagation = (e: Event): void => e.stopPropagation();

export function setStyle(
  elem: HTMLElement,
  key: keyof CSSStyleDeclaration,
  value: string
): void {
  // CSSStyleDeclaration.prototype.setProperty.call(elem, key, value);
  elem.style[key as any] = value;
}

export function displayNone(elem: HTMLElement): void {
  setStyle(elem, "display", "none");
}

export const appendChild = <T extends HTMLElement>(
  parent: HTMLElement,
  child: HTMLElement
): T => {
  return _appendChild.call(parent, child) as T;
};

const _appendChild = DOCUMENT.appendChild;

export const prependChild = <T extends HTMLElement>(
  parent: HTMLElement,
  child: HTMLElement
): T => {
  return _prependChild.call(parent, child) as T;
};

const _prependChild = DOCUMENT.prepend;
