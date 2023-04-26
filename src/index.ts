import * as PIXI from "pixi.js";
import { Desk } from "./desk";

export class Game {
  private app: PIXI.Application;
  public desk: Desk = new Desk();

  constructor() {
    this.app = new PIXI.Application({
      width: 900,
      height: 600,
      backgroundColor: "#48b362",
      view: document.getElementById("game-canvas") as HTMLCanvasElement,
    });
    this.app.stage.addChild(this.desk);
  }
}

new Game();
