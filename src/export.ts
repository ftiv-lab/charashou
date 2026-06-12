import type Konva from "konva";

export async function exportPng(stage: Konva.Stage): Promise<void> {
  await document.fonts.ready;
  stage.draw();

  const a = document.createElement("a");
  a.href = stage.toDataURL({
    pixelRatio: 3,
    mimeType: "image/png",
  });
  a.download = "charashou.png";
  a.click();
}
