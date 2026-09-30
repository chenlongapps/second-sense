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

## 字体授权

Zpix 最像素由 SolidZORO 制作，附带未修改官方字体。个人和教育产品免费，商业产品需另行授权。见 `public/font-license.txt` 和 https://github.com/SolidZORO/zpix-pixel-font 。
