import { expect, test, type Locator, type Page } from "@playwright/test";

const CHEAT_CLICKS = 5;

async function rapidClicks(target: Locator, count = CHEAT_CLICKS): Promise<void> {
  for (let i = 0; i < count; i += 1) await target.click();
}

async function skipCelebrationIfAny(page: Page): Promise<void> {
  const overlay = page.locator("#victory-overlay");
  if (await overlay.isVisible()) await overlay.click();
  await expect(overlay).toBeHidden();
}

test("five rapid clicks on one target auto-play a round with a visible display", async ({
  page,
}) => {
  await page.goto("/");

  const threeSeconds = page.getByRole("button", { name: "3 秒", exact: true });
  await rapidClicks(threeSeconds);

  await expect(page.locator("#status")).toHaveText("外挂计时中");
  await expect(page.locator("#dial-caption")).toHaveText("外挂：数码管实时可见，到点自动停。");
  await expect(page.locator("body")).toHaveClass(/is-running/);
  await expect(page.locator("#dial-number")).toHaveAttribute("aria-label", /^\d+\.\d{2} 秒$/);
  await expect(page.locator("#dial-number")).not.toHaveAttribute(
    "aria-label",
    "计时中，时间已隐藏",
  );

  const first = await page.locator("#dial-number").getAttribute("aria-label");
  await page.waitForTimeout(700);
  const second = await page.locator("#dial-number").getAttribute("aria-label");
  expect(second).not.toBe(first);

  await expect(page.locator("#status")).toHaveText("挑战完成", { timeout: 10_000 });
  await expect(page.locator("#dial-number")).toHaveAttribute("aria-label", /^\d\.\d{2} 秒$/);
  await expect(page.locator("#dial-caption")).toHaveText("本轮结束。");
  await skipCelebrationIfAny(page);
  await expect(page.locator(".history-item")).toHaveCount(1);
  await expect(page.locator(".history-target").first()).toHaveText("目标 3 秒");
  await expect(page.locator(".history-actual").first()).toHaveText(/^实际 3\.\d{2} 秒$/);
});

test("the cheat only lasts one round and hides the time again next round", async ({ page }) => {
  await page.goto("/");
  await rapidClicks(page.getByRole("button", { name: "3 秒", exact: true }));
  await expect(page.locator("#status")).toHaveText("挑战完成", { timeout: 10_000 });
  await skipCelebrationIfAny(page);

  await page.getByRole("button", { name: "再挑战一次" }).click();
  await expect(page.locator("#status")).toHaveText("计时进行中");
  await expect(page.locator("#dial-number")).toHaveAttribute("aria-label", "计时中，时间已隐藏");

  await page.locator("#action").click();
  await expect(page.locator("#status")).toHaveText("挑战完成");
  await skipCelebrationIfAny(page);
  await expect(page.locator(".history-item")).toHaveCount(2);
});

test("stopping a cheat round early ends the cheat", async ({ page }) => {
  await page.goto("/");
  await rapidClicks(page.getByRole("button", { name: "10 秒", exact: true }));
  await expect(page.locator("#status")).toHaveText("外挂计时中");

  await page.locator("#action").click();
  await expect(page.locator("#status")).toHaveText("挑战完成");
  await expect(page.locator("#action-label")).toHaveText("再挑战一次");
  await skipCelebrationIfAny(page);
  await expect(page.locator(".history-item")).toHaveCount(1);
  await expect(page.locator(".history-actual").first()).toHaveText(
    /^实际 0\.\d{2} 秒|1\.\d{2} 秒$/,
  );
});

test("clicks spread over targets or slowed down do not cheat", async ({ page }) => {
  await page.goto("/");

  const threeSeconds = page.getByRole("button", { name: "3 秒", exact: true });
  const fiveSeconds = page.getByRole("button", { name: "5 秒", exact: true });
  for (const button of [threeSeconds, fiveSeconds, threeSeconds, fiveSeconds, threeSeconds]) {
    await button.click();
  }
  await expect(page.locator("#status")).toHaveText("准备就绪");
  await expect(page.locator("#dial-number")).toHaveAttribute("aria-label", "3.00 秒");

  await page.waitForTimeout(1200);
  await rapidClicks(fiveSeconds, 4);
  await expect(page.locator("#status")).toHaveText("准备就绪");
  await expect(page.locator("#dial-number")).toHaveAttribute("aria-label", "5.00 秒");
  await expect(page.locator(".history-item")).toHaveCount(0);
});
