import type Konva from "konva";

export async function exportPng(stage: Konva.Stage): Promise<void> {
  await document.fonts.ready;
  const editorLayer = stage.findOne(".editor-ui");
  const wasVisible = editorLayer?.visible() ?? false;
  editorLayer?.hide();
  stage.draw();

  try {
    const a = document.createElement("a");
    a.href = stage.toDataURL({
      pixelRatio: 3,
      mimeType: "image/png",
    });
    a.download = "charashou.png";
    a.click();
  } finally {
    if (wasVisible) editorLayer?.show();
    stage.draw();
  }
}
