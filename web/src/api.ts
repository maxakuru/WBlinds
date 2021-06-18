export const enum HTTPMethod {
  GET = "GET",
  POST = "POST",
}

const api = process.env.API_ENDPOINT;
/**
 *
 */
export function fetchJson(href: string, method?: HTTPMethod): Promise<any> {
  return fetch(`${api}${href}`, {
    method,
  }).then((res) => {
    if (!res.ok) {
      throw res;
    }
    return res.json();
  });
}
