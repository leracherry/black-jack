import * as PIXI from "pixi.js";
import { Sprite } from "pixi.js";
import { Deck } from "./deck";

export class Desk extends PIXI.Container {
  private hitButton: PIXI.Sprite = Sprite.from("assets/button.png");
  private standButton: PIXI.Sprite = Sprite.from("assets/button.png");
  private bets: number[] = [1, 2, 5, 10, 20];
  public deck: Deck = new Deck();

  private textStyle: PIXI.TextStyle = new PIXI.TextStyle({
    fontSize: 27,
    fill: "#403624",
    lineJoin: "round",
  });

  constructor() {
    super();
    this.addHitButton();
    this.addStandButton();
    this.displayUserBalance(1000);
    this.addText();
    this.addChild(this.deck);
  }

  private addHitButton() {
    this.hitButton.anchor.set(0.5);
    this.hitButton.scale.set(0.8);
    this.hitButton.interactive = true;
    this.hitButton.cursor = "pointer";
    this.addChild(this.hitButton);
    this.hitButton.x = 350;
    this.hitButton.y = 550;

    const textHitBtn = new PIXI.Text("HIT", this.textStyle);
    textHitBtn.anchor.set(0.5);
    this.hitButton.addChild(textHitBtn);

    this.hitButton.on("pointerdown", (evt: MouseEvent) => {
      this.deck.hit();
    });
  }

  private addStandButton() {
    this.standButton.anchor.set(0.5);
    this.standButton.scale.set(0.85);
    this.standButton.interactive = true;
    this.standButton.cursor = "pointer";
    this.addChild(this.standButton);
    this.standButton.x = 500;
    this.standButton.y = 550;

    const textStandBtn = new PIXI.Text("STAND", this.textStyle);
    textStandBtn.anchor.set(0.5);
    this.standButton.addChild(textStandBtn);

    this.standButton.on("pointerdown", (evt: MouseEvent) => {
      this.deck.stand();
    });
  }

  private addText() {
    const youText = new PIXI.Text("You: ", this.textStyle);
    youText.anchor.set(0.5);
    this.addChild(youText);
    youText.x = 430;
    youText.y = 280;

    const dealerText = new PIXI.Text("Dealer: ", this.textStyle);
    dealerText.anchor.set(0.5);
    this.addChild(dealerText);
    dealerText.x = 430;
    dealerText.y = 30;
  }

  public displayUserBalance(balance: number = 1000) {
    const textBalance = new PIXI.Text(`Balance : ${balance}`, this.textStyle);
    textBalance.anchor.set(0.5);
    this.addChild(textBalance);
    textBalance.x = 780;
    textBalance.y = 570;
  }
}
