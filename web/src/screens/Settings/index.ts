import {
  addClass,
  appendChild,
  createDiv,
  createElement,
  getElement,
  nextTick,
  querySelector,
  removeClass,
  displayNone,
  debug,
} from "@Util";
import {
  ComponentFunction,
  Component,
  Input,
  Selector,
  InputType,
} from "@Components";
import template from "./Settings.html";
import { State, SettingsData, DEFAULT_SETTINGS_DATA } from "@State";
import "./Settings.css";
import { PENDING_STATE, SETTINGS } from "@Const";
import {
  InputType_Boolean,
  InputType_Enum,
  InputType_Number,
  InputType_String,
} from "components/Input";

type ActHandler = () => void;
export interface SettingsAPI {
  destroy(): void;
  onSave: (h: ActHandler) => void;
  onCancel: (h: ActHandler) => void;
}

const InputGroup_Pins = 0;
const InputGroup_Physical = 1;
const InputGroup_MQTT = 2;

interface SettingsInputEntry {
  t?: InputType; // defaults to Number, most common
  l: string;
  g?: number;
  o?: any[];
}

const SETTING_INPUT_MAP: Record<
  "gen",
  Record<keyof SettingsData["gen"], SettingsInputEntry>
> &
  Record<"hw", Record<keyof SettingsData["hw"], SettingsInputEntry>> &
  Record<"mqtt", Record<keyof SettingsData["mqtt"], SettingsInputEntry>> = {
  gen: {
    deviceName: {
      t: InputType_String,
      l: "Device name",
    },
    mdnsName: {
      t: InputType_String,
      l: "mDNS Name",
    },
    emitSync: {
      t: InputType_Boolean,
      l: "Emit sync data",
    },
  },
  mqtt: {
    enabled: {
      t: InputType_Boolean,
      l: "Enabled",
      g: InputGroup_MQTT,
    },
    host: {
      t: InputType_String,
      l: "Host",
      g: InputGroup_MQTT,
    },
    port: {
      l: "Port",
      g: InputGroup_MQTT,
    },
    topic: {
      t: InputType_String,
      l: "Topic",
      g: InputGroup_MQTT,
    },
    user: {
      t: InputType_String,
      l: "Username",
      g: InputGroup_MQTT,
    },
  },
  hw: {
    axDia: {
      l: "Axis diameter",
      g: InputGroup_Physical,
    },
    cDia: {
      l: "Cord diameter",
      g: InputGroup_Physical,
    },
    cLen: {
      l: "Cord length",
      g: InputGroup_Physical,
    },
    pDir: {
      l: "Direction pin",
      g: InputGroup_Pins,
    },
    pEn: {
      l: "Enable pin",
      g: InputGroup_Pins,
    },
    pHome: {
      l: "Home switch pin",
      g: InputGroup_Pins,
    },
    pMs1: {
      l: "Microstep pin 1",
      g: InputGroup_Pins,
    },
    pMs2: {
      l: "Microstep pin 2",
      g: InputGroup_Pins,
    },
    pMs3: {
      l: "Microstep pin 3",
      g: InputGroup_Pins,
    },
    pReset: {
      l: "Reset pin",
      g: InputGroup_Pins,
    },
    pSleep: {
      l: "Sleep pin",
      g: InputGroup_Pins,
    },
    pStep: {
      l: "Step pin",
      g: InputGroup_Pins,
    },
    stepsPerRev: {
      l: "Steps/revolution",
      g: InputGroup_Physical,
    },
    res: {
      t: InputType_Enum,
      l: "Resolution",
      g: InputGroup_Physical,
      o: [1, 4, 8, 16],
    },
  },
};

const _Settings: ComponentFunction<SettingsAPI> = function () {
  let _loading = true;
  let _saving = false;
  let _dirty = false;
  let _saveHandlers: ActHandler[] = [];
  let _cancelHandlers: ActHandler[] = [];

  let _inputs: any[] = [];
  const id = "stcc";
  const tabs = ["General", "Hardware", "MQTT"];
  const selector = Selector({ items: tabs });
  let general: HTMLElement;
  let hardware: HTMLElement;
  let mqtt: HTMLElement;

  this.init = (elem: HTMLElement) => {
    selector.onChange(displayTab);

    function displayTab(index: number) {
      const div = getElement(id);
      let content: HTMLElement;
      if (index === 0) {
        // General
        content = general;
      } else if (index === 1) {
        // Hardware
        content = hardware;
      } else if (index === 2) {
        // MQTT
        content = mqtt;
      }
      div.innerHTML = "";
      appendChild(div, content);
    }

    function loaded() {
      debug("settings loaded: ", State._state);
      if (!_loading && !_saving) return;
      const spinner = getElement("sl");
      const container = getElement("slc");
      displayNone(spinner);
      removeClass(container, "hide");
      container.prepend(selector.node);
      _loading = false;
      _saving && _setDirty(false);

      // make content container, add it
      let div = getElement(id);
      if (!div) {
        div = createDiv();
        div.id = id;
        appendChild(container, div);
      }

      general = makeTab("gen");
      hardware = makeTab("hw");
      mqtt = makeTab("mqtt");

      displayTab(selector.index()); // or 0
    }

    nextTick(() => {
      State.observe(SETTINGS, ({ value, prev }) => {
        debug("settings updated: ", value, prev);
        loaded();
      });
    });

    return {
      destroy: () => {
        _inputs.forEach((t) => t.destroy());
        _inputs = [];
        _saveHandlers = [];
        _cancelHandlers = [];
      },
      onCancel: (h) => {
        _cancelHandlers.push(h);
      },
      onSave: (h) => {
        _saveHandlers.push(h);
      },
    };
  };

  const _setDirty = (newState: boolean) => {
    if (newState !== _dirty) {
      _saving = false;
      _dirty = newState;
      const act = getElement("slc-act");
      if (_dirty) {
        // show save
        getElement("s-save").onclick = () => {
          _saving = true;
          _saveHandlers.map((h) => h());
        };
        getElement("s-can").onclick = () => {
          _cancelHandlers.map((h) => h());
        };
        removeClass(act, "hide");
      } else {
        addClass(act, "hide");
      }
    }
  };

  function makeTab(key: keyof typeof SETTING_INPUT_MAP): HTMLElement {
    console.log("makeTab: ", SETTING_INPUT_MAP);
    const container = createElement("span");
    const groupDivs: HTMLElement[] = [];
    const getContainer = (groupNum?: number) => {
      if (groupNum == null) {
        return container;
      }
      if (groupDivs[groupNum] == null) {
        const d = createDiv();
        addClass(d, "igroup");
        groupDivs[groupNum] = d;
        appendChild(container, d);
      }
      return groupDivs[groupNum];
    };
    console.log("SETTING_INPUT_MAP[key]: ", SETTING_INPUT_MAP[key]);
    for (const k in SETTING_INPUT_MAP[key]) {
      // group, label, type, enum options
      const { g, l, t, o } = (SETTING_INPUT_MAP[key] as any)[
        k
      ] as SettingsInputEntry;

      const stateKey = `${SETTINGS}.${key}.${k}`;
      const pendingKey = `${PENDING_STATE}.${key}.${k}`;

      console.log("stateKey: ", stateKey);
      console.log("State.get(stateKey): ", State.get(stateKey));
      const inp = Input({
        label: l,
        type: t || InputType_Number,
        enumOpts: o,
        value: State.get(stateKey),
      });

      inp.onChange((v) => {
        _setDirty(true);
        console.log("pendingKey: ", pendingKey, v);
        State.set(pendingKey, v);
      });
      _inputs.push(inp);
      appendChild(getContainer(g), inp.node);
    }

    return container;
  }

  return template;
};

export type Settings = Component<SettingsAPI>;
export const Settings = Component(_Settings);
