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
    const stage = {
      draw: vi.fn(),
      toDataURL: vi.fn(() => "data:image/png;base64,test"),
    } as unknown as Konva.Stage;

    await exportPng(stage);

    expect(stage.draw).toHaveBeenCalledTimes(1);
    expect(stage.toDataURL).toHaveBeenCalledWith({
      pixelRatio: 3,
      mimeType: "image/png",
    });
    expect(click).toHaveBeenCalledTimes(1);
  });
});
