import { describe, expect, it } from "vitest";
import { createDefaultTemplate, DEFAULT_TEMPLATE, getTemplateField } from "./template";

describe("DEFAULT_TEMPLATE", () => {
  it("describes the current card without field-level style overrides", () => {
    expect(DEFAULT_TEMPLATE.size).toEqual({ width: 680, height: 430 });
    expect(DEFAULT_TEMPLATE.theme).toEqual({
      cardBg: "#ffffff",
      bandColor: "#fbe2ec",
      textColor: "#2a2330",
      crestAccent: "#9b5d7a",
      baseFont: '"Noto Serif JP", serif',
      watermarkText: "COROND JOSHI GAKUIN ",
      watermarkOpacity: 0.28,
    });
    expect(DEFAULT_TEMPLATE.fields.map((field) => field.key)).toEqual([
      "schoolName",
      "schoolRoman",
      "title",
      "grade",
      "name",
      "nameRoman",
      "birth",
      "expiry",
      "statement",
      "issuer",
    ]);
    expect(DEFAULT_TEMPLATE.fields.every((field) => field.style === undefined)).toBe(true);
    expect(DEFAULT_TEMPLATE.elements.map((element) => element.id)).toContain("photo");
    expect(DEFAULT_TEMPLATE.elements.filter((element) => element.kind === "text")).toHaveLength(14);
  });

  it("creates an editable copy of the default template", () => {
    const template = createDefaultTemplate();
    getTemplateField(template, "name").value = "変更後";

    expect(getTemplateField(DEFAULT_TEMPLATE, "name").value).toBe("白峰 雪菜");
    expect(template.elements).not.toBe(DEFAULT_TEMPLATE.elements);
  });
});
