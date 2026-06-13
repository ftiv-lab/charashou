import Dexie, { type EntityTable } from "dexie";
import type { EditorDocument } from "../card/history";

export type SavedCard = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  thumbnail: string;
  doc: EditorDocument;
};

export type MetaEntry = {
  key: string;
  value: unknown;
  updatedAt: number;
};

class CharashouDatabase extends Dexie {
  cards!: EntityTable<SavedCard, "id">;
  meta!: EntityTable<MetaEntry, "key">;

  constructor() {
    super("charashou");
    this.version(1).stores({
      cards: "id, updatedAt",
      meta: "key",
    });
  }
}

export const db = new CharashouDatabase();
