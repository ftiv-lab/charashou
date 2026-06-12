import { expect, test } from "@playwright/test";

const PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR42mP8z8Dwn4GBgYGJAQoAHxcCAtp6uZQAAAAASUVORK5CYII=";

test("core card workflow stays intact", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("氏名", { exact: true }).fill("朝霞 ひより");
  await expect(page.locator('[data-field="name"]')).toHaveText("朝霞 ひより");

  const nameEditor = page.locator(".field-editor").filter({
    has: page.getByLabel("氏名", { exact: true }),
  });
  await nameEditor.getByText("スタイル", { exact: true }).click();
  await nameEditor.getByLabel("氏名 サイズ").fill("32");
  await nameEditor.getByLabel("氏名 揃え").selectOption("right");
  await expect(page.locator('[data-field="name"]')).toHaveCSS("font-size", "32px");
  await expect(page.locator('[data-field="name"]')).toHaveCSS("text-align", "right");

  await page.getByLabel("帯の色").fill("#123456");
  await expect(page.locator("#card")).toHaveCSS("--pink", "#123456");

  await page.getByLabel("透かし文字").fill("");
  await expect(page.locator("#wm")).toBeEmpty();

  await page.getByRole("button", { name: "既定に戻す" }).click();
  await expect(page.locator('[data-field="name"]')).toHaveText("白峰 雪菜");
  await expect(page.locator('[data-field="name"]')).toHaveCSS("font-size", "28px");
  await expect(page.locator("#card")).toHaveCSS("--pink", "#fbe2ec");
  await expect(page.locator("#wm")).toContainText("COROND JOSHI GAKUIN");

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
