# AGENTS.md — second-sense

单页像素风时间感游戏。使用 Vite + TypeScript，无后端。`index.html` → `src/main.ts`（负责所有 DOM 绑定和计时流程）；七段数码管渲染位于 `src/game/display.ts`，Web Audio 合成器位于 `src/audio/synth.ts`。

多语言位于 `src/i18n/`：`types.ts` 定义 `Messages` 文案接口、`MessageKey`（点号键名）和 `LOCALES`；`locales/` 是六门语言包（简体中文、繁体中文、英语、日语、韩语、西班牙语，彩蛋文案也在里面）；`index.ts` 提供 `t()`、`setLocale()`/`getLocale()`、`resolveLocale()`/`detectLocale()`、语言偏好的读写和 `applyStaticTranslations()`。界面文案一律走 `t("key", { params })`；`index.html` 保留中文兜底，并用 `data-i18n="status.ready"`、`data-i18n-attr="aria-label:brand.label"`、`data-i18n-params='{"n":3}'` 声明可替换项。切换语言时 `main.ts` 的 `refreshTranslations()` 会重铺全部文案并保留当前回合、彩蛋和历史记录；彩蛋用 `result.ts` 的 `localizeEasterEgg()` 按同一句下标换语言。

语言来源顺序：`localStorage` 的 `second-sense-locale` → `navigator.languages` → 英语。`resolveLocale()` 会把 `zh-Hant`/`zh-HK`/`zh-TW` 归到繁体中文，其余 `zh-*` 归简体。

`src/game/` 下的其它模块：`time.ts`（百分之一秒精度与误差）、`result.ts`（彩蛋分级与文案）、`history.ts`（近五次记录）、`cheat.ts`（连点外挂规则：`CHEAT_CLICKS = 5`、`CHEAT_WINDOW_MS = 1000`）。

外挂局实现：`src/main.ts` 的 `startCheatTracking()` / `stopCheatTracking()` 在外挂回合中驱动数码管实时显示（每 `CHEAT_TICK_MS` 刷新一次，不使用 `hidden` 遮挡），到目标秒数自动调用 `stop()`。`stop()`、`cancel()` 和切走页面都会清理计时循环，因此外挂只生效一局。

## 命令

- 环境设置：`nvm use`（Node 20，`engines: >=20`）、`npm ci`、`npm run dev`（端口 **8080**，不是 Vite 默认端口）。
- `npm run build` = `tsc --noEmit && vite build`（输出到 `dist/`）。部署或预览前务必运行。
- `npm run check` = `eslint . && prettier --check . && vitest run`。使用 `npx prettier --write <file>` 修复格式问题。
- 单元测试（Vitest，`tests/unit/**/*.test.ts`）：通过 `npm run check` 运行全部测试；单独运行某个文件：`npx vitest run tests/unit/display.test.ts`。
- 端到端测试（Playwright，`tests/e2e/`，Chromium + Pixel 7，baseURL 为 `http://localhost:4173`）：**默认无法运行**——`playwright.config.ts:11` 使用了 `npm run preview`，但 `package.json` 中没有 `preview` 脚本。临时解决方法：运行 `npm run build`，然后在另一个终端执行 `npx vite preview --port 4173`，再运行 `npx playwright test`（单独运行：`npx playwright test tests/e2e/game.spec.ts`）。
- Playwright 默认把 `locale` 设为 `zh-CN`，中文文案断言依赖它；语言检测、回退和切换在 `tests/e2e/locale.spec.ts` 里用 `test.use({ locale })` 覆盖。修改界面文案时同步更新 `tests/unit/i18n.test.ts`（键名、占位符、各语言条数一致）。
- `npm run deploy` = 构建 + `wrangler deploy`。需要先运行 `npx wrangler login`。通过 Cloudflare Workers Static Assets 提供 `dist/`（配置见 `wrangler.jsonc`，`not_found_handling: 404-page`）。

## 文档与 README

- 仓库维护两份 README：`README.md`（简体中文，GitHub 默认展示）和 `README.en.md`（英语）。任何改动——标题、简介、徽标、示意图、链接、命令表、部署与多语言说明——都必须同步改两份，不能只改一份。
- 两份顶部都有语言互链（`[简体中文](README.md) · [English](README.en.md)`）。调整章节标题时同步更新互相引用的锚点：i18n 徽标在中文版指向 `#多语言`，英文版指向 `#internationalization`。
- README 素材统一放 `docs/`（如 `docs/preview.webp`），两份用同一路径引用；换图时检查两份的图片说明和链接是否仍然准确。
- README 也参与 `prettier --check .`：改完运行 `npx prettier --write README.md README.en.md`，不要手改徽标与表格的换行。
- 代码许可是 MIT（`LICENSE`，版权归 chenlongapps）；随仓库分发的 `public/zpix.woff2` 字体不在 MIT 范围内。改动许可信息时同步更新 `LICENSE`、两份 README 的「许可」章节与徽标，不要把整仓库笼统写成"全部 MIT"。

## 约定与注意事项

- TypeScript 严格模式，并启用 `noUnusedLocals`/`noUnusedParameters`；`moduleResolution: bundler`，`allowImportingTsExtensions`。ESLint 使用严格的 `typescript-eslint` 规则，仅关闭 `no-non-null-assertion`。Prettier：行宽 100、双引号、尾随逗号。
- 超时保护：`src/main.ts` 中的 `MAX_ROUND_SECONDS = 60`（自动取消），目标秒数通过 `.target` 按钮的 `data-seconds` 选择。
- 只有声音开关会通过 `localStorage` 持久化（使用 `unsafeStorage()` 防护存储访问受阻的情况）。
- UI 文案为简体中文（zh-CN）；端到端测试会断言 `aria-label`（`#dial-number`、`#status`），修改文案时请同步更新测试。
- `public/zpix.woff2` 有授权限制（个人/教育用途免费，商业用途需根据 `public/font-license.txt` 获取授权）；未经确认不要修改或替换。`public/_headers` 控制部署时的缓存和安全响应头。
