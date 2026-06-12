import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});

Object.defineProperty(document, "fonts", {
  configurable: true,
  value: {
    ready: Promise.resolve(),
  },
});
