import type Konva from "konva";
import { afterEach, describe, expect, it, vi } from "vitest";
import { exportPng } from "./export";

describe("exportPng", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("waits for fonts and downloads a 3x Konva PNG", async () => {
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);
    const editorLayer = {
      visible: vi.fn(() => true),
      hide: vi.fn(),
      show: vi.fn(),
    };
    const stage = {
      draw: vi.fn(),
      toDataURL: vi.fn(() => "data:image/png;base64,test"),
      findOne: vi.fn(() => editorLayer),
    } as unknown as Konva.Stage;

    await exportPng(stage);

    expect(stage.findOne).toHaveBeenCalledWith(".editor-ui");
    expect(editorLayer.hide).toHaveBeenCalledTimes(1);
    expect(editorLayer.show).toHaveBeenCalledTimes(1);
    expect(stage.draw).toHaveBeenCalledTimes(2);
    expect(stage.toDataURL).toHaveBeenCalledWith({
      pixelRatio: 3,
      mimeType: "image/png",
    });
    expect(click).toHaveBeenCalledTimes(1);
  });
});
