import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App", () => {
  it("reflects text field edits into the card preview", () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("氏名"), {
      target: { value: "朝霞 ひより" },
    });

    expect(document.querySelector('[data-field="name"]')).toHaveTextContent("朝霞 ひより");
  });

  it("loads an uploaded photo as a data URL", async () => {
    render(<App />);

    const file = new File(["photo"], "photo.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("顔写真"), {
      target: { files: [file] },
    });

    await waitFor(() => {
      const photo = document.querySelector<HTMLImageElement>("#photo");
      expect(photo).toHaveClass("on");
      expect(photo?.src).toMatch(/^data:image\/png;base64,/);
    });
  });
});
