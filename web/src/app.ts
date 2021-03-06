import { Nav, Card, ToastContainer } from "@Components";
import { Home, Settings } from "@Screens";
import type { WBlindsNamespace } from "./namespace";
import {
  appendChild,
  debug,
  diffDeep,
  emitQueryChange,
  getElement,
  isObject,
  pathname,
  pushToHistory,
  querySelector,
} from "@Util";
import { mock } from "../tools/mock";
import { doFetch, HTTP_PUT } from "@Api";
import { DeviceRecord, SettingsData, State, StateData } from "@State";
import { makeWebsocket, WSEventType, WSIncomingEvent } from "./ws";
import {
  SETTINGS,
  STATE,
  PRESETS,
  DEVICES,
  DEFAULT_ERROR,
  PENDING_STATE,
} from "@Const";
import { WINDOW } from "min";
import { home, cog, clock } from "./assets";

import "./app.css";

/** @const */
export const s = State;

/** @const */
export const run = (ns: WBlindsNamespace): void => {
  // Bottom nav bar buttons
  const labels = [
    { t: "Home", i: home },
    { t: "Routines", i: clock },
    { t: "Settings", i: cog },
  ];

  mock.init();
  // Hack to make favicon cacheable in Chrome
  // add href after document load, replacing empty data url
  (getElement("favicon") as HTMLLinkElement).href = "favicon.ico";
  const body = querySelector("body");
  const app = getElement("app");
  let currentIndex = -1;
  let currentTab: Home | Settings;
  ns.state = State;

  // Toasts
  const tc = ToastContainer();
  ns.tc = tc;
  appendChild(body, tc.node);
  WINDOW.onerror = handleError;
  WINDOW.onpopstate = (e: PopStateEvent) => {
    handleRoute(pathname());
    emitQueryChange();
  };

  // Websocket
  const wsc = makeWebsocket({
    onMessage(msg: WSIncomingEvent) {
      debug("WS msg: ", msg);
      if (msg.type === WSEventType.Setting) {
        State.update(SETTINGS, {
          ...State.get<StateData["settings"]>(SETTINGS),
          ...msg.data,
        });
      }
      if (msg.type === WSEventType.State) {
        State.update(STATE, {
          ...State.get<StateData["state"]>(STATE),
          ...msg.data,
        });
      }
    },
    onError(e: any, num: number) {
      if (!num) {
        tc.pushToast("Websocket disconnected!", true, false, 5000);
      }
    },
    onConnect(e: Event, num: number) {
      debug("WS connect: ", e);
      if (num) {
        tc.pushToast("Websocket connected!");
      }
    },
    onDisconnect(e: CloseEvent) {
      debug("WS disconnect: ", e);
    },
  });

  // Nav
  const nav = Nav({ labels });
  appendChild(getElement("nav"), nav.node);
  nav.onClick(handleTabChange);
  const handleRoute = (path: string): void => {
    let i = labels.map((l) => l.t.toLowerCase()).indexOf(path.substr(1));
    if (i < 0) i = 0;
    nav.setIndex(i);
  };
  handleRoute(pathname());

  function handleTabChange(nextIndex: number) {
    if (currentIndex === nextIndex) return;
    const newPath =
      nextIndex > 0 ? `/${labels[nextIndex].t.toLowerCase()}` : `/`;
    currentIndex = nextIndex;
    currentTab?.destroy?.();
    currentTab?.node.remove();

    // change app screen
    switch (nextIndex) {
      // Home
      case 0: {
        const t = Home();
        pushToHistory(newPath, undefined, true);
        t.onDeviceClick(handleDeviceClick);
        currentTab = t;
        break;
      }

      // Routines
      case 1: {
        pushToHistory(newPath, undefined, true);
        currentTab = null;
        break;
      }

      // Settings
      case 2: {
        const t = Settings();
        pushToHistory(newPath, undefined, false);

        t.onSave(saveSettings);
        t.onCancel(cancelSettings);
        t.onCalib(handleCalibrationEvent);

        currentTab = t;
        if (!State.isLoaded(SETTINGS)) {
          load(SETTINGS, [PENDING_STATE, SETTINGS]);
        }
        break;
      }
    }
    currentTab && appendChild(app, currentTab.node);
  }

  const stripPasswords = (
    data: Partial<SettingsData>
  ): Partial<SettingsData> => {
    // remove wifi password
    if (data?.["gen"]?.["pass"]) {
      data["gen"]["pass"] = undefined;
    }
    // remove mqtt password
    if (data?.["mqtt"]?.["pass"]) {
      data["mqtt"]["pass"] = undefined;
    }
    return data;
  };

  function saveSettings() {
    debug("saveSettings: ", State._state);
    State.setSaving(SETTINGS, true);

    const body = diffDeep(State.get("settings"), State.get("pendingState"));
    doFetch(SETTINGS, HTTP_PUT, { body })
      .then(() => {
        State.setSaving(SETTINGS, false);
        State.update(SETTINGS, stripPasswords(State.get("pendingState")));
        tc.pushToast("Settings saved");
      })
      .catch((e) => {
        tc.pushToast("Failed to save settings");
        throw e;
      });
  }

  function cancelSettings() {
    State.update(PENDING_STATE, State.get("settings"));
  }

  function handleDeviceClick(data: DeviceRecord) {
    // Show device card
    const card = Card(data);
    appendChild(body, card.node);
    card.onChange((e) => {
      wsc.push(WSEventType.State, e);
    });
    setTimeout(card.show);
  }

  function handleCalibrationEvent(data: DeviceRecord) {
    wsc.push(WSEventType.Calibration, data);
  }

  function load(
    key: keyof Omit<StateData, "pendingState"> | "settings?type=gen",
    updates?: (keyof StateData)[],
    sets: string[] = []
  ) {
    updates = updates || ([key] as any[]);

    return doFetch(key)
      .then((r) => {
        updates.forEach((k) => State.update(k, r));
        sets.forEach((k) => State.set(k, r));
        return r;
      })
      .catch(handleError);
  }

  function handleError(
    err: string | Event | (Error & { response?: Response; message?: string })
  ): void {
    const m = isObject(err)
      ? (err?.message || DEFAULT_ERROR) + "\n" + err.stack
      : err;
    tc.pushToast(m as string, true);
  }
};
