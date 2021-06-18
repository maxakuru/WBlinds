import { Nav, Card, ToastContainer } from "@Components";
import { Home, Settings } from "@Screens";
import { WBlindsNamespace } from "./namespace";
import { appendChild, debug, getElement, isObject, querySelector } from "@Util";
import { mock } from "../tools/mock";
import { doFetch } from "@Api";
import { State, StateData } from "@State";
import { makeWebsocket, WSEventType, WSIncomingEvent } from "./ws";
import {
  SETTINGS,
  STATE,
  PRESETS,
  DEVICES,
  DEFAULT_ERROR,
  PENDING_STATE,
} from "@Const";

export default (ns: WBlindsNamespace): void => {
  debug("onLoad(): ", ns);
  mock.init();
  const body = querySelector("body");
  const app = getElement("app");
  ns.state = State;

  // Toasts
  const tc = ToastContainer({});
  appendChild(body, tc.node);
  window.onerror = handleError;

  let currentIndex = -1;
  let currentTab: Home | Settings;
  const handleTabChange = (nextIndex: number) => {
    if (currentIndex === nextIndex) return;

    currentIndex = nextIndex;
    currentTab?.destroy?.();
    currentTab?.node.remove();

    // change app screen
    switch (nextIndex) {
      // Home
      case 0: {
        const t = Home();
        t.onDeviceClick(handleDeviceClick);
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
  };
  handleTabChange(0);

  function saveSettings() {
    console.log("saveSettings: ", State._state);
    // TODO: API call
    State.update(SETTINGS, State._state.pendingState);
  }

  function cancelSettings() {
    console.log("cancelSettings: ", State._state);
    State.update(PENDING_STATE, State._state.settings);
  }

  function handleDeviceClick(device: any) {
    // Show device card
    const card = Card({});
    appendChild(body, card.node);
    setTimeout(card.show);
  }

  // Data
  load(STATE);
  load(PRESETS);
  load(DEVICES);

  function load(key: keyof StateData, updates: (keyof StateData)[] = [key]) {
    return doFetch(`/${key}`)
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
    const m = isObject(err) ? err?.message || DEFAULT_ERROR : err;
    tc.pushToast(m as string, true);
  }

  // Nav
  const nav = Nav();
  appendChild(getElement("nav"), nav.node);
  nav.onClick(handleTabChange);
};
