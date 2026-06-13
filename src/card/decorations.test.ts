import { describe, expect, it } from "vitest";
import {
  applyDecorationPreset,
  createPatternMarks,
  getCrestOutlinePoints,
  isDecorationPresetActive,
  resolveDecorationColor,
} from "./decorations";
import { createDefaultTemplate } from "./template";

describe("parametric decorations", () => {
  it("resolves theme colors and creates crest outlines", () => {
    expect(resolveDecorationColor(undefined, "#123456")).toBe("#123456");
    expect(resolveDecorationColor("#abcdef", "#123456")).toBe("#abcdef");
    expect(getCrestOutlinePoints("circle", 64, 64)).toBeUndefined();
    expect(getCrestOutlinePoints("shield", 64, 64)).toHaveLength(12);
    expect(getCrestOutlinePoints("diamond", 64, 64)).toEqual([32, 1, 63, 32, 32, 63, 1, 32]);
  });

  it.each([
    "stripe",
    "dot",
    "wave",
    "rosette",
  ] as const)("creates stable drawing marks for the %s pattern", (kind) => {
    const marks = createPatternMarks({ type: "pattern", kind, opacity: 0.1 }, 160, 90);
    expect(marks.length).toBeGreaterThan(0);
    expect(new Set(marks.map((mark) => mark.id)).size).toBe(marks.length);
  });

  it("applies presets without mutating the source template", () => {
    const template = createDefaultTemplate();
    const changed = applyDecorationPreset(template, "crest", "shield");
    const crest = changed.elements.find((element) => element.kind === "crest");

    expect(crest?.generator).toMatchObject({ initials: "CG", shape: "shield" });
    expect(isDecorationPresetActive(changed, "crest", "shield")).toBe(true);
    expect(isDecorationPresetActive(template, "crest", "classic")).toBe(true);
    expect(changed).not.toBe(template);
  });

  it("keeps legacy watermark theme fields synchronized with presets", () => {
    const changed = applyDecorationPreset(createDefaultTemplate(), "watermark", "monogram");
    const watermark = changed.elements.find((element) => element.kind === "watermark");

    expect(watermark?.generator).toMatchObject({ text: "CR ", angle: -30, opacity: 0.12 });
    expect(changed.theme).toMatchObject({ watermarkText: "CR ", watermarkOpacity: 0.12 });
  });
});
