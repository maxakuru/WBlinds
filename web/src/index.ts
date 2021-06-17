import { Nav, Card } from "./components";
import { Home } from "./pages";
import { WBlindsNamespace } from "./types";
import { debug, getElement, querySelector } from "./util";
import { mock } from "../tools/mock";
import { fetchJson } from "./api";
import { State } from "./state";
import { makeWebsocket, WSEventType, WSIncomingEvent } from "./ws";
import { ToastContainer } from "./components/ToastContainer";

export default function (ns: WBlindsNamespace): void {
  debug("onLoad(): ", ns);
  mock.init();
  const body = querySelector("body");
  const app = getElement("app");
  (window as any).wblinds.State = State;

  // Toasts
  const tc = ToastContainer({});
  body.appendChild(tc.node);
  window.onerror = (e) => {
    tc.pushToast(e.toString(), true);
  };

  fetchJson("/state").then((res) => {
    console.log("state res: ", res);
    State.update("state", res);
  });

  // fetch home state
  fetchJson("/presets").then((res) => {
    console.log("presets res: ", res);
    State.update("presets", res);
  });

  fetchJson("/devices").then((res) => {
    console.log("devices res: ", res);
    State.update("devices", res);
  });

  let currentIndex = -1;
  let currentTab: Home;
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
        console.log("node: ", currentTab.node);

        break;
      }
      // Routines
      case 1: {
        currentTab = null;
        break;
      }
      // Settings
      case 2: {
        currentTab = null;
        break;
      }
    }
    currentTab && app.appendChild(currentTab.node);
  }
  handleTabChange(0);

  function handleDeviceClick(device: any) {
    console.log("device clicked: ", device);
    // Show device card
    const card = Card({});
    body.appendChild(card.node);
    setTimeout(card.show);
  }

  // Websocket
  const wsc = makeWebsocket({
    onMessage(msg: WSIncomingEvent) {
      console.log("WS msg: ", msg);
      if (msg.type === WSEventType.UpdateSettings) {
        State.update("settings", {
          ...State.get<State["_state"]["settings"]>("settings"),
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

  // Nav
  const nav = Nav();
  console.log("node: ", nav.node);
  getElement("nav").appendChild(nav.node);
  console.log("nav: ", nav.currentIndex());
  nav.onClick(handleTabChange);
}
