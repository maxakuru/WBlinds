import { initNamespace } from "namespace";
import "./index.css";

const w = window;
const ns = initNamespace(w);
w.onload = () => {
  // #_fr shows a mock screen in css until app.js loads
  // NOTE: most places where ["squareBrackets"] are used instead
  // of dot notation is for closure compiler to not mangle the name
  import(`./src/app.js`).then((m) => {
    // inject server rendered data into state
    const k = "settings.gen";
    m["s"].set(k, { ...m["s"].get<Record<string, string>>(k), ...ns["inj"] });
    // then execute the module
    m["run"](ns);
  });
};

// disable zooms
const z = <T extends keyof WindowEventMap>(
  m: T,
  h: (e: WindowEventMap[T]) => void
) => {
  w.addEventListener(m, h, { passive: false });
};
z("wheel", (e) => {
  e.ctrlKey && e.preventDefault();
});
z("touchmove", (e) => {
  if (e.touches.length > 1) {
    e.preventDefault();
  }
});
