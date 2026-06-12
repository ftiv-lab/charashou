import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { forwardRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { App } from "./App";
import type { Template, TemplateElementChange } from "./card/template";

vi.mock("./components/CardPreview", () => ({
  CardPreview: forwardRef(function MockCardPreview({
    template,
    photoDataUrl,
    onElementChange,
  }: {
    template: Template;
    photoDataUrl: string;
    onElementChange: (id: string, change: TemplateElementChange) => void;
  }) {
    return (
      <>
        <div
          data-testid="card-preview-state"
          data-template={JSON.stringify(template)}
          data-photo={photoDataUrl}
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

describe("App", () => {
  it("passes text field edits into the template preview state", () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("氏名"), {
      target: { value: "朝霞 ひより" },
    });

    expect(fieldValue(currentTemplate(), "name")?.value).toBe("朝霞 ひより");
  });

  it("passes theme and field style edits, then restores defaults", () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("帯の色"), {
      target: { value: "#123456" },
    });
    fireEvent.change(screen.getByLabelText("氏名 サイズ"), {
      target: { value: "32" },
    });
    fireEvent.change(screen.getByLabelText("氏名 揃え"), {
      target: { value: "right" },
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
  });

  it("passes an uploaded photo data URL into the preview", async () => {
    render(<App />);

    const file = new File(["photo"], "photo.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("顔写真"), {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByTestId("card-preview-state").getAttribute("data-photo")).toMatch(
        /^data:image\/png;base64,/,
      );
    });
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
  });
});
