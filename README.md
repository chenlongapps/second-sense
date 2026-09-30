# 秒感 · SECOND SENSE

[简体中文](README.md) · [English](README.en.md)

**凭感觉，停在那一秒。** 响应式像素风读秒游戏：选一个目标秒数，凭感觉按停，看看你的时间感有多准（或有多离谱）。

[![Deploy to GitHub Pages](https://github.com/chenlongapps/second-sense/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/chenlongapps/second-sense/actions/workflows/deploy-pages.yml)
[![Live Demo](https://img.shields.io/badge/demo-online-2ea44f?logo=githubpages&logoColor=white)](https://chenlongapps.github.io/second-sense/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=fff)](https://vite.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-5FA04E?logo=nodedotjs&logoColor=fff)](https://nodejs.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?logo=cloudflare&logoColor=fff)](https://workers.cloudflare.com/)
[![i18n](https://img.shields.io/badge/i18n-6_languages-4B8BBE)](#多语言)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?logo=opensourceinitiative&logoColor=fff)](LICENSE)

[![秒感在桌面端与移动端的界面](docs/preview.webp)](https://chenlongapps.github.io/second-sense/)

在线游玩：<https://chenlongapps.github.io/second-sense/>

## 玩法

选择 3、5 或 10 秒，点击红色按钮或按空格开始，凭感觉再次按停。计时中不显示时间，停止后数码管显示实际用时；命中整秒会全屏庆祝，约 2 秒后自动结束（点击、空格或 Esc 可跳过）。

- **误差反馈**：提前或超时都有专属吐槽；误差达到目标的 10%、低于 20%，或用时超过两倍时触发分级文案，0.01–0.02 秒的贴脸命中另有彩蛋、动效与音效。
- **外挂局**：同一目标按钮连点 5 次触发，数码管实时显示、到点自动停止，只生效一局。
- **近五次记录**：数码管、历史与彩蛋统一按百分之一秒四舍五入。
- **音效与动效**：右上角可开关音效；静音和系统"减少动态效果"设置对彩蛋同样生效。

## 快速开始

```sh
nvm use
npm ci
npm run dev
```

访问 <http://localhost:8080>（需要 Node 20+）。

## 命令

| 命令             | 说明                                                               |
| ---------------- | ------------------------------------------------------------------ |
| `npm run dev`    | 本地开发（端口 8080）                                              |
| `npm run build`  | `tsc --noEmit` + 生产构建到 `dist/`                                |
| `npm run check`  | ESLint + Prettier + [Vitest](https://vitest.dev/) 单元测试         |
| `npm run deploy` | 构建并发布到 [Cloudflare Workers](https://workers.cloudflare.com/) |

低频操作直接用 `npx`：`vite preview`、[`playwright test`](https://playwright.dev/)、`prettier --write .`。

## 结构

- [`index.html`](index.html)：入口
- [`src/main.ts`](src/main.ts)：DOM 装配、计时流程
- [`src/game/`](src/game)：`display.ts` 数码管渲染、`time.ts` 计时精度、`result.ts` 彩蛋分级、`history.ts` 历史记录、`cheat.ts` 外挂规则
- [`src/i18n/`](src/i18n)：六语言文案、语言检测与切换
- [`src/audio/synth.ts`](src/audio/synth.ts)：Web Audio 合成音效
- [`src/styles.css`](src/styles.css)：像素界面样式
- [`tests/`](tests)：[Vitest](https://vitest.dev/) 单测 + [Playwright](https://playwright.dev/) E2E
- [`docs/preview.webp`](docs/preview.webp)：README 示意图
- [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml)：GitHub Pages 自动部署
- [`wrangler.jsonc`](wrangler.jsonc)：Cloudflare Workers 静态资源配置

## 部署

- **GitHub Pages**（当前线上环境）：仓库 **Settings → Pages** 将 **Source** 设为 **GitHub Actions**；推送到 `main` 即自动运行 `npm run check`、构建并发布 `dist/`，也可在 Actions 里手动触发。Fork 后地址为 `https://<用户名>.github.io/<仓库名>/`，构建时自动适配仓库子路径、根站点与自定义域名。
- **Cloudflare Workers Static Assets**：[`npx wrangler login`](https://developers.cloudflare.com/workers/wrangler/) 后运行 `npm run deploy`；在 Dashboard 连接仓库并开启 Workers Builds 即可 push 自动部署。

本地验证子路径部署：

```sh
npm run build -- --base=/second-sense/
npx vite preview --base=/second-sense/   # http://localhost:4173/second-sense/
```

## 多语言

界面支持**简体中文、繁体中文、英语、日语、韩语、西班牙语**，右上角随时切换。首次进入按 `localStorage` → 浏览器语言 → 英语的顺序决定（`zh-Hant`、`zh-HK`、`zh-TW` 视为繁体，其余 `zh-*` 视为简体），选择只保存在当前浏览器。界面、彩蛋、历史记录、读屏标签与页面标题全部跟随语言切换，且不会打断正在进行的一局。

## 许可

代码以 [MIT 许可](LICENSE) 发布，可自由使用、修改和分发，保留版权声明即可。随仓库分发的 [Zpix 最像素](https://github.com/SolidZORO/zpix-pixel-font) 字体（[`public/zpix.woff2`](public/zpix.woff2)）是第三方作品，**不在 MIT 覆盖范围内**：个人与教育用途免费，商业用途需另行授权，详见 [`public/font-license.txt`](public/font-license.txt)。
