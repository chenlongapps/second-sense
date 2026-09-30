import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  use: {
    baseURL: "http://localhost:4173",
    // 默认按简体中文加载，中文文案断言由此保证；语言检测用 tests/e2e/locale.spec.ts 里的 test.use 覆盖。
    locale: "zh-CN",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run preview",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
