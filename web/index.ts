import { initNamespace } from "namespace";
import "./index.css";

const ns = initNamespace(window);
window.onload = () => {
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
