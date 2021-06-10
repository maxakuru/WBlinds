type StateHandler = (u: { value: any; prev: any }) => void;
interface _State {
  _observers: Record<string, StateHandler[]>;
  _state: any;
}
class _State {
  //   private _observers: Record<string, StateHandler[]>;
  //   private _state: any;

  constructor() {
    this._observers = {};
    this._state = {};
  }

  update(key: string, value: any) {
    this._observers[key] ??= [];
    const prev = this._state[key];
    this._state[key] = value;
    this._observers[key].forEach((h) => {
      h({
        value: { ...value },
        prev,
      });
    });
  }

  observe(key: string, handler: StateHandler) {
    this._observers[key] ??= [];
    this._observers[key].push(handler);
    if (this._state[key]) {
      handler({
        value: { ...this._state[key] },
        prev: undefined,
      });
    }
  }
}

export const State = new _State();
