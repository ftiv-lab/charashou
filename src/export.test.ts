import type Konva from "konva";
import { afterEach, describe, expect, it, vi } from "vitest";
import { exportPng } from "./export";

describe("exportPng", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("waits for fonts and downloads a 3x Konva PNG blob", async () => {
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
      toBlob: vi.fn(async () => new Blob(["png"], { type: "image/png" })),
      findOne: vi.fn(() => editorLayer),
    } as unknown as Konva.Stage;
    const createObjectURL = vi.fn(() => "blob:charashou");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });

    await exportPng(stage);

    expect(stage.findOne).toHaveBeenCalledWith(".editor-ui");
    expect(editorLayer.hide).toHaveBeenCalledTimes(1);
    expect(editorLayer.show).toHaveBeenCalledTimes(1);
    expect(stage.draw).toHaveBeenCalledTimes(2);
    expect(stage.toBlob).toHaveBeenCalledWith({
      pixelRatio: 3,
      mimeType: "image/png",
    });
    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:charashou");
    expect(click).toHaveBeenCalledTimes(1);
  });
});
