import '../style.css';
import { handValue, type Card } from './cards';
import { BETS, Blackjack } from './game';
import { Table } from './table';

function element<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`Missing element: ${id}`);
  return found as T;
}

const game = new Blackjack();
const table = new Table();
const deal = element<HTMLButtonElement>('deal');
const hit = element<HTMLButtonElement>('hit');
const stand = element<HTMLButtonElement>('stand');
const reset = element<HTMLButtonElement>('reset');
const rules = element<HTMLDialogElement>('rules');
const host = element('card-table');
const format = new Intl.NumberFormat('en', { maximumFractionDigits: 1 });
const chipButtons = BETS.map((bet) => {
  const button = document.createElement('button');
  button.className = 'chip';
  button.textContent = String(bet);
  button.setAttribute('aria-label', `Bet ${bet} chips`);
  button.addEventListener('click', () => {
    game.setBet(bet);
    render();
  });
  element('chips').append(button);
  return button;
});

function describe(cards: readonly Card[]): string {
  const suits = { C: 'clubs', D: 'diamonds', H: 'hearts', S: 'spades' };
  return cards
    .map((card) => {
      const [rank, suit] = card.split('-');
      return `${rank} of ${suits[suit as keyof typeof suits]}`;
    })
    .join(', ');
}

function render(): void {
  const playing = game.phase === 'playing';
  const broke = game.balance < BETS[0] && !playing;
  if (!playing && game.bet > game.balance && !broke) {
    game.setBet([...BETS].reverse().find((bet) => bet <= game.balance)!);
  }
  table.render(game);
  element('balance').innerHTML =
    `${format.format(game.balance)}<span> chips</span>`;
  element('session').textContent = `${game.rounds} hands · ${game.wins} wins`;
  element('bet-lock').textContent = playing ? '· locked' : '';
  chipButtons.forEach((button, index) => {
    button.disabled = playing || BETS[index] > game.balance;
    button.setAttribute('aria-pressed', String(BETS[index] === game.bet));
  });
  deal.hidden = playing || broke;
  deal.disabled = playing || broke;
  deal.textContent = game.phase === 'ready' ? 'Deal me in  ↗' : 'Next hand  ↗';
  hit.hidden = stand.hidden = !playing;
  hit.disabled = stand.disabled = !playing;
  reset.hidden = !broke;
  element('dealer-score').textContent = !game.dealer.length
    ? '—'
    : playing
      ? `${handValue([game.dealer[0]])} + ?`
      : String(handValue(game.dealer));
  element('player-score').textContent = game.player.length
    ? String(handValue(game.player))
    : '—';
  const messages = {
    blackjack: `Blackjack. Beautiful. You won ${format.format(game.bet * 1.5)} chips!`,
    win: `That’s your hand. You won ${game.bet} chips!`,
    push: 'A perfect tie. Your chips are back with you.',
    lose:
      handValue(game.player) > 21
        ? 'Over 21. The house takes this one.'
        : 'The house takes this one. There’s always the next hand.',
  };
  element('status').textContent = broke
    ? 'Out of chips? A fresh start is on the house.'
    : playing
      ? 'Your move. Take a card or hold your hand.'
      : game.outcome
        ? messages[game.outcome]
        : 'Choose your chips. The table is yours.';
  const won = game.outcome === 'win' || game.outcome === 'blackjack';
  element('status-icon').textContent = won ? '✦' : '♢';
  element('status').parentElement?.classList.toggle('win', won);
  host.setAttribute(
    'aria-label',
    game.player.length
      ? `Dealer: ${describe(playing ? [game.dealer[0]] : game.dealer)}${playing ? ', one hidden card' : ''}. Your hand: ${describe(game.player)}. Total ${handValue(game.player)}.`
      : 'An empty blackjack table',
  );
}

function play(action: () => void): void {
  action();
  render();
  // Hand completion hides the action; move keyboard focus to the next step.
  if (game.phase !== 'playing')
    (reset.hidden ? deal : reset).focus({ preventScroll: true });
}

deal.addEventListener('click', () => {
  play(() => game.deal());
  if (game.phase === 'playing') hit.focus({ preventScroll: true });
});
hit.addEventListener('click', () => play(() => game.hit()));
stand.addEventListener('click', () => play(() => game.stand()));
reset.addEventListener('click', () => play(() => game.reset()));
element('rules-button').addEventListener('click', () => rules.showModal());
element('close-rules').addEventListener('click', () => rules.close());
rules.addEventListener('click', (event) => {
  if (event.target === rules) {
    const rect = rules.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      rules.close();
  }
});
document.addEventListener('keydown', (event) => {
  if (
    event.repeat ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    rules.open ||
    game.phase !== 'playing'
  )
    return;
  if (event.key.toLowerCase() === 'h') play(() => game.hit());
  if (event.key.toLowerCase() === 's') play(() => game.stand());
});

try {
  await table.initialize(host);
  render();
  let resizeFrame = 0;
  new ResizeObserver(() => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => table.render(game));
  }).observe(host);
} catch (error) {
  console.error(error);
  element('status').textContent =
    'The table couldn’t load. Refresh to try again.';
  deal.textContent = 'Table unavailable';
  chipButtons.forEach((button) => {
    button.disabled = true;
  });
}
