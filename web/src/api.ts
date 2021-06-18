export const enum HTTPMethod {
  GET = "GET",
  POST = "POST",
}

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
