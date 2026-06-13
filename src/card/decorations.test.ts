import { describe, expect, it } from "vitest";
import {
  applyDecorationPreset,
  createPatternGenerator,
  createPatternMarks,
  getCrestOutlinePoints,
  isDecorationPresetActive,
  normalizePatternGenerator,
  resolveDecorationColor,
  updatePatternGenerator,
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
    "repeatText",
    "stripe",
    "dots",
    "rosetteLite",
  ] as const)("creates stable drawing marks for the %s pattern", (kind) => {
    const marks = createPatternMarks(createPatternGenerator(kind), 160, 90);
    expect(marks.length).toBeGreaterThan(0);
    expect(new Set(marks.map((mark) => mark.id)).size).toBe(marks.length);
  });

  it("maps generator parameters into the expected mark geometry", () => {
    const textMarks = createPatternMarks(
      { ...createPatternGenerator("repeatText"), text: "ID", angle: -12, spacing: 64 },
      160,
      90,
    );
    expect(textMarks[0]).toMatchObject({ kind: "text", text: "ID", rotation: -12 });

    const stripeMarks = createPatternMarks(
      { ...createPatternGenerator("stripe"), angle: 20, spacing: 24, strokeWidth: 0.75 },
      160,
      90,
    );
    expect(stripeMarks[0]).toMatchObject({ kind: "line", rotation: 20, strokeWidth: 0.75 });
    expect(stripeMarks.some((mark) => mark.kind === "line" && mark.rotation === 110)).toBe(true);

    const rosetteMarks = createPatternMarks(
      { ...createPatternGenerator("rosetteLite"), loops: 12, radius: 16, amplitude: 3 },
      160,
      90,
    );
    expect(rosetteMarks[0]).toMatchObject({ kind: "rosette", strokeWidth: 0.5 });
    expect(rosetteMarks[0]?.kind === "rosette" ? rosetteMarks[0].points.length : 0).toBeGreaterThan(
      200,
    );
  });

  it("normalizes legacy generators and updates template state immutably", () => {
    expect(
      normalizePatternGenerator({ type: "pattern", kind: "dot", opacity: 0.08 }),
    ).toMatchObject({ kind: "dots", spacing: 30, radius: 1.25, opacity: 0.08 });
    const template = createDefaultTemplate();
    const nextGenerator = createPatternGenerator("repeatText");
    const changed = updatePatternGenerator(template, nextGenerator);
    expect(changed.elements.find((element) => element.kind === "pattern")?.generator).toEqual(
      nextGenerator,
    );
    expect(template.elements.find((element) => element.kind === "pattern")?.generator).not.toEqual(
      nextGenerator,
    );
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
