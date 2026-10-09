import { createDeck, handValue, isBlackjack, type Card } from './cards';

export type Phase = 'ready' | 'playing' | 'finished';
export type Outcome = 'blackjack' | 'win' | 'push' | 'lose' | null;
export const BETS = [10, 25, 50, 100, 250] as const;
export const STARTING_BALANCE = 1000;

/** Rules and bankroll live here; rendering never changes the game state. */
export class Blackjack {
  balance = STARTING_BALANCE;
  bet: number = BETS[1];
  phase: Phase = 'ready';
  outcome: Outcome = null;
  player: Card[] = [];
  dealer: Card[] = [];
  rounds = 0;
  wins = 0;
  private deck: Card[] = [];

  constructor(private readonly deckFactory: () => Card[] = createDeck) {}

  setBet(amount: number): void {
    if (this.phase !== 'playing' && BETS.some(bet => bet === amount) && amount <= this.balance) {
      this.bet = amount;
    }
  }

  deal(): void {
    if (this.phase === 'playing' || this.bet > this.balance) return;
    this.deck = this.deckFactory();
    this.balance -= this.bet;
    this.phase = 'playing';
    this.outcome = null;
    this.player = [this.draw(), this.draw()];
    this.dealer = [this.draw(), this.draw()];
    if (isBlackjack(this.player) || isBlackjack(this.dealer)) {
      this.settle(isBlackjack(this.player) ? isBlackjack(this.dealer) ? 'push' : 'blackjack' : 'lose');
    }
  }

  hit(): void {
    if (this.phase !== 'playing') return;
    this.player.push(this.draw());
    if (handValue(this.player) > 21) this.settle('lose');
    else if (handValue(this.player) === 21) this.stand();
  }

  stand(): void {
    if (this.phase !== 'playing') return;
    // Stand on all 17s, including soft 17. Recalculate aces after every draw.
    while (handValue(this.dealer) < 17) this.dealer.push(this.draw());
    const player = handValue(this.player);
    const dealer = handValue(this.dealer);
    this.settle(dealer > 21 || player > dealer ? 'win' : player === dealer ? 'push' : 'lose');
  }

  reset(): void {
    if (this.phase === 'playing') return;
    this.balance = STARTING_BALANCE;
    this.bet = BETS[1];
    this.phase = 'ready';
    this.outcome = null;
    this.player = [];
    this.dealer = [];
    this.rounds = 0;
    this.wins = 0;
  }

  private draw(): Card {
    const card = this.deck.pop();
    if (!card) throw new Error('The deck is empty.');
    return card;
  }

  private settle(outcome: Exclude<Outcome, null>): void {
    this.outcome = outcome;
    this.phase = 'finished';
    this.rounds++;
    if (outcome === 'win' || outcome === 'blackjack') this.wins++;
    const returns = { blackjack: 2.5, win: 2, push: 1, lose: 0 };
    this.balance += this.bet * returns[outcome];
  }
}
