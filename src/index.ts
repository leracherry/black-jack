import * as PIXI from "pixi.js";
import { Sprite } from "pixi.js";
import { Table } from "./table";

export class Game {
  private app: PIXI.Application;
  public table: Table = new Table();
  private filtersContainer: PIXI.Container;
  private dimmingLayer: PIXI.Graphics;
  private startButton: PIXI.Sprite = Sprite.from("assets/start.png");

  constructor() {
    this.app = new PIXI.Application({
      width: 900,
      height: 600,
      backgroundColor: "#48b362",
      view: document.getElementById("game-canvas") as HTMLCanvasElement,
    });

    this.filtersContainer = new PIXI.Container();
    this.app.stage.addChild(this.filtersContainer);

    this.filtersContainer.addChild(this.table);
    this.dimmingLayer = new PIXI.Graphics();
    this.dimmingLayer.beginFill(0x000000, 0.5);
    this.dimmingLayer.drawRect(
      0,
      0,
      this.app.renderer.width,
      this.app.renderer.height
    );
    this.dimmingLayer.endFill();
    this.dimmingLayer.visible = false;
    this.app.stage.addChild(this.dimmingLayer);
    this.initializeStartButton();
  }

  private applyFilters(isDarkened: boolean) {
    if (isDarkened) {
      const blurFilter = new PIXI.filters.BlurFilter();
      blurFilter.blur = 5;
      const colorMatrixFilter = new PIXI.filters.ColorMatrixFilter();
      colorMatrixFilter.alpha = 0.5;
      colorMatrixFilter.brightness(-0.2, false);
      this.filtersContainer.filters = [blurFilter, colorMatrixFilter];
      this.dimmingLayer.visible = true;
    } else {
      this.filtersContainer.filters = [];
      this.dimmingLayer.visible = false;
    }
  }

  public start() {
    this.applyFilters(true);
  }

  public initializeStartButton() {
    this.startButton.anchor.set(0.5);
    this.startButton.scale.set(0.5);
    this.startButton.interactive = true;
    this.startButton.cursor = "pointer";
    this.app.stage.addChild(this.startButton);
    this.startButton.x = 420;
    this.startButton.y = 300;

    this.startButton.on("pointerdown", (evt: MouseEvent) => {
      game.applyFilters(false);
      this.startButton.destroy();
    });
  }
}

const game = new Game();
game.start();
