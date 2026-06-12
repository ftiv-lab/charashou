import type { PhotoState } from "./photo";
import type { Template } from "./template";

export const HISTORY_LIMIT = 50;

export type EditorDocument = {
  template: Template;
  photo: PhotoState;
};

export type HistoryState = {
  past: EditorDocument[];
  present: EditorDocument;
  future: EditorDocument[];
  lastMergeKey?: string;
};

export type HistoryAction =
  | { type: "EDIT"; next: EditorDocument; mergeKey?: string }
  | { type: "RESET"; next: EditorDocument }
  | { type: "UNDO" }
  | { type: "REDO" };

export function createHistoryState(present: EditorDocument): HistoryState {
  return { past: [], present, future: [] };
}

function appendPast(past: EditorDocument[], present: EditorDocument): EditorDocument[] {
  return [...past, present].slice(-HISTORY_LIMIT);
}

export function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case "EDIT":
      if (action.mergeKey && action.mergeKey === state.lastMergeKey) {
        return {
          past: state.past,
          present: action.next,
          future: [],
          lastMergeKey: action.mergeKey,
        };
      }
      return {
        past: appendPast(state.past, state.present),
        present: action.next,
        future: [],
        lastMergeKey: action.mergeKey,
      };
    case "RESET":
      return {
        past: appendPast(state.past, state.present),
        present: action.next,
        future: [],
      };
    case "UNDO": {
      const previous = state.past[state.past.length - 1];
      if (!previous) return { ...state, lastMergeKey: undefined };
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
      };
    }
    case "REDO": {
      const next = state.future[0];
      if (!next) return { ...state, lastMergeKey: undefined };
      return {
        past: appendPast(state.past, state.present),
        present: next,
        future: state.future.slice(1),
      };
    }
  }
}
