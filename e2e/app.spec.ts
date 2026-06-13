import { readFile } from "node:fs/promises";
import { expect, type Page, test } from "@playwright/test";

async function openPanelTab(page: Page, name: "内容" | "デザイン" | "写真" | "マイカード") {
  await page.getByRole("tab", { name }).click();
}

async function downloadPng(page: Page): Promise<Buffer> {
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "PNGで保存" }).click();
  const download = await downloadPromise;
  const downloadPath = await download.path();
  if (!downloadPath) throw new Error("PNG download path was not available");
  return readFile(downloadPath);
}

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
  await openPanelTab(page, "デザイン");
  await page.getByLabel("帯の色").fill("#123456");
  await page.getByLabel("透かし文字").fill("");

  await expect.poll(async () => Buffer.compare(await canvas.screenshot(), initial)).not.toBe(0);
  const customized = await canvas.screenshot();

  await page.getByRole("button", { name: "既定に戻す" }).click();
  await openPanelTab(page, "内容");
  await expect(page.getByLabel("氏名", { exact: true })).toHaveValue("白峰 雪菜");
  await openPanelTab(page, "デザイン");
  await expect(page.getByLabel("帯の色")).toHaveValue("#fbe2ec");
  await expect(page.getByLabel("透かし文字")).toHaveValue("COROND JOSHI GAKUIN ");
  await expect.poll(async () => Buffer.compare(await canvas.screenshot(), customized)).not.toBe(0);

  const photoBase64 = await page.evaluate(() => {
    const source = document.createElement("canvas");
    source.width = 40;
    source.height = 40;
    const context = source.getContext("2d");
    if (!context) throw new Error("Canvas context was not available");
    for (const [color, x, y] of [
      ["#ff0000", 0, 0],
      ["#0000ff", 20, 0],
      ["#00ff00", 0, 20],
      ["#ffff00", 20, 20],
    ] as const) {
      context.fillStyle = color;
      context.fillRect(x, y, 20, 20);
    }
    return source.toDataURL("image/png").split(",")[1];
  });
  await openPanelTab(page, "写真");
  const photoInput = page.getByLabel("顔写真");
  await expect(photoInput).toHaveAttribute("accept", "image/png,image/jpeg,image/webp");
  await photoInput.setInputFiles({
    name: "photo.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from("<svg></svg>"),
  });
  const photoError = page.locator(".photo-error");
  await expect(photoError).toHaveText("PNG、JPEG、WebP形式の画像を選択してください。");
  await expect(photoError).toHaveAttribute("aria-live", "assertive");

  const beforePhoto = await canvas.screenshot();
  await photoInput.setInputFiles({
    name: "photo.png",
    mimeType: "image/png",
    buffer: Buffer.from(photoBase64, "base64"),
  });
  await expect(photoError).toBeEmpty();
  await expect.poll(async () => Buffer.compare(await canvas.screenshot(), beforePhoto)).not.toBe(0);

  const uploaded = await canvas.screenshot();
  await page.getByLabel("ズーム").fill("2");
  await expect.poll(async () => Buffer.compare(await canvas.screenshot(), uploaded)).not.toBe(0);
  const zoomed = await canvas.screenshot();
  await page.getByLabel("横位置").fill("1");
  await expect.poll(async () => Buffer.compare(await canvas.screenshot(), zoomed)).not.toBe(0);
  const movedHorizontally = await canvas.screenshot();
  await page.getByLabel("縦位置").fill("-1");
  await expect
    .poll(async () => Buffer.compare(await canvas.screenshot(), movedHorizontally))
    .not.toBe(0);

  await page.getByRole("button", { name: "既定に戻す" }).click();
  await expect(page.getByLabel("ズーム")).toHaveValue("2");
  await expect(page.getByLabel("横位置")).toHaveValue("1");
  await expect(page.getByLabel("縦位置")).toHaveValue("-1");

  const cardBox = await card.boundingBox();
  expect(Math.round(cardBox?.width ?? 0)).toBe(680);
  expect(Math.round(cardBox?.height ?? 0)).toBe(430);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "PNGで保存" }).click();
  await expect(page.getByText("PNGを保存しました。")).toHaveAttribute("aria-live", "polite");
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("charashou.png");
  const downloadPath = await download.path();
  expect(downloadPath).not.toBeNull();
  const png = await readFile(downloadPath as string);
  expect(png.readUInt32BE(16)).toBe(2040);
  expect(png.readUInt32BE(20)).toBe(1290);
});

test("undo and redo coalesce edits and support keyboard shortcuts", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);

  const undo = page.getByRole("button", { name: "Undo" });
  const redo = page.getByRole("button", { name: "Redo" });
  const name = page.getByLabel("氏名", { exact: true });
  await expect(undo).toBeDisabled();
  await expect(redo).toBeDisabled();

  await name.click();
  await page.keyboard.press("Control+A");
  await name.pressSequentially("Asaka Hiyori");
  await expect(name).toHaveValue("Asaka Hiyori");
  await undo.click();
  await expect(name).toHaveValue("白峰 雪菜");
  await expect(undo).toBeDisabled();
  await redo.click();
  await expect(name).toHaveValue("Asaka Hiyori");

  await openPanelTab(page, "デザイン");
  const bandColor = page.getByLabel("帯の色");
  await bandColor.fill("#123456");
  await page.keyboard.press("Control+Z");
  await expect(bandColor).toHaveValue("#fbe2ec");
  await page.keyboard.press("Control+Shift+Z");
  await expect(bandColor).toHaveValue("#123456");
  await page.keyboard.press("Control+Z");
  await page.keyboard.press("Control+Y");
  await expect(bandColor).toHaveValue("#123456");

  await page.getByRole("button", { name: "既定に戻す" }).click();
  await openPanelTab(page, "内容");
  await expect(name).toHaveValue("白峰 雪菜");
  await undo.click();
  await expect(name).toHaveValue("Asaka Hiyori");
  await openPanelTab(page, "デザイン");
  await expect(bandColor).toHaveValue("#123456");
});

test("editable background patterns persist and are included in PNG export", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);

  const card = page.getByRole("img", { name: "カードプレビュー" });
  const canvas = card.locator("canvas").first();
  const initialCanvas = await canvas.screenshot();
  const initialPng = await downloadPng(page);

  await openPanelTab(page, "デザイン");
  await page.getByRole("button", { name: "校章 シールド" }).click();
  await page.getByRole("button", { name: "印 証明印" }).click();
  await page.getByRole("button", { name: "透かし モノグラム" }).click();
  await page.getByRole("button", { name: "背景 ストライプ" }).click();
  await page.getByLabel("地紋 種類").selectOption("repeatText");
  await page.getByLabel("地紋 テキスト").fill("CHARACTER FILE");
  await page.getByLabel("地紋 角度").fill("-18");
  await page.getByLabel("地紋 間隔").fill("74");
  await page.getByLabel("地紋 濃さ").fill("0.08");
  await page.getByLabel("テーマ色を使用").uncheck();
  await page.getByLabel("地紋 色").fill("#456789");
  await expect
    .poll(async () => Buffer.compare(await canvas.screenshot(), initialCanvas))
    .not.toBe(0);

  await openPanelTab(page, "マイカード");
  await expect(page.locator(".storage-status")).toHaveText("自動保存しました。", {
    timeout: 5000,
  });
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
  await openPanelTab(page, "デザイン");
  await expect(page.getByRole("button", { name: "校章 シールド" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("button", { name: "印 証明印" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("button", { name: "透かし モノグラム" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByLabel("地紋 種類")).toHaveValue("repeatText");
  await expect(page.getByLabel("地紋 テキスト")).toHaveValue("CHARACTER FILE");
  await expect(page.getByLabel("地紋 角度")).toHaveValue("-18");
  await expect(page.getByLabel("地紋 間隔")).toHaveValue("74");
  await expect(page.getByLabel("地紋 濃さ")).toHaveValue("0.08");
  await expect(page.getByLabel("テーマ色を使用")).not.toBeChecked();
  await expect(page.getByLabel("地紋 色")).toHaveValue("#456789");

  const restoredPng = await downloadPng(page);
  expect(Buffer.compare(restoredPng, initialPng)).not.toBe(0);
  expect(restoredPng.readUInt32BE(16)).toBe(2040);
  expect(restoredPng.readUInt32BE(20)).toBe(1290);
});

test("text selection opens the right inspector and edits the shared template state", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);

  const card = page.getByRole("img", { name: "カードプレビュー" });
  const canvas = card.locator("canvas").first();
  const before = await canvas.screenshot();

  await card.click({ position: { x: 387, y: 205 } });
  await expect(card).toBeFocused();
  await expect(card).toHaveAttribute("data-selected-element", "name");
  await expect(page.getByRole("heading", { name: "選択中：氏名（テキスト）" })).toBeVisible();
  await expect(page.getByText("氏名を選択しました。")).toHaveAttribute("aria-live", "polite");
  await expect(page.getByRole("button", { name: "インスペクタを閉じる" })).toHaveAttribute(
    "aria-expanded",
    "true",
  );

  await page.getByLabel("インスペクタ 文字サイズ").fill("38");
  await expect.poll(async () => Buffer.compare(await canvas.screenshot(), before)).not.toBe(0);
  await expect(page.getByLabel("氏名 サイズ")).toHaveValue("38");

  await page.keyboard.press("Escape");
  await expect(card).toHaveAttribute("data-selected-element", "");
  await expect(page.locator("#right-inspector")).toHaveCount(0);
});

test("photo and crest selections expose their shared inspector controls", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);

  const photoBase64 = await page.evaluate(() => {
    const source = document.createElement("canvas");
    source.width = 40;
    source.height = 40;
    const context = source.getContext("2d");
    if (!context) throw new Error("Canvas context was not available");
    context.fillStyle = "#ff4d6d";
    context.fillRect(0, 0, 20, 40);
    context.fillStyle = "#3d7bff";
    context.fillRect(20, 0, 20, 40);
    return source.toDataURL("image/png").split(",")[1];
  });
  await openPanelTab(page, "写真");
  await page.getByLabel("顔写真").setInputFiles({
    name: "inspector-photo.png",
    mimeType: "image/png",
    buffer: Buffer.from(photoBase64, "base64"),
  });

  const card = page.getByRole("img", { name: "カードプレビュー" });
  const canvas = card.locator("canvas").first();
  const cardBox = await card.boundingBox();
  if (!cardBox) throw new Error("Card preview was not laid out");

  await page.mouse.move(cardBox.x + 95, cardBox.y + 199);
  await expect(card).toHaveAttribute("data-hovered-element", "photo");
  await expect(card.locator(".konvajs-content")).toHaveCSS("cursor", "pointer");
  await card.click({ position: { x: 95, y: 199 } });
  await expect(card).toBeFocused();
  await expect(card).toHaveAttribute("data-selected-element", "photo");
  await expect(page.getByRole("heading", { name: "選択中：写真（写真）" })).toBeVisible();
  await expect(page.getByText("写真を選択しました。")).toHaveAttribute("aria-live", "polite");
  await expect(page.getByLabel("インスペクタ X")).toBeVisible();
  await expect(page.getByLabel("インスペクタ Y")).toBeVisible();
  await expect(page.getByLabel("インスペクタ 幅")).toBeVisible();
  await expect(page.getByLabel("インスペクタ 高さ")).toBeVisible();

  const beforeZoom = await canvas.screenshot();
  await page.getByLabel("インスペクタ ズーム").fill("2");
  await expect.poll(async () => Buffer.compare(await canvas.screenshot(), beforeZoom)).not.toBe(0);

  await card.click({ position: { x: 52, y: 46 } });
  await expect(card).toHaveAttribute("data-selected-element", "crest");
  await expect(page.getByRole("heading", { name: "選択中：校章（校章）" })).toBeVisible();
  await expect(page.getByLabel("インスペクタ 幅")).toBeVisible();
  await expect(page.getByLabel("インスペクタ 高さ")).toBeVisible();
  await expect(page.getByLabel("インスペクタ ズーム")).toHaveCount(0);
});

test("saved cards, autosave and JSON backup restore documents", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "storage", {
      configurable: true,
      value: {
        persist: async () => {
          localStorage.setItem("persist-called", "yes");
          return true;
        },
      },
    });
  });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("persist-called"))).toBe("yes");

  const name = page.getByLabel("氏名", { exact: true });
  await name.fill("保存対象 キャラ");
  await openPanelTab(page, "マイカード");
  await expect(page.locator(".storage-status")).toHaveText("自動保存しました。", {
    timeout: 5000,
  });

  await page.reload();
  await page.evaluate(() => document.fonts.ready);
  await expect(name).toHaveValue("保存対象 キャラ");
  await expect(page.getByRole("button", { name: "Undo" })).toBeDisabled();

  await openPanelTab(page, "マイカード");
  const saveName = page.getByLabel("保存名", { exact: true });
  await saveName.fill("カードA");
  await page.getByRole("button", { name: "現在カードを保存" }).click();
  await expect(page.locator(".saved-card")).toHaveCount(1);
  await expect(page.locator(".saved-card-thumbnail")).toHaveAttribute("src", /^data:image\/png/);

  await openPanelTab(page, "内容");
  await name.fill("未保存の変更");
  await openPanelTab(page, "マイカード");
  const cardA = page
    .locator(".saved-card")
    .filter({ has: page.getByRole("textbox", { name: "カードA の保存名" }) });
  await cardA.getByRole("button", { name: "開く" }).click();
  await openPanelTab(page, "内容");
  await expect(name).toHaveValue("保存対象 キャラ");
  await expect(page.getByRole("button", { name: "Undo" })).toBeDisabled();

  await openPanelTab(page, "マイカード");
  await cardA.getByRole("button", { name: "複製" }).click();
  await expect(page.locator(".saved-card")).toHaveCount(2);
  const savedCardBoxes = await page.locator(".saved-card").evaluateAll((cards) =>
    cards.map((card) => {
      const box = card.getBoundingClientRect();
      return { x: box.x, y: box.y };
    }),
  );
  expect(Math.abs(savedCardBoxes[0].y - savedCardBoxes[1].y)).toBeLessThan(2);
  expect(savedCardBoxes[0].x).not.toBe(savedCardBoxes[1].x);
  const copyName = page.getByRole("textbox", { name: "カードA のコピー の保存名" });
  await copyName.fill("カードB");
  const cardB = page.locator(".saved-card").filter({ has: copyName });
  await cardB.getByRole("button", { name: "改名" }).click();
  const renamedCard = page
    .locator(".saved-card")
    .filter({ has: page.getByRole("textbox", { name: "カードB の保存名" }) });
  await expect(renamedCard).toBeVisible();
  await renamedCard.getByRole("button", { name: "削除" }).click();
  await expect(page.locator(".saved-card")).toHaveCount(1);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "JSON書き出し" }).click();
  const jsonDownload = await downloadPromise;
  expect(jsonDownload.suggestedFilename()).toBe("charashou-カードA.json");
  const jsonPath = await jsonDownload.path();
  expect(jsonPath).not.toBeNull();

  await openPanelTab(page, "内容");
  await name.fill("JSON前の変更");
  await openPanelTab(page, "マイカード");
  await page.getByLabel("JSON読み込み").setInputFiles(jsonPath as string);
  await openPanelTab(page, "内容");
  await expect(name).toHaveValue("保存対象 キャラ");
  await expect(page.getByRole("button", { name: "Undo" })).toBeDisabled();
  await openPanelTab(page, "マイカード");
  await expect(page.locator(".storage-action-status")).toHaveText("JSONを読み込みました。");

  await page.getByLabel("JSON読み込み").setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"invalid":true}'),
  });
  await expect(page.locator(".storage-error")).toHaveText("JSONの形式が正しくありません。");
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
  await page.getByRole("button", { name: "インスペクタを閉じる" }).click();
  await card.click({ position: { x: 637, y: 377 } });
  await expect(card).toHaveAttribute("data-selected-element", "seal");
  await page.getByRole("button", { name: "インスペクタを閉じる" }).click();
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

  await page.getByRole("button", { name: "Undo" }).click();
  await expect.poll(async () => Buffer.compare(await canvas.screenshot(), moved)).not.toBe(0);
  await expect(page.getByRole("button", { name: "Undo" })).toBeDisabled();
  await expect(card).toHaveAttribute("data-selected-element", "name");
  await page.getByRole("button", { name: "Redo" }).click();
  await expect.poll(async () => Buffer.compare(await canvas.screenshot(), moved)).toBe(0);
  await expect(card).toHaveAttribute("data-selected-element", "name");

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
