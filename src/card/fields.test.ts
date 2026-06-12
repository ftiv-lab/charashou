import { describe, expect, it } from "vitest";
import { DEFAULT_FIELD_VALUES, FIELDS } from "./fields";

describe("FIELDS", () => {
  it("keeps every text field backed by a default value", () => {
    expect(FIELDS.map((field) => field.key)).toEqual([
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

    for (const field of FIELDS) {
      expect(DEFAULT_FIELD_VALUES[field.key]).toEqual(expect.any(String));
      expect(DEFAULT_FIELD_VALUES[field.key].length).toBeGreaterThan(0);
    }
  });
});
