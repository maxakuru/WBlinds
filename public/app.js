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

var template$a = "<ul class=\"fw navc\"></ul>";

var css_248z$b = "#nav {\n\tbackground: rgba(0,0,0,0.5);\n\theight: 50px;\n\tdisplay: flex;\n\tfont-size: 10px;\n\tjustify-content: center;\n}\n\n.navc {\n\tjustify-content: space-around;\n\talign-self: center;\n\tmax-width: 500px;\n}\n\n/* uncss:ignore */\n\n.navc .sel {\n\tcolor: #DB8B1D;\n}\n\n/* uncss:ignore */\n\n#nav>ul>li>.l {\n\t-webkit-margin-before: 0em;\n\t        margin-block-start: 0em;\n    -webkit-margin-after: 0em;\n            margin-block-end: 0em;\n}";
stynj(css_248z$b);

const DomTokenProto = DOMTokenList.prototype;
function addClass(elem, ...tokens) {
    DomTokenProto.add.call(elem.classList, ...tokens);
}
function removeClass(elem, ...tokens) {
    DomTokenProto.remove.call(elem.classList, ...tokens);
}
const toggleClass = (elem, token) => {
    DomTokenProto.toggle.call(elem.classList, token);
    // elem.classList.toggle.call(elem, token);
};
const nextTick = setTimeout;
const DOCUMENT = document;
const WINDOW = window;
const createElement = DOCUMENT.createElement.bind(DOCUMENT);
const createDiv = DOCUMENT.createElement.bind(DOCUMENT, "div");
const innerWidth = () => {
    return WINDOW.innerWidth;
};
/**
 * Alias to document.getElementById,
 * so closure can trim a few extra characters.
 */
const getElement = DOCUMENT.getElementById.bind(DOCUMENT);
const getElementsByTagName = (tags, elem = DOCUMENT) => elem.getElementsByTagName.call(elem, tags);
const querySelector = (selectors, elem = DOCUMENT) => elem.querySelector.call(elem, selectors);
const stopPropagation = (e) => e.stopPropagation();
function setStyle(elem, key, value) {
    // CSSStyleDeclaration.prototype.setProperty.call(elem, key, value);
    elem.style[key] = value;
}
function displayNone(elem) {
    setStyle(elem, "display", "none");
}
const appendChild = (parent, child) => {
    return _appendChild.call(parent, child);
};
const _appendChild = DOCUMENT.appendChild;

const isObject = (o) => {
    return o && typeof o === "object" && !Array.isArray(o);
};
function isNullish(o) {
    return o == null;
}
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
/**
 * Returns new object that is the difference between source and target.
 * Entries that exist or are different in target are returned.
 * If source contains keys that target doesn't, they are ignored.
 * Ignores arrays, only returns them as is from target.
 *
 * @param source
 * @param target
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const diffDeep = (source, target) => {
    return Object.keys(target).reduce((diff, key) => {
        if (source[key] === target[key] || target[key] == null)
            return diff;
        if (isObject(source[key]) && isObject(target[key])) {
            // both keys are objects, diff recursively
            const oDiff = diffDeep(source[key], target[key]);
            if (Object.keys(oDiff).length === 0)
                return diff;
            return {
                ...diff,
                [key]: oDiff,
            };
        }
        return {
            ...diff,
            [key]: target[key],
        };
    }, {});
};
const getQueryParam = (param, qpStr) => {
    qpStr = qpStr || location.search;
    const query = qpStr.substring(1);
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
    // TODO: enable debugging by localstorage
    console.debug.call(console, ...msgs);
};
const getFromNamespace = (key) => {
    return window.wblinds[key];
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
const _queryChangeHandlers = [];
const onQueryChange = (h) => {
    const ind = _queryChangeHandlers.push(h);
    return () => {
        delete _queryChangeHandlers[ind - 1];
    };
};
const query = () => location.search;
const pathname = () => location.pathname;
const _callQueryHandlers = () => {
    _queryChangeHandlers.forEach((h) => {
        h && h();
    });
};
let _lastQp = query();
const emitQueryChange = () => {
    const q = query();
    debug("q === query: ", q, _lastQp, location.search);
    if (q === _lastQp)
        return;
    _lastQp = q;
    _callQueryHandlers();
};
const pushToHistory = (path, qps, resetQps) => {
    qps = qps || {};
    if (isNullish(resetQps))
        resetQps = true;
    const cPath = pathname();
    const cSearch = query();
    const params = new URLSearchParams(resetQps ? "" : cSearch);
    for (const k in qps) {
        params.set(k, qps[k]);
    }
    let qpStr = params.toString();
    if (qpStr.length > 0)
        qpStr = "?" + qpStr;
    if (path === cPath && qpStr === cSearch) {
        // no change
        debug("no change: ", path, cPath, qpStr, cSearch);
        return;
    }
    const fullPath = (path || cPath) + qpStr;
    debug("push history: ", fullPath);
    history.pushState(null, "", fullPath);
    if (qpStr !== cSearch) {
        _callQueryHandlers();
    }
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
            addClass(l, "fC");
            if (i === _i) {
                addClass(l, "sel");
            }
            // Add icon
            const ic = createElement("i");
            appendChild(ic, label.i);
            // ic.innerHTML = label.i;
            appendChild(l, ic);
            // Add label
            const p = createElement("p");
            addClass(p, "l");
            p.innerText = label.t;
            appendChild(l, p);
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
    return template$a;
};
const Nav = Component(_Nav);

var template$9 = "<div class=\"sc flex\"><input class=\"slider\" type=\"range\" min=\"0\" max=\"100\"></div>";

var css_248z$a = ":root {\n\t--oc: #1d95db;\n\t--cc: #606060;\n}\n\n.sc {\n\tpointer-events: none;\n\tpadding: 20px;\n\talign-self: center;\n\talign-items: center;\n\tjustify-content: center;\n\theight: 59%;\n\toverflow-x: hidden;\n\twidth: 50vh;\n}\n\n.slider {\n\tpointer-events: all;\n\ttransform: rotate( 90deg);\n\tbackground: linear-gradient(to right, var(--cc) 0%, var(--cc) 50%, var(--oc) 50%, var(--oc) 100%);\n\theight: 7px;\n\toutline: none;\n\tborder-radius: 15px;\n\theight: 150px;\n\t-webkit-appearance: none;\n\t-moz-appearance: none;\n\tappearance: none;\n\twidth: 400px;\n}\n\n.slider::-webkit-slider-thumb {\n\t-webkit-appearance: none;\n\tappearance: none;\n\twidth: 30px;\n\ttransform: translateX(-15px);\n\theight: 70px;\n\tbackground: rgba(0, 0, 0, 0);\n\tborder-right: 2px solid white;\n\tbox-shadow: black;\n\tcursor: pointer;\n}";
stynj(css_248z$a);

const OPEN_COLOR = "#1d95db";
const CLOSED_COLOR = "#606060";
const setGradientStyle = (input, val, min, max, activeColor, inactiveColor) => {
    const pVal = ((val - min) / (max - min)) * 100;
    setStyle(input, "background", `linear-gradient(to right, ${activeColor} 0%, ${activeColor} ${pVal}%, ${inactiveColor} ${pVal}%, ${inactiveColor} 100%`);
};
const _Slider = function ({ value, }) {
    let _onChangeHandlers = [];
    this.init = (elem) => {
        const slider = querySelector("input", elem);
        slider.onmousedown = (slider.ontouchstart = stopPropagation);
        const parse = parseInt;
        const min = parse(slider.min);
        const max = parse(slider.max);
        slider.oninput = () => {
            const val = parse(slider.value);
            setGradientStyle(slider, val, min, max, CLOSED_COLOR, OPEN_COLOR);
            // _onChangeHandlers.forEach((h) => h(val));
        };
        slider.onchange = () => {
            const val = parse(slider.value);
            _onChangeHandlers.forEach((h) => h(val));
        };
        slider.value = `${value}`;
        // initial gradient
        setGradientStyle(slider, value, min, max, CLOSED_COLOR, OPEN_COLOR);
        return {
            destroy: () => {
                _onChangeHandlers = [];
                // todo
            },
            onChange: (h) => {
                _onChangeHandlers.push(h);
            },
        };
    };
    return template$9;
};
const Slider = Component(_Slider);

var template$8 = "<div id=\"card\" class=\"an f flex\"><div class=\"ca-con flex fC\"></div><div class=\"act\">X</div></div>";

var css_248z$9 = "#card {\n    position: fixed;\n    top: 100%;\n\tbackground: rgb(9 9 9 / 88%);\n    border-radius: 30px 30px 0 0;\n    text-align: left;\n    justify-content: center;\n    font-size: 12px;\n}\n\n/* uncss:ignore */\n\n#card::after {\n    content: \"-\";\n    transform: scale(20, 1) translate(0.5px);\n    position: fixed;\n    color: var(--cc);\n}\n\n/* uncss:ignore */\n\n#card.an, #card>*.an {\n    transition: 0.2s top ease-in-out;\n}\n\n.in {\n    text-align: left;\n}\n\n.ca-con {\n    width: 80%;\n    max-width: 300px;\n    padding-top: 50px;\n}\n\n/* uncss:ignore */\n\n.cR {\n    margin-bottom: 50px;\n}\n\n/* uncss:ignore */\n\n#card .act {\n    position: fixed;\n    right: 23px;\n    top: 100%;\n    font-size: 20px;\n    font-weight: 100;\n    transform: scaleX(1.3);\n}";
stynj(css_248z$9);

var template$7 = "<div class=\"fR\"></div>";

var css_248z$8 = ":root {\n\t--c: #1d95db;\n}\n\n/* uncss:ignore */\n\n.in {\n  justify-content: space-between;\n  height: 50px;\n  align-items: center;\n  background: rgba(0,0,0,.56);\n  padding: 0px 0px 0px 15px;\n  border-radius: 15px;\n  min-width: 300px;\n  font-size: 14px;\n}\n\n/* uncss:ignore */\n\n.in.disabled {\n  color: grey;\n}\n\n/* uncss:ignore */\n\n.in>label {\n  font-weight: bold;\n}\n\n/* uncss:ignore */\n\n.igroup>.in {\n  margin-top: 0px;\n  border-radius: 0px;\n  border-bottom: 1px solid #FFFFFF4D;\n}\n\n/* uncss:ignore */\n\n.igroup>.in:first-child {\n  border-radius: 15px 15px 0px 0px;\n  margin-top: 20px;\n}\n\n/* uncss:ignore */\n\n.igroup>.in:last-child {\n  border-radius: 0px 0px 15px 15px;\n  margin-bottom: 20px;\n  border-bottom: none;\n}\n\n/* uncss:ignore */\n\n.in-r {\n\tbackground: linear-gradient(to right, var(--c) 0%, var(--c) 50%, #606060 50%, #606060 100%);\n\tborder-radius: 8px;\n\theight: 7px;\n\twidth: 75%;\n\toutline: none;\n\t-webkit-appearance: none;\n}\n\n/* uncss:ignore */\n\n.in-r {\n\tborder-radius: 15px;\n\theight: 6px;\n\t-webkit-appearance: none;\n\t-moz-appearance: none;\n\tappearance: none;\n\twidth: 100%;\n\toutline: none;\n}\n\n/* uncss:ignore */\n\n.in-r::-webkit-slider-thumb {\n\t-webkit-appearance: none;\n\tappearance: none;\n\twidth: 16px;\n\theight: 16px;\n\tbackground: white;\n\tbox-shadow: black;\n\tborder-radius: 50%;\n\tcursor: pointer;\n}\n\n/* uncss:ignore */\n\n.in>input:not([type=checkbox]),.in>select {\n  flex-grow: 1;\n  padding: 10px 27px 10px 0px;\n  background: rgba(0,0,0,0);\n  border: none;\n  color: #DB8B1D;\n  -moz-text-align-last: right;\n  text-align-last: right;\n  -webkit-appearance: none;\n  -moz-appearance: none;\n  text-align: right;\n}\n\n/* uncss:ignore */\n\n.in>select + span {\n  left: -10px;\n  transform: scale(1.6, 0.9) translateY(-1px);\n  font-weight: 200;\n  color:#DB8B1D;\n}\n\n/* uncss:ignore */\n\n.in>span {\n  color: #5f5f5f;\n  position: relative;\n  font-size: 12px;\n  pointer-events: none;\n  margin-left: -20px;\n  left: -5px;\n}\n\n/* uncss:ignore */\n\n.in>select {\n  margin-inline: 12px;\n}\n\n/* uncss:ignore */\n\n.in:focus-within {\n  box-shadow: -1px 0px rgba(219, 139, 29, 0.627) inset;\n}\n\n/* uncss:ignore */\n\n.in>input:is([type=checkbox]) {\n  margin-right: 15px;\n}\n\n/* uncss:ignore */\n\n.in>input:disabled {\n  color: grey;\n}\n\n/* uncss:ignore */\n\ninput::-webkit-outer-spin-button,\ninput::-webkit-inner-spin-button {\n  -webkit-appearance: none;\n  margin: 0;\n}\n\n/* uncss:ignore */\n\ninput[type=number] {\n  -moz-appearance: textfield;\n}\n\n/* uncss:ignore */\n\n[type=\"checkbox\"] {\n  -webkit-appearance: none;\n     -moz-appearance: none;\n          appearance: none;\n  width: 51px;\n  height: 31px;\n  border-radius: 50px;\n  background-color: rgba(148, 148, 154, 0.2) !important;\n}\n\n/* uncss:ignore */\n\n[type=\"checkbox\"]:after {\n  content: \"\";\n  width: 50%;\n  border-radius: 100%;\n  height: 80%;\n  display: block;\n  position: relative;\n  background-color: white;\n  top: 12%;\n  left: 3%;\n  /* transition: all 0.3s ease 0s; */\n  transition: 0.2s all ease-in-out;\n}\n\n/* uncss:ignore */\n\n[type=\"checkbox\"].on {\n  background-color: #34C759 !important;\n}\n\n/* uncss:ignore */\n\n[type=\"checkbox\"].on::after {\n  left: 45%;\n}";
stynj(css_248z$8);

const InputType_Number = 0;
const InputType_String = 1;
const InputType_Boolean = 2;
const InputType_Enum = 3;
const InputType_Password = 4;
const InputType_Range = 5;
const InputTypeMap = {
    [InputType_String]: "text",
    [InputType_Boolean]: "checkbox",
    [InputType_Number]: "number",
    [InputType_Enum]: "select",
    [InputType_Password]: "password",
    [InputType_Range]: "range",
};
const _Input = function ({ label, type, enumOpts, placeholder, value, unit, embed = true, prevDefault = false, min, max, }) {
    let _currentValue = value;
    const _firstValue = value;
    let _input;
    let _onChangeHandlers = [];
    const setup = (elem) => {
        elem.innerHTML = "";
        if (embed) {
            addClass(elem, "in");
        }
        const l = createElement("label");
        l.innerText = label;
        appendChild(elem, l);
        if (type === InputType_Enum) {
            // make select with options
            _input = createElement("select");
            addClass(elem, "in-s");
            enumOpts.forEach((o) => {
                const opt = createElement("option");
                opt.value = o.v;
                opt.innerText = o.l;
                appendChild(_input, opt);
            });
            _input.onchange = (e) => {
                if (prevDefault)
                    e.preventDefault();
                _onChange(enumOpts[_input.options.selectedIndex].v);
            };
        }
        else {
            // all others are input type
            _input = createElement("input");
            _input.type = InputTypeMap[type];
            _input.placeholder = placeholder || "xxxxx";
            if (!isNullish(min))
                _input.min = `${min}`;
            if (!isNullish(max))
                _input.max = `${max}`;
            if (type === InputType_Range) {
                addClass(_input, "in-r");
            }
            if (type === InputType_Boolean) {
                // checkbox/select inputs, use checked for bool, value for enum
                _input.checked = value;
                value && addClass(_input, "on");
                _input.onchange = (e) => {
                    if (prevDefault)
                        e.preventDefault();
                    toggleClass(_input, "on");
                    _onChange(_input.checked);
                };
            }
            else {
                // text/number inputs
                _input.onchange = (e) => {
                    if (prevDefault)
                        e.preventDefault();
                    _onChange(_input.value);
                };
            }
        }
        // set initial value
        if (value != null)
            _input.value = value;
        _input.id = l.htmlFor = `in-${label.split(" ").join("-")}`;
        const _showError = (err) => {
            // TODO:
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
        function _validate() {
            // TODO: show error hint
            return;
        }
        appendChild(elem, _input);
        // Add unit if it exists,
        // or an arrow for selects.
        if (type === InputType_Enum || unit) {
            const suf = createElement("span");
            suf.innerText = unit ? unit : "v";
            appendChild(elem, suf);
        }
    };
    this.init = (elem) => {
        setup(elem);
        return {
            onChange: (h) => {
                _onChangeHandlers.push(h);
            },
            setDisabled: (val) => {
                toggleClass(elem, "disabled");
                _input.disabled = val;
            },
            destroy: () => {
                _onChangeHandlers = [];
            },
            reset: () => {
                setup(elem);
            },
            isDirty: () => {
                return _firstValue !== _currentValue;
            },
        };
    };
    return template$7;
};
const Input = Component(_Input);

const MIN_TOP = 8;
const ACT_Y_OFFSET = 12;
const INPUT_SPEED = 0;
const INPUT_ACCEL = 1;
const INPUT_LABEL_MAP = ["Speed", "Acceleration"];
const INPUT_LIMIT_MAP = [
    [1, 5000],
    [1, 4294967294],
];
const _Card = function ({ pos, accel, speed, ...data }) {
    let _onChangeHandlers = [];
    let draggingCard = false;
    let yOffset = 0;
    let yStart = 0;
    let animated = false;
    let lastCoords = {};
    let _inputs = [];
    this.init = (elem) => {
        const container = querySelector(".ca-con", elem);
        const act = querySelector(".act", elem);
        toggleAnimations(true);
        debug("card data: ", data);
        const notify = (d) => {
            _onChangeHandlers.forEach((h) => h(d));
        };
        const makeRangeInput = (input) => {
            const value = input === INPUT_SPEED ? speed : accel;
            const range = Input({
                type: InputType_Range,
                label: INPUT_LABEL_MAP[input],
                value,
                embed: false,
                min: INPUT_LIMIT_MAP[input][0],
                max: INPUT_LIMIT_MAP[input][1],
            });
            const node = range.node;
            const inp = querySelector("input", node);
            removeClass(range.node, "fR");
            addClass(range.node, "cR");
            const parse = parseInt;
            const min = parse(inp.min);
            const max = parse(inp.max);
            inp.oninput = () => {
                const val = parse(inp.value);
                setGradientStyle(inp, val, min, max, OPEN_COLOR, CLOSED_COLOR);
            };
            const _handleChange = (val) => {
                // let accel, speed;
                if (input === INPUT_SPEED) {
                    notify({ speed: val, ...data });
                }
                else if (input === INPUT_ACCEL) {
                    // accel = val;
                    notify({ accel: val, ...data });
                }
            };
            range.onChange(_handleChange);
            appendChild(container, range.node);
            setGradientStyle(inp, value, min, max, OPEN_COLOR, CLOSED_COLOR);
            _inputs.push(range);
        };
        makeRangeInput(INPUT_SPEED);
        makeRangeInput(INPUT_ACCEL);
        const slider = Slider({ value: pos });
        slider.onChange((tPos) => {
            notify({ tPos, ...data });
        });
        appendChild(container, slider.node);
        const onPress = (coords) => {
            lastCoords = coords;
            yStart = coords.y;
            draggingCard = true;
            toggleAnimations(false);
        };
        const closeAndDestroy = () => {
            toggleAnimations(true);
            elem.ontransitionend = destroy;
            const o = elem.clientHeight;
            setStyle(elem, "top", `${o}px`);
            setStyle(act, "top", `${o + ACT_Y_OFFSET}px`);
        };
        act.onclick = closeAndDestroy;
        const onRelease = () => {
            if (!draggingCard)
                return;
            draggingCard = false;
            toggleAnimations(true);
            if (yOffset > elem.clientHeight / 2) {
                return closeAndDestroy();
            }
            setStyle(elem, "top", `${MIN_TOP}px`);
            setStyle(act, "top", `${MIN_TOP + ACT_Y_OFFSET}px`);
            yOffset = yStart = MIN_TOP;
        };
        const onMove = (coords) => {
            if (!draggingCard)
                return;
            if (coords.y - yStart < MIN_TOP) {
                lastCoords = coords;
                return;
            }
            const movedY = coords.y - lastCoords.y;
            yOffset += movedY;
            lastCoords = coords;
            setStyle(elem, "top", `${yOffset}px`);
            setStyle(act, "top", `${yOffset + ACT_Y_OFFSET}px`);
        };
        function toggleAnimations(newState) {
            if (isNullish(newState))
                newState = false;
            if (newState === animated)
                return;
            newState ? addClass(elem, "an") : removeClass(elem, "an");
            newState ? addClass(act, "an") : removeClass(act, "an");
            animated = newState;
        }
        const destroy = () => {
            _onChangeHandlers = [];
            slider.destroy();
            _inputs.forEach((inp) => inp.destroy());
            _inputs = [];
            elem.remove();
        };
        const firstTouchXY = (e) => {
            let { x, y } = e;
            if (x == null) {
                // touch event
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
            onChange: (h) => {
                _onChangeHandlers.push(h);
            },
            show: () => {
                setStyle(elem, "top", `${MIN_TOP}px`);
                setStyle(act, "top", `${MIN_TOP + ACT_Y_OFFSET}px`);
            },
        };
    };
    return template$8;
};
const Card = Component(_Card);

var template$6 = "<div class=\"tile sq\"><span></span><p>Bedroom Left</p></div>";

var css_248z$7 = ":root {\n\t/* --wid: calc((100vw - 30px) / 3);  */\n\t/* Always 3 columns */\n\t--wid: min(calc(33.3vw - 20px),110px, 110px);\n}\n\n.tile {\n\tbackground: rgba(0,0,0,.3);\n\tborder-radius: 12px;\n\tdisplay: flex;\n\t/* justify-content: space-around; */\n}\n\n/* uncss:ignore */\n\n.tile.sq {\n\twidth: var(--wid);\n\theight: var(--wid);\n\t/* margin: 20px; */\n\tmargin: 5px 0px 5px 0px;\n\tposition: relative;\n}\n\n/* uncss:ignore */\n\n.tile.sq>span {\n\twidth: calc(var(--wid) - 1px);\n\tmax-height: 90px;\n\ttop: 10px;\n\tposition: absolute;\n\tright: 0px;\n\tborder-right: 1px dashed white;\n\tborder-right-style: groove;\n}\n\n/* uncss:ignore */\n\n.tile.sq p {\n\tfont-size: 12px;\n\tmargin: auto 21px 10px 9px;\n\tfont-weight: 500;\n\toverflow-wrap: anywhere;\n}";
stynj(css_248z$7);

const _Tile = function ({ name, id, ...data }) {
    let _clickHandlers = [];
    this.init = (elem) => {
        elem.id = id;
        elem.onclick = () => {
            _clickHandlers.forEach((h) => h({ id, name, ...data }));
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

var css_248z$6 = "/* uncss:ignore */\n:root {\n\t--bord: 1px solid rgba(0, 0, 0, 0.034);\n}\n/* uncss:ignore */\n#pas {\n\tborder-radius: 7px;\n    justify-content: center;\n\tmargin-bottom: 20px;\n    max-width: 400px;\n    border: rgba(0,0,0,0);\n    background: rgba(118, 118, 128, 0.24);\n    margin: auto;\n}\n/* uncss:ignore */\n#pas>div {\n\t/* width: 10px; */\n\tpadding: 2px 0 2px;\n\tflex-grow: 1;\n\ttext-align: center;\n\tfont-size: 14px;\n\tborder: 1px rgba(0,0,0,0);\n}\n/* uncss:ignore */\n#pas>div.sel {\n\tbackground-color: rgb(103, 103, 105, .64);\n\tborder-radius: 7px;\n\tborder: 1px rgba(0,0,0,0.14) solid\n}\n/* uncss:ignore */\n#pas>div::after {\n\theight: 13px;\n    content: \"\";\n    display: block;\n    position: absolute;\n    border-left: 1px solid rgba(142, 142, 147, 0.45);\n    border-radius: 0.5px;\n    transform: translate(-1px, -110%);\n}\n/* uncss:ignore */\n#pas>div:first-child::after {\n\tborder-left: none;\n}";
stynj(css_248z$6);

const _Selector = function ({ items, queries, }) {
    let _index = 0;
    let _changeHandlers = [];
    let _items = [];
    this.init = (elem) => {
        const onChange = (h) => {
            _changeHandlers.push(h);
        };
        const handleQueryChange = () => {
            if (queries.length < 1)
                return;
            let tab = getQueryParam("tab");
            tab = tab && tab.toLowerCase();
            let ind = queries.indexOf(tab);
            debug("handleQueryChange: ", ind);
            if (ind < 0)
                ind = 0;
            if (_index !== ind)
                _onChange(ind);
        };
        const removeQh = onQueryChange(handleQueryChange);
        const _onClick = (index) => {
            queries[index] && pushToHistory(undefined, { tab: queries[index] });
            _onChange(index);
        };
        const _onChange = (index) => {
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
        handleQueryChange();
        return {
            destroy: () => {
                removeQh();
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

var css_248z$5 = ".toast {\n\tbackground-color: rgba(0,0,0,.44);\n    box-shadow: 1px 1px 8px rgba(84, 84, 84, 0.451);\n    border-radius: 10px;\n\tfont-size: 13px;\n\tmargin: 10px;\n\theight: 60px;\n\tdisplay: flex;\n\tmin-width: 250px;\n\tmax-width: 500px;\n\tposition: relative;\n\ttransition: 0.5s bottom ease-in-out;\n\tpointer-events: all;\n\talign-self: center;\n}\n\n.tom {\n\tmargin: auto;\n}";
stynj(css_248z$5);

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

var template$3 = "<div id=\"toc\" class=\"fw tc\"></div>";

var css_248z$4 = "\n.tc {\n\tdisplay: flex;\n\tposition: absolute;\n    top: 0;\n    flex-flow: column-reverse;\n\tpointer-events: none;\n\theight: calc(100% - 50px);\n\tpadding-bottom: 50px;\n}";
stynj(css_248z$4);

const _ToastContainer = function () {
    let _index = 0;
    let _toasts = [];
    this.init = (elem) => {
        const pushToast = (message, isError, isPersistent, timeout) => {
            if (isError)
                console.error(message);
            const setBottomStyle = () => {
                setStyle(t.node, "bottom", `-${50 + 200 * (_toasts.length + 1)}px`);
            };
            const remove = () => {
                setBottomStyle();
                setTimeout(() => {
                    t.node.remove();
                }, 500);
            };
            const t = Toast({ message, isError, id: _index++ });
            setBottomStyle();
            t.onClick(remove);
            _toasts.push(t);
            appendChild(elem, t.node);
            setTimeout(() => {
                setStyle(t.node, "bottom", "0px");
                !isPersistent && setTimeout(remove, timeout || isError ? 5000 : 2500);
            });
        };
        return {
            destroy: () => {
                _toasts.map((t) => t.destroy());
                _toasts = [];
                _index = 0;
            },
            pushToast,
        };
    };
    return template$3;
};
const ToastContainer = Component(_ToastContainer);

var template$2 = "<div id=\"h\" class=\"f flex\"><div id=\"hl\" class=\"loader\"></div><div id=\"hlc\" class=\"hide fw\" style=\"text-align: left;\"><h1 id=\"ht\">WBlinds</h1><!-- <h4 class=\"hst\">Presets</h4> --><div id=\"preset-tiles\" class=\"pt fw flex wrap\"></div><h2 class=\"hst\">Devices</h2><div id=\"device-tiles\" class=\"dt fw flex wrap\"></div></div></div>";

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
    //   private _observers: Record<string, StateHandler[]>;
    //   private _state: any;
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
    /**
     *
     * @param key
     * @param value
     */
    update(key, value) {
        this._observers[key] = this._observers[key] || [];
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
        this._observers[key] = this._observers[key] || [];
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

var css_248z$3 = ".dt {\n\t/* margin: 0 10px 0 -10px; */\n\tjustify-content: space-between;\n}\n\n/* uncss:ignore */\n\n.pt>.sq {\n\theight: 50px;\n\twidth: auto;\n\tmin-width: 150px;\n}\n\n/* uncss:ignore */\n\n.pt>.sq>span {\n\tdisplay: none;\n}\n\n#hlc > h2 {\n\t-webkit-margin-after: 0.1em;\n\t        margin-block-end: 0.1em;\n\t-webkit-margin-before: 0.5em;\n\t        margin-block-start: 0.5em;\n\tfont-size: 16px;\n\tpadding-left: 5px;\n}";
stynj(css_248z$3);

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
    let _currentDeviceName;
    this.init = (elem) => {
        // initially spinner is showing,
        // rest is hidden in a div
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
        const handleTileClick = (type, data) => {
            if (type === "device") {
                _deviceClickHandlers.forEach((h) => h(data));
            }
        };
        const updateTiles = (type, o) => {
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
                    }
                    else {
                        tile.remove();
                    }
                }
                else {
                    // Exists, remove from list so it isn't added again
                    o[id] = undefined;
                }
            });
            for (const [k, v] of Object.entries(o)) {
                if (!v || (k === _currentDeviceName && cDeviceExists))
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
        nextTick(() => {
            State.observe(PRESETS, ({ value, prev }) => {
                debug("presets updated: ", value, prev);
                loaded();
                // TODO: define PresetRecord
                updateTiles(PRESET_TILE, value);
            });
            State.observe(STATE, ({ value, prev }) => {
                debug("state updated: ", value, prev);
                _currentDeviceName = State.get("settings.gen.deviceName");
                console.log("_currentDeviceName:", _currentDeviceName);
                loaded();
                // TODO: add mac address, etc. to window before sending from ESP
                // for now just use 'c' to identify the current device
                const gen = State.get("settings.gen");
                const state = State.get("state");
                debug("set tile: ", gen.deviceName, {
                    ...gen,
                    ...value,
                    ...state,
                });
                updateTiles(DEVICE_TILE, {
                    [gen.deviceName]: { ...gen, ...value, ...state },
                });
            });
            State.observe(DEVICES, ({ value, prev }) => {
                debug("devices updated: ", value, prev);
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
    return template$2;
};
const Home = Component(_Home);

var template$1 = "<div id=\"ps\" class=\"f fC\"><div id=\"sl\" class=\"loader\"></div><div id=\"slc\" class=\"hide fw\" style=\"text-align: left;\"><div id=\"slc-act\" class=\"fR fw hide\"><button id=\"s-can\" class=\"btn-c\">Cancel</button> <button id=\"s-save\" class=\"btn-s\">Save</button></div></div></div>";

var css_248z$2 = "/* uncss:ignore */\n#stcc {\n    display: flex;\n}\n/* uncss:ignore */\n#stcc>span {\n    margin: auto;\n}\n/* uncss:ignore */\n#stcc>span:last-child {\n    margin-bottom: 70px;\n}\n/* uncss:ignore */\n#stcc>div {\n    justify-content: center;\n}\n/* uncss:ignore */\n#slc-act {\n    position: fixed;\n    bottom: 55px;\n    justify-content: space-evenly;\n    left: 0%;\n}\n";
stynj(css_248z$2);

var template = "<div class=\"f fC\"><button class=\"calib-btn\">Calibrate</button><div id=\"calib-c\" class=\"hide fR\"></div><button id=\"calib-x\" class=\"btn-t hide\">&lt; cancel</button></div>";

var css_248z$1 = ".calib-btn {\n    margin-top: 40px;\n}\n\n#calib-c, #calib-x {\n    position: fixed;\n    left: 100%;\n    transition: 0.4s left ease-in-out;\n    top: 0;\n}\n\n#calib-c {\n    background: url(bg-dev.jpg), #000;\n    background-position: center;\n    background-size: cover;\n    overflow: hidden;\n}\n\n/* uncss:ignore */\n\n#calib-c>div {\n    width: 100vw;\n    height: 100vh;\n}\n\n/* uncss:ignore */\n\n#calib-c>div>h2 {\n    margin: 80px 30px 10px 30px;\n}\n\n/* uncss:ignore */\n\n#calib-c>div>p {\n    font-size: 13px;\n    margin: 5px 30px 10px 30px;\n}\n\n#calib-x {\n    margin: 10px;\n    width: 90px;\n    transition-delay: 0s;\n    transition-duration: 0.4s;\n}\n\n/* uncss:ignore */\n\n.cal-conc {\n    /* margin: auto; */\n    margin: 20px auto;\n    max-width: 300px;\n    display: flex;\n    flex-wrap: wrap;\n}";
stynj(css_248z$1);

// speed to clear steps on cancel
const FLOW_SPEED = 0.4;
const WIPE_SPEED = FLOW_SPEED / 2;
const CALIBRATION_STEPS = [
    {
        t: "Find home position",
        d: "Move to the fully open position then tap 'Done'. \nBe careful not to wind the cord too tight.",
    },
    {
        t: "Find closed position",
        d: "Move to the fully closed position then tap 'Done'",
    },
    {
        o: true,
        t: "Repeat",
        d: "Alternate between open and closed, tap the corresponding button in between. Repeat as many times as you like. \n\nDue to the differences in how the cord may wrap around the axis, this may or may not be needed.",
    },
];
const _Calibration = function () {
    let _cancelBtn;
    let _initBtn;
    let _active = false;
    let _saveHandlers = [];
    let _container;
    let _stepIndex = 0;
    const _tc = getFromNamespace("tc");
    const makeStep = (data, index, totalStepCount) => {
        const div = createElement("div");
        addClass(div, "fC");
        const title = createElement("h2");
        title.innerText = `${index + 1}. ${data.t}`;
        appendChild(div, title);
        const desc = createElement("p");
        desc.innerText = `${data.d}`;
        appendChild(div, desc);
        const content = createElement("div");
        setStyle(content, "height", "90%");
        addClass(content, "fC");
        appendChild(div, content);
        const acts = createElement("div");
        addClass(acts, "fR");
        appendChild(div, acts);
        const ctx = {
            div,
            c: content,
        };
        const goFwdOrBack = (isNext) => {
            return async () => {
                const preFn = isNext ? "preNext" : "preBack";
                try {
                    if (ctx[preFn])
                        await ctx[preFn]();
                }
                catch (e) {
                    _tc.pushToast(`"[Calib] Error in pre: ${e}"`);
                }
                _stepIndex += isNext ? 1 : -1;
                setStyle(_container, "left", `-${innerWidth() * _stepIndex}px`);
            };
        };
        if (index > 0) {
            const backBtn = createElement("button");
            backBtn.innerText = "Back";
            appendChild(acts, backBtn);
            backBtn.onclick = goFwdOrBack(false);
        }
        const nextBtn = createElement("button");
        const lastStep = index === totalStepCount - 1;
        const nextText = lastStep ? "Done" : "Next";
        if (!data.o)
            nextBtn.disabled = true;
        ctx.showNext = (loading) => {
            if (loading) {
                nextBtn.innerText = "";
                const loader = createElement("div");
                addClass(loader, "loader");
                appendChild(nextBtn, loader);
            }
            else {
                // remove loading div and add back text
                nextBtn.innerText = nextText;
                nextBtn.disabled = false;
            }
        };
        nextBtn.innerText = nextText;
        nextBtn.onclick = goFwdOrBack(true);
        appendChild(acts, nextBtn);
        return ctx;
    };
    const makeControls = () => {
        const div = createElement("div");
        addClass(div, "cal-conc");
        ["speed ▲", "move ▲", "speed ▼", "move ▼"].forEach((l) => {
            const btn = createElement("button");
            btn.innerText = l;
            if (l.indexOf("up") > -1)
                addClass(btn, "btn-up");
            else
                addClass(btn, "btn-down");
            appendChild(div, btn);
        });
        return div;
    };
    const beginCalibFlow = () => {
        CALIBRATION_STEPS.forEach((d, i) => {
            const s = makeStep(d, i, CALIBRATION_STEPS.length);
            // add step specific content
            // right now, each step has the same controls
            // but different actions on commit
            const controls = makeControls();
            appendChild(s.c, controls);
            const btn = createElement("button");
            btn.innerText = "Done";
            appendChild(s.c, btn);
            btn.onclick = async () => {
                s.showNext(true);
                // TODO: call API
                setTimeout(() => {
                    s.showNext();
                }, 4000);
            };
            appendChild(_container, s.div);
        });
        setStyle(_container, "width", `${innerWidth() * CALIBRATION_STEPS.length}px`);
        setStyle(_container, "left", "0");
        setStyle(_cancelBtn, "left", "0");
    };
    this.init = (elem) => {
        _container = querySelector("div", elem);
        const btns = getElementsByTagName("button", elem);
        _initBtn = btns.item(0);
        _cancelBtn = btns.item(1);
        _initBtn.onclick = () => {
            if (_active)
                return;
            _active = true;
            removeClass(_cancelBtn, "hide");
            removeClass(_container, "hide");
            nextTick(beginCalibFlow);
        };
        const TRANSITION_DUR = "transitionDuration";
        const TRANSITION_DELAY = "transitionDelay";
        _cancelBtn.onclick = () => {
            // speed up animations
            const wipeDuration = (_stepIndex + 1) * WIPE_SPEED;
            setStyle(_container, TRANSITION_DUR, `${wipeDuration}s`);
            // some fudge here for the delay to make
            // the button move with the last step
            setStyle(_cancelBtn, TRANSITION_DELAY, `${(_stepIndex - 0.5) * WIPE_SPEED}s`);
            setStyle(_cancelBtn, TRANSITION_DUR, `${WIPE_SPEED}s`);
            setStyle(_container, "left", `${innerWidth()}px`);
            setStyle(_cancelBtn, "left", `${innerWidth()}px`);
            setTimeout(() => {
                _stepIndex = 0;
                // reset styles
                setStyle(_container, TRANSITION_DUR, `${FLOW_SPEED}s`);
                setStyle(_cancelBtn, TRANSITION_DUR, `${FLOW_SPEED}s`);
                setStyle(_cancelBtn, TRANSITION_DELAY, "0s");
                // clear the container
                _container.innerHTML = "";
                // hide
                addClass(_container, "hide");
                _active = false;
            }, wipeDuration * 1000);
        };
        return {
            destroy: () => {
                _saveHandlers = [];
                elem.remove();
            },
            setDisabled: (v) => {
                _initBtn.disabled = v;
            },
            onSave: (h) => {
                _saveHandlers.push(h);
            },
        };
    };
    return template;
};
const Calibration = Component(_Calibration);

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
    hw: {
        axDia: {
            l: "Axis diameter",
            g: InputGroup_Physical,
            u: "mm",
        },
        cDia: {
            l: "Cord diameter",
            g: InputGroup_Physical,
            u: "mm",
        },
        cLen: {
            l: "Cord length",
            g: InputGroup_Physical,
            u: "mm",
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
                { l: "1/2", v: 2 },
                { l: "1/4", v: 4 },
                { l: "1/8", v: 8 },
                { l: "1/16", v: 16 },
            ],
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
};
const _Settings = function () {
    let _loading = true;
    let _savingOrCanceling = false;
    let _dirty = false;
    let _saveHandlers = [];
    let _cancelHandlers = [];
    let _inputs = [];
    const _inputsDirty = [];
    const id = "stcc";
    const tabs = ["General", "Hardware", "MQTT"];
    const shortTabs = Object.keys(SETTING_INPUT_MAP); // = ["gen", "hw", "mqtt"]
    let general;
    let hardware;
    let mqtt;
    let _afterLoad;
    let _calib;
    this.init = (elem) => {
        const selector = Selector({ items: tabs, queries: shortTabs });
        const displayTab = (index) => {
            // set query param
            // pushToHistory(undefined, { tab: shortTabs[index] });
            const div = getElement(id);
            if (!div) {
                _afterLoad = () => displayTab(index);
                return;
            }
            let content;
            if (index === 0) {
                // General
                content = general;
            }
            else if (index === 1) {
                // Hardware
                content = hardware;
            }
            else if (index === 2) {
                // MQTT
                content = mqtt;
            }
            div.innerHTML = "";
            appendChild(div, content);
        };
        selector.onChange(displayTab);
        const loaded = () => {
            debug("settings loaded: ", State._state);
            // Events that come from WS shouldn't overwrite existing data.
            // TODO: add map of key -> inputs, check state of input and allow overwriting
            // if the input hasn't been modified by the user. Would be pretty rare in normal
            // household use.
            if (!_loading && !_savingOrCanceling)
                return;
            // Still loading, event came in between save press and response.
            if (!_loading && State.isSaving(SETTINGS))
                return;
            const spinner = getElement("sl");
            const container = getElement("slc");
            displayNone(spinner);
            removeClass(container, "hide");
            container.prepend(selector.node);
            _loading = false;
            _savingOrCanceling && _setDirty(false);
            // make content container, add it
            let div = getElement(id);
            if (!div) {
                div = createDiv();
                div.id = id;
                appendChild(container, div);
            }
            general = makeTab(shortTabs[0]);
            _calib = Calibration();
            appendChild(general, _calib.node);
            hardware = makeTab(shortTabs[1]);
            mqtt = makeTab(shortTabs[2]);
            if (!_afterLoad)
                return selector.setIndex(selector.index());
            _afterLoad();
            _afterLoad = undefined;
        };
        nextTick(() => {
            State.observe(SETTINGS, ({ value, prev }) => {
                debug("settings updated: ", value, prev);
                loaded();
            });
        });
        const _setDirty = (newState) => {
            if (newState !== _dirty) {
                _savingOrCanceling = false;
                _dirty = newState;
                if (_calib)
                    _calib.setDisabled(_dirty);
                const act = getElement("slc-act");
                if (_dirty) {
                    // show save
                    getElement("s-save").onclick = () => {
                        _savingOrCanceling = true;
                        _saveHandlers.map((h) => h());
                    };
                    getElement("s-can").onclick = () => {
                        _savingOrCanceling = true;
                        _cancelHandlers.map((h) => h());
                        loaded();
                    };
                    removeClass(act, "hide");
                }
                else {
                    addClass(act, "hide");
                }
            }
        };
        const makeTab = (key) => {
            const container = createElement("span");
            const groupDivs = [];
            const addToContainer = (groupNum, input) => {
                if (groupNum == null) {
                    return appendChild(container, input.node);
                }
                // first entry in group, create the entry
                if (groupDivs[groupNum] == null) {
                    const d = createDiv();
                    addClass(d, "igroup");
                    groupDivs[groupNum] = [d, []];
                    appendChild(container, d);
                }
                // add to group divs input list
                groupDivs[groupNum][1].push(input);
                // add to group
                appendChild(groupDivs[groupNum][0], input.node);
            };
            for (const k in SETTING_INPUT_MAP[key]) {
                // group, controls group, label, type, enum options
                const { g, cg, l, t = InputType_Number, o, u, } = SETTING_INPUT_MAP[key][k];
                const stateKey = `${SETTINGS}.${key}.${k}`;
                const pendingKey = `${PENDING_STATE}.${key}.${k}`;
                const inp = Input({
                    label: l,
                    type: t,
                    enumOpts: o,
                    value: State.get(stateKey),
                    unit: u,
                });
                addToContainer(g, inp);
                const ind = _inputs.push(inp);
                inp.onChange((v) => {
                    if (cg) {
                        _enableDisableGroup(v, inp, groupDivs[g][0], groupDivs[g][1]);
                    }
                    _inputsDirty[ind] = inp.isDirty();
                    _setDirty(_inputsDirty.filter((d) => d === true).length > 0);
                    State.set(pendingKey, v);
                });
            }
            return container;
        };
        return {
            destroy: () => {
                // removeQh();
                selector.destroy();
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
    /**
     * Set a group and it's inputs disabled or enabled based on state change
     * @param value   - True = green/ON/enabled
     * @param toggler - The input that triggered the state change
     * @param groupDiv
     * @param inputs
     */
    const _enableDisableGroup = (value, toggler, groupDiv, inputs) => {
        const d = "disabled";
        value ? removeClass(groupDiv, d) : addClass(groupDiv, d);
        inputs.forEach((i) => {
            if (toggler !== i)
                i.setDisabled(!value);
        });
    };
    return template$1;
};
const Settings = Component(_Settings);

const HTTP_PUT = "PUT";
const HTTP_GET = "GET";
/**
 * Begins with /
 * Does not end with /
 */
const api = "http://192.168.1.17/api";
/**
 * Do fetch on some route of the API
 * @param resource - The resource, without "/" prefix
 * @param method - HTTP method
 * @param [opts]
 */
const doFetch = (resource, method, opts) => {
    return _doFetch(resource, method, opts);
};
const _doFetch = (resource, method, opts, attempt) => {
    attempt = attempt || 0;
    opts = opts || {};
    method = method || HTTP_GET;
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
        debug("got res: ", res);
        if (!res.ok) {
            attempt += 1;
            if (attempt > 8 || res.status < 500) {
                const e = new Error(`[${method}] ${url} failed (${res.status})`);
                e.response = res;
                throw e;
            }
            return wait(attempt * 5000).then(() => _doFetch(resource, method, opts, attempt));
        }
        return method === HTTP_GET ? res.json() : undefined;
    });
};

/**
 * The indices of OrderedEventFlags that are string values.
 * Indicates the data should not be parsed to int.
 */
const EventFlagStringIndices = [4, 5, 22, 24];
// TODO: Make these match the values in the web state
// so that updating the state can be done without checking.
// The strings can be anything (including minified)
// but the order matters.
// Also strip some of these out, once the event flags
// that are sent from the cpp is defined.
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

const makeWebsocket = (opts = {}) => {
    let ws;
    let _enabled = false;
    let _reconnectAttempt = 0;
    const { onMessage: oM, onDisconnect: oD, onConnect: oC, onError: oE } = opts;
    const _hasOnError = !!oE;
    const _hasOnConnect = !!oC;
    const _hasOnMessage = !!oM;
    const _hasOnDisconnect = !!oD;
    const connect = () => {
        ws = new WebSocket(`ws://${"192.168.1.17" }/ws`);
        ws.onopen = (e) => {
            debug("[ws] onOpen(): ", e);
            _enabled = true;
            _reconnectAttempt = 0;
            if (_hasOnConnect)
                oC(e, _reconnectAttempt);
        };
        ws.onclose = (e) => {
            debug("[ws] onClose(): ", e);
            _enabled = false;
            if (_hasOnDisconnect)
                oD(e, _reconnectAttempt);
            setTimeout(connect, Math.min(5000 * ++_reconnectAttempt, 60000));
        };
        ws.onmessage = (e) => {
            debug("[ws] onMessage(): ", e, e.data);
            console.log("[ws] onMessage(): ", e, e.data);
            const unpacked = unpackMessages(e.data);
            console.log("[ws] onMessage() unpacked: ", unpacked);
            if (_hasOnMessage) {
                unpacked.forEach(oM);
            }
        };
        ws.onerror = (e) => {
            debug("[ws] onError(): ", e);
            _enabled = false;
            _hasOnError && oE(e, _reconnectAttempt);
        };
    };
    connect();
    /**
     * Order matters for events, this is the expected data.
     * If undefined, it becomes a 0 in the event flags mask.
     * @param data
     * @returns
     */
    const sortData = (ev, data) => {
        if (ev === 0 /* State */) {
            const d = data;
            return [d.pos, d.tPos, d.speed, d.accel];
        }
        if (ev === 2 /* Calibration */) {
            const d = data;
            return [d.moveBy, d.stop];
        }
        return [];
    };
    const push = (ev, data) => {
        debug("[ws] push(): ", ev, data);
        if (_enabled) {
            const s = packMessage(ev, data.mac, sortData(ev, data));
            debug("[ws] push() str: ", s);
            ws.send(s);
        }
    };
    function packMessage(ev, mac, data) {
        switch (ev) {
            case 0 /* State */: {
                const f = [];
                let s = "";
                for (const k in data) {
                    const d = data[k];
                    if (d != null) {
                        s += `${d}/`;
                        f.push(1);
                    }
                    else {
                        f.push(0);
                    }
                }
                debug("[packMessage] f: ", f);
                const flags = parseInt(f.reverse().join(""), 2);
                return `${mac}/${ev}/${flags}/${s}`;
            }
            default: {
                const e = "Unexpected event type";
                if (_hasOnError)
                    oE(e, 0);
                else
                    console.error(e);
            }
        }
    }
    function unpackMessages(data) {
        // TODO: convert string message to object
        debug("unpackMessages: ", data);
        if (data.endsWith("/"))
            data = data.substr(0, data.length - 1);
        const spl = data.split("/");
        const mac = spl.shift();
        parseInt(spl.shift());
        const mask = parseInt(spl.shift());
        // Check the message contents before unpacking.
        // It should have the same number of data segments
        // as bits flipped in the mask.
        const bits = mask.toString(2).split("1").length - 1;
        if (bits !== spl.length) {
            if (_hasOnError)
                oE("Event flags and data don't match", 0);
        }
        // for each event flag, add to corresponding event
        const stateEvData = {};
        const settingsEvData = {};
        // Right now this loop handles any incoming event.
        // In the future, may be better to drop the ordered flags list
        // and use the event type & a switch.
        let j = 1;
        for (let i = 0, len = OrderedEventFlags.length; i < len && spl.length > 0; i++) {
            if (j & mask) {
                const k = OrderedEventFlags[i];
                const v = spl.shift();
                if (i < 4) {
                    // All state updates are numbers
                    stateEvData[k] = parseInt(v);
                }
                else {
                    // Some settings are strings, most are numbers.
                    // Some are also bools, but will be parsed as
                    // ints and used as 0/1, just can't do strict
                    // equivalence checks.
                    settingsEvData[k] = i in EventFlagStringIndices ? v : parseInt(v);
                }
            }
            j = j << 1;
        }
        const evs = [];
        if (Object.keys(stateEvData).length > 0) {
            evs.push({
                type: 0 /* State */,
                mac,
                data: stateEvData,
            });
        }
        if (Object.keys(settingsEvData).length > 0) {
            evs.push({
                type: 1 /* Setting */,
                mac,
                data: settingsEvData,
            });
        }
        return evs;
    }
    return { ws, push };
};

const svg$2 = {
    data: "M280.37 148.26L96 300.11V464a16 16 0 0 0 16 16l112.06-.29a16 16 0 0 0 15.92-16V368a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v95.64a16 16 0 0 0 16 16.05L464 480a16 16 0 0 0 16-16V300L295.67 148.26a12.19 12.19 0 0 0-15.3 0zM571.6 251.47L488 182.56V44.05a12 12 0 0 0-12-12h-56a12 12 0 0 0-12 12v72.61L318.47 43a48 48 0 0 0-61 0L4.34 251.47a12 12 0 0 0-1.6 16.9l25.5 31A12 12 0 0 0 45.15 301l235.22-193.74a12.19 12.19 0 0 1 15.3 0L530.9 301a12 12 0 0 0 16.9-1.6l25.5-31a12 12 0 0 0-1.7-16.93z",
    box: "0 0 576 512",
    w: 22,
};

const svg$1 = {
    data: "M256,8C119,8,8,119,8,256S119,504,256,504,504,393,504,256,393,8,256,8Zm92.49,313h0l-20,25a16,16,0,0,1-22.49,2.5h0l-67-49.72a40,40,0,0,1-15-31.23V112a16,16,0,0,1,16-16h32a16,16,0,0,1,16,16V256l58,42.5A16,16,0,0,1,348.49,321Z",
    box: "0 0 512 512",
    w: 20,
};

const svg = {
    data: "M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z",
    box: "0 0 512 512",
    w: 20,
};

const makeSvg = (d) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", "currentColor");
    path.setAttribute("d", d.data);
    svg.setAttribute("viewBox", d.box);
    appendChild(svg, path);
    //   addClass(svg as any, "ic-w");
    svg.style.width = `${d.w}px`;
    return svg;
};
const home = makeSvg(svg$2);
const clock = makeSvg(svg$1);
const cog = makeSvg(svg);

var css_248z = "/* uncss:ignore */\n.ic-w {\n\twidth: 22px;\n}\n/* uncss:ignore */\n.ic {\n\theight: 16px;\n\twidth: 16px;\n}\n/* uncss:ignore */\n.ic-home {\n\tbackground: url(home.svg);\n}\n#bg {\n    background-image: url(bg-dev.jpg), linear-gradient(40deg, #1d0143 0, #293b7c, #300a52);\n}\n/* uncss:ignore */\n#bg > #_fr {\n    display: none;\n}\n.overlay {\n\tposition: fixed;\n\theight: 100%;\n\twidth: 100%;\n\ttop: 0;\n\tleft: 0;\n\tbackground-color: #333;\n\tfont-size: 24px;\n\tdisplay: flex;\n\talign-items: center;\n\tjustify-content: center;\n\tz-index: 11;\n\topacity: 0.95;\n\ttransition: 0.7s;\n\tpointer-events: none;\n}\nbutton {\n\twidth: 110px;\n\theight: 45px;\n\tfont-size: 11px;\n\ttext-transform: uppercase;\n\tletter-spacing: 2.5px;\n\tmargin: 20px auto;\n\tfont-weight: 500;\n\tcolor: black;\n\tbackground: #f0f8ffcc;\n\tborder: 1px solid #cadae833;\n\tborder-radius: 45px;\n\tbox-shadow: 0px 8px 15px rgb(0 0 0 / 10%);\n\ttransition: all 0.3s ease 0s;\n\tcursor: pointer;\n\toutline: none;\n\tposition: relative;\n}\nbutton.btn-t {\n\tborder: none;\n\tbackground: none;\n\tcolor: white;\n}\n/* uncss:ignore */\nbutton:active:not(:disabled, .btn-t) {\n\tbackground-color: #2a637a;\n\tbox-shadow: 0px 15px 20px #2a637a71;\n\tcolor: #fff;\n}\n/* uncss:ignore */\nbutton:active.btn-s {\n\tbackground-color: #2EE59D;\n\tbox-shadow: 0px 15px 20px #2ee59c71;\n}\n/* uncss:ignore */\nbutton:active.btn-c {\n\tbackground: #ff5656;\n\tbox-shadow: 0px 15px 20px #ff565666;\n}\n/* uncss:ignore */\n@media (hover: hover) and (pointer: fine) {\n\tbutton:hover:not(:disabled, .btn-t) {\n\t\ttransform: translateY(-7px);\n\t\tbackground-color: #2a637a;\n\t\tbox-shadow: 0px 15px 20px #2a637a71;\n\t\tcolor: #fff;\n\t}\n\t/* uncss:ignore */\n\tbutton:hover.btn-s {\n\t\tbackground-color: #2EE59D;\n\t\tbox-shadow: 0px 15px 20px #2ee59c71;\n\t}\n\tbutton:hover.btn-c {\n\t\tbackground: #ff5656;\n\t\tbox-shadow: 0px 15px 20px #ff565666;\n\t}\n}\n/* uncss:ignore */\nbutton:disabled {\n\topacity: 50%;\n}\n/* uncss:ignore */\nbutton>div.loader {\n\ttransform: translate3d(0, -17px, 0);\n\tfont-size: 7px;\n}\n#app {\n\tdisplay: flex;\n\tflex-direction: column;\n\tpadding: 23px 23px 0 23px;\n\theight: calc(100% - (50px + 23px));\n\toverflow-y: scroll;\n}\n/* uncss:ignore */\nul {\n\tdisplay: flex;\n\tlist-style-type: none;\n\t-webkit-margin-before: 0em;\n\t        margin-block-start: 0em;\n\t-webkit-margin-after: 0em;\n\t        margin-block-end: 0em;\n\t-webkit-padding-start: 0px;\n\t        padding-inline-start: 0px;\n}\n/* uncss:ignore */\nli {\n\tdisplay: list-item;\n\ttext-align: -webkit-match-parent;\n\tcolor: rgba(255, 255, 255, 0.44);\n}\n/* uncss:ignore */\nli.s {\n\tcolor: #DB8B1D;\n}";
stynj(css_248z);

// Bottom nav bar buttons
const labels = [
    { t: "Home", i: home },
    { t: "Routines", i: clock },
    { t: "Settings", i: cog },
];
const s = State;
const run = (ns) => {
    console.log("onLoad(): ", ns);
    // Hack to make favicon cacheable in Chrome
    // add href after document load, replacing empty data url
    getElement("favicon").href = "favicon.ico";
    const body = querySelector("body");
    const app = getElement("app");
    let currentIndex = -1;
    let currentTab;
    ns.state = State;
    // Toasts
    const tc = ToastContainer();
    ns.tc = tc;
    appendChild(body, tc.node);
    WINDOW.onerror = handleError;
    WINDOW.onpopstate = (e) => {
        handleRoute(pathname());
        emitQueryChange();
    };
    // Websocket
    const wsc = makeWebsocket({
        onMessage(msg) {
            debug("WS msg: ", msg);
            if (msg.type === 1 /* Setting */) {
                State.update(SETTINGS, {
                    ...State.get(SETTINGS),
                    ...msg.data,
                });
            }
            if (msg.type === 0 /* State */) {
                State.update(STATE, {
                    ...State.get(STATE),
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
            debug("WS connect: ", e);
            if (num) {
                tc.pushToast("Websocket connected!");
            }
        },
        onDisconnect(e) {
            debug("WS disconnect: ", e);
        },
    });
    // Nav
    const nav = Nav({ labels });
    appendChild(getElement("nav"), nav.node);
    nav.onClick(handleTabChange);
    const handleRoute = (path) => {
        let i = labels.map((l) => l.t.toLowerCase()).indexOf(path.substr(1));
        if (i < 0)
            i = 0;
        nav.setIndex(i);
    };
    handleRoute(pathname());
    function handleTabChange(nextIndex) {
        if (currentIndex === nextIndex)
            return;
        const newPath = nextIndex > 0 ? `/${labels[nextIndex].t.toLowerCase()}` : `/`;
        currentIndex = nextIndex;
        currentTab?.destroy?.();
        currentTab?.node.remove();
        // change app screen
        switch (nextIndex) {
            // Home
            case 0: {
                const t = Home();
                pushToHistory(newPath, undefined, true);
                t.onDeviceClick(handleDeviceClick);
                // if (!State.isLoaded(STATE)) {
                //   load(STATE);
                // load("settings?type=gen", [], ["settings.gen"]).then(() => {
                //   load(STATE);
                //   load(PRESETS);
                //   load(DEVICES);
                // });
                // }
                currentTab = t;
                break;
            }
            // Routines
            case 1: {
                pushToHistory(newPath, undefined, true);
                currentTab = null;
                break;
            }
            // Settings
            case 2: {
                const t = Settings();
                pushToHistory(newPath, undefined, false);
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
    const stripPasswords = (data) => {
        // remove wifi password
        if (data?.gen?.pass) {
            data.gen.pass = undefined;
        }
        // remove mqtt password
        if (data?.mqtt?.pass) {
            data.mqtt.pass = undefined;
        }
        return data;
    };
    function saveSettings() {
        debug("saveSettings: ", State._state);
        State.setSaving(SETTINGS, true);
        debug("State._state.settings: ", State._state.settings);
        debug("State._state.pendingState: ", State._state.pendingState);
        const body = diffDeep(State._state.settings, State._state.pendingState);
        debug("diffed: ", body);
        doFetch(SETTINGS, HTTP_PUT, { body })
            .then(() => {
            State.setSaving(SETTINGS, false);
            State.update(SETTINGS, stripPasswords(State._state.pendingState));
            tc.pushToast("Settings saved");
        })
            .catch((e) => {
            tc.pushToast("Failed to save settings");
            throw e;
        });
    }
    function cancelSettings() {
        debug("cancelSettings: ", State._state);
        State.update(PENDING_STATE, State._state.settings);
    }
    function handleDeviceClick(data) {
        // Show device card
        const card = Card(data);
        appendChild(body, card.node);
        card.onChange((e) => {
            wsc.push(0 /* State */, e);
        });
        setTimeout(card.show);
    }
    function load(key, updates, sets = []) {
        updates = updates || [key];
        return doFetch(key)
            .then((r) => {
            updates.forEach((k) => State.update(k, r));
            sets.forEach((k) => State.set(k, r));
            return r;
        })
            .catch(handleError);
    }
    function handleError(err) {
        const m = isObject(err)
            ? (err?.message || DEFAULT_ERROR) + "\n" + err.stack
            : err;
        tc.pushToast(m, true);
    }
};
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// goog.exportSymbol("run", run);

export { run, s };
//# sourceMappingURL=app.js.map
