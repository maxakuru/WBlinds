export const enum HTTPMethod {
  GET = "GET",
  POST = "POST",
}

/**
 *
 */
export function fetchJson(url: string, method?: HTTPMethod): Promise<any> {
  console.log("this: ", this);
  return fetch(url, {
    method,
  }).then((res) => {
    if (!res.ok) {
      throw res;
    }
    return res.json();
  });
}
