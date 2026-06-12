import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

const PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR42mP8z8Dwn4GBgYGJAQoAHxcCAtp6uZQAAAAASUVORK5CYII=";

test("core Konva card workflow stays intact", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);

  const card = page.getByRole("img", { name: "カードプレビュー" });
  const canvas = card.locator("canvas").first();
  await expect(card).toHaveAttribute("data-renderer", "konva");
  await expect(canvas).toBeVisible();

  const initial = await canvas.screenshot();
  expect(initial.byteLength).toBeGreaterThan(1000);

  await page.getByLabel("氏名", { exact: true }).fill("朝霞 ひより");
  const nameEditor = page.locator(".field-editor").filter({
    has: page.getByLabel("氏名", { exact: true }),
  });
  await nameEditor.getByText("スタイル", { exact: true }).click();
  await nameEditor.getByLabel("氏名 サイズ").fill("32");
  await nameEditor.getByLabel("氏名 揃え").selectOption("right");
  await page.getByLabel("帯の色").fill("#123456");
  await page.getByLabel("透かし文字").fill("");

  await expect.poll(async () => Buffer.compare(await canvas.screenshot(), initial)).not.toBe(0);
  const customized = await canvas.screenshot();

  await page.getByRole("button", { name: "既定に戻す" }).click();
  await expect(page.getByLabel("氏名", { exact: true })).toHaveValue("白峰 雪菜");
  await expect(page.getByLabel("帯の色")).toHaveValue("#fbe2ec");
  await expect(page.getByLabel("透かし文字")).toHaveValue("COROND JOSHI GAKUIN ");
  await expect.poll(async () => Buffer.compare(await canvas.screenshot(), customized)).not.toBe(0);

  const beforePhoto = await canvas.screenshot();
  await page.getByLabel("顔写真").setInputFiles({
    name: "photo.png",
    mimeType: "image/png",
    buffer: Buffer.from(PNG_BASE64, "base64"),
  });
  await expect.poll(async () => Buffer.compare(await canvas.screenshot(), beforePhoto)).not.toBe(0);

  const cardBox = await card.boundingBox();
  expect(Math.round(cardBox?.width ?? 0)).toBe(680);
  expect(Math.round(cardBox?.height ?? 0)).toBe(430);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "PNGで保存" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("charashou.png");
  const downloadPath = await download.path();
  expect(downloadPath).not.toBeNull();
  const png = await readFile(downloadPath as string);
  expect(png.readUInt32BE(16)).toBe(2040);
  expect(png.readUInt32BE(20)).toBe(1290);
});

test("content elements can be selected, snapped, resized and reset", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);

  const card = page.getByRole("img", { name: "カードプレビュー" });
  const canvas = card.locator("canvas").first();
  const initial = await canvas.screenshot();
  const cardBox = await card.boundingBox();
  if (!cardBox) throw new Error("Card preview was not laid out");

  await card.click({ position: { x: 52, y: 46 } });
  await expect(card).toHaveAttribute("data-selected-element", "crest");
  await card.click({ position: { x: 95, y: 199 } });
  await expect(card).toHaveAttribute("data-selected-element", "photo");
  await card.click({ position: { x: 637, y: 377 } });
  await expect(card).toHaveAttribute("data-selected-element", "seal");
  await card.click({ position: { x: 387, y: 205 } });
  await expect(card).toHaveAttribute("data-selected-element", "name");

  await page.mouse.move(cardBox.x + 387, cardBox.y + 205);
  await page.mouse.down();
  await page.mouse.move(cardBox.x + 342, cardBox.y + 205, { steps: 8 });
  await expect(card).not.toHaveAttribute("data-guide-count", "0");
  await page.mouse.up();
  await expect(card).toHaveAttribute("data-guide-count", "0");
  await expect.poll(async () => Buffer.compare(await canvas.screenshot(), initial)).not.toBe(0);
  const moved = await canvas.screenshot();

  await page.mouse.move(cardBox.x + 449, cardBox.y + 230);
  await page.mouse.down();
  await page.mouse.move(cardBox.x + 479, cardBox.y + 245, { steps: 6 });
  await page.mouse.up();
  await expect(page.getByLabel("氏名 サイズ")).not.toHaveValue("");
  await expect(page.getByLabel("氏名 サイズ")).not.toHaveValue("28");
  await expect.poll(async () => Buffer.compare(await canvas.screenshot(), moved)).not.toBe(0);

  await page.keyboard.press("Escape");
  await expect(card).toHaveAttribute("data-selected-element", "");
  await card.click({ position: { x: 5, y: 5 } });
  await expect(card).toHaveAttribute("data-selected-element", "");

  await page.getByRole("button", { name: "既定に戻す" }).click();
  await expect(page.getByLabel("氏名 サイズ")).toHaveValue("");
  await expect.poll(async () => Buffer.compare(await canvas.screenshot(), initial)).toBe(0);
});
