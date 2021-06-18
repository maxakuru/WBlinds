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

export default function (ns: WBlindsNamespace): void {
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
  function handleTabChange(nextIndex: number) {
    console.log("on click! ", nextIndex);
    if (currentIndex === nextIndex) return;

    currentIndex = nextIndex;
    currentTab?.destroy?.();
    console.log("currentTab.node: ", currentTab?.node);
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
        currentTab = t;
        if (!State.isLoaded(SETTINGS)) {
          load(SETTINGS).then((res) => res && State.update(PENDING_STATE, res));
        }
        break;
      }
    }
    currentTab && appendChild(app, currentTab.node);
  }
  handleTabChange(0);

  function handleDeviceClick(device: any) {
    console.log("device clicked: ", device);
    // Show device card
    const card = Card({});
    appendChild(body, card.node);
    setTimeout(card.show);
  }

  // Data
  load(STATE);
  load(PRESETS);
  load(DEVICES);

  function load(key: keyof StateData) {
    return doFetch(`/${key}`)
      .then((r) => {
        State.update(key, r);
        return r;
      })
      .catch(handleError);
  }

  // Websocket
  const wsc = makeWebsocket({
    onMessage(msg: WSIncomingEvent) {
      console.log("WS msg: ", msg);
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
      console.log("WS connect: ", e);
      if (num) {
        tc.pushToast("Websocket connected!");
      }
    },
    onDisconnect(e: CloseEvent) {
      console.log("WS disconnect: ", e);
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
  console.log("node: ", nav.node);
  appendChild(getElement("nav"), nav.node);
  console.log("nav: ", nav.currentIndex());
  nav.onClick(handleTabChange);
}
