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
  opts: any = {}
): Promise<any> {
  return _doFetch(href, method, opts);
}

function _doFetch(
  href: string,
  method?: HTTPMethod,
  opts: any = {},
  attempt = 0
): Promise<any> {
  return fetch(`${api}${href}`, {
    method,
  }).then((res) => {
    if (!res.ok) {
      attempt += 1;
      if (attempt > 8) {
        const e = new Error(
          `Failed with ${res.status} on fetch [${method}] ${href}`
        );
        (e as any).response = res;
        throw e;
      }
      setTimeout(_doFetch.bind(href, method, opts, attempt), attempt * 5000);
    }
    return res.json();
  });
}
