import { expect, test } from "@playwright/test";

test("target switching, start/stop flow, and sound toggle", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "凭感觉，停在那一秒。" })).toBeVisible();
  await expect(page.locator("#dial-number .digit")).toHaveCount(6);

  const tenSeconds = page.getByRole("button", { name: "10 秒" });
  await tenSeconds.click();
  await expect(tenSeconds).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "开始挑战" }).click();
  await expect(page.locator("#status")).toHaveText("计时进行中");
  await expect(page.locator("#dial-number")).toHaveAttribute("aria-label", "计时中，时间已隐藏");

  await page.keyboard.press("Space");
  await expect(page.locator("#status")).toHaveText("挑战完成");
  await expect(page.locator(".score")).toBeVisible();
  await expect(page.locator("#count")).toContainText("1");

  const soundToggle = page.getByRole("button", { name: /音效/ });
  await soundToggle.click();
  await expect(page.locator("#sound-label")).toHaveText("音效 关");
  await soundToggle.click();
  await expect(page.locator("#sound-label")).toHaveText("音效 开");
});
