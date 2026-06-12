import { describe, expect, it } from "vitest";
import { calculatePhotoCrop, MAX_PHOTO_BYTES, validatePhotoFile } from "./photo";

describe("photo utilities", () => {
  it("calculates cover crop with zoom and clamped pan offsets", () => {
    expect(
      calculatePhotoCrop(
        { width: 400, height: 200 },
        { width: 100, height: 100 },
        { zoom: 2, offsetX: 1, offsetY: -1 },
      ),
    ).toEqual({ x: 300, y: 0, width: 100, height: 100 });

    expect(
      calculatePhotoCrop(
        { width: 400, height: 200 },
        { width: 100, height: 100 },
        { zoom: 9, offsetX: 4, offsetY: -4 },
      ),
    ).toEqual({ x: 400 - 200 / 3, y: 0, width: 200 / 3, height: 200 / 3 });
  });

  it("accepts PNG, JPEG and WebP files within 10MB", () => {
    for (const type of ["image/png", "image/jpeg", "image/webp"]) {
      expect(validatePhotoFile(new File(["image"], "photo", { type }))).toBeUndefined();
    }
  });

  it("rejects unsupported types and oversized files before reading", () => {
    expect(validatePhotoFile(new File(["svg"], "photo.svg", { type: "image/svg+xml" }))).toBe(
      "PNG、JPEG、WebP形式の画像を選択してください。",
    );
    expect(
      validatePhotoFile(
        new File([new Uint8Array(MAX_PHOTO_BYTES + 1)], "photo.png", { type: "image/png" }),
      ),
    ).toBe("画像サイズは10MB以下にしてください。");
  });
});
