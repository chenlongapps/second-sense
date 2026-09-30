import { expect, test, type Page } from "@playwright/test";

async function setElapsedTime(page: Page, seconds: number): Promise<void> {
  await page.evaluate((milliseconds) => {
    Object.defineProperty(performance, "now", {
      configurable: true,
      value: () => milliseconds,
    });
  }, seconds * 1000);
}

async function finishRound(page: Page, seconds: number, keyboard = false): Promise<void> {
  await setElapsedTime(page, 0);
  await page.locator("#action").click();
  await setElapsedTime(page, seconds);
  if (keyboard) await page.keyboard.press("Space");
  else await page.locator("#action").click();
}

const cases = [
  { actual: 5, kind: "perfect", title: "时间掌控者", diff: "刚刚好", display: "5.00 秒" },
  { actual: 4.999, kind: "perfect", title: "时间掌控者", diff: "刚刚好", display: "5.00 秒" },
  { actual: 4.99, kind: "near-one", title: "只差一丝", diff: "提前 0.01 秒", display: "4.99 秒" },
  { actual: 5.01, kind: "near-one", title: "只差一丝", diff: "超出 0.01 秒", display: "5.01 秒" },
  { actual: 4.98, kind: "near-two", title: "擦肩而过", diff: "提前 0.02 秒", display: "4.98 秒" },
  { actual: 5.02, kind: "near-two", title: "擦肩而过", diff: "超出 0.02 秒", display: "5.02 秒" },
  { actual: 5.015, kind: "near-two", title: "擦肩而过", diff: "超出 0.02 秒", display: "5.02 秒" },
  { actual: 0.25, kind: "too-early", title: "光速下班", diff: "提前 4.75 秒", display: "0.25 秒" },
  { actual: 2.5, kind: "wild", title: "秒感已离线", diff: "提前 2.50 秒", display: "2.50 秒" },
  { actual: 7.5, kind: "wild", title: "秒感已离线", diff: "超出 2.50 秒", display: "7.50 秒" },
  { actual: 10, kind: "too-late", title: "超长待机", diff: "超出 5.00 秒", display: "10.00 秒" },
];

for (const result of cases) {
  test(`${result.actual} seconds shows the ${result.kind} easter egg`, async ({ page }) => {
    await page.goto("/");
    await finishRound(page, result.actual);

    await expect(page.locator("#status")).toHaveText("挑战完成");
    await expect(page.locator("#dial-number")).toHaveAttribute("aria-label", result.display);
    await expect(page.locator("#dial")).toHaveAttribute("data-result", result.kind);
    await expect(page.locator("#easter-egg")).toBeVisible();
    await expect(page.locator("#easter-egg")).toHaveAttribute("data-kind", result.kind);
    await expect(page.locator("#easter-egg-title")).toHaveText(result.title);
    await expect(page.locator("#easter-egg-message")).not.toBeEmpty();
    await expect(page.locator("#easter-egg-diff")).toHaveText(result.diff);
    await expect(page.locator("#dial-caption")).toBeHidden();
    await expect(page.locator(".history-actual").first()).toHaveText(`实际 ${result.display}`);
    await expect(page.locator(".history-diff").first()).toHaveText(result.diff);
    await expect(page.locator("#pixel-sparks .pixel-spark")).toHaveCount(
      result.kind === "perfect" ? 24 : result.kind === "near-one" ? 8 : 0,
    );
  });
}

for (const actual of [5.03, 5.025, 4.6, 4.52, 5.49]) {
  test(`${actual} seconds keeps ordinary feedback`, async ({ page }) => {
    await page.goto("/");
    await finishRound(page, actual);
    await expect(page.locator("#easter-egg")).toBeHidden();
    await expect(page.locator("#dial")).not.toHaveAttribute("data-result");
    await expect(page.locator("#dial-caption")).toHaveText("本轮结束。");
    await expect(page.locator("#pixel-sparks .pixel-spark")).toHaveCount(0);
    await expect(page.locator("#victory-overlay")).toBeHidden();
  });
}

test("target changes, keyboard restart, and cancellation clear the previous egg", async ({
  page,
}) => {
  await page.goto("/");
  await finishRound(page, 5, true);
  await page.getByRole("button", { name: "3 秒", exact: true }).click();
  await expect(page.locator("#easter-egg")).toBeHidden();
  await expect(page.locator("#dial")).not.toHaveAttribute("data-result");
  await expect(page.locator("#pixel-sparks .pixel-spark")).toHaveCount(0);
  await expect(page.locator("#dial-number")).toHaveAttribute("aria-label", "3.00 秒");

  await finishRound(page, 3.01, true);
  await expect(page.locator("#easter-egg-title")).toHaveText("只差一丝");
  await page.keyboard.press("Space");
  await expect(page.locator("#easter-egg")).toBeHidden();
  await expect(page.locator("#dial")).not.toHaveAttribute("data-result");
  await expect(page.locator("#pixel-sparks .pixel-spark")).toHaveCount(0);
  await expect(page.locator("#dial-caption")).toHaveText("计时中 · 凭感觉停止。");

  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator("#notice")).toHaveText("页面切换，本轮不计。");
  await expect(page.locator("#easter-egg")).toBeHidden();
  await expect(page.locator(".history-item")).toHaveCount(2);
});

test("timeout cancels without a taunt or a history entry", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await finishRound(page, 5);
  await page.locator("#action").click();
  await page.clock.runFor(60_000);
  await expect(page.locator("#notice")).toHaveText("已超过 60 秒。");
  await expect(page.locator("#easter-egg")).toBeHidden();
  await expect(page.locator("#dial")).not.toHaveAttribute("data-result");
  await expect(page.locator(".history-item")).toHaveCount(1);
});

test("reduced motion and muting preserve the result without animated particles", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator("#sound-toggle").click();
  await finishRound(page, 5);
  await expect(page.locator("#easter-egg-title")).toHaveText("时间掌控者");
  await expect(page.locator("#easter-egg")).toBeVisible();
  await expect(page.locator("#pixel-sparks")).toBeHidden();
  await expect(page.locator("#dial")).toHaveCSS("animation-name", "none");
  await expect(page.locator("#sound-toggle")).toHaveAttribute("aria-pressed", "false");
});

test("a perfect hit fills the screen with a celebration", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await finishRound(page, 5);

  const overlay = page.locator("#victory-overlay");
  await expect(overlay).toBeVisible();
  await expect(page.locator("body")).toHaveClass(/celebrating/);
  await expect(page.locator("#victory-title")).toHaveText("时间掌控者");
  await expect(page.locator("#victory-time")).toHaveText("5.00 秒");
  await expect(page.locator("#victory-message")).not.toBeEmpty();
  await expect(page.locator("#victory-confetti .victory-bit")).toHaveCount(40);
  await expect(page.locator("#easter-egg")).toBeVisible();

  const blocked = await page.evaluate(() => {
    const rect = document.getElementById("action")!.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return hit instanceof Element && hit.closest("#victory-overlay") !== null;
  });
  expect(blocked).toBe(true);

  await page.clock.runFor(2_000);
  await expect(overlay).toBeHidden();
  await expect(page.locator("body")).not.toHaveClass(/celebrating/);
  await expect(page.locator("#victory-confetti .victory-bit")).toHaveCount(0);
  await expect(page.locator("#status")).toHaveText("挑战完成");
  await expect(page.locator(".history-item")).toHaveCount(1);
});

test("tapping the celebration skips it without starting a round", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await finishRound(page, 5);
  await expect(page.locator("#victory-overlay")).toBeVisible();

  await page.locator("#victory-overlay").click();
  await expect(page.locator("#victory-overlay")).toBeHidden();
  await expect(page.locator("body")).not.toHaveClass(/celebrating/);
  await expect(page.locator("#victory-confetti .victory-bit")).toHaveCount(0);
  await expect(page.locator("#status")).toHaveText("挑战完成");
  await expect(page.locator("#action-label")).toHaveText("再挑战一次");
  await expect(page.locator("#dial-caption")).toHaveText("本轮结束。");
  await expect(page.locator(".history-item")).toHaveCount(1);
});

test("space and escape skip the celebration without starting a round", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await finishRound(page, 5);
  await page.keyboard.press("Space");
  await expect(page.locator("#victory-overlay")).toBeHidden();
  await expect(page.locator("#status")).toHaveText("挑战完成");

  await finishRound(page, 5);
  await expect(page.locator("#victory-overlay")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#victory-overlay")).toBeHidden();
  await expect(page.locator("#status")).toHaveText("挑战完成");
  await expect(page.locator(".history-item")).toHaveCount(2);
});

test("hiding the page during the celebration stops it without losing the score", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  await finishRound(page, 5);
  await expect(page.locator("#victory-overlay")).toBeVisible();

  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator("#victory-overlay")).toBeHidden();
  await expect(page.locator("#easter-egg")).toBeVisible();
  await expect(page.locator(".history-item")).toHaveCount(1);
});

test("reduced motion keeps the celebration still and legible", async ({ page }) => {
  await page.clock.install();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await finishRound(page, 5);
  await expect(page.locator("#victory-overlay")).toBeVisible();
  await expect(page.locator("#victory-confetti")).toBeHidden();
  await expect(page.locator("#victory-overlay")).toHaveCSS("animation-name", "none");
  await expect(page.locator("#victory-card")).toHaveCSS("animation-name", "none");
  await expect(page.locator("#victory-title")).toHaveText("时间掌控者");

  await page.clock.runFor(2_000);
  await expect(page.locator("#victory-overlay")).toBeHidden();
});

test("a muted celebration still covers the screen", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await page.locator("#sound-toggle").click();
  await finishRound(page, 5);
  await expect(page.locator("#victory-overlay")).toBeVisible();
  await expect(page.locator("#sound-toggle")).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("#victory-time")).toHaveText("5.00 秒");
});
