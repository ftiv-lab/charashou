import { describe, expect, it } from "vitest";
import {
  elementChangeFromTransform,
  getGuideStops,
  snapDragPosition,
  snapResizeBounds,
} from "./editor";
import { createDefaultTemplate, getTemplateField } from "./template";

describe("editor geometry", () => {
  it("snaps a dragged element to the card center and returns guides", () => {
    const template = createDefaultTemplate();
    const stops = getGuideStops(template.size, template.elements, "name");
    const result = snapDragPosition({ x: 233, y: 180, width: 210, height: 42 }, stops);

    expect(result.x).toBe(235);
    expect(result.guides).toContainEqual({ orientation: "vertical", position: 340 });
  });

  it("snaps a resize edge without shrinking below the minimum", () => {
    const result = snapResizeBounds({ x: 20, y: 104, width: 146, height: 190 }, "middle-right", {
      vertical: [170],
      horizontal: [],
    });

    expect(result.bounds.width).toBe(150);
    expect(result.guides).toEqual([{ orientation: "vertical", position: 170 }]);
  });

  it("converts text scale into width, height and font size", () => {
    const template = createDefaultTemplate();
    const element = template.elements.find((candidate) => candidate.id === "name");
    if (!element) throw new Error("name element missing");

    const change = elementChangeFromTransform(element, {
      x: 300,
      y: 190,
      scaleX: 1.5,
      scaleY: 1.25,
    });

    expect(change).toMatchObject({
      x: 300,
      y: 190,
      width: 315,
      height: 52.5,
      fontSize: 35,
    });
    expect(getTemplateField(template, "name").style).toBeUndefined();
  });
});
