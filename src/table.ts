import * as PIXI from "pixi.js";
import { Sprite } from "pixi.js";
import { Deck } from "./deck";

export class Table extends PIXI.Container {
  private hitButton: PIXI.Sprite = Sprite.from("assets/button.png");
  private standButton: PIXI.Sprite = Sprite.from("assets/button.png");
  private betButtonRight: PIXI.Sprite = Sprite.from("assets/bet_button.png");
  private betButtonLeft: PIXI.Sprite = Sprite.from("assets/bet_button.png");
  private bets: number[] = [1, 2, 5, 10, 20];
  public deck: Deck = new Deck();
  public currentBetIndex: number = 0;

  public textBetValue = new PIXI.Text(
    this.bets[this.currentBetIndex],
    this.deck.textStyle
  );

  constructor() {
    super();
    this.addHitButton();
    this.addStandButton();
    this.addChild(this.deck);
    this.addBetButtons();
  }

  private addHitButton() {
    this.hitButton.anchor.set(0.5);
    this.hitButton.scale.set(0.8);
    this.hitButton.interactive = true;
    this.hitButton.cursor = "pointer";
    this.addChild(this.hitButton);
    this.hitButton.x = 350;
    this.hitButton.y = 550;

    const textHitBtn = new PIXI.Text("HIT", this.deck.textStyle);
    textHitBtn.anchor.set(0.5);
    this.hitButton.addChild(textHitBtn);

    this.hitButton.on("pointerdown", (evt: MouseEvent) => {
      this.deck.hit(this.bets[this.currentBetIndex]);
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

    const textStandBtn = new PIXI.Text("STAND", this.deck.textStyle);
    textStandBtn.anchor.set(0.5);
    this.standButton.addChild(textStandBtn);

    this.standButton.on("pointerdown", (evt: MouseEvent) => {
      this.deck.stand(this.bets[this.currentBetIndex]);
    });
  }

  private addBetButtons() {
    this.betButtonRight.anchor.set(0.5);
    this.betButtonRight.scale.set(0.07);
    this.betButtonRight.interactive = true;
    this.betButtonRight.cursor = "pointer";
    this.addChild(this.betButtonRight);
    this.betButtonRight.x = 150;
    this.betButtonRight.y = 550;

    this.betButtonRight.on("pointerdown", (evt: MouseEvent) => {
      this.displayNextBet();
    });

    this.addChild(this.textBetValue);
    this.textBetValue.x = 90;
    this.textBetValue.y = 535;

    this.betButtonLeft.rotation = 180 * PIXI.DEG_TO_RAD;
    this.betButtonLeft.anchor.set(0.5);
    this.betButtonLeft.scale.set(0.07);
    this.betButtonLeft.interactive = true;
    this.betButtonLeft.cursor = "pointer";
    this.addChild(this.betButtonLeft);
    this.betButtonLeft.x = 50;
    this.betButtonLeft.y = 550;

    this.betButtonLeft.on("pointerdown", (evt: MouseEvent) => {
      this.displayPreviousBet();
    });
  }

  private displayNextBet(): void {
    this.currentBetIndex++;
    if (this.currentBetIndex >= this.bets.length) {
      this.currentBetIndex = 0;
    }
    const nextBet: number = this.bets[this.currentBetIndex];
    this.textBetValue.text = nextBet;
  }

  private displayPreviousBet(): void {
    this.currentBetIndex--;
    if (this.currentBetIndex < 0) {
      this.currentBetIndex = this.bets.length - 1;
    }
    const previousBet: number = this.bets[this.currentBetIndex];
    this.textBetValue.text = previousBet;
  }
}
