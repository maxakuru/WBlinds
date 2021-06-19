export * from "./min";

export function isObject(o: unknown): o is Record<string, unknown> {
  return o && typeof o === "object" && !Array.isArray(o);
}

export const mergeDeep = (target: unknown, ...sources: unknown[]): any => {
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
};

/**
 * Returns new object that is the difference between source and target.
 * Entries that exist or are different in target are returned.
 * If source contains keys that target doesn't, they are ignored.
 * Ignores arrays, only returns them as is from target.
 *
 * @param source
 * @param target
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const diffDeep = (source: any, target: any): any => {
  return Object.keys(target).reduce((diff, key) => {
    if (source[key] === target[key] || target[key] == null) return diff;
    if (isObject(source[key]) && isObject(target[key])) {
      // both keys are objects, diff recursively
      return {
        ...diff,
        [key]: diffDeep(source[key], target[key]),
      };
    }
    return {
      ...diff,
      [key]: target[key],
    };
  }, {});
};

export const getQueryParam = (param: string): string | false => {
  const query = window.location.search.substring(1);
  const vars = query.split("&");
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split("=");
    if (pair[0] == param) {
      return pair[1];
    }
  }
  return false;
};

export const wait = (duration: number): Promise<void> => {
  return new Promise((res) => {
    setTimeout(res, duration);
  });
};

export function debug(...msgs: any[]): void {
  // TODO: enable debugging by localstorage
  if (process.env.DEBUG === "true") console.debug(...msgs);
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
