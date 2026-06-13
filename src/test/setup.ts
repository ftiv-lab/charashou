import "@testing-library/jest-dom/vitest";
import "fake-indexeddb/auto";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { db } from "../storage/db";

afterEach(async () => {
  cleanup();
  await db.cards.clear();
  await db.meta.clear();
});

Object.defineProperty(document, "fonts", {
  configurable: true,
  value: {
    ready: Promise.resolve(),
  },
});
