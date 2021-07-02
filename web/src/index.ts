import { Nav, Card, ToastContainer } from "@Components";
import { Home, Settings } from "@Screens";
import { WBlindsNamespace } from "./namespace";
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

// Bottom nav bar buttons
const labels = [
  { t: "Home", i: home },
  { t: "Routines", i: clock },
  { t: "Settings", i: cog },
];

export default (ns: WBlindsNamespace): void => {
  debug("onLoad(): ", ns);
  mock.init();
  const body = querySelector("body");
  const app = getElement("app");
  let currentIndex = -1;
  let currentTab: Home | Settings;
  ns.state = State;

  // Toasts
  const tc = ToastContainer();
  appendChild(body, tc.node);
  WINDOW.onerror = handleError;
  WINDOW.onpopstate = (e: PopStateEvent) => {
    handleRoute(pathname());
    emitQueryChange();
  };

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
    const newPath = `/${labels[nextIndex].t.toLowerCase()}`;
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
        if (!State.isLoaded(STATE)) {
          load("settings?type=gen", [], ["settings.gen"]).then(() => {
            load(STATE);
            load(PRESETS);
            load(DEVICES);
          });
        }
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
    if (data?.gen?.pass) {
      data.gen.pass = undefined;
    }
    // remove mqtt password
    if (data?.mqtt?.pass) {
      data.mqtt.pass = undefined;
    }
    return data;
  };

  function saveSettings() {
    debug("saveSettings: ", State._state);
    State.setSaving(SETTINGS, true);
    debug("State._state.settings: ", State._state.settings);
    debug("State._state.pendingState: ", State._state.pendingState);

    const body = diffDeep(State._state.settings, State._state.pendingState);
    debug("diffed: ", body);
    doFetch(SETTINGS, HTTP_PUT, { body })
      .then(() => {
        State.setSaving(SETTINGS, false);
        State.update(SETTINGS, stripPasswords(State._state.pendingState));
        tc.pushToast("Settings saved");
      })
      .catch((e) => {
        tc.pushToast("Failed to save settings");
        throw e;
      });
  }

  function cancelSettings() {
    debug("cancelSettings: ", State._state);
    State.update(PENDING_STATE, State._state.settings);
  }

  function handleDeviceClick(data: DeviceRecord) {
    // Show device card
    const card = Card(data);
    appendChild(body, card.node);
    card.onChange((e) => {
      wsc.push(WSEventType.UpdateState, e);
    });
    setTimeout(card.show);
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

  // Websocket
  const wsc = makeWebsocket({
    onMessage(msg: WSIncomingEvent) {
      debug("WS msg: ", msg);
      if (msg.type === WSEventType.UpdateSettings) {
        State.update(SETTINGS, {
          ...State.get<StateData["settings"]>(SETTINGS),
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

  function handleError(
    err: string | Event | (Error & { response?: Response; message?: string })
  ): void {
    console.error(err);
    const m = isObject(err)
      ? (err?.message || DEFAULT_ERROR) + "\n" + err.stack
      : err;
    tc.pushToast(m as string, true);
  }
};
