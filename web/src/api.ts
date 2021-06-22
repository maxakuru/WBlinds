import { debug, isObject, wait } from "@Util";

export const HTTP_POST = "POST";
export const HTTP_PUT = "PUT";
export const HTTP_GET = "GET";
export type HTTPMethod = typeof HTTP_POST | typeof HTTP_PUT | typeof HTTP_GET;

/**
 * Begins with /
 * Does not end with /
 */
const api = process.env.API_ENDPOINT;

/**
 * Do fetch on some route of the API
 * @param resource - The resource, without "/" prefix
 * @param method - HTTP method
 * @param [opts]
 */
export const doFetch = (
  resource: string,
  method?: HTTPMethod,
  opts?: any
): Promise<any> => {
  return _doFetch(resource, method, opts);
};

const _doFetch = (
  resource: string,
  method?: HTTPMethod,
  opts?: any,
  attempt?: number
): Promise<any> => {
  attempt = attempt || 0;
  opts = opts || {};
  method = method || HTTP_GET;
  const body = isObject(opts.body) ? JSON.stringify(opts.body) : opts.body;
  const headers = { ...(opts.headers || {}) };
  if (body) headers["content-type"] = "application/json";
  const url = `${api}/${resource}`;
  return fetch(url, {
    body,
    method,
    headers,
  }).then((res) => {
    debug("got res: ", res);
    if (!res.ok) {
      attempt += 1;
      if (attempt > 8 || res.status < 500) {
        const e = new Error(`[${method}] ${url} failed (${res.status})`);
        (e as any).response = res;
        throw e;
      }
      return wait(attempt * 5000).then(() =>
        _doFetch(resource, method, opts, attempt)
      );
    }
    return method === HTTP_GET ? res.json() : undefined;
  });
};
