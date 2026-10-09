import { Application, Assets, Container, Graphics, Sprite } from 'pixi.js';
import { RANKS, SUITS, type Card } from './cards';
import type { Blackjack } from './game';

const DESKTOP_WIDTH = 960;
const HEIGHT = 420;

/** Only draws cards. Controls and scores stay in accessible HTML. */
export class Table {
  private width = DESKTOP_WIDTH;
  private host!: HTMLElement;
  private readonly app = new Application();
  private readonly cards = new Container();

  async initialize(host: HTMLElement): Promise<void> {
    this.host = host;
    this.width = host.clientWidth < 600 ? 600 : DESKTOP_WIDTH;
    host.style.aspectRatio = `${this.width} / ${HEIGHT}`;
    await this.app.init({
      width: this.width,
      height: HEIGHT,
      backgroundAlpha: 0,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
      preference: 'webgl',
    });
    const urls = SUITS.flatMap((suit) =>
      RANKS.map((rank) => `assets/cards/${rank}-${suit}.png`),
    );
    await Assets.load(urls.map((url) => `${import.meta.env.BASE_URL}${url}`));
    host.append(this.app.canvas);
    this.app.stage.addChild(this.cards);
    this.renderEmpty();
  }

  render(game: Blackjack): void {
    const width = this.host.clientWidth < 600 ? 600 : DESKTOP_WIDTH;
    if (width !== this.width) {
      this.width = width;
      this.app.renderer.resize(width, HEIGHT);
      this.host.style.aspectRatio = `${width} / ${HEIGHT}`;
    }
    // Destroy display objects, retain cached textures for the next hand.
    for (const child of this.cards.removeChildren())
      child.destroy({ children: true });
    if (game.phase === 'ready') return this.renderEmpty();
    this.drawHand(game.dealer, 100, game.phase === 'playing');
    this.drawHand(game.player, 315, false);
  }

  private renderEmpty(): void {
    for (const y of [100, 315]) {
      for (const x of [this.width / 2 - 54, this.width / 2 + 54]) {
        const outline = new Graphics()
          .roundRect(x - 46, y - 66, 92, 132, 7)
          .stroke({ color: 0xb3c9a1, alpha: 0.15, width: 1 });
        this.cards.addChild(outline);
      }
    }
  }

  private drawHand(hand: readonly Card[], y: number, hidden: boolean): void {
    const gap = Math.min(
      108,
      (this.width - 160) / Math.max(hand.length - 1, 1),
    );
    hand.forEach((card, index) => {
      const x = this.width / 2 + (index - (hand.length - 1) / 2) * gap;
      const shadow = new Graphics()
        .roundRect(x - 43, y - 60, 92, 132, 7)
        .fill({ color: 0x001c13, alpha: 0.4 });
      this.cards.addChild(shadow);
      if (hidden && index === 1) {
        const back = new Graphics()
          .roundRect(x - 46, y - 66, 92, 132, 7)
          .fill(0xe5dfc8)
          .roundRect(x - 41, y - 61, 82, 122, 4)
          .fill(0x173f32);
        for (let dy = -51; dy <= 51; dy += 12) {
          for (let dx = -30; dx <= 30; dx += 12) {
            back
              .poly([
                x + dx,
                y + dy - 3,
                x + dx + 3,
                y + dy,
                x + dx,
                y + dy + 3,
                x + dx - 3,
                y + dy,
              ])
              .fill({ color: 0xe2bf76, alpha: 0.5 });
          }
        }
        this.cards.addChild(back);
      } else {
        const sprite = Sprite.from(
          `${import.meta.env.BASE_URL}assets/cards/${card}.png`,
        );
        sprite.anchor.set(0.5);
        sprite.position.set(x, y);
        sprite.width = 92;
        sprite.height = 132;
        this.cards.addChild(sprite);
      }
    });
  }
}
