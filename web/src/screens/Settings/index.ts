import {
  appendChild,
  createDiv,
  getElement,
  nextTick,
  querySelector,
} from "../../util";
import { ComponentFunction, Component } from "../../components/Component";
import template from "./Settings.html";
import { State, SettingsData, DEFAULT_SETTINGS_DATA } from "../../state";
import { Input, Selector } from "../../components";
import "./Settings.css";
import { InputType } from "../../components/Input";

type DeviceClickHandler = (device: any) => void;
export interface SettingsAPI {
  destroy(): void;
}

const enum InputGroup {
  Pins = 0,
  Physical = 1,
  MQTT = 2,
}

interface SettingsInputEntry {
  type: InputType;
  label: string;
  group?: InputGroup;
  enumOpts?: any[];
}

const SETTING_INPUT_MAP: Record<
  "gen",
  Record<keyof SettingsData["gen"], SettingsInputEntry>
> &
  Record<"hw", Record<keyof SettingsData["hw"], SettingsInputEntry>> &
  Record<"mqtt", Record<keyof SettingsData["mqtt"], SettingsInputEntry>> = {
  gen: {
    deviceName: {
      type: InputType.String,
      label: "Device name",
    },
    emitSync: {
      type: InputType.Boolean,
      label: "Emit sync data",
    },
    mdnsName: {
      type: InputType.String,
      label: "mDNS Name",
    },
  },
  mqtt: {
    enabled: {
      type: InputType.Boolean,
      label: "Enabled",
      group: InputGroup.MQTT,
    },
    host: {
      type: InputType.String,
      label: "Host",
      group: InputGroup.MQTT,
    },
    port: {
      type: InputType.Number,
      label: "Port",
      group: InputGroup.MQTT,
    },
    topic: {
      type: InputType.String,
      label: "Topic",
      group: InputGroup.MQTT,
    },
    user: {
      type: InputType.String,
      label: "Username",
      group: InputGroup.MQTT,
    },
  },
  hw: {
    axDia: {
      type: InputType.Number,
      label: "Axis diameter",
      group: InputGroup.Physical,
    },
    cDia: {
      type: InputType.Number,
      label: "Cord diameter",
      group: InputGroup.Physical,
    },
    cLen: {
      type: InputType.Number,
      label: "Cord length",
      group: InputGroup.Physical,
    },
    pDir: {
      type: InputType.Number,
      label: "Direction pin",
      group: InputGroup.Pins,
    },
    pEn: {
      type: InputType.Number,
      label: "Enable pin",
      group: InputGroup.Pins,
    },
    pHome: {
      type: InputType.Number,
      label: "Home switch pin",
      group: InputGroup.Pins,
    },
    pMs1: {
      type: InputType.Number,
      label: "Microstep pin 1",
      group: InputGroup.Pins,
    },
    pMs2: {
      type: InputType.Number,
      label: "Microstep pin 2",
      group: InputGroup.Pins,
    },
    pMs3: {
      type: InputType.Number,
      label: "Microstep pin 3",
      group: InputGroup.Pins,
    },
    pReset: {
      type: InputType.Number,
      label: "Reset pin",
      group: InputGroup.Pins,
    },
    pSleep: {
      type: InputType.Number,
      label: "Sleep pin",
      group: InputGroup.Pins,
    },
    pStep: {
      type: InputType.Number,
      label: "Step pin",
      group: InputGroup.Pins,
    },
    stepsPerRev: {
      type: InputType.Number,
      label: "Steps/revolution",
      group: InputGroup.Physical,
    },
    res: {
      type: InputType.Enum,
      label: "Resolution",
      group: InputGroup.Physical,
      enumOpts: [1, 4, 8, 16],
    },
  },
};

let _dirty = false;
const _Settings: ComponentFunction<SettingsAPI> = function () {
  let _loading = true;
  let _inputs: any[] = [];
  const id = "stcc";
  const tabs = ["General", "Hardware", "MQTT"];
  const selector = Selector({ items: tabs });
  let general: HTMLElement;
  let hardware: HTMLElement;
  let mqtt: HTMLElement;

  this.init = function (elem: HTMLElement) {
    selector.onChange(displayTab);

    function displayTab(index: number) {
      console.log("display tab: ", index);
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

    function setDirty(newState: boolean) {
      if (newState !== _dirty) {
        _dirty = newState;
        // TODO: validate inputs, show save/cancel buttons
      }
    }

    function loaded() {
      console.log("settings loaded: ", State._state);
      if (!_loading) return;
      const spinner = getElement("sl");
      const container = getElement("slc");
      spinner.style.display = "none";
      container.classList.remove("hide");
      container.prepend(selector.node);
      _loading = false;

      // make content container, add it
      const div = createDiv();
      div.id = id;
      appendChild(container, div);

      general = makeTab("gen");
      hardware = makeTab("hw");
      mqtt = makeTab("mqtt");

      displayTab(selector.index()); // or 0
    }

    nextTick(() => {
      State.observe("settings", ({ value, prev }) => {
        console.log("settings updated: ", value, prev);
        loaded();
      });
    });

    return {
      destroy: () => {
        _inputs.forEach((t) => t.destroy());
        _inputs = [];
      },
    };
  };

  function makeTab(key: keyof typeof SETTING_INPUT_MAP): HTMLElement {
    const div = createDiv();
    const groupDivs: HTMLElement[] = [];
    function getDiv(groupNum?: number) {
      if (groupNum == null) {
        return div;
      }
      if (groupDivs[groupNum] == null) {
        const d = createDiv();
        d.classList.add("igroup");
        groupDivs[groupNum] = d;
        appendChild(div, d);
      }
      return groupDivs[groupNum];
    }
    for (const k in SETTING_INPUT_MAP[key]) {
      const { group, label, type, enumOpts } = (SETTING_INPUT_MAP[key] as any)[
        k
      ] as SettingsInputEntry;

      const inp = Input({ label, type, enumOpts });
      appendChild(getDiv(group), inp.node);
    }
    return div;
  }

  return template;
};

export type Settings = Component<SettingsAPI>;
export const Settings = Component(_Settings);
