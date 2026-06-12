import type Konva from "konva";

export async function exportPng(stage: Konva.Stage): Promise<void> {
  await document.fonts.ready;
  const editorLayer = stage.findOne(".editor-ui");
  const wasVisible = editorLayer?.visible() ?? false;
  editorLayer?.hide();
  stage.draw();

  try {
    const result = await stage.toBlob({
      pixelRatio: 3,
      mimeType: "image/png",
    });
    if (!(result instanceof Blob)) {
      throw new Error("PNG blob could not be created");
    }

    const objectUrl = URL.createObjectURL(result);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = "charashou.png";
    try {
      a.click();
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  } finally {
    if (wasVisible) editorLayer?.show();
    stage.draw();
  }
}
