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

  it("reflects theme and field style edits, then restores defaults", () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("帯の色"), {
      target: { value: "#123456" },
    });
    fireEvent.change(screen.getByLabelText("氏名 サイズ"), {
      target: { value: "32" },
    });
    fireEvent.change(screen.getByLabelText("氏名 揃え"), {
      target: { value: "right" },
    });
    fireEvent.change(screen.getByLabelText("透かし文字"), {
      target: { value: "" },
    });

    const card = document.querySelector<HTMLElement>("#card");
    const name = document.querySelector<HTMLElement>('[data-field="name"]');
    expect(card?.style.getPropertyValue("--pink")).toBe("#123456");
    expect(name).toHaveStyle({ fontSize: "32px", textAlign: "right" });
    expect(document.querySelector("#wm")).toBeEmptyDOMElement();

    fireEvent.click(screen.getByRole("button", { name: "既定に戻す" }));

    expect(card?.style.getPropertyValue("--pink")).toBe("#fbe2ec");
    expect(name).not.toHaveStyle({ fontSize: "32px", textAlign: "right" });
    expect(document.querySelector("#wm")).toHaveTextContent("COROND JOSHI GAKUIN");
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
