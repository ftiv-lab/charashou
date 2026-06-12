import { mkdir } from "node:fs/promises";
import path from "node:path";
import { expect, type Page, test } from "@playwright/test";

const screenshotDirectory = path.resolve("docs/screenshots");

async function openApp(page: Page) {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole("img", { name: "カードプレビュー" })).toBeVisible();
}

async function capture(page: Page, filename: string) {
  await page.screenshot({
    path: path.join(screenshotDirectory, filename),
    animations: "disabled",
  });
}

async function createPlaceholderPhoto(page: Page): Promise<Buffer> {
  const base64 = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 760;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas context was not available");

    const background = context.createLinearGradient(0, 0, 600, 760);
    background.addColorStop(0, "#7bc8d6");
    background.addColorStop(0.55, "#6875b9");
    background.addColorStop(1, "#d785a7");
    context.fillStyle = background;
    context.fillRect(0, 0, 600, 760);

    context.fillStyle = "rgba(255, 255, 255, 0.18)";
    for (const [x, y, radius] of [
      [88, 105, 28],
      [505, 180, 42],
      [470, 625, 24],
    ] as const) {
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }

    context.fillStyle = "#282746";
    context.beginPath();
    context.arc(300, 260, 112, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.moveTo(112, 760);
    context.quadraticCurveTo(145, 430, 300, 420);
    context.quadraticCurveTo(455, 430, 488, 760);
    context.closePath();
    context.fill();

    context.fillStyle = "#f3d8ca";
    context.beginPath();
    context.arc(300, 275, 82, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#282746";
    context.beginPath();
    context.arc(270, 270, 7, 0, Math.PI * 2);
    context.arc(330, 270, 7, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "#a65b72";
    context.lineWidth = 5;
    context.beginPath();
    context.arc(300, 294, 24, 0.2, Math.PI - 0.2);
    context.stroke();

    return canvas.toDataURL("image/png").split(",")[1];
  });

  return Buffer.from(base64, "base64");
}

test("generate review screenshots", async ({ page }) => {
  await mkdir(screenshotDirectory, { recursive: true });

  await openApp(page);
  await capture(page, "01-overview.png");

  await page.getByLabel("氏名", { exact: true }).fill("星宮 ルナ");
  const nameEditor = page.locator(".field-editor").filter({
    has: page.getByLabel("氏名", { exact: true }),
  });
  await nameEditor.getByText("スタイル", { exact: true }).click();
  await nameEditor.getByLabel("氏名 サイズ").fill("34");
  await nameEditor.getByLabel("氏名 フォント").selectOption('"Noto Sans JP", sans-serif');
  await page.getByLabel("カード背景").fill("#f4fbff");
  await page.getByLabel("帯の色").fill("#dce8ff");
  await page.getByLabel("文字色", { exact: true }).fill("#24324f");
  await page.getByLabel("校章アクセント").fill("#d45886");
  await capture(page, "02-customize.png");

  await openApp(page);
  const photo = await createPlaceholderPhoto(page);
  await page.getByLabel("顔写真").setInputFiles({
    name: "generated-character.png",
    mimeType: "image/png",
    buffer: photo,
  });
  await page.getByLabel("ズーム").fill("1.45");
  await page.getByLabel("横位置").fill("0.25");
  await page.getByLabel("縦位置").fill("-0.2");
  await capture(page, "03-photo.png");

  await openApp(page);
  const card = page.getByRole("img", { name: "カードプレビュー" });
  const cardBox = await card.boundingBox();
  if (!cardBox) throw new Error("Card preview was not laid out");
  await card.click({ position: { x: 387, y: 205 } });
  await expect(card).toHaveAttribute("data-selected-element", "name");
  await page.mouse.move(cardBox.x + 387, cardBox.y + 205);
  await page.mouse.down();
  await page.mouse.move(cardBox.x + 342, cardBox.y + 205, { steps: 8 });
  await expect(card).not.toHaveAttribute("data-guide-count", "0");
  await capture(page, "04-editor.png");
  await page.mouse.up();

  await openApp(page);
  await page.addStyleTag({
    content: `
      .topbar, .stage { display: none !important; }
      .app { display: block !important; max-width: 620px; padding: 24px; }
      .property-panel { max-height: none !important; width: 560px; }
    `,
  });
  await page.locator(".field-editor").first().getByText("スタイル", { exact: true }).click();
  await page.locator(".property-panel").screenshot({
    path: path.join(screenshotDirectory, "05-panel.png"),
    animations: "disabled",
  });
});
