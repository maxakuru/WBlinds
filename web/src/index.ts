import { Nav, Card } from "./components";
import { Home } from "./pages";
import { WBlindsNamespace } from "./types";
import { debug, getElement } from "./util";
import { mock } from "../tools/mock";
import { fetchJson } from "./api";
import { State } from "./state";

export default function (ns: WBlindsNamespace): void {
  debug("onLoad(): ", ns);
  mock.init();
  const body = document.querySelector("body");
  const app = getElement("app");
  (window as any).wblinds.State = State;

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
        break;
      }
      // Settings
      case 2: {
        break;
      }
    }
    app.appendChild(currentTab.node);
  }
  handleTabChange(0);

  function handleDeviceClick(device: any) {
    console.log("device clicked: ", device);
    // Show device card
    const card = Card({});
    body.appendChild(card.node);
    setTimeout(card.show);
  }

  // add nav
  const nav = Nav();
  console.log("node: ", nav.node);
  getElement("nav").appendChild(nav.node);
  console.log("nav: ", nav.currentIndex());
  nav.onClick(handleTabChange);
}
