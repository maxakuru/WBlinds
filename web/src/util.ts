export * from "./min";

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

export function emptyObject(obj: any): boolean {
  return Object.keys(obj).length === 0;
}

export function pruneUndef<T>(obj: T): T {
  const o: T = {} as T;
  for (const k in obj) {
    if (obj[k] != null) {
      o[k] = obj[k];
    }
  }
  return o;
}

export const appendChild = (parent: HTMLElement, child: HTMLElement) =>
  parent.appendChild(child);
