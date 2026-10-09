export const RANKS = [
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
] as const;
export const SUITS = ['C', 'D', 'H', 'S'] as const;
export type Card = `${(typeof RANKS)[number]}-${(typeof SUITS)[number]}`;

/** Fisher–Yates gives every permutation an equal chance. */
export function createDeck(random: () => number = Math.random): Card[] {
  const cards: Card[] = SUITS.flatMap((suit) =>
    RANKS.map((rank) => `${rank}-${suit}` as Card),
  );
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export function handValue(cards: readonly Card[]): number {
  let aces = 0;
  let total = 0;
  for (const card of cards) {
    const rank = card.split('-')[0];
    if (rank === 'A') aces++;
    total +=
      rank === 'A' ? 11 : ['J', 'Q', 'K'].includes(rank) ? 10 : Number(rank);
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

export function isBlackjack(cards: readonly Card[]): boolean {
  return cards.length === 2 && handValue(cards) === 21;
}
