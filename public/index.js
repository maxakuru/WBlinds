function Component(c) {
    return (...args) => {
        const ctx = {};
        const toRender = c.call(ctx, ...args);
        const elem = new DOMParser().parseFromString(toRender, "text/html");
        const node = elem.getElementsByTagName("body").item(0).firstChild;
        const api = ctx.init(node);
        api.node = node;
        return api;
    };
}

var template$9 = "<ul class=\"fw navc\"></ul>";

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z$a = "#nav {\n\tbackground: #00000080;\n\theight: 63px;\n\tdisplay: flex;\n}\n\n.navc {\n\tjustify-content: space-evenly;\n\talign-self: center;\n}\n\n/* uncss:ignore */\n\n.navc .sel {\n\tcolor: #DB8B1D;\n}";
styleInject(css_248z$a);

function addClass(elem, ...tokens) {
    elem.classList.add(...tokens);
}
function removeClass(elem, ...tokens) {
    elem.classList.remove(...tokens);
}
function toggleClass(elem, token) {
    elem.classList.toggle(token);
}
const nextTick = setTimeout;
const createElement = document.createElement.bind(document);
const createDiv = document.createElement.bind(document, "div");
const getElement = document.getElementById.bind(document);
const querySelector = (selectors, elem = document) => elem.querySelector.call(elem, selectors);
const stopPropagation = (e) => e.stopPropagation();
const displayNone = (elem) => {
    elem.style.display = "none";
};
const appendChild = (parent, child) => {
    return _appendChild.call(parent, child);
};
const _appendChild = document.appendChild;

const isObject = (o) => {
    return o && typeof o === "object" && !Array.isArray(o);
};
const mergeDeep = (target, ...sources) => {
    if (!sources.length)
        return target;
    const source = sources.shift();
    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key])
                    Object.assign(target, { [key]: {} });
                mergeDeep(target[key], source[key]);
            }
            else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }
    return mergeDeep(target, ...sources);
};
const diffDeep = (source, target) => {
    return Object.keys(target).reduce((diff, key) => {
        if (source[key] === target[key] || target[key] == null)
            return diff;
        if (isObject(source[key]) && isObject(target[key])) {
            return {
                ...diff,
                [key]: diffDeep(source[key], target[key]),
            };
        }
        return {
            ...diff,
            [key]: target[key],
        };
    }, {});
};
const getQueryParam = (param) => {
    const query = window.location.search.substring(1);
    const vars = query.split("&");
    for (let i = 0; i < vars.length; i++) {
        const pair = vars[i].split("=");
        if (pair[0] == param) {
            return pair[1];
        }
    }
    return false;
};
const wait = (duration) => {
    return new Promise((res) => {
        setTimeout(res, duration);
    });
};
const debug = (...msgs) => {
};
const pruneUndef = (obj) => {
    const o = {};
    for (const k in obj) {
        if (obj[k] != null) {
            o[k] = obj[k];
        }
    }
    return o;
};
const pushToHistory = (path, qps = {}, resetQps) => {
    const cPath = location.pathname;
    const cSearch = location.search;
    const params = new URLSearchParams(resetQps ? "" : cSearch);
    for (const k in qps) {
        params.set(k, qps[k]);
    }
    const qpStr = "?" + params.toString();
    if (path === cPath && qpStr === cSearch) {
        console.log("no change: ", path, cPath, qpStr, cSearch);
        return;
    }
    const fullPath = (path || cPath) + qpStr;
    history.pushState(null, "", fullPath);
};

const _Nav = function ({ labels }) {
    let _i = 0;
    let _clickHandlers = [];
    const _lis = [];
    this.init = (elem) => {
        const setIndex = (index) => {
            _i = index;
            _lis.forEach((l2, i2) => {
                if (i2 === _i)
                    addClass(l2, "sel");
                else
                    removeClass(l2, "sel");
            });
            _clickHandlers.map((c) => c(index));
        };
        labels.map((label, i) => {
            const l = createElement("li");
            if (i === _i) {
                addClass(l, "sel");
            }
            l.innerText = label;
            _lis.push(l);
            appendChild(elem, l);
            l.onclick = () => setIndex(i);
        });
        return {
            onClick: (h) => {
                _clickHandlers.push(h);
            },
            currentIndex: () => _i,
            destroy: () => {
                _clickHandlers = [];
            },
            setIndex,
        };
    };
    return template$9;
};
const Nav = Component(_Nav);

var template$8 = "<div class=\"sc\"><div class=\"fR fSB\"><h4>Title</h4><h4>Value</h4></div><input class=\"slider\" type=\"range\" min=\"0\" max=\"100\"></div>";

var css_248z$9 = ".sc {\n\tpadding: 20px;\n}\n\n.slider {\n\tbackground: linear-gradient(to right, #DB8B1D 0%, #DB8B1D 50%, #606060 50%, #606060 100%);\n\tborder-radius: 8px;\n\theight: 7px;\n\twidth: 75%;\n\toutline: none;\n\t-webkit-appearance: none;\n}\n\n.slider {\n\tborder-radius: 15px;\n\theight: 6px;\n\t-webkit-appearance: none;\n\t-moz-appearance: none;\n\tappearance: none;\n\twidth: 100%;\n\toutline: none;\n}\n\n.slider::-webkit-slider-thumb {\n\t-webkit-appearance: none;\n\tappearance: none;\n\twidth: 16px;\n\theight: 16px;\n\tbackground: white;\n\tbox-shadow: black;\n\tborder-radius: 50%;\n\tcursor: pointer;\n}";
styleInject(css_248z$9);

const _Slider = function ({ label, value, id, }) {
    this.init = (elem) => {
        elem.id = id;
        querySelector("h4", elem).innerText = label;
        const slider = querySelector("input", elem);
        slider.onmousedown = stopPropagation;
        slider.ontouchstart = stopPropagation;
        slider.oninput = () => {
            const value = ((parseInt(slider.value) - parseInt(slider.min)) /
                (parseInt(slider.max) - parseInt(slider.min))) *
                100;
            slider.style.background = `linear-gradient(to right, #DB8B1D 0%, #DB8B1D ${value}%, #606060 ${value}%, #606060 100%`;
        };
        slider.value = value;
        return {
            destroy: () => {
            },
        };
    };
    return template$8;
};
const Slider = Component(_Slider);

var template$7 = "<div id=\"card\" class=\"an\"></div>";

var css_248z$8 = "#card {\n\theight: 100%;\n    position: fixed;\n    width: 100%;\n    top: 100%;\n\tbackground: #53535378;\n}\n\n#card.an {\n    transition: 0.2s top ease-in-out;\n}";
styleInject(css_248z$8);

const _Card = function ({ temp, }) {
    let draggingCard = false;
    let yOffset = 0;
    let yStart = 0;
    let animated = false;
    let lastCoords = {};
    this.init = (elem) => {
        toggleAnimations(true);
        const slider = Slider({ id: "position", label: "Position", value: "50" });
        appendChild(elem, slider.node);
        const onPress = (coords) => {
            lastCoords = coords;
            yStart = coords.y;
            draggingCard = true;
            toggleAnimations(false);
        };
        const onRelease = () => {
            if (!draggingCard)
                return;
            draggingCard = false;
            toggleAnimations(true);
            let o = 0;
            if (yOffset > elem.clientHeight / 2) {
                o = elem.clientHeight;
                elem.ontransitionend = destroy;
            }
            elem.style.top = `${o}px`;
            yOffset = yStart = 0;
        };
        const onMove = (coords) => {
            if (!draggingCard)
                return;
            if (coords.y - yStart < 0) {
                lastCoords = coords;
                return;
            }
            const movedY = coords.y - lastCoords.y;
            yOffset += movedY;
            lastCoords = coords;
            elem.style.top = `${yOffset}px`;
        };
        function toggleAnimations(newState = false) {
            if (newState === animated)
                return;
            newState ? addClass(elem, "an") : removeClass(elem, "an");
            animated = newState;
        }
        const destroy = (ev) => {
            elem.remove();
        };
        const firstTouchXY = (e) => {
            let { x, y } = e;
            if (x == null) {
                x = e.touches[0].clientX;
                y = e.touches[0].clientY;
            }
            return {
                x,
                y,
            };
        };
        elem.onmousedown = elem.ontouchstart = (e) => onPress(firstTouchXY(e));
        elem.onmouseup = elem.onmouseout = elem.ontouchend = onRelease;
        elem.onmousemove = elem.ontouchmove = (e) => onMove(firstTouchXY(e));
        return {
            destroy,
            show: () => {
                elem.style.top = "0px";
            },
        };
    };
    return template$7;
};
const Card = Component(_Card);

var template$6 = "<div class=\"tile sq\"><span></span><p>Bedroom Left</p></div>";

var css_248z$7 = ":root {\n\t/* --wid: calc((100vw - 30px) / 3);  */\n\t/* Always 3 columns */\n\t--wid: min(calc((100vw - 60px) / 3), 110px);\n}\n\n.tile {\n\tbackground: #0000004D;\n\tborder-radius: 12px;\n\tdisplay: flex;\n\t/* justify-content: space-around; */\n}\n\n/* uncss:ignore */\n\n.tile.sq {\n\twidth: var(--wid);\n\theight: var(--wid);\n\t/* margin: 20px; */\n\tmargin: 5px 0px 5px 0px;\n\tposition: relative;\n}\n\n/* uncss:ignore */\n\n.tile.sq>span {\n\twidth: calc(var(--wid) - 1px);\n\tmax-height: 90px;\n\ttop: 10px;\n\tposition: absolute;\n\tright: 0px;\n\tborder-right: 1px dashed white;\n\tborder-right-style: groove;\n}\n\n/* uncss:ignore */\n\n.tile.sq p {\n\tfont-size: 11px;\n\tmargin: auto 21px 10px 9px;\n\tfont-weight: 500;\n}";
styleInject(css_248z$7);

const _Tile = function ({ name, id, }) {
    let _clickHandlers = [];
    this.init = (elem) => {
        elem.id = id;
        elem.onclick = (e) => {
            _clickHandlers.forEach((h) => h({ id, name }));
        };
        querySelector("p", elem).innerText = name;
        return {
            onClick: (h) => {
                _clickHandlers.push(h);
            },
            destroy: () => {
                _clickHandlers = [];
            },
        };
    };
    return template$6;
};
const Tile = Component(_Tile);

var template$5 = "<div id=\"pas\" class=\"fw flex fR\"></div>";

var css_248z$6 = "/* uncss:ignore */\n:root {\n\t--bord: 1px solid rgba(0, 0, 0, 0.034);\n}\n/* uncss:ignore */\n#pas {\n\tborder-radius: 7px;\n    justify-content: center;\n    background: #7676803D;\n\tborder: 2px solid #00000000;\n}\n/* uncss:ignore */\n#pas>div {\n\t/* width: 10px; */\n\tpadding: 2px 0 2px;\n\tflex-grow: 1;\n\ttext-align: center;\n\tfont-size: 14px;\n\tborder: 1px #FFFFFF00 solid;\n}\n/* uncss:ignore */\n#pas>div.sel {\n\tbackground-color: #676769a3;\n\tborder-radius: 7px;\n\tborder: 1px #00000024 solid\n}\n/* uncss:ignore */\n#pas>div::after {\n\theight: 13px;\n    content: \"\";\n    display: block;\n    position: absolute;\n    border-left: 1px solid #8e8e9373;\n    border-radius: 0.5px;\n    transform: translate(-1px, -110%);\n}\n/* uncss:ignore */\n#pas>div:first-child::after {\n\tborder-left: none;\n}";
styleInject(css_248z$6);

const _Selector = function ({ items, }) {
    let _index = 0;
    let _changeHandlers = [];
    let _items = [];
    this.init = (elem) => {
        const onChange = (h) => {
            _changeHandlers.push(h);
        };
        const _onClick = (index) => {
            removeClass(_items[_index], "sel");
            _index = index;
            addClass(_items[_index], "sel");
            _changeHandlers.map((c) => c(index));
        };
        items.map((i, index) => {
            const e = createDiv();
            e.innerText = i;
            index === _index && addClass(e, "sel");
            e.onclick = () => _onClick(index);
            _items.push(e);
            appendChild(elem, e);
        });
        return {
            destroy: () => {
                _changeHandlers = [];
                _index = 0;
                _items = [];
            },
            index: () => {
                return _index;
            },
            onChange,
            setIndex: (index) => {
                _onClick(index);
            },
        };
    };
    return template$5;
};
const Selector = Component(_Selector);

var template$4 = "<div class=\"toast\"><p class=\"tom\"></p></div>";

var css_248z$5 = ".toast {\n\tbackground-color: #00000070;\n    box-shadow: 1px 1px 8px #54545473;\n    border-radius: 10px;\n\tfont-size: 13px;\n\tmargin: 10px;\n\theight: 60px;\n\tdisplay: flex;\n\tmin-width: 250px;\n\tmax-width: 500px;\n\tposition: relative;\n\ttransition: 0.5s bottom ease-in-out;\n\tpointer-events: all;\n\talign-self: center;\n}\n\n.tom {\n\tmargin: auto;\n}";
styleInject(css_248z$5);

const _Toast = function ({ message, id, isError = false, }) {
    let _clickHandlers = [];
    this.init = (elem) => {
        elem.onclick = (e) => {
            _clickHandlers.forEach((h) => h({ id }));
        };
        querySelector("p", elem).innerText = message;
        return {
            onClick: (h) => {
                _clickHandlers.push(h);
            },
            destroy: () => {
                _clickHandlers = [];
            },
        };
    };
    return template$4;
};
const Toast = Component(_Toast);

var template$3 = "<div class=\"fR in\"><label></label></div>";

var css_248z$4 = ".in {\n\tjustify-content: space-between;\n\theight: 50px;\n\talign-items: center;\n\tbackground: #0000008F;\n\tpadding: 0px 15px 0px 15px;\n\tmargin-top: 10px;\n\tborder-radius: 15px;\n\t/* width: min(90%, 300px); */\n\tmin-width: 300px;\n}\n\n.in>label {\n\tfont-weight: bold;\n\tfont-size: 14px;\n}\n\n/* uncss:ignore */\n\n.igroup>.in {\n\tmargin-top: 0px;\n\tborder-radius: 0px;\n\tborder-bottom: 1px solid #FFFFFF4D;\n}\n\n/* uncss:ignore */\n\n.igroup>.in:first-child {\n\tborder-radius: 15px 15px 0px 0px;\n  margin-top: 20px;\n}\n\n/* uncss:ignore */\n\n.igroup>.in:last-child {\n\tborder-radius: 0px 0px 15px 15px;\n\tmargin-bottom: 20px;\n\tborder-bottom: none;\n}\n\n/* uncss:ignore */\n\n.in>input {\n\tbackground-color: #00000000;\n  border: none;\n\ttext-align: right;\n\tcolor: #DB8B1D;\n}\n\n/* uncss:ignore */\n\n[type=\"checkbox\"] {\n\t-webkit-appearance: none;\n\t   -moz-appearance: none;\n\t        appearance: none;\n\twidth: 51px;\n\theight: 31px;\n\tborder-radius: 50px;\n\tbackground-color: #94949a33 !important;\n}\n\n/* uncss:ignore */\n\n[type=\"checkbox\"]:after {\n\tcontent: \"\";\n    width: 50%;\n    border-radius: 100%;\n    height: 80%;\n    display: block;\n    position: relative;\n    background-color: white;\n    top: 12%;\n    left: 3%;\n    transition: 0.2s left ease-in-out;\n}\n\n/* uncss:ignore */\n\n[type=\"checkbox\"].on {\n\tbackground-color: #34C759 !important;\n}\n\n/* uncss:ignore */\n\n[type=\"checkbox\"].on::after {\n\tleft: 45%;\n}\n\n/* \n[type=\"checkbox\"]:not(:checked),\n  [type=\"checkbox\"]:checked {\n    position: absolute;\n    left: 0;\n    opacity: 0.01;\n  }\n  [type=\"checkbox\"]:not(:checked) + label,\n  [type=\"checkbox\"]:checked + label {\n    position: relative;\n    padding-left: 2.3em;\n    font-size: 1.05em;\n    line-height: 1.7;\n    cursor: pointer;\n  }\n\n  [type=\"checkbox\"]:not(:checked) + label:before,\n  [type=\"checkbox\"]:checked + label:before {\n    content: '';\n    position: absolute;\n    left: 0;\n    top: 0;\n    width: 1.4em;\n    height: 1.4em;\n    border: 1px solid #aaa;\n    background: #FFF;\n    border-radius: .2em;\n    box-shadow: inset 0 1px 3px rgba(0,0,0, .1), 0 0 0 rgba(203, 34, 237, .2);\n    -webkit-transition: all .275s;\n        transition: all .275s;\n  } */\n\n";
styleInject(css_248z$4);

const InputType_Number = 0;
const InputType_String = 1;
const InputType_Boolean = 2;
const InputType_Enum = 3;
const InputType_Password = 4;
const InputTypeMap = {
    [InputType_String]: "text",
    [InputType_Boolean]: "checkbox",
    [InputType_Number]: "number",
    [InputType_Enum]: "select",
    [InputType_Password]: "password",
};
const _Input = function ({ label, type, enumOpts, placeholder, value, }) {
    let _currentValue = value;
    const _firstValue = value;
    let _onChangeHandlers = [];
    this.init = (elem) => {
        const id = `cb-${label.split(" ").join("-")}`;
        const l = elem.firstChild;
        l.innerText = label;
        l.htmlFor = id;
        let input;
        if (type === InputType_Enum) {
            input = createElement("select");
            enumOpts.forEach((o) => {
                const opt = createElement("option");
                opt.value = o.v;
                opt.innerText = o.l;
                appendChild(input, opt);
            });
        }
        else {
            input = createElement("input");
            input.type = InputTypeMap[type];
            input.placeholder = placeholder || "xxxxx";
        }
        if (type === InputType_Boolean || type === InputType_Enum) {
            input.checked = value;
            value && addClass(input, "on");
            input.onchange = (e) => {
                toggleClass(input, "on");
                if (type === InputType_Boolean)
                    _onChange(input.checked);
                else
                    _onChange(input.value);
            };
        }
        else {
            input.oninput = () => _onChange(input.value);
            if (value != null)
                input.value = value;
        }
        input.id = id;
        const _showError = (err) => {
        };
        function _onChange(v) {
            if (v === "")
                v = undefined;
            _currentValue = v;
            const err = _validate();
            if (err) {
                return _showError();
            }
            _onChangeHandlers.forEach((h) => h(_currentValue));
        }
        const setDisabled = (val) => {
            input.disabled = val;
        };
        function _validate() {
            return;
        }
        appendChild(elem, input);
        return {
            onChange: (h) => {
                _onChangeHandlers.push(h);
            },
            setDisabled,
            destroy: () => {
                _onChangeHandlers = [];
            },
            isDirty: () => {
                console.log("input is dirty? ", _firstValue, input.value, _currentValue, _firstValue !== _currentValue);
                return _firstValue !== _currentValue;
            },
        };
    };
    return template$3;
};
const Input = Component(_Input);

var template$2 = "<div id=\"toc\" class=\"fw tc\"></div>";

var css_248z$3 = "\n.tc {\n\tdisplay: flex;\n\tposition: absolute;\n    top: 0;\n    flex-flow: column-reverse;\n\tpointer-events: none;\n\theight: calc(100% - 63px);\n\tpadding-bottom: 63px;\n}";
styleInject(css_248z$3);

const _ToastContainer = function ({ name, id }) {
    let _index = 0;
    let _toasts = [];
    this.init = (elem) => {
        function pushToast(message, isError, isPersistent, timeout = 2500) {
            const t = Toast({ message, isError, id: _index++ });
            t.node.style.bottom = `-${63 + 200 * (_toasts.length + 1)}px`;
            t.onClick(remove);
            _toasts.push(t);
            appendChild(elem, t.node);
            function remove() {
                t.node.style.bottom = `-${63 + 200 * (_toasts.length + 1)}px`;
                setTimeout(() => {
                    t.node.remove();
                }, 500);
            }
            setTimeout(() => {
                t.node.style.bottom = `0px`;
                !isPersistent && setTimeout(remove, timeout);
            });
        }
        return {
            destroy: () => {
                _toasts.map((t) => t.destroy());
                _toasts = [];
                _index = 0;
            },
            pushToast,
        };
    };
    return template$2;
};
const ToastContainer = Component(_ToastContainer);

var template$1 = "<div id=\"h\" class=\"f flex\"><div id=\"hl\" class=\"loader\"></div><div id=\"hlc\" class=\"hide fw\" style=\"text-align: left;\"><h1 id=\"ht\">WBlinds</h1><h4 class=\"hst\">Presets</h4><div id=\"preset-tiles\" class=\"pt fw flex wrap\"></div><h4 class=\"hst\">Devices</h4><div id=\"device-tiles\" class=\"dt fw flex wrap\"></div></div></div>";

const DEFAULT_SETTINGS_DATA = {
    gen: {
        deviceName: "WBlinds",
        mdnsName: "WBlinds",
        emitSync: false,
    },
    hw: {
        pStep: 19,
        pDir: 18,
        pEn: 13,
        pSleep: 21,
        pReset: 3,
        pMs1: 1,
        pMs2: 5,
        pMs3: 17,
        pHome: 4,
        cLen: 1650,
        cDia: 0.1,
        axDia: 15,
        stepsPerRev: 200,
        res: 16,
    },
    mqtt: {
        enabled: false,
        host: "192.168.0.99",
        port: 1833,
        topic: "wblinds",
        user: "user",
    },
};
const DEFAULT_STATE_DATA = {
    state: {
        pos: 0,
        tPos: 0,
        accel: 0,
        speed: 0,
    },
    settings: mergeDeep({}, DEFAULT_SETTINGS_DATA),
    pendingState: mergeDeep({}, DEFAULT_SETTINGS_DATA),
    devices: {},
    presets: {},
};
class _State {
    constructor() {
        this._observers = {};
        this._state = mergeDeep({}, DEFAULT_STATE_DATA);
        const t = {};
        Object.keys(this._state).map((k) => {
            t[k] = false;
        });
        this._loadedKeys = { ...t };
        this._savingKeys = { ...t };
    }
    get(path) {
        const spl = path.split(".");
        let curr = this._state;
        while (spl.length > 0) {
            if (typeof curr !== "object")
                return;
            curr = curr[spl.shift()];
        }
        return curr;
    }
    set(path, val) {
        const spl = path.split(".");
        const last = spl.pop();
        let curr = this._state;
        while (spl.length > 0) {
            if (typeof curr !== "object")
                return;
            curr = curr[spl.shift()];
        }
        curr[last] = val;
    }
    isLoaded(key) {
        return this._loadedKeys[key];
    }
    setSaving(key, v) {
        this._savingKeys[key] = v;
    }
    isSaving(key) {
        return this._savingKeys[key];
    }
    update(key, value) {
        var _a;
        var _b;
        (_a = (_b = this._observers)[key]) !== null && _a !== void 0 ? _a : (_b[key] = []);
        const prev = this._state[key];
        this._state[key] = mergeDeep({}, prev, pruneUndef(value));
        this._loadedKeys[key] = true;
        this._observers[key].forEach((h) => {
            h({
                value: { ...value },
                prev,
            });
        });
    }
    observe(key, handler) {
        var _a;
        var _b;
        (_a = (_b = this._observers)[key]) !== null && _a !== void 0 ? _a : (_b[key] = []);
        this._observers[key].push(handler);
        if (this._loadedKeys[key]) {
            handler({
                value: mergeDeep({}, this._state[key]),
                prev: undefined,
            });
        }
    }
}
const State = new _State();

var css_248z$2 = ".dt {\n\t/* margin: 0 10px 0 -10px; */\n\tjustify-content: space-between;\n}\n\n/* uncss:ignore */\n\n.pt>.sq {\n\theight: 50px;\n\twidth: auto;\n\tmin-width: 150px;\n}\n\n/* uncss:ignore */\n\n.pt>.sq>span {\n\tdisplay: none;\n}\n";
styleInject(css_248z$2);

const STATE = "state";
const SETTINGS = "settings";
const PENDING_STATE = "pendingState";
const DEVICES = "devices";
const PRESETS = "presets";
const DEFAULT_ERROR = "Error encountered, check console";

const DEVICE_TILE = "device";
const PRESET_TILE = "preset";
const _Home = function () {
    let _loading = true;
    let _tiles = [];
    let _deviceClickHandlers = [];
    this.init = (elem) => {
        const loaded = () => {
            if (!_loading)
                return;
            const spinner = getElement("hl");
            const content = getElement("hlc");
            displayNone(spinner);
            removeClass(content, "hide");
            _loading = false;
        };
        const getAllTiles = (type) => {
            const container = getElement(`${type}-tiles`);
            return { container, tiles: container.querySelectorAll("div") };
        };
        const padTiles = (type) => {
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
        const updateTiles = (type, o) => {
            const { container, tiles } = getAllTiles(type);
            tiles.forEach((tile) => {
                if (!(tile.id in o)) ;
                else {
                    o[tile.id] = undefined;
                }
            });
            for (const [k, v] of Object.entries(o)) {
                if (!v)
                    continue;
                const t = Tile({
                    id: `tile-${k}`,
                    name: v.name || k,
                    ...v,
                });
                t.onClick((data) => handleTileClick(type, data));
                _tiles.push(t);
                appendChild(container, t.node);
            }
            padTiles(type);
        };
        function handleTileClick(type, data) {
            if (type === "device") {
                _deviceClickHandlers.forEach((h) => h(data));
            }
        }
        nextTick(() => {
            State.observe(PRESETS, ({ value, prev }) => {
                loaded();
                updateTiles(PRESET_TILE, value);
            });
            State.observe(DEVICES, ({ value, prev }) => {
                loaded();
                updateTiles(DEVICE_TILE, value);
            });
        });
        return {
            onDeviceClick: (h) => {
                _deviceClickHandlers.push(h);
            },
            destroy: () => {
                _deviceClickHandlers = [];
                _tiles.forEach((t) => t.destroy());
                _tiles = [];
            },
        };
    };
    return template$1;
};
const Home = Component(_Home);

var template = "<div id=\"ps\" class=\"f fC\"><div id=\"sl\" class=\"loader\"></div><div id=\"slc\" class=\"hide fw\" style=\"text-align: left;\"><div id=\"slc-act\" class=\"fR fw hide\"><div id=\"s-can\">Cancel</div><div id=\"s-save\">Save</div></div></div></div>";

var css_248z$1 = "/* uncss:ignore */\n#pas {\n    margin-bottom: 20px;\n}\n/* uncss:ignore */\n#stcc {\n    display: flex;\n}\n/* uncss:ignore */\n#stcc>span {\n    margin: auto;\n}\n/* uncss:ignore */\n#stcc>span:last-child {\n    margin-bottom: 70px;\n}\n/* uncss:ignore */\n#stcc>div {\n    justify-content: center;\n}\n/* uncss:ignore */\n#slc-act {\n    position: fixed;\n    bottom: 75px;\n    justify-content: space-evenly;\n    width: 100%;\n    left: 0%;\n}\n#slc-act>* {\n    border-radius: 25px;\n    width: 120px;\n    height: 41px;\n    text-align: center;\n    display: flex;\n    justify-content: space-around;\n    align-items: center;\n}\n#s-save {\n    background: #007AFF;\n}\n#s-can {\n    background: tomato;\n}\n";
styleInject(css_248z$1);

const InputGroup_Wifi = 0;
const InputGroup_Pins = 1;
const InputGroup_Physical = 2;
const InputGroup_MQTT = 3;
const SETTING_INPUT_MAP = {
    gen: {
        ssid: {
            t: InputType_String,
            l: "SSID",
            g: InputGroup_Wifi,
        },
        pass: {
            t: InputType_Password,
            l: "Password",
            g: InputGroup_Wifi,
        },
        deviceName: {
            t: InputType_String,
            l: "Device name",
            g: InputGroup_Wifi,
        },
        mdnsName: {
            t: InputType_String,
            l: "mDNS Name",
            g: InputGroup_Wifi,
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
            cg: true,
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
        pass: {
            t: InputType_Password,
            l: "Password",
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
            o: [
                { l: "1", v: 1 },
                { l: "1/4", v: 4 },
                { l: "1/8", v: 8 },
                { l: "1/16", v: 16 },
            ],
        },
    },
};
const _Settings = function () {
    let _loading = true;
    let _saving = false;
    let _dirty = false;
    let _saveHandlers = [];
    let _cancelHandlers = [];
    let _inputs = [];
    const _inputsDirty = [];
    const id = "stcc";
    const tabs = ["General", "Hardware", "MQTT"];
    const shortTabs = Object.keys(SETTING_INPUT_MAP);
    const selector = Selector({ items: tabs });
    let general;
    let hardware;
    let mqtt;
    this.init = (elem) => {
        selector.onChange(displayTab);
        function displayTab(index) {
            pushToHistory(undefined, { tab: shortTabs[index] });
            const div = getElement(id);
            let content;
            if (index === 0) {
                content = general;
            }
            else if (index === 1) {
                content = hardware;
            }
            else if (index === 2) {
                content = mqtt;
            }
            div.innerHTML = "";
            appendChild(div, content);
        }
        function loaded() {
            debug("settings loaded: ", State._state);
            if (!_loading && !_saving)
                return;
            if (!_loading && State.isSaving(SETTINGS))
                return;
            const spinner = getElement("sl");
            const container = getElement("slc");
            displayNone(spinner);
            removeClass(container, "hide");
            container.prepend(selector.node);
            _loading = false;
            _saving && _setDirty(false);
            let div = getElement(id);
            if (!div) {
                div = createDiv();
                div.id = id;
                appendChild(container, div);
            }
            general = makeTab(shortTabs[0]);
            hardware = makeTab(shortTabs[1]);
            mqtt = makeTab(shortTabs[2]);
            let tab = getQueryParam("tab");
            tab = tab && tab.toLowerCase();
            let ind = shortTabs.indexOf(tab);
            if (ind < 0)
                ind = 0;
            selector.setIndex(ind);
        }
        nextTick(() => {
            State.observe(SETTINGS, ({ value, prev }) => {
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
    const _setDirty = (newState) => {
        if (newState !== _dirty) {
            _saving = false;
            _dirty = newState;
            const act = getElement("slc-act");
            if (_dirty) {
                getElement("s-save").onclick = () => {
                    _saving = true;
                    _saveHandlers.map((h) => h());
                };
                getElement("s-can").onclick = () => {
                    _cancelHandlers.map((h) => h());
                };
                removeClass(act, "hide");
            }
            else {
                addClass(act, "hide");
            }
        }
    };
    function makeTab(key) {
        const container = createElement("span");
        const groupDivs = [];
        const addToContainer = (groupNum, input) => {
            if (groupNum == null) {
                return appendChild(container, input.node);
            }
            if (groupDivs[groupNum] == null) {
                const d = createDiv();
                addClass(d, "igroup");
                groupDivs[groupNum] = [d, []];
                appendChild(container, d);
            }
            groupDivs[groupNum][1].push(input);
            appendChild(groupDivs[groupNum][0], input.node);
        };
        for (const k in SETTING_INPUT_MAP[key]) {
            const { g, cg, l, t = InputType_Number, o, } = SETTING_INPUT_MAP[key][k];
            const stateKey = `${SETTINGS}.${key}.${k}`;
            const pendingKey = `${PENDING_STATE}.${key}.${k}`;
            const inp = Input({
                label: l,
                type: t,
                enumOpts: o,
                value: State.get(stateKey),
            });
            addToContainer(g, inp);
            const ind = _inputs.push(inp);
            inp.onChange((v) => {
                if (cg) {
                    _enableDisableGroup(v, groupDivs[g][0], groupDivs[g][1]);
                }
                _inputsDirty[ind] = inp.isDirty();
                _setDirty(_inputsDirty.filter((d) => d === true).length > 0);
                State.set(pendingKey, v);
            });
        }
        return container;
    }
    function _enableDisableGroup(value, groupDiv, inputs) {
        const d = "disabled";
        value ? removeClass(groupDiv, d) : addClass(groupDiv, d);
        inputs.forEach((i) => {
            i.setDisabled(!value);
        });
    }
    return template;
};
const Settings = Component(_Settings);

const HTTP_PUT = "PUT";
const HTTP_GET = "GET";
const api = "/api";
function doFetch(resource, method, opts) {
    return _doFetch(resource, method, opts);
}
function _doFetch(resource, method = HTTP_GET, opts = {}, attempt = 0) {
    const body = isObject(opts.body) ? JSON.stringify(opts.body) : opts.body;
    const headers = { ...(opts.headers || {}) };
    if (body)
        headers["content-type"] = "application/json";
    const url = `${api}/${resource}`;
    return fetch(url, {
        body,
        method,
        headers,
    }).then((res) => {
        if (!res.ok) {
            attempt += 1;
            if (attempt > 8 || res.status < 500) {
                const e = new Error(`[${method}] ${url} failed (${res.status})`);
                e.response = res;
                throw e;
            }
            return wait(attempt * 5000).then(() => _doFetch(resource, method, opts, attempt));
        }
        return res.json();
    });
}

const EventFlagStringIndices = [4, 5, 22, 24];
const OrderedEventFlags = [
    "pos",
    "tPos",
    "speed",
    "accel",
    "deviceName",
    "mdnsName",
    "emitSyncData",
    "pinStep",
    "pinDir",
    "pinEn",
    "pinSleep",
    "pinReset",
    "pinMs1",
    "pinMs2",
    "pinMs3",
    "pinHomeSw",
    "cordLength",
    "cordDiameter",
    "axisDiameter",
    "stepsPerRev",
    "resolution",
    "mqttEnabled",
    "mqttHost",
    "mqttPort",
    "mqttTopic",
    "moveUp",
    "moveDown",
    "moveStop",
    "tick",
];

var WSEventType;
(function (WSEventType) {
    WSEventType[WSEventType["UpdateSettings"] = 0] = "UpdateSettings";
    WSEventType[WSEventType["UpdateState"] = 1] = "UpdateState";
})(WSEventType || (WSEventType = {}));
const makeWebsocket = (opts = {}) => {
    let ws;
    let _enabled = false;
    let _reconnectAttempt = 0;
    connect();
    function connect() {
        ws = new WebSocket(`ws://${window.location.hostname}/ws`);
        ws.onopen = (e) => {
            _enabled = true;
            _reconnectAttempt = 0;
            opts.onConnect && opts.onConnect(e, _reconnectAttempt);
        };
        ws.onclose = (e) => {
            _enabled = false;
            opts.onDisconnect && opts.onDisconnect(e, _reconnectAttempt);
            setTimeout(connect, Math.min(5000 * ++_reconnectAttempt, 60000));
        };
        ws.onmessage = (e) => {
            debug("[ws] onMessage(): ", e, e.data);
            const unpacked = unpackMessages(e.data);
            if (opts.onMessage) {
                unpacked.map((m) => opts.onMessage(m));
            }
        };
        ws.onerror = (e) => {
            _enabled = false;
            opts.onError && opts.onError(e, _reconnectAttempt);
        };
    }
    const push = (ev, data) => {
        if (_enabled) {
            ws.send(packMessage());
        }
    };
    function packMessage(ev, data) {
        return "";
    }
    function unpackMessages(data) {
        const spl = data.split("/");
        const mac = spl.shift();
        const mask = parseInt(spl.shift());
        const stateEvData = {};
        const settingsEvData = {};
        let j = 1;
        for (let i = 0, len = OrderedEventFlags.length; i < len && spl.length > 0; i++) {
            if (j & mask) {
                const k = OrderedEventFlags[i];
                const v = spl.shift();
                if (i < 4) {
                    stateEvData[k] = parseInt(v);
                }
                else {
                    settingsEvData[k] = i in EventFlagStringIndices ? v : parseInt(v);
                }
            }
            j = j << 1;
        }
        const evs = [];
        if (Object.keys(stateEvData).length > 0) {
            evs.push({
                type: 1,
                mac,
                data: stateEvData,
            });
        }
        if (Object.keys(settingsEvData).length > 0) {
            evs.push({
                type: 0,
                mac,
                data: settingsEvData,
            });
        }
        return evs;
    }
    return { ws, push };
};

const labels = ["Home", "Routines", "Settings"];
var run = (ns) => {
    const body = querySelector("body");
    const app = getElement("app");
    ns.state = State;
    const nav = Nav({ labels });
    appendChild(getElement("nav"), nav.node);
    nav.onClick(handleTabChange);
    const tc = ToastContainer({});
    appendChild(body, tc.node);
    window.onerror = handleError;
    window.onpopstate = (e) => {
        console.log("on pop state: ", e);
    };
    let currentIndex = -1;
    let currentTab;
    function handleTabChange(nextIndex) {
        var _a;
        if (currentIndex === nextIndex)
            return;
        currentIndex = nextIndex;
        (_a = currentTab === null || currentTab === void 0 ? void 0 : currentTab.destroy) === null || _a === void 0 ? void 0 : _a.call(currentTab);
        currentTab === null || currentTab === void 0 ? void 0 : currentTab.node.remove();
        pushToHistory(`/${labels[currentIndex].toLowerCase()}`);
        switch (nextIndex) {
            case 0: {
                const t = Home();
                t.onDeviceClick(handleDeviceClick);
                if (!State.isLoaded(STATE)) {
                    load(STATE);
                    load(PRESETS);
                    load(DEVICES);
                }
                currentTab = t;
                break;
            }
            case 1: {
                currentTab = null;
                break;
            }
            case 2: {
                const t = Settings();
                t.onSave(saveSettings);
                t.onCancel(cancelSettings);
                currentTab = t;
                if (!State.isLoaded(SETTINGS)) {
                    load(SETTINGS, [PENDING_STATE, SETTINGS]);
                }
                break;
            }
        }
        currentTab && appendChild(app, currentTab.node);
    }
    const handleRoute = (path) => {
        let i = labels.map((l) => l.toLowerCase()).indexOf(path.substr(1));
        if (i < 0)
            i = 0;
        nav.setIndex(i);
    };
    handleRoute(location.pathname);
    const stripPasswords = (data) => {
        var _a, _b;
        if ((_a = data === null || data === void 0 ? void 0 : data.gen) === null || _a === void 0 ? void 0 : _a.pass) {
            data.gen.pass = undefined;
        }
        if ((_b = data === null || data === void 0 ? void 0 : data.mqtt) === null || _b === void 0 ? void 0 : _b.pass) {
            data.mqtt.pass = undefined;
        }
        return data;
    };
    function saveSettings() {
        debug("saveSettings: ", State._state);
        State.setSaving(SETTINGS, true);
        const body = diffDeep(State._state.state, State._state.pendingState);
        doFetch(SETTINGS, HTTP_PUT, { body }).then(() => {
            State.setSaving(SETTINGS, false);
            State.update(SETTINGS, stripPasswords(State._state.pendingState));
        });
    }
    function cancelSettings() {
        debug("cancelSettings: ", State._state);
        State.update(PENDING_STATE, State._state.settings);
    }
    function handleDeviceClick(device) {
        const card = Card({});
        appendChild(body, card.node);
        setTimeout(card.show);
    }
    function load(key, updates = [key]) {
        return doFetch(key)
            .then((r) => {
            updates.map((k) => State.update(k, r));
            return r;
        })
            .catch(handleError);
    }
    makeWebsocket({
        onMessage(msg) {
            if (msg.type === 0) {
                State.update(SETTINGS, {
                    ...State.get(SETTINGS),
                    ...msg.data,
                });
            }
        },
        onError(e, num) {
            if (!num) {
                tc.pushToast("Websocket disconnected!", true, false, 5000);
            }
        },
        onConnect(e, num) {
            if (num) {
                tc.pushToast("Websocket connected!");
            }
        },
        onDisconnect(e) {
        },
    });
    function handleError(err) {
        console.error(err);
        const m = isObject(err)
            ? ((err === null || err === void 0 ? void 0 : err.message) || DEFAULT_ERROR) + "\n" + err.stack
            : err;
        tc.pushToast(m, true, true);
    }
};

var css_248z = "html {\n\ttouch-action: manipulation;\n}\n\nbody {\n\tmargin: 0;\n\tbackground-color: #111;\n\tfont-family: -apple-system, BlinkMacSystemFont, helvetica, sans-serif;;\n\tfont-size: 17px;\n\tfont-weight: 400;\n\tcolor: #fff;\n\ttext-align: center;\n\t-webkit-touch-callout: none;\n\t-webkit-user-select: none;\n\t-moz-user-select: none;\n\t-ms-user-select: none;\n\tuser-select: none;\n\t-webkit-tap-highlight-color: transparent;\n\tscrollbar-width: 6px;\n\tscrollbar-color: var(--c-sb) transparent;\n}\n\nhtml, body {\n\theight: 100%;\n\twidth: 100%;\n\tposition: fixed;\n\t-ms-scroll-chaining: none;\n\t    overscroll-behavior: none;\n}\n\n*:focus {\n    outline: none;\n}\n\nh1, h4 {\n\tfont-weight: 400;\n}\n\nh1 {\n\tfont-size: 32px;\n}\n\nh4 {\n\t-webkit-margin-after: 0.3em;\n\t        margin-block-end: 0.3em;\n\tfont-size: 14px;\n\tpadding-left: 5px;\n}\n\n/* uncss:ignore */\n\n.hide {\n\tdisplay: none !important;\n}\n\n/* uncss:ignore */\n\n.loader, .loader:before, .loader:after {\n\tborder-radius: 50%;\n\twidth: 2.5em;\n\theight: 2.5em;\n\t-webkit-animation-fill-mode: both;\n\tanimation-fill-mode: both;\n\t-webkit-animation: load7 1.8s infinite ease-in-out;\n\tanimation: load7 1.8s infinite ease-in-out;\n}\n\n/* uncss:ignore */\n\n.loader {\n\tmargin: auto;\n\tcolor: #ffffff;\n\tfont-size: 10px;\n\ttext-indent: -9999em;\n\ttransform: translate3d(0, -100px, 0);\n\t-webkit-animation-delay: -0.16s;\n\tanimation-delay: -0.16s;\n\talign-self: center;\n}\n\n/* uncss:ignore */\n\n.loader:before, .loader:after {\n\tcontent: '';\n\tposition: absolute;\n\ttop: 0;\n}\n\n/* uncss:ignore */\n\n.loader:before {\n\tleft: -3.5em;\n\t-webkit-animation-delay: -0.32s;\n\tanimation-delay: -0.32s;\n}\n\n/* uncss:ignore */\n\n.loader:after {\n\tleft: 3.5em;\n}\n\n/* uncss:ignore */\n\n@-webkit-keyframes load7 {\n\t0%, 80%, 100% {\n\t\tbox-shadow: 0 2.5em 0 -1.3em;\n\t}\n\t40% {\n\t\tbox-shadow: 0 2.5em 0 0;\n\t}\n}\n\n/* uncss:ignore */\n\n@keyframes load7 {\n\t0%, 80%, 100% {\n\t\tbox-shadow: 0 2.5em 0 -1.3em;\n\t}\n\t40% {\n\t\tbox-shadow: 0 2.5em 0 0;\n\t}\n}\n\n/* uncss:ignore */\n\n.em {\n\topacity: 0;\n}\n\n/* uncss:ignore */\n\nul {\n\tdisplay: flex;\n\tlist-style-type: none;\n\t-webkit-margin-before: 0em;\n\t        margin-block-start: 0em;\n\t-webkit-margin-after: 0em;\n\t        margin-block-end: 0em;\n\t-webkit-padding-start: 0px;\n\t        padding-inline-start: 0px;\n}\n\n/* uncss:ignore */\n\nli {\n\tdisplay: list-item;\n\ttext-align: -webkit-match-parent;\n\tcolor: #FFFFFF66;\n}\n\n/* uncss:ignore */\n\nli.s {\n\tcolor: #DB8B1D;\n}\n\n.f {\n\twidth: 100%;\n\theight: 100%;\n}\n\n.flex {\n\tdisplay: flex;\n}\n\n.fC {\n\tdisplay: flex;\n\tflex-direction: column;\n}\n\n.fR {\n\tdisplay: flex;\n\tflex-direction: row;\n}\n\n.fSB {\n\tjustify-content: space-between;\n}\n\n.wrap {\n\tflex-wrap: wrap;\n}\n\n.fw {\n\twidth: 100%;\n}\n\n#bg {\n\theight: 100vh;\n\twidth: 100vw;\n\tposition: fixed;\n\tz-index: -10;\n\tbackground-position: 30%;\n\tbackground-repeat: no-repeat;\n\tbackground-size: cover;\n\topacity: 1;\n\ttransition: opacity 2s;\n    background-image: url(https://github.com/maxakuru/WBlinds/blob/main/public/bg.jpg?raw=true),linear-gradient(40deg,#1d0143 0,#293b7c, #300a52);\n}\n\n#app {\n\tdisplay: flex;\n\tflex-direction: column;\n\tpadding: 23px 23px 0 23px;\n\theight: calc(100% - (63px + 23px));\n\toverflow-y: scroll;\n}\n\n.overlay {\n\tposition: fixed;\n\theight: 100%;\n\twidth: 100%;\n\ttop: 0;\n\tleft: 0;\n\tbackground-color: #333;\n\tfont-size: 24px;\n\tdisplay: flex;\n\talign-items: center;\n\tjustify-content: center;\n\tz-index: 11;\n\topacity: 0.95;\n\ttransition: 0.7s;\n\tpointer-events: none;\n}";
styleInject(css_248z);

const ns = (window.wblinds = {});
window.onload = () => run(ns);
//# sourceMappingURL=index.js.map
