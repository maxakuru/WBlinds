/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

// eslint-disable-next-line @typescript-eslint/no-var-requires
// import fetchMock from "fetch-mock";

let _mock = {
  init: () => {},
  restore: () => {},
};

console.log("use mocks: ", process.env.USE_MOCKS, typeof process.env.USE_MOCKS);
if (process.env.USE_MOCKS === "true") {
  const ogFetch = window.fetch;

  const presetResp: any = {
    "Going to bed": {
      state: {
        "mac-address": {
          position: 50,
          speed: 50,
          accel: 50,
        },
        "mac-address-2": {
          position: 50,
          speed: 50,
          accel: 50,
        },
      },
      routines: [],
    },
  };

  const devicesResp: any = {
    "mac-address": {
      name: "Bedroom Left",
      position: 50,
      speed: 50,
      accel: 50,
    },
    "mac-address-2": {
      name: "Bedroom Right",
      position: 50,
      speed: 50,
      accel: 50,
    },
    "mac-address-3": {
      name: "Bay Window Left",
      position: 50,
      speed: 50,
      accel: 50,
    },
    "mac-address-4": {
      name: "Bay Window Middle",
      position: 50,
      speed: 50,
      accel: 50,
    },
    "mac-address-5": {
      name: "Bay Window Right",
      position: 50,
      speed: 50,
      accel: 50,
    },
  };
  _mock = {
    init: () => {
      (window as any).fetch = async (url: string, opts: RequestInfo) => {
        return {
          json: () => {
            return url === "/devices" ? devicesResp : presetResp;
          },
          ok: true,
        };
      };
    },
    restore: () => {
      window.fetch = ogFetch;
    },
  };
}

export const mock = _mock;
