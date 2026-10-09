import * as PIXI from "pixi.js";
import { Sprite } from "pixi.js";
import { Table } from "./table";

export class Game {
  private app = new PIXI.Application();
  private table!: Table;
  private filtersContainer!: PIXI.Container;
  private dimmingLayer!: PIXI.Graphics;
  private startButton!: PIXI.Sprite;

  async initialize() {
    await PIXI.Assets.load(["assets/start.png", "assets/button.png", "assets/bet_button.png", "assets/text_space.png", ...["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"].flatMap(rank => ["C", "D", "H", "S"].map(suit => `assets/cards/${rank}-${suit}.png`)), "assets/cards/BACK.png"]);
    this.table = new Table();
    this.startButton = Sprite.from("assets/start.png");
    await this.app.init({
      width: 900,
      height: 600,
      backgroundColor: "#48b362",
      canvas: document.getElementById("game-canvas") as HTMLCanvasElement,
    });

    this.filtersContainer = new PIXI.Container();
    this.app.stage.addChild(this.filtersContainer);

    this.filtersContainer.addChild(this.table);
    this.dimmingLayer = new PIXI.Graphics();
    this.dimmingLayer.rect(0, 0, 900, 600).fill({ color: 0x000000, alpha: 0.5 });
    this.dimmingLayer.visible = false;
    this.app.stage.addChild(this.dimmingLayer);
    this.initializeStartButton();
  }

  private applyFilters(isDarkened: boolean) {
    if (isDarkened) {
      const blurFilter = new PIXI.BlurFilter();
      blurFilter.blur = 5;
      const colorMatrixFilter = new PIXI.ColorMatrixFilter();
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

  private initializeStartButton() {
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
await game.initialize();
game.start();
