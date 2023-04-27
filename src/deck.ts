import * as PIXI from "pixi.js";
import { Sprite } from "pixi.js";

export class Deck extends PIXI.Container {
  private dealerSum: number = 0;
  private playerSum: number = 0;

  private dealerAceCount: number = 0;
  private playerAceCount = 0;
  private hidden: any;
  private dealerDeckX: number = 320;
  private message: string = "";
  private widthHitDeck: number = 440;
  private canHit: boolean = true; //allows player to draw while yourSum <= 21
  private values: string[] = [
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
  private types: string[] = ["C", "D", "H", "S"];
  private deck: string[] = [];

  public textStyle: PIXI.TextStyle = new PIXI.TextStyle({
    fontSize: 30,
    fill: "#3a3a3a",
    lineJoin: "round",
  });

  private dealerSumText: PIXI.Text = new PIXI.Text("Dealer: ", this.textStyle);
  private yourSumText: PIXI.Text = new PIXI.Text("You: ", this.textStyle);
  private textBalance = new PIXI.Text("Balance: 1000", this.textStyle);
  private userBalance: number = 1000;
  private betDone: boolean = false;
  private balanceUpdated: boolean = false;
  private gameOverText = new PIXI.Text("", this.textStyle);

  constructor() {
    super();
    this.buildDeck();
    this.shuffleDeck();
    this.startGame();
    this.initializeText();
    this.displayUserBalance(this.userBalance);
  }

  private buildDeck() {
    for (let i: number = 0; i < this.types.length; i++) {
      for (let j = 0; j < this.values.length; j++) {
        this.deck.push(this.values[j] + "-" + this.types[i]); //A-C -> K-C, A-D -> K-D
      }
    }
  }

  private shuffleDeck() {
    for (let i: number = 0; i < this.deck.length; i++) {
      let j = Math.floor(Math.random() * this.deck.length); // (0-1) * 52 => (0-51.9999)
      let temp = this.deck[i];
      this.deck[i] = this.deck[j];
      this.deck[j] = temp;
    }
  }

  private startGame() {
    let cardBack: PIXI.Sprite = Sprite.from("assets/cards/BACK.png");
    cardBack.anchor.set(0.5);
    cardBack.scale.set(0.22);
    this.addChild(cardBack);
    cardBack.x = 200;
    cardBack.y = 150;

    this.dealerSum = 0;
    this.playerSum = 0;
    this.dealerAceCount = 0;
    this.playerAceCount = 0;
    this.hidden = this.deck.pop();
    this.dealerSum += this.getValue(this.hidden);
    this.dealerAceCount += this.checkAce(this.hidden);

    let card = this.deck.pop();
    let cardImg = Sprite.from(`assets/cards/${card}.png`);
    cardImg.anchor.set(0.5);
    cardImg.scale.set(0.22);
    this.addChild(cardImg);
    cardImg.x = this.dealerDeckX;
    cardImg.y = 150;
    this.dealerDeckX += 120;
    this.dealerSum += this.getValue(card);
    this.dealerAceCount += this.checkAce(card);

    for (let i: number = 0; i < 2; i++) {
      const width = 200 + i * 120;
      let card = this.deck.pop();
      let cardImg: PIXI.Sprite = Sprite.from(`assets/cards/${card}.png`);
      cardImg.anchor.set(0.5);
      cardImg.scale.set(0.22);
      this.addChild(cardImg);
      cardImg.x = width;
      cardImg.y = 400;
      this.playerSum += this.getValue(card);
      this.playerAceCount += this.checkAce(card);
      console.log("add your sum", this.getValue(card));
    }
  }

  private getValue(card: any) {
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
    if (this.userBalance > 0) {
      if (!this.betDone) {
        this.userBalance -= betValue;
        this.displayUserBalance(this.userBalance);
        this.betDone = true;
      }
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

      this.playerSum += this.getValue(card);
      this.playerAceCount += this.checkAce(card);
      this.addChild(cardImg);

      if (this.reduceAce(this.playerSum, this.playerAceCount) > 21) {
        //A, J, 8 -> 1 + 10 + 8
        this.canHit = false;
      }
    } else {
      this.message = "Low balance";
      this.initializeGameOverText();
      this.updateGameOverText(this.message);
    }
  }

  public stand(betValue: number) {
    while (this.dealerSum < 17) {
      const card = this.deck.pop();
      const cardImg = Sprite.from(`assets/cards/${card}.png`);
      cardImg.anchor.set(0.5);
      cardImg.scale.set(0.22);
      this.addChild(cardImg);
      cardImg.x = this.dealerDeckX;
      this.dealerDeckX += 120;
      cardImg.y = 150;
      this.dealerSum += this.getValue(card);
      this.dealerAceCount += this.checkAce(card);
    }
    this.dealerSum = this.reduceAce(this.dealerSum, this.dealerAceCount);
    this.playerSum = this.reduceAce(this.playerSum, this.playerAceCount);
    if (!this.betDone) {
      this.userBalance -= betValue;
      this.displayUserBalance(this.userBalance);
      this.betDone = true;
    }
    this.canHit = false;
    let hiddenImg: PIXI.Sprite = Sprite.from(`assets/cards/${this.hidden}.png`);
    hiddenImg.anchor.set(0.5);
    hiddenImg.scale.set(0.22);
    this.addChild(hiddenImg);
    hiddenImg.x = 200;

    hiddenImg.y = 150;

    if (this.playerSum > 21) {
      this.message = "You lose!";
    } else if (this.dealerSum > 21) {
      this.message = "You win!";
      this.userBalance += betValue * 2;
    }
    //both you and dealer <= 21
    else if (this.playerSum == this.dealerSum) {
      this.message = "Tie! ";
      this.userBalance += betValue / 2;
    } else if (this.playerSum > this.dealerSum) {
      this.message = "You win! ";
      this.userBalance += betValue * 2;
    } else if (this.playerSum < this.dealerSum) {
      this.message = "You lose! ";
    }

    setTimeout(() => {
      this.initializeGameOverText();
    }, 1000);
    this.updateGameOverText(this.message);
    this.addCurrentBalanceText(this.playerSum, this.dealerSum);
    if (!this.balanceUpdated) {
      this.displayUserBalance(this.userBalance);
      this.balanceUpdated = true;
    }
  }

  private reduceAce(playerSum: number, playerAceCount: number) {
    while (playerSum > 21 && playerAceCount > 0) {
      playerSum -= 10;
      playerAceCount -= 1;
    }
    return playerSum;
  }

  private initializeText() {
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
    this.yourSumText.text = "You: " + youSum;
    this.dealerSumText.text = "Dealer: " + dealerSum;
  }

  private displayUserBalance(balance: number) {
    this.textBalance.text = "Balance:" + balance;
  }

  private initializeGameOverText() {
    const gameOverButton: PIXI.Sprite = Sprite.from("assets/text_space.png");
    gameOverButton.anchor.set(0.5);
    gameOverButton.interactive = true;
    gameOverButton.cursor = "pointer";
    gameOverButton.x = 425;
    gameOverButton.y = 325;
    this.addChild(gameOverButton);

    gameOverButton.anchor.set(0.5);
    this.gameOverText.anchor.set(0.5);
    gameOverButton.addChild(this.gameOverText);

    gameOverButton.on("pointerdown", (evt: MouseEvent) => {
      this.cleanDeck();
      gameOverButton.destroy();
    });
  }

  private updateGameOverText(text: string) {
    this.gameOverText.text = text + "Press to start";
  }

  private cleanDeck() {
    this.deck = [];
    this.removeChildren();
    this.dealerSum = 0;
    this.playerSum = 0;
    this.dealerAceCount = 0;
    this.playerAceCount = 0;
    this.dealerDeckX = 320;
    this.message = "";
    this.widthHitDeck = 440;
    this.canHit = true;
    this.betDone = false;
    this.buildDeck();
    this.shuffleDeck();
    this.initializeText();
    this.displayUserBalance(this.userBalance);
    this.addCurrentBalanceText(0, 0);
    this.startGame();
  }
}
