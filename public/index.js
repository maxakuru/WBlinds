function _Component(c) {
    return (...args) => {
        const ctx = {};
        const toRender = c.call(ctx, ...args);
        const elem = new DOMParser().parseFromString(toRender, "text/html");
        console.log("ctx: ", ctx);
        const node = elem.getElementsByTagName("body").item(0).firstChild;
        const api = ctx.init.call(ctx, node);
        api.node = node;
        return api;
    };
}

var template$4 = "<ul class=\"fw navc\"><li class=\"sel\">Home</li><li>Routines</li><li>Settings</li></ul>";

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

var css_248z$4 = "#nav {\n\tbackground: #00000080;\n\theight: 63px;\n\tdisplay: flex;\n}\n\n.navc {\n\tjustify-content: space-evenly;\n\talign-self: center;\n}\n\n.navc .sel {\n\tcolor: #DB8B1D;\n}";
styleInject(css_248z$4);

const _Nav = function () {
    let _i = 0;
    let _clickHandlers = [];
    this.init = function (elem) {
        console.log("elem: ", elem);
        const buttons = elem.querySelectorAll("li");
        console.log("buttons: ", buttons);
        buttons.forEach((b, index) => {
            b.addEventListener("click", () => {
                _i = index;
                buttons.forEach((b2, i2) => {
                    if (i2 === _i) {
                        b2.classList.add("sel");
                    }
                    else {
                        b2.classList.remove("sel");
                    }
                });
                _clickHandlers.map((c) => c.call(undefined, index));
            });
        });
        return {
            onClick: (h) => {
                _clickHandlers.push(h);
            },
            currentIndex: () => _i,
            destroy: () => {
                _clickHandlers = [];
            },
        };
    };
    return template$4;
};
const Nav = _Component(_Nav);

var template$3 = "<div id=\"card\" class=\"an\"></div>";

var css_248z$3 = "#card {\n\theight: 100%;\n    position: fixed;\n    width: 100%;\n    top: 100%;\n\tbackground: #53535378;\n}\n\n#card.an {\n    transition: 0.2s top ease-in-out;\n}";
styleInject(css_248z$3);

var template$2 = "<div class=\"sc\"><div class=\"fR fSB\"><h4>Title</h4><h4>Value</h4></div><input class=\"slider\" type=\"range\" min=\"0\" max=\"100\"></div>";

var css_248z$2 = ".sc {\n\tpadding: 20px;\n}\n\n.slider {\n\tbackground: linear-gradient(to right, #DB8B1D 0%, #DB8B1D 50%, #606060 50%, #606060 100%);\n\tborder-radius: 8px;\n\theight: 7px;\n\twidth: 75%;\n\toutline: none;\n\t-webkit-appearance: none;\n}\n\n.slider {\n\tborder-radius: 15px;\n\theight: 6px;\n\t-webkit-appearance: none;\n\t-moz-appearance: none;\n\tappearance: none;\n\twidth: 100%;\n\toutline: none;\n}\n\n.slider::-webkit-slider-thumb {\n\t-webkit-appearance: none;\n\tappearance: none;\n\twidth: 16px;\n\theight: 16px;\n\tbackground: white;\n\tbox-shadow: black;\n\tborder-radius: 50%;\n\tcursor: pointer;\n}";
styleInject(css_248z$2);

function debug(...msgs) {
    console.debug(...msgs);
}
const getElement = document.getElementById.bind(document);
const stopPropagation = (e) => e.stopPropagation();

const _Slider = function ({ label, value, id, }) {
    this.init = function (elem) {
        elem.id = id;
        elem.querySelector("h4").innerText = label;
        const slider = elem.querySelector("input");
        slider.onmousedown = stopPropagation;
        slider.ontouchstart = stopPropagation;
        slider.oninput = function () {
            const value = ((parseInt(slider.value) - parseInt(slider.min)) /
                (parseInt(slider.max) - parseInt(slider.min))) *
                100;
            slider.style.background =
                "linear-gradient(to right, #DB8B1D 0%, #DB8B1D " +
                    value +
                    "%, #606060 " +
                    value +
                    "%, #606060 100%)";
        };
        console.log("slider: ", slider, value);
        slider.value = value;
        return {
            destroy: () => {
            },
        };
    };
    return template$2;
};
const Slider = _Component(_Slider);

const _Card = function ({ temp }) {
    let draggingCard = false;
    let yOffset = 0;
    let yStart = 0;
    let animated = false;
    let lastCoords = {};
    this.init = function (elem) {
        toggleAnimations(true);
        const slider = Slider({ id: "position", label: "Position", value: "50" });
        elem.appendChild(slider.node);
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
            newState ? elem.classList.add("an") : elem.classList.remove("an");
            animated = newState;
        }
        function destroy(ev) {
            console.log("on transition end: ", ev);
            elem.remove();
        }
        elem.onmousedown = elem.ontouchstart = (e) => onPress(firstTouchXY(e));
        elem.onmouseup = elem.onmouseout = elem.ontouchend = onRelease;
        elem.onmousemove = elem.ontouchmove = (e) => onMove(firstTouchXY(e));
        function firstTouchXY(e) {
            console.log("move event: ", e);
            let { x, y } = e;
            if (x == null) {
                x = e.touches[0].clientX;
                y = e.touches[0].clientY;
            }
            return {
                x,
                y,
            };
        }
        return {
            destroy,
            show: () => {
                elem.style.top = "0px";
            },
        };
    };
    return template$3;
};
const Card = _Component(_Card);

var template$1 = "<div class=\"tile sq\"><span></span><p>Bedroom Left</p></div>";

var css_248z$1 = "\n.dt {\n\t/* margin: 0 10px 0 -10px; */\n\tjustify-content: space-between;\n}\n\n.tile {\n\tbackground: #0000004D;\n\tborder-radius: 12px;\n\tdisplay: flex;\n\t/* justify-content: space-around; */\n}\n\n.tile.sq {\n\twidth: 110px;\n\theight: 110px;\n\tmargin: 20px;\n\tmargin: 5px 0px 5px 0px;\n\tposition: relative;\n}\n\n.tile.sq >span {\n\twidth: 109px;\n\tmax-height: 90px;\n\ttop: 10px;\n\tposition: absolute;\n\tright: 0px;\n\tborder-right: 1px dashed white;\n\tborder-right-style: groove;\n}\n\n.pt>.sq {\n\theight: 50px;\n\twidth: auto;\n\tmin-width: 150px;\n}\n\n.pt>.sq>span {\n\tdisplay: none;\n}\n\n.tile.sq p {\n\tfont-size: 11px;\n\tmargin: auto 21px 10px 9px;\n\tfont-weight: 500;\n}";
styleInject(css_248z$1);

const _Tile = function ({ name, id, }) {
    let _clickHandlers = [];
    this.init = function (elem) {
        elem.id = id;
        elem.onclick = (e) => {
            _clickHandlers.forEach((h) => h({ id, name }));
        };
        elem.querySelector("p").innerText = name;
        return {
            onClick: (h) => {
                _clickHandlers.push(h);
            },
            destroy: () => {
                _clickHandlers = [];
            },
        };
    };
    return template$1;
};
const Tile = _Component(_Tile);

var template = "<div class=\"f flex\" id=\"h\"><div class=\"loader\" id=\"hl\"></div><div id=\"hlc\" class=\"hide\" style=\"text-align: left;\"><h1 id=\"ht\">WBlinds</h1><h4 class=\"hst\">Presets</h4><div id=\"preset-tiles\" class=\"pt fw flex wrap\"></div><h4 class=\"hst\">Devices</h4><div id=\"device-tiles\" class=\"dt fw flex wrap\"></div></div></div>";

class _State {
    constructor() {
        this._observers = {};
        this._state = {};
    }
    update(key, value) {
        var _a;
        var _b;
        (_a = (_b = this._observers)[key]) !== null && _a !== void 0 ? _a : (_b[key] = []);
        const prev = this._state[key];
        this._state[key] = value;
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
        if (this._state[key]) {
            handler({
                value: { ...this._state[key] },
                prev: undefined,
            });
        }
    }
}
const State = new _State();

const DEVICE_TILE = "device";
const PRESET_TILE = "preset";
const _Home = function () {
    let _loading = true;
    let _tiles = [];
    let _deviceClickHandlers = [];
    this.init = function (elem) {
        function loaded() {
            if (!_loading)
                return;
            const spinner = getElement("hl");
            spinner.style.display = "none";
            const content = getElement("hlc");
            content.classList.remove("hide");
            _loading = false;
        }
        function getAllTiles(type) {
            const container = getElement(`${type}-tiles`);
            return { container, tiles: container.querySelectorAll("div") };
        }
        function padTiles(type) {
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
        function updateTiles(type, o) {
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
                container.appendChild(t.node);
            }
            padTiles(type);
        }
        function handleTileClick(type, data) {
            if (type === "device") {
                _deviceClickHandlers.forEach((h) => h(data));
            }
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
    return template;
};
const Home = _Component(_Home);

let _mock = {
    init: () => { },
    restore: () => { },
};
console.log("use mocks: ", "true", typeof "true");
{
    const ogFetch = window.fetch;
    const presetResp = {
        "Going to bed": {
            state: {
                "mac-address": {
                    position: 50,
                    speed: 50,
                    accel: 50,
                },
                "mac-address-2": {
                    position: 50,
                    speed: 50,
                    accel: 50,
                },
            },
            routines: [],
        },
    };
    const devicesResp = {
        "mac-address": {
            name: "Bedroom Left",
            position: 50,
            speed: 50,
            accel: 50,
        },
        "mac-address-2": {
            name: "Bedroom Right",
            position: 50,
            speed: 50,
            accel: 50,
        },
        "mac-address-3": {
            name: "Bay Window Left",
            position: 50,
            speed: 50,
            accel: 50,
        },
        "mac-address-4": {
            name: "Bay Window Middle",
            position: 50,
            speed: 50,
            accel: 50,
        },
        "mac-address-5": {
            name: "Bay Window Right",
            position: 50,
            speed: 50,
            accel: 50,
        },
    };
    _mock = {
        init: () => {
            window.fetch = async (url, opts) => {
                return {
                    json: () => {
                        return url === "/devices" ? devicesResp : presetResp;
                    },
                    ok: true,
                };
            };
        },
        restore: () => {
            window.fetch = ogFetch;
        },
    };
}
const mock = _mock;

var HTTPMethod;
(function (HTTPMethod) {
    HTTPMethod["GET"] = "GET";
    HTTPMethod["POST"] = "POST";
})(HTTPMethod || (HTTPMethod = {}));
function fetchJson(url, method) {
    console.log("this: ", this);
    return fetch(url, {
        method,
    }).then((res) => {
        if (!res.ok) {
            throw res;
        }
        return res.json();
    });
}

function run (ns) {
    debug("onLoad(): ", ns);
    mock.init();
    const body = document.querySelector("body");
    const app = getElement("app");
    window.wblinds.State = State;
    fetchJson("/presets").then((res) => {
        console.log("presets res: ", res);
        State.update("presets", res);
    });
    fetchJson("/devices").then((res) => {
        console.log("devices res: ", res);
        State.update("devices", res);
    });
    let currentIndex = -1;
    let currentTab;
    function handleTabChange(nextIndex) {
        var _a;
        console.log("on click! ", nextIndex);
        if (currentIndex === nextIndex)
            return;
        currentIndex = nextIndex;
        (_a = currentTab === null || currentTab === void 0 ? void 0 : currentTab.destroy) === null || _a === void 0 ? void 0 : _a.call(currentTab);
        currentTab === null || currentTab === void 0 ? void 0 : currentTab.node.remove();
        switch (nextIndex) {
            case 0: {
                const t = Home();
                t.onDeviceClick(handleDeviceClick);
                currentTab = t;
                console.log("node: ", currentTab.node);
                break;
            }
        }
        app.appendChild(currentTab.node);
    }
    handleTabChange(0);
    function handleDeviceClick(device) {
        console.log("device clicked: ", device);
        const card = Card({});
        body.appendChild(card.node);
        setTimeout(card.show);
    }
    const nav = Nav();
    console.log("node: ", nav.node);
    getElement("nav").appendChild(nav.node);
    console.log("nav: ", nav.currentIndex());
    nav.onClick(handleTabChange);
}

var css_248z = ":root {\n\t--blue: #06c;\n\t--green: #32D74B;\n\t--input: #DB8B1D;\n}\n\nhtml {\n\ttouch-action: manipulation;\n}\n\nbody {\n\tmargin: 0;\n\tbackground-color: #111;\n\tfont-family: -apple-system, BlinkMacSystemFont, helvetica, sans-serif;;\n\tfont-size: 17px;\n\tfont-weight: 400;\n\tcolor: #fff;\n\ttext-align: center;\n\t-webkit-touch-callout: none;\n\t-webkit-user-select: none;\n\t-moz-user-select: none;\n\t-ms-user-select: none;\n\tuser-select: none;\n\t-webkit-tap-highlight-color: transparent;\n\tscrollbar-width: 6px;\n\tscrollbar-color: var(--c-sb) transparent;\n}\n\nhtml, body {\n\theight: 100%;\n\twidth: 100%;\n\tposition: fixed;\n\t-ms-scroll-chaining: none;\n\t    overscroll-behavior: none;\n}\n\nh1, h4 {\n\tfont-weight: 400;\n}\n\nh1 {\n\tfont-size: 32px;\n}\n\nh4 {\n\t-webkit-margin-after: 0.3em;\n\t        margin-block-end: 0.3em;\n\tfont-size: 14px;\n\tpadding-left: 5px;\n}\n\n.hide {\n\tdisplay: none;\n}\n\n.loader, .loader:before, .loader:after {\n\tborder-radius: 50%;\n\twidth: 2.5em;\n\theight: 2.5em;\n\t-webkit-animation-fill-mode: both;\n\tanimation-fill-mode: both;\n\t-webkit-animation: load7 1.8s infinite ease-in-out;\n\tanimation: load7 1.8s infinite ease-in-out;\n}\n\n.loader {\n\tmargin: auto;\n\tcolor: #ffffff;\n\tfont-size: 10px;\n\ttext-indent: -9999em;\n\ttransform: translate3d(0, -100px, 0);\n\t-webkit-animation-delay: -0.16s;\n\tanimation-delay: -0.16s;\n\talign-self: center;\n}\n\n.loader:before, .loader:after {\n\tcontent: '';\n\tposition: absolute;\n\ttop: 0;\n}\n\n.loader:before {\n\tleft: -3.5em;\n\t-webkit-animation-delay: -0.32s;\n\tanimation-delay: -0.32s;\n}\n\n.loader:after {\n\tleft: 3.5em;\n}\n\n@-webkit-keyframes load7 {\n\t0%, 80%, 100% {\n\t\tbox-shadow: 0 2.5em 0 -1.3em;\n\t}\n\t40% {\n\t\tbox-shadow: 0 2.5em 0 0;\n\t}\n}\n\n@keyframes load7 {\n\t0%, 80%, 100% {\n\t\tbox-shadow: 0 2.5em 0 -1.3em;\n\t}\n\t40% {\n\t\tbox-shadow: 0 2.5em 0 0;\n\t}\n}\n\n.em {\n\topacity: 0;\n}\n\nul {\n\tdisplay: flex;\n\tlist-style-type: none;\n\t-webkit-margin-before: 0em;\n\t        margin-block-start: 0em;\n\t-webkit-margin-after: 0em;\n\t        margin-block-end: 0em;\n\t-webkit-padding-start: 0px;\n\t        padding-inline-start: 0px;\n}\n\nli {\n\tdisplay: list-item;\n\ttext-align: -webkit-match-parent;\n\tcolor: #FFFFFF66;\n}\n\nli.s {\n\tcolor: #DB8B1D;\n}\n\n.f {\n\twidth: 100%;\n\theight: 100%;\n}\n\n.flex {\n\tdisplay: flex;\n}\n\n.fC {\n\tdisplay: flex;\n\tflex-direction: column;\n}\n\n.fR {\n\tdisplay: flex;\n\tflex-direction: row;\n}\n\n.fSB {\n\tjustify-content: space-between;\n}\n\n.wrap {\n\tflex-wrap: wrap;\n}\n\n.fh {\n\theight: 100%;\n}\n\n.fw {\n\twidth: 100%;\n}\n\n#bg {\n\theight: 100vh;\n\twidth: 100vw;\n\tposition: fixed;\n\tz-index: -10;\n\tbackground-position: 30%;\n\t/* background-position: center; */\n\tbackground-repeat: no-repeat;\n\tbackground-size: cover;\n\topacity: 1;\n\ttransition: opacity 2s;\n\tbackground-image: url(\"bg.jpeg\");\n}\n\n#app {\n\tdisplay: flex;\n\tflex-direction: column;\n\tpadding: 23px 23px 0 23px;\n\theight: calc(100% - (63px + 23px));\n\toverflow-y: scroll;\n}\n\n.overlay {\n\tposition: fixed;\n\theight: 100%;\n\twidth: 100%;\n\ttop: 0;\n\tleft: 0;\n\tbackground-color: #333;\n\tfont-size: 24px;\n\tdisplay: flex;\n\talign-items: center;\n\tjustify-content: center;\n\tz-index: 11;\n\topacity: 0.95;\n\ttransition: 0.7s;\n\tpointer-events: none;\n}";
styleInject(css_248z);

const ns = {
    test: true,
};
window.wblinds = ns;
window.onload = () => run(ns);
