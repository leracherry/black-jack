import * as PIXI from "pixi.js";
import { Sprite } from "pixi.js";

export class Deck extends PIXI.Container {
  private hitButton: PIXI.Sprite = Sprite.from("assets/button.png");
  private standButton: PIXI.Sprite = Sprite.from("assets/button.png");
  private dealerSum: number = 0;
  private yourSum: number = 0;
  private dealerAceCount: number = 0;
  private yourAceCount = 0;
  private hidden: any;
  public widthDealerDeck: number = 320;
  public widthHitDeck: number = 440;
  private canHit: boolean = true; //allows the player (you) to draw while yourSum <= 21
  public values: string[] = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
  ];
  public types: string[] = ["C", "D", "H", "S"];
  public deck: string[] = [];

  constructor() {
    super();
    this.buildDeck();
    this.shuffleDeck();
    this.startGame();
  }

  public buildDeck() {
    for (let i = 0; i < this.types.length; i++) {
      for (let j = 0; j < this.values.length; j++) {
        this.deck.push(this.values[j] + "-" + this.types[i]); //A-C -> K-C, A-D -> K-D
      }
    }
  }

  public shuffleDeck() {
    for (let i = 0; i < this.deck.length; i++) {
      let j = Math.floor(Math.random() * this.deck.length); // (0-1) * 52 => (0-51.9999)
      let temp = this.deck[i];
      this.deck[i] = this.deck[j];
      this.deck[j] = temp;
    }
  }

  public startGame() {
    this.hidden = this.deck.pop();
    this.dealerSum += this.getValue(this.hidden);
    this.dealerAceCount += this.checkAce(this.hidden);

    while (this.dealerSum < 17) {
      let cardBack: PIXI.Sprite = Sprite.from("assets/cards/BACK.png");
      cardBack.anchor.set(0.5);
      cardBack.scale.set(0.22);
      this.addChild(cardBack);
      cardBack.x = 200;
      cardBack.y = 150;

      let card = this.deck.pop();
      let cardImg: PIXI.Sprite = Sprite.from(`assets/cards/${card}.png`);
      cardImg.anchor.set(0.5);
      cardImg.scale.set(0.22);
      this.addChild(cardImg);
      cardImg.x = this.widthDealerDeck;
      this.widthDealerDeck += 120;
      cardImg.y = 150;

      this.dealerSum += this.getValue(card);
      this.dealerAceCount += this.checkAce(card);
    }
    for (let i = 0; i < 2; i++) {
      const width = 200 + i * 120;
      let card = this.deck.pop();
      let cardImg: PIXI.Sprite = Sprite.from(`assets/cards/${card}.png`);
      cardImg.anchor.set(0.5);
      cardImg.scale.set(0.22);
      this.addChild(cardImg);
      cardImg.x = width;
      cardImg.y = 400;
      this.yourSum += this.getValue(card);
      this.yourAceCount += this.checkAce(card);
    }
  }

  public getValue(card: any) {
    let data = card.split("-"); // "4-C" -> ["4", "C"]
    let value = data[0];

    if (isNaN(value)) {
      //A J Q K
      if (value == "A") {
        return 11;
      }
      return 10;
    }
    return parseInt(value);
  }

  private checkAce(card: any) {
    if (card[0] == "A") {
      return 1;
    }
    return 0;
  }

  public hit() {
    if (!this.canHit) {
      return;
    }

    let card = this.deck.pop();
    let cardImg: PIXI.Sprite = Sprite.from(`assets/cards/${card}.png`);
    cardImg.anchor.set(0.5);
    cardImg.scale.set(0.22);
    this.addChild(cardImg);
    cardImg.x = this.widthHitDeck;
    this.widthHitDeck += 120;
    cardImg.y = 400;

    this.yourSum += this.getValue(card);
    this.yourAceCount += this.checkAce(card);
    this.addChild(cardImg);

    if (this.reduceAce(this.yourSum, this.yourAceCount) > 21) {
      //A, J, 8 -> 1 + 10 + 8
      this.canHit = false;
    }
  }

  public stand() {
    this.dealerSum = this.reduceAce(this.dealerSum, this.dealerAceCount);
    this.yourSum = this.reduceAce(this.yourSum, this.yourAceCount);

    this.canHit = false;
    let hiddenImg: PIXI.Sprite = Sprite.from(`assets/cards/${this.hidden}.png`);
    hiddenImg.anchor.set(0.5);
    hiddenImg.scale.set(0.22);
    this.addChild(hiddenImg);
    hiddenImg.x = 200;

    hiddenImg.y = 150;

    let message = "";
    if (this.yourSum > 21) {
      message = "You Lose!";
    } else if (this.dealerSum > 21) {
      message = "You win!";
    }
    //both you and dealer <= 21
    else if (this.yourSum == this.dealerSum) {
      message = "Tie!";
    } else if (this.yourSum > this.dealerSum) {
      message = "You Win!";
    } else if (this.yourSum < this.dealerSum) {
      message = "You Lose!";
    }

    //  dealerSum;
    // yourSum;
    //  message;
  }

  public reduceAce(playerSum: number, playerAceCount: number) {
    while (playerSum > 21 && playerAceCount > 0) {
      playerSum -= 10;
      playerAceCount -= 1;
    }
    return playerSum;
  }
}
