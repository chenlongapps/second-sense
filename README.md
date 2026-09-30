# 秒感 · 像素读秒挑战

响应式像素风读秒游戏。Vite + TypeScript 构建，Cloudflare Workers Static Assets 部署。

## 快速开始

```sh
nvm use || true
npm ci
npm run dev
```

访问 http://localhost:8080 。

## 命令

- `npm run dev`：本地开发
- `npm run build`：类型检查 + 生产构建（输出 `dist/`）
- `npm run check`：ESLint + Prettier 检查 + Vitest 单元测试
- `npm run deploy`：构建并发布到 Cloudflare

低频操作直接用 `npx`：`npx vite preview`、`npx prettier --write .`、`npx playwright test`。

## 结构

- `index.html`：入口
- `src/main.ts`：DOM 装配、计时流程
- `src/game/display.ts`：七段数码管渲染
- `src/game/time.ts`：统一的百分之一秒精度和误差计算
- `src/game/result.ts`：精准彩蛋、离谱成绩分级和随机文案
- `src/audio/synth.ts`：Web Audio 合成音效
- `src/styles.css`：像素界面样式
- `public/zpix.woff2`：中文像素字体
- `public/_headers`：缓存与安全头
- `tests/unit`：Vitest
- `tests/e2e`：Playwright
- `wrangler.jsonc`：Cloudflare Workers 静态资源配置

## 部署（Cloudflare Workers Static Assets）

1. 登录：`npx wrangler login`
2. 构建验证：`npm run build`
3. 发布：`npm run deploy`
4. 在 Dashboard → Workers & Pages 连接 Git 仓库，开启 Workers Builds 实现 push 自动部署。

配置说明见 `wrangler.jsonc`，静态目录为 `dist/`，`not_found_handling` 为 `404-page`。

## 玩法

选择 3、5 或 10 秒，点击红色按钮或按空格开始，再次点击或按空格停止。计时中隐藏时间；停止后数码管显示实际用时。音效开关在右上角，仅保存在当前浏览器。

数码管、历史记录和彩蛋统一按百分之一秒四舍五入。命中目标整秒会触发全屏庆祝：约 2 秒后自动结束，也可以点击画面、按空格或 Esc 跳过；庆祝期间背景操作被挡住，但不会自动开始下一局。相差 0.01 秒或 0.02 秒会触发不同的彩蛋、动效和音效，提前或超时都适用。

误差达到目标的 10% 会触发随机吐槽；不到目标的 20% 就停止、或用时达到目标的两倍时，优先触发专属吐槽。三类吐槽文案会轮换，避免连续玩的时候重复同一句。重开或切换目标会清除彩蛋，取消的回合不触发。静音设置和系统的减少动态效果设置同样适用于彩蛋和全屏庆祝。

## 字体授权

Zpix 最像素由 SolidZORO 制作，附带未修改官方字体。个人和教育产品免费，商业产品需另行授权。见 `public/font-license.txt` 和 https://github.com/SolidZORO/zpix-pixel-font 。
