import { describe, expect, it } from 'vitest';
import { createDeck, handValue, type Card } from '../src/cards';
import { Blackjack } from '../src/game';

function gameWith(...draws: Card[]): Blackjack {
  return new Blackjack(() => [...draws].reverse());
}

describe('deck and ace scoring', () => {
  it('creates 52 unique cards', () => {
    expect(new Set(createDeck()).size).toBe(52);
  });
  it('reduces as many aces as needed', () => {
    expect(handValue(['A-C', 'A-D', '9-H'])).toBe(21);
    expect(handValue(['A-C', 'A-D', '9-H', 'K-S'])).toBe(21);
    expect(handValue(['A-C', '6-D'])).toBe(17);
  });
});

describe('blackjack rules and bankroll', () => {
  it('locks the wager and prevents a second deal during a hand', () => {
    const game = gameWith('10-C', '8-H', '10-D', '7-S');
    game.deal(); game.setBet(100); game.deal();
    expect(game.bet).toBe(25);
    expect(game.balance).toBe(975);
    expect(game.player).toHaveLength(2);
  });
  it('returns the entire stake on a push and settles only once', () => {
    const game = gameWith('10-C', '8-H', '10-D', '8-S');
    game.deal(); game.stand(); game.stand(); game.hit();
    expect(game.outcome).toBe('push');
    expect(game.balance).toBe(1000);
    expect(game.rounds).toBe(1);
  });
  it('pays a natural blackjack 3:2', () => {
    const game = gameWith('A-C', 'K-H', '10-D', '8-S');
    game.deal();
    expect(game.outcome).toBe('blackjack');
    expect(game.balance).toBe(1037.5);
  });
  it('pushes when both hands have a natural blackjack', () => {
    const game = gameWith('A-C', 'K-H', 'A-D', 'Q-S');
    game.deal();
    expect(game.outcome).toBe('push');
    expect(game.balance).toBe(1000);
  });
  it('settles a bust immediately and disables further actions', () => {
    const game = gameWith('10-C', '8-H', '10-D', '7-S', '5-C');
    game.deal(); game.hit(); game.stand(); game.hit();
    expect(game.outcome).toBe('lose');
    expect(game.balance).toBe(975);
    expect(game.player).toHaveLength(3);
  });
  it('recalculates soft aces before deciding whether the dealer draws', () => {
    const game = gameWith('10-C', '9-H', 'A-D', '5-S', '10-H', '2-C');
    game.deal(); game.stand();
    expect(handValue(game.dealer)).toBe(18);
    expect(game.outcome).toBe('win');
    expect(game.balance).toBe(1025);
  });
  it('stands on soft 17', () => {
    const game = gameWith('10-C', '8-H', 'A-D', '6-S');
    game.deal(); game.stand();
    expect(game.dealer).toHaveLength(2);
    expect(game.outcome).toBe('win');
  });
  it('rejects unaffordable bets and deals', () => {
    const game = gameWith('10-C', '8-H', '10-D', '7-S');
    game.balance = 5; game.setBet(10); game.deal();
    expect(game.phase).toBe('ready');
    expect(game.balance).toBe(5);
  });
  it('keeps a session reset from changing an active hand', () => {
    const game = gameWith('10-C', '8-H', '10-D', '7-S');
    game.deal(); game.reset();
    expect(game.phase).toBe('playing');
    game.stand(); game.reset();
    expect(game.phase).toBe('ready');
    expect(game.balance).toBe(1000);
    expect(game.rounds).toBe(0);
  });
});
