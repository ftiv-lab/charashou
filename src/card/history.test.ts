import { describe, expect, it } from "vitest";
import { createHistoryState, type EditorDocument, HISTORY_LIMIT, historyReducer } from "./history";
import { DEFAULT_PHOTO_STATE } from "./photo";
import { createDefaultTemplate } from "./template";

function documentWithName(name: string): EditorDocument {
  const template = createDefaultTemplate();
  return {
    template: {
      ...template,
      fields: template.fields.map((field) =>
        field.key === "name" ? { ...field, value: name } : field,
      ),
    },
    photo: { ...DEFAULT_PHOTO_STATE },
  };
}

describe("historyReducer", () => {
  it("edits, undoes and redoes documents while clearing redo on a new edit", () => {
    const initial = documentWithName("initial");
    const edited = documentWithName("edited");
    const replacement = documentWithName("replacement");
    let state = historyReducer(createHistoryState(initial), { type: "EDIT", next: edited });

    expect(state).toMatchObject({ past: [initial], present: edited, future: [] });
    state = historyReducer(state, { type: "UNDO" });
    expect(state).toMatchObject({ past: [], present: initial, future: [edited] });
    state = historyReducer(state, { type: "REDO" });
    expect(state).toMatchObject({ past: [initial], present: edited, future: [] });
    state = historyReducer(historyReducer(state, { type: "UNDO" }), {
      type: "EDIT",
      next: replacement,
    });
    expect(state).toMatchObject({ present: replacement, future: [] });
  });

  it("coalesces consecutive edits with the same merge key", () => {
    const initial = documentWithName("initial");
    const first = documentWithName("f");
    const second = documentWithName("final");
    let state = historyReducer(createHistoryState(initial), {
      type: "EDIT",
      next: first,
      mergeKey: "field:name",
    });
    state = historyReducer(state, {
      type: "EDIT",
      next: second,
      mergeKey: "field:name",
    });

    expect(state.past).toEqual([initial]);
    expect(historyReducer(state, { type: "UNDO" }).present).toBe(initial);
  });

  it("breaks the merge chain after undo, redo and independent edits", () => {
    const initial = documentWithName("initial");
    const first = documentWithName("first");
    const second = documentWithName("second");
    let state = historyReducer(createHistoryState(initial), {
      type: "EDIT",
      next: first,
      mergeKey: "field:name",
    });
    state = historyReducer(state, { type: "UNDO" });
    state = historyReducer(state, { type: "REDO" });
    state = historyReducer(state, {
      type: "EDIT",
      next: second,
      mergeKey: "field:name",
    });

    expect(state.past).toEqual([initial, first]);
  });

  it("stores reset as an undoable entry", () => {
    const initial = documentWithName("initial");
    const reset = documentWithName("default");
    const state = historyReducer(createHistoryState(initial), { type: "RESET", next: reset });

    expect(state.present).toBe(reset);
    expect(historyReducer(state, { type: "UNDO" }).present).toBe(initial);
  });

  it("loads a document while clearing all history", () => {
    const initial = documentWithName("initial");
    const edited = documentWithName("edited");
    const loaded = documentWithName("loaded");
    const editedState = historyReducer(createHistoryState(initial), { type: "EDIT", next: edited });
    const state = historyReducer(editedState, { type: "LOAD", next: loaded });

    expect(state).toEqual(createHistoryState(loaded));
  });

  it("keeps only the most recent history entries", () => {
    let state = createHistoryState(documentWithName("0"));
    for (let index = 1; index <= HISTORY_LIMIT + 5; index += 1) {
      state = historyReducer(state, { type: "EDIT", next: documentWithName(String(index)) });
    }

    expect(state.past).toHaveLength(HISTORY_LIMIT);
    expect(state.past[0].template.fields.find((field) => field.key === "name")?.value).toBe("5");
  });
});
