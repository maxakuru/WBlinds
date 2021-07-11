import { initNamespace } from "namespace";
import "./index.css";

const ns = initNamespace(window);
window.onload = () => {
  // #_fr shows a mock screen in css until app.js loads
  // TODO: adjust this path to include version in rollup plugin chunk tranformer
  import(`./src/app.js`).then((m) => {
    // inject server rendered data into state
    const k = "settings.gen";
    m["s"].set(k, { ...m["s"].get<Record<string, string>>(k), ...ns["inj"] });
    // then execute the module
    m["run"](ns);
  });
};
