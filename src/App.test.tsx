import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type Konva from "konva";
import { forwardRef, useImperativeHandle } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import type { PhotoState } from "./card/photo";
import type { Template, TemplateElementChange } from "./card/template";
import { exportPng } from "./export";

vi.mock("./export", () => ({ exportPng: vi.fn() }));

vi.mock("./components/CardPreview", () => ({
  CardPreview: forwardRef(function MockCardPreview(
    {
      template,
      photo,
      onElementChange,
    }: {
      template: Template;
      photo: PhotoState;
      onElementChange: (id: string, change: TemplateElementChange) => void;
    },
    ref,
  ) {
    useImperativeHandle(ref, () => ({}) as Konva.Stage);
    return (
      <>
        <div
          data-testid="card-preview-state"
          data-template={JSON.stringify(template)}
          data-photo={JSON.stringify(photo)}
        />
        <button
          type="button"
          onClick={() =>
            onElementChange("name", {
              x: 300,
              y: 190,
              width: 315,
              height: 52.5,
              fontSize: 35,
            })
          }
        >
          mock transform
        </button>
      </>
    );
  }),
}));

function currentTemplate(): Template {
  const value = screen.getByTestId("card-preview-state").getAttribute("data-template");
  if (!value) throw new Error("Template state was not rendered");
  return JSON.parse(value) as Template;
}

function fieldValue(template: Template, key: string) {
  return template.fields.find((field) => field.key === key);
}

function currentPhoto(): PhotoState {
  const value = screen.getByTestId("card-preview-state").getAttribute("data-photo");
  if (!value) throw new Error("Photo state was not rendered");
  return JSON.parse(value) as PhotoState;
}

function selectPanelTab(name: "内容" | "デザイン" | "写真" | "マイカード") {
  fireEvent.click(screen.getByRole("tab", { name }));
}

describe("App", () => {
  beforeEach(() => {
    vi.mocked(exportPng).mockReset();
    vi.mocked(exportPng).mockResolvedValue();
  });

  it("exposes accessible tabs and supports arrow-key navigation", () => {
    render(<App />);

    const content = screen.getByRole("tab", { name: "内容" });
    const design = screen.getByRole("tab", { name: "デザイン" });
    expect(screen.getByRole("tablist", { name: "編集パネル" })).toBeInTheDocument();
    expect(content).toHaveAttribute("aria-selected", "true");
    expect(content).toHaveAttribute("aria-controls", "panel-content");
    expect(screen.getByRole("tabpanel", { name: "内容" })).toBeVisible();

    content.focus();
    fireEvent.keyDown(content, { key: "ArrowRight" });
    expect(design).toHaveFocus();
    expect(design).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "デザイン" })).toBeVisible();

    fireEvent.keyDown(design, { key: "End" });
    expect(screen.getByRole("tab", { name: "マイカード" })).toHaveFocus();
  });

  it("passes text field edits into the template preview state", () => {
    render(<App />);

    expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Redo" })).toBeDisabled();

    fireEvent.change(screen.getByLabelText("氏名"), {
      target: { value: "朝霞 ひより" },
    });

    expect(fieldValue(currentTemplate(), "name")?.value).toBe("朝霞 ひより");
    expect(screen.getByRole("button", { name: "Undo" })).toBeEnabled();
  });

  it("coalesces consecutive field input and supports buttons and keyboard shortcuts", () => {
    render(<App />);
    const nameInput = screen.getByLabelText("氏名");

    fireEvent.change(nameInput, { target: { value: "朝霞" } });
    fireEvent.change(nameInput, { target: { value: "朝霞 ひより" } });
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(nameInput).toHaveValue("白峰 雪菜");
    expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Redo" }));
    expect(nameInput).toHaveValue("朝霞 ひより");
    fireEvent.keyDown(window, { key: "z", ctrlKey: true });
    expect(nameInput).toHaveValue("白峰 雪菜");
    fireEvent.keyDown(window, { key: "z", ctrlKey: true, shiftKey: true });
    expect(nameInput).toHaveValue("朝霞 ひより");
    fireEvent.keyDown(window, { key: "z", ctrlKey: true });
    fireEvent.keyDown(window, { key: "y", ctrlKey: true });
    expect(nameInput).toHaveValue("朝霞 ひより");
  });

  it("passes theme and field style edits, then restores defaults", () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("氏名 サイズ"), {
      target: { value: "32" },
    });
    fireEvent.change(screen.getByLabelText("氏名 揃え"), {
      target: { value: "right" },
    });
    selectPanelTab("デザイン");
    fireEvent.change(screen.getByLabelText("帯の色"), {
      target: { value: "#123456" },
    });
    fireEvent.change(screen.getByLabelText("透かし文字"), {
      target: { value: "" },
    });

    const changed = currentTemplate();
    expect(changed.theme.bandColor).toBe("#123456");
    expect(changed.theme.watermarkText).toBe("");
    expect(fieldValue(changed, "name")?.style).toMatchObject({
      fontSize: 32,
      align: "right",
    });

    fireEvent.click(screen.getByRole("button", { name: "既定に戻す" }));

    const restored = currentTemplate();
    expect(restored.theme.bandColor).toBe("#fbe2ec");
    expect(restored.theme.watermarkText).toBe("COROND JOSHI GAKUIN ");
    expect(fieldValue(restored, "name")?.style).toBeUndefined();

    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    const undoReset = currentTemplate();
    expect(undoReset.theme.bandColor).toBe("#123456");
    expect(undoReset.theme.watermarkText).toBe("");
    expect(fieldValue(undoReset, "name")?.style).toMatchObject({
      fontSize: 32,
      align: "right",
    });
  });

  it("validates uploads and passes photo adjustments into the preview", async () => {
    render(<App />);
    selectPanelTab("写真");

    const input = screen.getByLabelText("顔写真");
    expect(input).toHaveAttribute("accept", "image/png,image/jpeg,image/webp");
    fireEvent.change(input, {
      target: {
        files: [new File(["svg"], "photo.svg", { type: "image/svg+xml" })],
      },
    });
    expect(document.querySelector(".photo-error")).toHaveTextContent(
      "PNG、JPEG、WebP形式の画像を選択してください。",
    );

    const file = new File(["photo"], "photo.png", { type: "image/png" });
    fireEvent.change(input, {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(currentPhoto().dataUrl).toMatch(/^data:image\/png;base64,/);
    });
    expect(document.querySelector(".photo-error")).toBeEmptyDOMElement();

    const uploadedDataUrl = currentPhoto().dataUrl;
    fireEvent.change(screen.getByLabelText("ズーム"), { target: { value: "1.5" } });
    fireEvent.change(screen.getByLabelText("ズーム"), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(currentPhoto()).toMatchObject({ dataUrl: uploadedDataUrl, zoom: 1 });
    fireEvent.click(screen.getByRole("button", { name: "Redo" }));
    expect(currentPhoto()).toMatchObject({ dataUrl: uploadedDataUrl, zoom: 2 });
    fireEvent.change(screen.getByLabelText("横位置"), { target: { value: "0.5" } });
    fireEvent.change(screen.getByLabelText("縦位置"), { target: { value: "-0.5" } });
    expect(currentPhoto()).toMatchObject({ zoom: 2, offsetX: 0.5, offsetY: -0.5 });

    fireEvent.click(screen.getByRole("button", { name: "既定に戻す" }));
    expect(currentPhoto()).toMatchObject({ zoom: 2, offsetX: 0.5, offsetY: -0.5 });
  });

  it("stores position and text resize changes from the canvas", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "mock transform" }));

    const template = currentTemplate();
    expect(template.elements.find((element) => element.id === "name")).toMatchObject({
      x: 300,
      y: 190,
      width: 315,
      height: 52.5,
    });
    expect(fieldValue(template, "name")?.style?.fontSize).toBe(35);

    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(currentTemplate().elements.find((element) => element.id === "name")).toMatchObject({
      x: 282,
      y: 184,
      width: 210,
      height: 42,
    });
    fireEvent.click(screen.getByRole("button", { name: "Redo" }));
    expect(currentTemplate().elements.find((element) => element.id === "name")).toMatchObject({
      x: 300,
      y: 190,
      width: 315,
      height: 52.5,
    });
  });

  it("disables export while saving and announces success", async () => {
    let finishExport: (() => void) | undefined;
    vi.mocked(exportPng).mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finishExport = resolve;
        }),
    );
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "PNGで保存" }));
    expect(screen.getByRole("button", { name: "保存中…" })).toBeDisabled();
    expect(screen.getByText("保存中です。")).toHaveAttribute("aria-live", "polite");

    finishExport?.();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "PNGで保存" })).toBeEnabled();
    });
    expect(screen.getByText("PNGを保存しました。")).toHaveAttribute("aria-live", "polite");
  });

  it("announces export failures", async () => {
    vi.mocked(exportPng).mockRejectedValue(new Error("failed"));
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "PNGで保存" }));

    await waitFor(() => {
      expect(screen.getByText(/PNGの保存に失敗しました/)).toHaveAttribute("aria-live", "polite");
    });
    expect(screen.getByRole("button", { name: "PNGで保存" })).toBeEnabled();
  });
});
