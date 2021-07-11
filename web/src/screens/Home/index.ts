import {
  addClass,
  appendChild,
  createDiv,
  getElement,
  nextTick,
  removeClass,
  displayNone,
  debug,
} from "@Util";
import { ComponentFunction, Component, Tile } from "@Components";
import template from "./Home.html";
import { DeviceRecord, SettingsData, State, StateData } from "@State";
import "./Home.css";
import { DEVICES, PRESETS, STATE } from "@Const";

type DeviceClickHandler = (data: DeviceRecord) => void;
export interface HomeAPI {
  onDeviceClick: (handler: DeviceClickHandler) => void;
  destroy(): void;
}

const DEVICE_TILE = "device";
const PRESET_TILE = "preset";

const _Home: ComponentFunction<HomeAPI> = function () {
  let _loading = true;
  let _tiles: Tile[] = [];
  let _deviceClickHandlers: DeviceClickHandler[] = [];
  let _currentDeviceName: string;
  let _rmObservers: (() => void)[] = [];

  this.init = (elem: HTMLElement) => {
    // initially spinner is showing,
    // rest is hidden in a div

    const loaded = () => {
      if (!_loading) return;
      const spinner = getElement("hl");
      const content = getElement("hlc");
      displayNone(spinner);
      removeClass(content, "hide");
      _loading = false;
    };

    const getAllTiles = (
      type: "preset" | "device"
    ): {
      container: HTMLElement;
      tiles: NodeListOf<HTMLDivElement>;
    } => {
      const container = getElement(`${type}-tiles`);
      return { container, tiles: container.querySelectorAll("div") };
    };

    const padTiles = (type: "preset" | "device") => {
      const { container, tiles } = getAllTiles(type);
      const w = container.clientWidth;
      const perRow = Math.floor(w / 110);
      let len = tiles.length;
      while (len % perRow !== 0) {
        const e = createDiv();
        addClass(e, "tile", "sq", "em");
        appendChild(container, e);
        len++;
      }
    };

    const handleTileClick = (type: "device" | "preset", data: any) => {
      if (type === "device") {
        _deviceClickHandlers.forEach((h) => h(data));
      } else {
        // TODO: handle preset click
      }
    };

    const updateTiles = (
      type: "preset" | "device",
      o: Record<string, DeviceRecord>
    ) => {
      const { container, tiles } = getAllTiles(type);
      let cDeviceExists = false;

      tiles.forEach((tile) => {
        const { id } = tile;
        if (!(id in o)) {
          // Existing tile, but doesn't exist in new device list.
          if (id === _currentDeviceName) {
            // Don't remove current device, even when device
            // list is updated with peers.
            cDeviceExists = true;
          } else {
            tile.remove();
          }
        } else {
          // Exists, remove from list so it isn't added again
          o[id] = undefined;
        }
      });

      for (const [k, v] of Object.entries(o)) {
        if (!v || (k === _currentDeviceName && cDeviceExists)) continue;
        const t = Tile({
          id: `tile-${k}`,
          name: (v as any).name || k,
          ...(v as any),
        });
        t.onClick((data) => handleTileClick(type, data));
        _tiles.push(t);
        appendChild(container, t.node);
      }
      padTiles(type);
    };

    nextTick(() => {
      let rmObs = State.observe(PRESETS, ({ value, prev }) => {
        debug("presets updated: ", value, prev);
        loaded();

        // TODO: define PresetRecord
        updateTiles(PRESET_TILE, value as any);
      });
      _rmObservers.push(rmObs);

      rmObs = State.observe(STATE, ({ value, prev }) => {
        debug("state updated: ", value, prev);
        _currentDeviceName = State.get("settings.gen.deviceName");
        console.log("_currentDeviceName:", _currentDeviceName);
        loaded();

        // TODO: add mac address, etc. to window before sending from ESP
        // for now just use 'c' to identify the current device
        const gen = State.get("settings.gen") as SettingsData["gen"];
        const state = State.get("state") as StateData["state"];
        debug("set tile: ", gen.deviceName, {
          ...gen,
          ...value,
          ...state,
        });
        updateTiles(DEVICE_TILE, {
          [gen.deviceName]: { ...gen, ...value, ...state },
        });
      });
      _rmObservers.push(rmObs);

      rmObs = State.observe(DEVICES, ({ value, prev }) => {
        debug("devices updated: ", value, prev);
        loaded();

        updateTiles(DEVICE_TILE, value);
      });
      _rmObservers.push(rmObs);
    });

    return {
      onDeviceClick: (h: DeviceClickHandler) => {
        _deviceClickHandlers.push(h);
      },
      destroy: () => {
        _rmObservers.forEach((rm) => rm());
        _rmObservers = [];
        _deviceClickHandlers = [];
        _tiles.forEach((t) => t.destroy());
        _tiles = [];
      },
    };
  };
  return template;
};

export type Home = Component<HomeAPI>;
export const Home = Component(_Home);
