import { expect, test } from "@playwright/test";

const PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR42mP8z8Dwn4GBgYGJAQoAHxcCAtp6uZQAAAAASUVORK5CYII=";

test("core card workflow stays intact", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("氏名", { exact: true }).fill("朝霞 ひより");
  await expect(page.locator('[data-field="name"]')).toHaveText("朝霞 ひより");

  await page.getByLabel("顔写真").setInputFiles({
    name: "photo.png",
    mimeType: "image/png",
    buffer: Buffer.from(PNG_BASE64, "base64"),
  });
  await expect(page.locator("#photo")).toHaveClass(/on/);
  await expect(page.locator("#photo")).toHaveAttribute("src", /^data:image\/png;base64,/);

  const cardBox = await page.locator("#card").boundingBox();
  expect(Math.round(cardBox?.width ?? 0)).toBe(680);
  expect(Math.round(cardBox?.height ?? 0)).toBe(430);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "PNGで保存" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("charashou.png");
});
