/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { HTTPMethod } from "@Api";

// eslint-disable-next-line @typescript-eslint/no-var-requires
// import fetchMock from "fetch-mock";

let _mock = {
  init: () => {},
  restore: () => {},
};

console.log("use mocks: ", process.env.USE_MOCKS, typeof process.env.USE_MOCKS);
if (process.env.USE_MOCKS === "true") {
  const ogFetch = window.fetch;

  const responseCodeMap: Record<HTTPMethod, number> = {
    GET: 200,
    PUT: 204,
    POST: 204,
  };

  const responseMap: any = {
    "/state": {
      GET: {
        pos: 50,
        tPos: 50,
        speed: 1000,
        accel: 9999999,
      },
    },
    "/settings": {
      GET: {
        gen: { deviceName: "WBlinds", mdnsName: "WBlinds", emitSync: true },
        hw: {
          pStep: 19,
          pDir: 18,
          pEn: 23,
          pSleep: 21,
          pReset: 3,
          pMs1: 1,
          pMs2: 5,
          pMs3: 17,
          pHome: 4,
          cLen: 1650,
          cDia: 0.1,
          axDia: 15,
          stepsPerRev: 200,
          res: 16,
        },
        mqtt: {
          enabled: true,
          host: "192.168.1.99",
          port: 1883,
          topic: "WBlinds",
          user: "max",
        },
      },
    },
    "/presets": {
      GET: {
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
      },
    },
    "/devices": {
      GET: {
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
      },
    },
  };

  _mock = {
    init: () => {
      (window as any).fetch = async (
        url: string,
        opts: Request = {} as any
      ) => {
        const method = (opts.method || "GET") as HTTPMethod;
        const hasResponse = !!responseMap[url] && !!responseMap[url][method];
        return Promise.resolve({
          json: () => {
            return hasResponse ? responseMap[url][method] : {};
          },
          statusCode: hasResponse ? responseCodeMap[method] : 404,
          ok: hasResponse,
        });
      };
    },
    restore: () => {
      window.fetch = ogFetch;
    },
  };
}

export const mock = _mock;
