import { _Component, Component } from "./Component";
import html from "./Tile.html";

type ClickHandler = (index: number) => unknown;
interface TileAPI {
  onClick: (handler: ClickHandler) => void;
}

interface TileProps {
  name: string;
  id: string;
}

const Tile: Component<TileAPI, TileProps> = function ({ name, id }: TileProps) {
  const clickHandlers: ClickHandler[] = [];

  this.init = function (elem: HTMLElement) {
    elem.id = id;
    elem.querySelector("p").innerText = name;
    return {
      onClick: (h) => {
        clickHandlers.push(h);
      },
    };
  };
  return html;
};

export default _Component(Tile);
