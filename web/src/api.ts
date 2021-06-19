import { debug, isObject, wait } from "@Util";

export const HTTP_POST = "POST";
export const HTTP_PUT = "PUT";
export const HTTP_GET = "GET";
export type HTTPMethod = typeof HTTP_POST | typeof HTTP_PUT | typeof HTTP_GET;

const api = process.env.API_ENDPOINT;
/**
 *
 */
export function doFetch(
  href: string,
  method?: HTTPMethod,
  opts?: any
): Promise<any> {
  return _doFetch(href, method, opts);
}

function _doFetch(
  href: string,
  method: HTTPMethod = HTTP_GET,
  opts: any = {},
  attempt = 0
): Promise<any> {
  const body = isObject(opts.body) ? JSON.stringify(opts.body) : opts.body;
  const headers = { ...(opts.headers || {}) };
  if (body) headers["content-type"] = "application/json";
  return fetch(`${api}${href}`, {
    body,
    method,
    headers,
  }).then((res) => {
    debug("got res: ", res);
    if (!res.ok) {
      attempt += 1;
      if (attempt > 8 || res.status < 500) {
        const e = new Error(
          `Failed with ${res.status} on fetch [${method}] ${href}`
        );
        (e as any).response = res;
        throw e;
      }
      return wait(attempt * 5000).then(() =>
        _doFetch(href, method, opts, attempt)
      );
    }
    return res.json();
  });
}
