import { Nav, Card, ToastContainer } from "@Components";
import { Home, Settings } from "@Screens";
import { WBlindsNamespace } from "./namespace";
import {
  appendChild,
  debug,
  diffDeep,
  getElement,
  isObject,
  pushToHistory,
  querySelector,
} from "@Util";
import { mock } from "../tools/mock";
import { doFetch, HTTP_PUT } from "@Api";
import { SettingsData, State, StateData } from "@State";
import { makeWebsocket, WSEventType, WSIncomingEvent } from "./ws";
import {
  SETTINGS,
  STATE,
  PRESETS,
  DEVICES,
  DEFAULT_ERROR,
  PENDING_STATE,
} from "@Const";

// Bottom nav bar buttons
const labels = ["Home", "Routines", "Settings"];

export default (ns: WBlindsNamespace): void => {
  debug("onLoad(): ", ns);
  mock.init();
  const body = querySelector("body");
  const app = getElement("app");
  ns.state = State;

  // Nav
  const nav = Nav({ labels });
  appendChild(getElement("nav"), nav.node);
  nav.onClick(handleTabChange);

  // Toasts
  const tc = ToastContainer({});
  appendChild(body, tc.node);
  window.onerror = handleError;
  window.onpopstate = (e: any) => {
    console.log("on pop state: ", e);
  };

  let currentIndex = -1;
  let currentTab: Home | Settings;
  function handleTabChange(nextIndex: number) {
    if (currentIndex === nextIndex) return;

    currentIndex = nextIndex;
    currentTab?.destroy?.();
    currentTab?.node.remove();

    pushToHistory(`/${labels[currentIndex].toLowerCase()}`);

    // change app screen
    switch (nextIndex) {
      // Home
      case 0: {
        const t = Home();

        t.onDeviceClick(handleDeviceClick);
        if (!State.isLoaded(STATE)) {
          load(STATE);
          load(PRESETS);
          load(DEVICES);
        }
        currentTab = t;
        break;
      }

      // Routines
      case 1: {
        currentTab = null;
        break;
      }

      // Settings
      case 2: {
        const t = Settings();
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

  const handleRoute = (path: string): void => {
    let i = labels.map((l) => l.toLowerCase()).indexOf(path.substr(1));
    if (i < 0) i = 0;
    nav.setIndex(i);
  };

  handleRoute(location.pathname);

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
    const body = diffDeep(State._state.state, State._state.pendingState);
    doFetch(SETTINGS, HTTP_PUT, { body }).then(() => {
      State.setSaving(SETTINGS, false);
      State.update(SETTINGS, stripPasswords(State._state.pendingState));
    });
  }

  function cancelSettings() {
    debug("cancelSettings: ", State._state);
    State.update(PENDING_STATE, State._state.settings);
  }

  function handleDeviceClick(device: any) {
    // Show device card
    const card = Card({});
    appendChild(body, card.node);
    setTimeout(card.show);
  }

  function load(
    key: keyof Omit<StateData, "pendingState">,
    updates: (keyof StateData)[] = [key]
  ) {
    return doFetch(key)
      .then((r) => {
        updates.map((k) => State.update(k, r));
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
    tc.pushToast(m as string, true, true);
  }
};
