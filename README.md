# ♠ Blackjack

A clean browser blackjack game built with **TypeScript and PixiJS**. Green felt, gold chips, and quick hands against the dealer. No account or real money required.

[![CI](https://github.com/leracherry/black-jack/actions/workflows/ci.yml/badge.svg)](https://github.com/leracherry/black-jack/actions/workflows/ci.yml)

![Desktop blackjack table with dealer cards, player cards, and betting controls](docs/screenshots/desktop.png)

## Features

- Responsive table for desktop and mobile.
- Five chip values, a session bankroll, and hand and win counters.
- Keyboard shortcuts, visible focus states, and accessible HTML controls.
- Card descriptions for screen readers and live hand result announcements.
- Built-in rules dialog and a fresh start when you run out of chips.
- Local card assets with no external fonts or CDN scripts.

## Run locally

Use **Node.js 24** and npm. The project also supports Node.js 20.19+ or 22.12+.

```sh
git clone git@github.com:leracherry/black-jack.git
cd black-jack
npm ci
npm start
```

Open **http://localhost:8000**.

1. Choose a bet.
2. Select **Deal me in**.
3. **Hit** to draw another card or **Stand** to keep your hand.
4. Select **Next hand** after the result.

| Control     | Shortcut | Action              |
| ----------- | -------- | ------------------- |
| Hit         | `H`      | Draw a card         |
| Stand       | `S`      | Finish your turn    |
| How to play |          | Open the rules      |
| Close rules | `Esc`    | Return to the table |

## Rules and payouts

Get closer to **21** than the dealer without going over.

- Start with **1,000 pretend chips**. Bet 10, 25, 50, 100, or 250 chips.
- Face cards count as 10. Aces count as 1 or 11, whichever keeps your hand strongest without busting.
- The dealer draws to 17 and stands on all 17s, including soft 17.
- A player hand reaching 21 stands automatically. A bust ends the hand immediately.
- A two-card blackjack beats a regular 21. Two natural blackjacks tie.
- Bets lock when you deal. Each hand uses a freshly shuffled 52-card deck.
- Splitting, doubling, and insurance are not included.

| Result            | Net payout     | With a 100-chip bet                     |
| ----------------- | -------------- | --------------------------------------- |
| Win               | 1:1            | Receive 200 chips, including your stake |
| Natural blackjack | 3:2            | Receive 250 chips, including your stake |
| Tie               | Stake returned | Receive your 100 chips back             |
| Loss              | Stake lost     | Receive 0 chips                         |

Your bankroll lasts for the current page session. Refreshing resets it. If you cannot afford the smallest bet, **Fresh start** resets the bankroll and session counters.

## Screenshots

### Mobile

<img src="docs/screenshots/mobile.png" alt="Mobile blackjack table with chip selection and hit and stand buttons" width="300" />

<details>
<summary>Finished hand</summary>

![Completed hand with revealed dealer cards and the outcome](docs/screenshots/result.png)

</details>

## Development

| Command                | Purpose                                     |
| ---------------------- | ------------------------------------------- |
| `npm start`            | Start the development server                |
| `npm test`             | Run game-rule and bankroll regression tests |
| `npm run typecheck`    | Check TypeScript                            |
| `npm run build`        | Type-check and build to `dist/`             |
| `npm run preview`      | Serve the production build locally          |
| `npm run format`       | Format source files and documentation       |
| `npm run format:check` | Verify formatting                           |

**PixiJS** renders the cards. **Vite** handles development and builds. **Vitest** tests the game logic, and **Prettier** formats the code. GitHub Actions runs formatting checks, tests, and the production build on pushes to `main` or `master` and on pull requests.

```text
src/
  cards.ts          Typed cards, shuffle, and hand scoring
  game.ts           Hand lifecycle, wagers, and payouts
  table.ts          PixiJS renderer and responsive canvas
  index.ts          Controls, keyboard input, and announcements
public/
  assets/cards/     Card artwork
style.css           Table styling and responsive layouts
tests/              Game-rule regression tests
docs/screenshots/   Desktop, mobile, and result screenshots
```

Game rules are separate from rendering, so scoring and payouts can be tested without a browser.

## Build and deploy

```sh
npm run build
npm run preview
```

Deploy the contents of `dist/` to a static host. For a site served from a subdirectory, set the base path when building:

```sh
npm run build -- --base=/black-jack/
```

Serve the files over HTTP. Opening the built HTML directly from the filesystem will not load the game correctly.
