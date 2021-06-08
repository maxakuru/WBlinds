import { getElement } from "../util";
import { ComponentCtx, _Component, Component } from "../components/Component";
import html from "./Home.html";
import { State } from "../state";
import Tile from "../components/Tile";

interface HomeAPI {
  temp?: boolean;
}

const DEVICE_TILE = "device";
const PRESET_TILE = "preset";

const Home: Component<HomeAPI> = function () {
  const loading = true;
  this.init = function (elem: HTMLElement) {
    // initially spinner is showing,
    // rest is hidden in a div

    // const buttons = elem.querySelectorAll("li");
    // buttons.forEach((b, index) => {
    //   b.addEventListener("click", () => {
    //     i = index;
    //     clickHandlers.map((c) => c.call(undefined, index));
    //   });
    // });

    function loaded() {
      if (!loading) return;
      const spinner = getElement("hl");
      spinner.style.display = "none";

      const content = getElement("hlc");
      content.classList.remove("hide");
    }

    function getAllTiles(type: "preset" | "device"): {
      container: HTMLElement;
      tiles: NodeListOf<HTMLDivElement>;
    } {
      const container = getElement(`${type}-tiles`);
      return { container, tiles: container.querySelectorAll("div") };
    }

    function padTiles(type: "preset" | "device") {
      const { container, tiles } = getAllTiles(type);
      const w = container.clientWidth;
      const perRow = Math.floor(w / 110);
      let len = tiles.length;
      while (len % perRow !== 0) {
        const e = document.createElement("div");
        e.classList.add("tile", "sq", "em");
        container.appendChild(e);
        len++;
      }
    }

    function updateTiles(type: "preset" | "device", o: any) {
      const { container, tiles } = getAllTiles(type);
      tiles.forEach((tile) => {
        if (!(tile.id in o)) {
          // Existing, but doesn't exist in state
          // TODO: Remove component
        } else {
          // Exists, remove from list so it isn't added again
          o[tile.id] = undefined;
        }
      });

      for (const [k, v] of Object.entries(o)) {
        if (!v) continue;
        const t = Tile({
          id: `tile-${k}`,
          ...(v as any),
        });
        container.appendChild(t.node);
      }
      padTiles(type);
    }

    State.observe(PRESET_TILE + "s", ({ value, prev }) => {
      console.log("presets updated: ", value, prev);
      loaded();

      updateTiles(PRESET_TILE, value);
    });

    State.observe(DEVICE_TILE + "s", ({ value, prev }) => {
      console.log("devices updated: ", value, prev);
      loaded();

      updateTiles(DEVICE_TILE, value);
    });

    return {
      temp: true,
    };
  };
  return html;
};

export default _Component(Home);
