import Nav from "./components/Nav";
import Home from "./pages/Home";
import { WBlindsNamespace } from "./types";
import {
  mergeDeep,
  debug,
  getElement,
  setLoading,
  getComponentContainer,
} from "./util";
import { mock } from "../tools/mock";
import { fetchJson } from "./api";
import { State } from "./state";

export default function (ns: WBlindsNamespace): void {
  debug("onLoad(): ", ns);
  mock.init();
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
  function handleTabChange(nextIndex: number) {
    console.log("on click! ", nextIndex);
    if (currentIndex === nextIndex) return;

    currentIndex = nextIndex;

    // change app screen
    switch (nextIndex) {
      case 0: {
        const nav = Home();
        console.log("node: ", nav.node);
        const app = getElement("app");
        app.firstChild.remove();
        app.appendChild(nav.node);
        break;
      }
      case 1: {
        break;
      }
      case 2: {
        break;
      }
    }
  }
  handleTabChange(0);

  // add nav
  const nav = Nav();
  console.log("node: ", nav.node);
  getElement("nav").appendChild(nav.node);
  console.log("nav: ", nav.currentIndex());
  nav.onClick(handleTabChange);
}
