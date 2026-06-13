import { describe, expect, it, vi } from "vitest";
import type { EditorDocument } from "../card/history";
import { DEFAULT_PHOTO_STATE } from "../card/photo";
import { createDefaultTemplate } from "../card/template";
import { createSavedCard, duplicateSavedCard, jsonFilename } from "./savedCards";
import { parseEditorDocumentJson, serializeEditorDocument } from "./schema";
import { scheduleDebouncedSave } from "./useDocumentPersistence";

function createDocument(): EditorDocument {
  return { template: createDefaultTemplate(), photo: { ...DEFAULT_PHOTO_STATE } };
}

describe("storage helpers", () => {
  it("round trips a valid document and rejects invalid JSON", () => {
    const doc = createDocument();
    expect(parseEditorDocumentJson(serializeEditorDocument(doc))).toEqual(doc);
    expect(() => parseEditorDocumentJson('{"format":"charashou","version":1,"doc":{}}')).toThrow();
    expect(() => parseEditorDocumentJson("not json")).toThrow();
  });

  it("creates and duplicates saved cards with stable metadata", () => {
    const doc = createDocument();
    const card = createSavedCard(doc, "  My Card  ", "data:image/png;base64,test", {
      id: "card-1",
      now: 100,
    });
    const copy = duplicateSavedCard(card, { id: "card-2", now: 200 });

    expect(card).toMatchObject({ id: "card-1", name: "My Card", createdAt: 100, updatedAt: 100 });
    expect(copy).toMatchObject({
      id: "card-2",
      name: "My Card のコピー",
      createdAt: 200,
      updatedAt: 200,
    });
    expect(jsonFilename(' My / Card: "A" ')).toBe("charashou-My-Card-A.json");
  });

  it("debounces persistence and supports cancellation", async () => {
    vi.useFakeTimers();
    const save = vi.fn();
    const cancel = scheduleDebouncedSave(save, 2000);
    await vi.advanceTimersByTimeAsync(1999);
    expect(save).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(save).toHaveBeenCalledTimes(1);

    const cancelled = vi.fn();
    const cancelSecond = scheduleDebouncedSave(cancelled, 2000);
    cancelSecond();
    await vi.advanceTimersByTimeAsync(2000);
    expect(cancelled).not.toHaveBeenCalled();
    cancel();
    vi.useRealTimers();
  });
});
