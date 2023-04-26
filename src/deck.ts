import * as PIXI from "pixi.js";
import { Sprite } from "pixi.js";

export class Deck extends PIXI.Container {
  public dealerSum: number = 0;
  public yourSum: number = 0;

  private dealerAceCount: number = 0;
  private yourAceCount = 0;
  private hidden: any;
  public widthDealerDeck: number = 320;
  public message: string = "";
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

  private textStyle: PIXI.TextStyle = new PIXI.TextStyle({
    fontSize: 27,
    fill: "#403624",
    lineJoin: "round",
  });

  public dealerSumText: PIXI.Text = new PIXI.Text("Dealer: ", this.textStyle);
  public yourSumText: PIXI.Text = new PIXI.Text("You: ", this.textStyle);
  public textBalance = new PIXI.Text("Balance: 1000", this.textStyle);
  public userBalance: number = 1000;

  constructor() {
    super();
    this.buildDeck();
    this.shuffleDeck();
    this.startGame();
    this.initializeText();
    this.displayUserBalance(this.userBalance);
  }

  public buildDeck() {
    for (let i: number = 0; i < this.types.length; i++) {
      for (let j = 0; j < this.values.length; j++) {
        this.deck.push(this.values[j] + "-" + this.types[i]); //A-C -> K-C, A-D -> K-D
      }
    }
  }

  public shuffleDeck() {
    for (let i: number = 0; i < this.deck.length; i++) {
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
    for (let i: number = 0; i < 2; i++) {
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
    let value: any = data[0];

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

  public hit(betValue: number) {
    this.userBalance -= betValue;
    this.displayUserBalance(this.userBalance);
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

  public stand(betValue: number) {
    this.dealerSum = this.reduceAce(this.dealerSum, this.dealerAceCount);
    this.yourSum = this.reduceAce(this.yourSum, this.yourAceCount);

    this.canHit = false;
    let hiddenImg: PIXI.Sprite = Sprite.from(`assets/cards/${this.hidden}.png`);
    hiddenImg.anchor.set(0.5);
    hiddenImg.scale.set(0.22);
    this.addChild(hiddenImg);
    hiddenImg.x = 200;

    hiddenImg.y = 150;

    if (this.yourSum > 21) {
      this.message = "You Lose!";
    } else if (this.dealerSum > 21) {
      this.message = "You win!";
    }
    //both you and dealer <= 21
    else if (this.yourSum == this.dealerSum) {
      this.message = "Tie!";
      this.userBalance += betValue / 2;
    } else if (this.yourSum > this.dealerSum) {
      this.message = "You Win!";
      this.userBalance += betValue * 2;
    } else if (this.yourSum < this.dealerSum) {
      this.message = "You Lose!";
    }

    this.addCurrentBalanceText(this.yourSum, this.dealerSum);
    this.displayUserBalance(this.userBalance);
  }

  public reduceAce(playerSum: number, playerAceCount: number) {
    while (playerSum > 21 && playerAceCount > 0) {
      playerSum -= 10;
      playerAceCount -= 1;
    }
    return playerSum;
  }

  public initializeText() {
    this.yourSumText.anchor.set(0.5);
    this.addChild(this.yourSumText);
    this.yourSumText.x = 430;
    this.yourSumText.y = 280;

    this.dealerSumText.anchor.set(0.5);
    this.addChild(this.dealerSumText);
    this.dealerSumText.x = 430;
    this.dealerSumText.y = 30;

    this.textBalance.anchor.set(0.5);
    this.addChild(this.textBalance);
    this.textBalance.x = 780;
    this.textBalance.y = 550;
  }

  private addCurrentBalanceText(youSum?: number, dealerSum?: number) {
    this.yourSumText.text += String(youSum);
    this.dealerSumText.text += String(dealerSum);
  }

  public displayUserBalance(balance: number) {
    this.textBalance.text = "Balance:" + balance;
  }
}
