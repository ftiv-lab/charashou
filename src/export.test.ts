import html2canvas from "html2canvas";
import { afterEach, describe, expect, it, vi } from "vitest";
import { exportPng } from "./export";

vi.mock("html2canvas", () => ({
  default: vi.fn(async () => ({
    toDataURL: () => "data:image/png;base64,test",
  })),
}));

describe("exportPng", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("waits for fonts and downloads a scaled PNG", async () => {
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);
    const node = document.createElement("div");

    await exportPng(node);

    expect(html2canvas).toHaveBeenCalledWith(node, {
      scale: 3,
      backgroundColor: "#ffffff",
      useCORS: true,
    });
    expect(click).toHaveBeenCalledTimes(1);
  });
});
