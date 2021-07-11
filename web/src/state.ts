import { emptyObject, mergeDeep, nextTick, pruneUndef } from "@Util";

type StateHandler<T = any> = (u: { value: T; prev: T }) => void;
export interface CurrentData {
  tPos: number;
  pos: number;
  accel: number;
  speed: number;
}
export interface SettingsData {
  gen: {
    ssid: string;
    pass: string;
    deviceName: string;
    mac: string;
    ip: string;
    mdnsName: string;
    emitSync: boolean;
  };
  hw: {
    pStep: number;
    pDir: number;
    pEn: number;
    pSleep: number;
    pReset: number;
    pMs1: number;
    pMs2: number;
    pMs3: number;
    pHome: number;
    cLen: number;
    cDia: number;
    axDia: number;
    stepsPerRev: number;
    res: number;
  };
  mqtt: {
    enabled: boolean;
    host: string;
    port: number;
    topic: string;
    user: string;
    pass: string;
  };
}

export interface DeviceRecord {
  name?: string;
  mac: string;
  ip: string;
  tPos: number;
  pos: number;
  accel?: number;
  speed?: number;
}

// TODO
interface PresetRecord {
  [key: string]: any;
}
export interface StateData {
  state: CurrentData;
  pendingState: Partial<SettingsData>;
  settings: SettingsData;
  devices: Record<string, DeviceRecord>;
  presets: Record<string, PresetRecord>;
}

interface _State {
  _observers: Record<string, StateHandler[]>;
  _state: StateData;
}

export const DEFAULT_SETTINGS_DATA = {
  ["gen"]: {
    ["deviceName"]: "WBlinds",
    ["mdnsName"]: "WBlinds",
    ["emitSync"]: false,
  },
  ["hw"]: {
    ["pStep"]: 19,
    ["pDir"]: 18,
    ["pEn"]: 13,
    ["pSleep"]: 21,
    ["pReset"]: 3,
    ["pMs1"]: 1,
    ["pMs2"]: 5,
    ["pMs3"]: 17,
    ["pHome"]: 4,
    ["cLen"]: 1650,
    ["cDia"]: 0.1,
    ["axDia"]: 15,
    ["stepsPerRev"]: 200,
    ["res"]: 16,
  },
  ["mqtt"]: {
    ["enabled"]: false,
    ["host"]: "192.168.0.99",
    ["port"]: 1833,
    ["topic"]: "wblinds",
    ["user"]: "user",
  },
};
const DEFAULT_STATE_DATA = {
  ["state"]: {
    ["pos"]: 0,
    ["tPos"]: 0,
    ["accel"]: 0,
    ["speed"]: 0,
  },
  ["settings"]: mergeDeep({}, DEFAULT_SETTINGS_DATA),
  ["pendingState"]: mergeDeep({}, DEFAULT_SETTINGS_DATA),
  ["devices"]: {},
  ["presets"]: {},
};

interface _State {
  _loadedKeys: Record<keyof StateData, boolean>;
  _savingKeys: Record<keyof StateData, boolean>;
}
class _State {
  //   private _observers: Record<string, StateHandler[]>;
  //   private _state: any;

  constructor() {
    this._observers = {};
    this._state = mergeDeep({}, DEFAULT_STATE_DATA);
    const t = {} as Record<keyof StateData, boolean>;
    Object.keys(this._state).map((k) => {
      t[k as keyof StateData] = false;
    });
    this._loadedKeys = { ...t };
    this._savingKeys = { ...t };
  }

  get<T>(path: string): T {
    const spl = path.split(".");
    let curr: any = this._state;
    while (spl.length > 0) {
      if (typeof curr !== "object") return;
      curr = curr[spl.shift()];
    }
    return curr;
  }

  set<T>(path: string, val: T): void {
    const spl = path.split(".");
    const last = spl.pop();
    let curr: any = this._state;
    while (spl.length > 0) {
      if (typeof curr !== "object") return;
      curr = curr[spl.shift()];
    }
    curr[last] = val;
  }

  isLoaded(key: keyof StateData): boolean {
    return this._loadedKeys[key];
  }

  setSaving(key: keyof StateData, v: boolean): void {
    this._savingKeys[key] = v;
  }

  isSaving(key: keyof StateData): boolean {
    return this._savingKeys[key];
  }

  /**
   *
   * @param key
   * @param value
   */
  update<T extends keyof StateData, U extends StateData[T]>(
    key: T,
    value: Partial<U>
  ) {
    this._observers[key] = this._observers[key] || [];
    const prev = this._state[key];
    this._state[key] = mergeDeep({}, prev, pruneUndef(value));
    this._loadedKeys[key] = true;
    this._observers[key].forEach((h) => {
      h &&
        h({
          value: { ...(value as U) },
          prev,
        });
    });
  }

  observe<T extends keyof StateData, U extends StateData[T]>(
    key: T,
    handler: StateHandler<U>
  ) {
    this._observers[key] = this._observers[key] || [];
    const index = this._observers[key].push(handler) - 1;
    if (this._loadedKeys[key]) {
      handler({
        value: mergeDeep({}, this._state[key] as U),
        prev: undefined,
      });
    }
    return () => {
      delete this._observers[key][index];
    };
  }
}

export type State = _State;
export const State = new _State();
