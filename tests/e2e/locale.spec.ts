import { expect, test, type Page } from "@playwright/test";

async function chooseLocale(page: Page, locale: string): Promise<void> {
  await page.locator("#locale-toggle").click();
  await expect(page.locator("#locale-menu")).toBeVisible();
  await page.locator(`#locale-menu [data-locale="${locale}"]`).click();
  await expect(page.locator("#locale-menu")).toBeHidden();
}

async function expectLocaleShown(page: Page, locale: string, label: string): Promise<void> {
  await expect(page.locator("#locale-toggle")).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#locale-current")).toHaveText(label);
  await expect(page.locator(`#locale-menu [data-locale="${locale}"]`)).toHaveAttribute(
    "aria-selected",
    "true",
  );
}

async function setElapsedTime(page: Page, seconds: number): Promise<void> {
  await page.evaluate((milliseconds) => {
    Object.defineProperty(performance, "now", {
      configurable: true,
      value: () => milliseconds,
    });
  }, seconds * 1000);
}

async function finishRound(page: Page, seconds: number): Promise<void> {
  await setElapsedTime(page, 0);
  await page.locator("#action").click();
  await setElapsedTime(page, seconds);
  await page.locator("#action").click();
}

test.describe("English browser", () => {
  test.use({ locale: "en-US" });

  test("opens in English", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page).toHaveTitle("Second Sense · Pixel Stopwatch Challenge");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Stop at that one second — by feel.",
    );
    await expect(page.locator("#status")).toHaveText("Ready");
    await expect(page.locator("#dial-label")).toHaveText("Target time");
    await expect(page.locator("#dial-caption")).toHaveText("Click to start.");
    await expect(page.getByRole("button", { name: "3s", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "10s", exact: true })).toBeVisible();
    await expect(page.getByRole("group", { name: "Pick a target duration" })).toBeVisible();
    await expect(page.locator("#history-title")).toHaveText("Last 5 rounds");
    await expect(page.locator("#history-empty")).toHaveText("No rounds yet");
    await expect(page.locator("#action-label")).toHaveText("Start the challenge");
    await expect(page.locator(".keyboard-hint")).toHaveText("Space to start / stop");
    await expect(page.locator("#sound-label")).toHaveText("Sound on");
    await expect(page.locator("#sound-toggle")).toHaveAttribute(
      "aria-label",
      "Sound on, click to mute",
    );
    await expectLocaleShown(page, "en", "English");
  });

  test("plays and reports a round in English", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Start the challenge" }).click();
    await expect(page.locator("#status")).toHaveText("Timing");
    await expect(page.locator("#dial-number")).toHaveAttribute(
      "aria-label",
      "Timing — the time is hidden",
    );

    await page.locator("#action").click();
    await expect(page.locator("#status")).toHaveText("Round complete");
    await expect(page.locator("#dial-number")).toHaveAttribute("aria-label", /^\d+\.\d{2}s$/);
    await expect(page.locator(".history-target").first()).toHaveText("Target 5s");
    await expect(page.locator(".history-actual").first()).toHaveText(/^Actual \d+\.\d{2}s$/);
    await expect(page.locator("#action-label")).toHaveText("Play again");
  });
});

test.describe("unsupported browser language", () => {
  test.use({ locale: "fr-FR" });

  test("falls back to English", async ({ page }) => {
    await page.goto("/");
    await expectLocaleShown(page, "en", "English");
    await expect(page.locator("#status")).toHaveText("Ready");
  });
});

test.describe("Japanese browser", () => {
  test.use({ locale: "ja-JP" });

  test("opens in Japanese", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "ja");
    await expect(page.locator("#status")).toHaveText("準備完了");
    await expect(page.getByRole("button", { name: "3秒", exact: true })).toBeVisible();
    await expectLocaleShown(page, "ja", "日本語");
    await expect(page.locator("#sound-label")).toHaveText("サウンド オン");
  });
});

test.describe("Korean browser", () => {
  test.use({ locale: "ko-KR" });

  test("opens in Korean", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#status")).toHaveText("준비 완료");
    await expect(page.locator("#history-title")).toHaveText("최근 5회 기록");
    await expectLocaleShown(page, "ko", "한국어");
  });
});

test.describe("traditional Chinese browser", () => {
  test.use({ locale: "zh-Hant-TW" });

  test("opens in traditional Chinese", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-TW");
    await expect(page.locator("#status")).toHaveText("準備就緒");
    await expect(page.locator(".keyboard-hint")).toHaveText("空白鍵開始 / 停止");
    await expectLocaleShown(page, "zh-TW", "繁體中文");
  });
});

test("a saved language wins over the browser language and survives reloads", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.setItem("second-sense-locale", "es");
  });
  await page.reload();

  await expectLocaleShown(page, "es", "Español");
  await expect(page.locator("#status")).toHaveText("Listo");

  await page.reload();
  await expectLocaleShown(page, "es", "Español");
  await expect(page.locator("#history-title")).toHaveText("Últimas 5 rondas");

  await chooseLocale(page, "zh-CN");
  await page.reload();
  await expectLocaleShown(page, "zh-CN", "简体中文");
  await expect(page.locator("#status")).toHaveText("准备就绪");
});

test("switching language translates a running round without stopping it", async ({ page }) => {
  await page.goto("/");
  await page.locator("#action").click();
  await expect(page.locator("#status")).toHaveText("计时进行中");

  await chooseLocale(page, "ko");
  await expect(page.locator("html")).toHaveAttribute("lang", "ko");
  await expect(page.locator("#status")).toHaveText("시간 측정 중");
  await expect(page.locator("#action-label")).toHaveText("측정 정지");
  await expect(page.locator("#dial-label")).toHaveText("목표 5초");
  await expect(page.locator("#dial-caption")).toHaveText("측정 중 · 감각으로 멈추세요.");
  await expect(page.locator("#dial-number")).toHaveAttribute("aria-label", "측정 중, 시간은 숨김");
  await expect(page.locator("body")).toHaveClass(/is-running/);

  await page.locator("#action").click();
  await expect(page.locator("#status")).toHaveText("도전 완료");
  await expect(page.locator("#dial-label")).toHaveText("실제 시간");
  await expect(page.locator("#action-label")).toHaveText("다시 도전");
});

test("switching language re-translates results, history, and the celebration", async ({ page }) => {
  await page.goto("/");
  await finishRound(page, 5);

  await expect(page.locator("#easter-egg-title")).toHaveText("时间掌控者");
  await expect(page.locator("#easter-egg-diff")).toHaveText("刚刚好");
  await expect(page.locator("#dial-number")).toHaveAttribute("aria-label", "5.00 秒");
  await expect(page.locator(".history-target").first()).toHaveText("目标 5 秒");
  await expect(page.locator(".history-actual").first()).toHaveText("实际 5.00 秒");
  await expect(page.locator(".history-diff").first()).toHaveText("刚刚好");
  await expect(page.locator("#victory-title")).toHaveText("时间掌控者");
  await expect(page.locator("#victory-time")).toHaveText("5.00 秒");

  await page.keyboard.press("Escape");
  await expect(page.locator("#victory-overlay")).toBeHidden();

  await chooseLocale(page, "es");
  await expect(page.locator("#easter-egg-title")).toHaveText("Dueño del tiempo");
  await expect(page.locator("#easter-egg-diff")).toHaveText("Exacto");
  await expect(page.locator("#easter-egg-message")).not.toBeEmpty();
  await expect(page.locator("#dial-number")).toHaveAttribute("aria-label", "5.00 s");
  await expect(page.locator("#dial-label")).toHaveText("Tiempo real");
  await expect(page.locator("#dial-caption")).toHaveText("Fin de la ronda.");
  await expect(page.locator("#status")).toHaveText("Ronda completa");
  await expect(page.locator(".history-target").first()).toHaveText("Objetivo 5 s");
  await expect(page.locator(".history-actual").first()).toHaveText("Real 5.00 s");
  await expect(page.locator(".history-diff").first()).toHaveText("Exacto");
  await expect(page.getByRole("button", { name: "10 s", exact: true })).toBeVisible();
  await expect(page.locator("#dial")).toHaveAttribute("data-result", "perfect");
  await expect(page.locator("#pixel-sparks .pixel-spark")).toHaveCount(24);
});

test("the language menu is a custom pixel dropdown", async ({ page }) => {
  await page.goto("/");
  const toggle = page.locator("#locale-toggle");
  const menu = page.locator("#locale-menu");

  await expect(menu).toBeHidden();
  await expect(toggle).toHaveAttribute("aria-haspopup", "listbox");
  await expect(toggle).toHaveAttribute("aria-label", "当前语言：简体中文，点击切换");
  await expect(menu).toHaveAttribute("role", "listbox");
  await expect(menu.locator(".locale-option")).toHaveCount(6);

  await toggle.click();
  await expect(menu).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(menu.locator(".locale-option.is-active")).toHaveText("简体中文");
  await expect(menu).toHaveAttribute("aria-activedescendant", "locale-option-zh-CN");

  // 菜单铺满六种语言的原文名称，当前语言高亮。
  await expect(menu.locator(".locale-option")).toHaveText([
    "简体中文",
    "繁體中文",
    "English",
    "日本語",
    "한국어",
    "Español",
  ]);
  await expect(menu.locator('[data-locale="zh-CN"]')).toHaveAttribute("aria-selected", "true");
  await expect(menu.locator('[data-locale="en"]')).toHaveAttribute("aria-selected", "false");

  // 点外面收起，再点按钮重新展开。
  await page.locator("#dial-caption").click();
  await expect(menu).toBeHidden();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");

  await toggle.click();
  await expect(menu).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(toggle).toBeFocused();
});

test("the language menu is keyboard driven and never double-fires the space bar", async ({
  page,
}) => {
  await page.goto("/");
  const menu = page.locator("#locale-menu");

  await page.locator("#locale-toggle").focus();
  await page.keyboard.press("ArrowDown");
  await expect(menu).toBeVisible();
  await expect(menu.locator(".locale-option.is-active")).toHaveText("简体中文");

  await page.keyboard.press("ArrowDown");
  await expect(menu.locator(".locale-option.is-active")).toHaveText("繁體中文");
  await page.keyboard.press("End");
  await expect(menu.locator(".locale-option.is-active")).toHaveText("Español");
  await page.keyboard.press("Home");
  await expect(menu.locator(".locale-option.is-active")).toHaveText("简体中文");

  // 空格只负责选中语言，不会顺手把游戏开了。
  await page.keyboard.press(" ");
  await expect(menu).toBeHidden();
  await expectLocaleShown(page, "zh-CN", "简体中文");
  await expect(page.locator("#status")).toHaveText("准备就绪");
  await expect(page.locator("#action-label")).toHaveText("开始挑战");

  await page.keyboard.press("Enter");
  await expect(menu).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-TW");
  await expectLocaleShown(page, "zh-TW", "繁體中文");
  await expect(page.locator("#status")).toHaveText("準備就緒");
  await expect(page.locator("#action-label")).toHaveText("開始挑戰");
});
