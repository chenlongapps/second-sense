# Second Sense · 秒感

[简体中文](README.md) · [English](README.en.md)

**Stop right on the second — by feel.** A responsive pixel-art timing game: pick a target duration, press stop when you think it has passed, and find out how good (or hopeless) your sense of time really is.

[![Deploy to GitHub Pages](https://github.com/chenlongapps/second-sense/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/chenlongapps/second-sense/actions/workflows/deploy-pages.yml)
[![Live Demo](https://img.shields.io/badge/demo-online-2ea44f?logo=githubpages&logoColor=white)](https://chenlongapps.github.io/second-sense/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=fff)](https://vite.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-5FA04E?logo=nodedotjs&logoColor=fff)](https://nodejs.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?logo=cloudflare&logoColor=fff)](https://workers.cloudflare.com/)
[![i18n](https://img.shields.io/badge/i18n-6_languages-4B8BBE)](#internationalization)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?logo=opensourceinitiative&logoColor=fff)](LICENSE)

[![Second Sense on desktop and mobile](docs/preview.webp)](https://chenlongapps.github.io/second-sense/)

Play online: <https://chenlongapps.github.io/second-sense/>

## How to play

Pick 3, 5, or 10 seconds, then click the red button or press Space to start and press it again when you feel the time is up. The clock stays hidden while running; when you stop, the seven-segment display shows your actual time. A perfect stop triggers a full-screen celebration that ends after about 2 seconds (click, Space, or Esc to skip).

- **Error feedback**: stopping early or late gets its own taunts; missing the target by 10%, hitting it within 20%, or taking twice as long triggers tiered messages, and stops within 0.01–0.02 s come with their own easter eggs, animations, and sounds.
- **Cheat round**: tap the same target button 5 times in a row to run a round that shows the clock live and stops automatically at the target — it only applies to one round.
- **Last five runs**: display, history, and easter eggs all round to 1/100 second.
- **Sound & motion**: toggle audio in the top-right corner; mute and the system "reduce motion" setting also apply to the easter eggs.

## Quick start

```sh
nvm use
npm ci
npm run dev
```

Open <http://localhost:8080> (Node 20+).

## Scripts

| Script           | Description                                                               |
| ---------------- | ------------------------------------------------------------------------- |
| `npm run dev`    | Local dev server (port 8080)                                              |
| `npm run build`  | `tsc --noEmit` + production build to `dist/`                              |
| `npm run check`  | ESLint + Prettier + [Vitest](https://vitest.dev/) unit tests              |
| `npm run deploy` | Build and deploy to [Cloudflare Workers](https://workers.cloudflare.com/) |

Occasional tasks go through `npx`: `vite preview`, [`playwright test`](https://playwright.dev/), `prettier --write .`.

## Project layout

- [`index.html`](index.html): entry point
- [`src/main.ts`](src/main.ts): DOM wiring and the timing flow
- [`src/game/`](src/game): `display.ts` seven-segment rendering, `time.ts` timing precision, `result.ts` easter-egg tiers, `history.ts` recent runs, `cheat.ts` cheat-round rules
- [`src/i18n/`](src/i18n): six locales, detection, and switching
- [`src/audio/synth.ts`](src/audio/synth.ts): Web Audio sound effects
- [`src/styles.css`](src/styles.css): pixel UI styles
- [`tests/`](tests): [Vitest](https://vitest.dev/) unit tests + [Playwright](https://playwright.dev/) E2E
- [`docs/preview.webp`](docs/preview.webp): README screenshot
- [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml): GitHub Pages deployment
- [`wrangler.jsonc`](wrangler.jsonc): Cloudflare Workers static assets config

## Deployment

- **GitHub Pages** (the current live site): set **Source** to **GitHub Actions** under **Settings → Pages**; pushing to `main` runs `npm run check`, builds, and publishes `dist/` automatically, and you can also trigger it from the Actions tab. Forks serve from `https://<username>.github.io/<repo>/`, and the build adapts to repo subpaths, root sites, and custom domains.
- **Cloudflare Workers Static Assets**: run [`npx wrangler login`](https://developers.cloudflare.com/workers/wrangler/) then `npm run deploy`; connect the repo in the dashboard with Workers Builds enabled to deploy on push.

Verify a subpath deployment locally:

```sh
npm run build -- --base=/second-sense/
npx vite preview --base=/second-sense/   # http://localhost:4173/second-sense/
```

## Internationalization

The UI ships in **Simplified Chinese, Traditional Chinese, English, Japanese, Korean, and Spanish**, switchable from the top-right corner. On a first visit the locale is resolved from `localStorage` → browser languages → English (`zh-Hant`, `zh-HK`, and `zh-TW` map to Traditional Chinese, other `zh-*` to Simplified), and the choice is stored in the current browser only. Interface copy, easter eggs, history, screen-reader labels, and the page title all follow the selected language, and switching never interrupts a running round.

## License

The code is released under the [MIT License](LICENSE) — free to use, modify, and distribute as long as the copyright notice is kept. The bundled [Zpix](https://github.com/SolidZORO/zpix-pixel-font) font ([`public/zpix.woff2`](public/zpix.woff2)) is third-party work and is **not covered by the MIT license**: it is free for personal and educational use, while commercial use requires a separate license — see [`public/font-license.txt`](public/font-license.txt).
