export function isObject(o: unknown): o is Record<string, unknown> {
  return o && typeof o === "object" && !Array.isArray(o);
}

export function mergeDeep(target: unknown, ...sources: unknown[]): any {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  return mergeDeep(target, ...sources);
}

export function debug(...msgs: any[]): void {
  // TODO: enable debugging by localstorage
  if (process.env.NODE_ENV === "dev") console.debug(...msgs);
}

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

export const stopPropagation = (e: any) => e.stopPropagation();
/**
 * Type alias for containers
 */
export const getComponentContainer: (id: "nav-c") => HTMLElement = getElement;

export function setLoading(segName: string, loading = false) {
  if (loading) {
    // todo
  } else {
    getElement(`${segName}-s`).style.display = "none";
  }
}
