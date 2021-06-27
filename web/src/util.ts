export * from "./min";

export const isObject = (o: unknown): o is Record<string, unknown> => {
  return o && typeof o === "object" && !Array.isArray(o);
};

export function isNullish(o: any): o is void {
  return o == null;
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

export const getQueryParam = (
  param: string,
  qpStr?: string
): string | false => {
  qpStr = qpStr || location.search;
  const query = qpStr.substring(1);
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

export const debug = (...msgs: any[]): void => {
  // TODO: enable debugging by localstorage
  if (process.env.DEBUG === "true") console.debug(...msgs);
};

export const emptyObject = (obj: any): boolean => {
  return Object.keys(obj).length === 0;
};

export const pruneUndef = <T>(obj: T): T => {
  const o: T = {} as T;
  for (const k in obj) {
    if (obj[k] != null) {
      o[k] = obj[k];
    }
  }
  return o;
};

type QueryChangeHandler = () => void;
const _queryChangeHandlers: QueryChangeHandler[] = [];
export const onQueryChange = (h: QueryChangeHandler): (() => void) => {
  const ind = _queryChangeHandlers.push(h);
  return () => {
    console.log(
      "delete: ",
      _queryChangeHandlers,
      ind,
      _queryChangeHandlers[ind - 1]
    );
    delete _queryChangeHandlers[ind - 1];
  };
};

const query = () => location.search;
export const pathname = (): string => location.pathname;

const _callQueryHandlers = () => {
  _queryChangeHandlers.forEach((h: QueryChangeHandler) => {
    h && h();
  });
};

let _lastQp = query();
export const emitQueryChange = (): void => {
  const q = query();
  debug("q === query: ", q, _lastQp, location.search);
  if (q === _lastQp) return;
  _lastQp = q;
  _callQueryHandlers();
};

export const pushToHistory = (
  path?: string,
  qps?: Record<string, string>,
  resetQps?: boolean
): void => {
  qps = qps || {};
  if (isNullish(resetQps)) resetQps = true;
  const cPath = pathname();
  const cSearch = query();
  const params = new URLSearchParams(resetQps ? "" : cSearch);
  for (const k in qps) {
    params.set(k, qps[k]);
  }
  let qpStr = params.toString();
  if (qpStr.length > 0) qpStr = "?" + qpStr;

  if (path === cPath && qpStr === cSearch) {
    // no change
    debug("no change: ", path, cPath, qpStr, cSearch);
    return;
  }

  const fullPath = (path || cPath) + qpStr;
  debug("push history: ", fullPath);
  history.pushState(null, "", fullPath);
  if (qpStr !== cSearch) {
    _callQueryHandlers();
  }
};
