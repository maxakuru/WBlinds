type StateHandler<T = any> = (u: { value: T; prev: T }) => void;
interface _State {
  _observers: Record<string, StateHandler[]>;
  _state: {
    state: {
      tPos: number;
      pos: number;
      accel: number;
      speed: number;
    };
    settings: {
      deviceName: string;
    };
    devices: Record<string, any>;
    presets: Record<string, any>;
  };
}
class _State {
  //   private _observers: Record<string, StateHandler[]>;
  //   private _state: any;

  constructor() {
    this._observers = {};
    this._state = {
      state: {
        pos: 0,
        tPos: 0,
        accel: 0,
        speed: 0,
      },
      settings: {
        deviceName: "",
      },
      devices: {},
      presets: {},
    };
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

  /**
   *
   * @param key
   * @param value
   */
  update<T extends keyof _State["_state"], U extends _State["_state"][T]>(
    key: T,
    value: U
  ) {
    this._observers[key] ??= [];
    const prev = this._state[key];
    this._state[key] = value;
    this._observers[key].forEach((h) => {
      h({
        value: { ...(value as U) },
        prev,
      });
    });
  }

  observe<T extends keyof _State["_state"], U extends _State["_state"][T]>(
    key: T,
    handler: StateHandler<U>
  ) {
    this._observers[key] ??= [];
    this._observers[key].push(handler);
    if (this._state[key]) {
      handler({
        value: { ...(this._state[key] as U) },
        prev: undefined,
      });
    }
  }
}

export type State = _State;
export const State = new _State();
