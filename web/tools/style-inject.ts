window["sty"] = function inject(css: string, ref: any = {}): void {
  if (!css || typeof document === "undefined") {
    return;
  }

  const head = document.head || document.getElementsByTagName("head")[0];
  const style = document.createElement("style");
  // style.type = "text/css";

  head.appendChild(style);
  style.appendChild(document.createTextNode(css));
};
