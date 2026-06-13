import type Konva from "konva";
import type { EditorDocument } from "../card/history";
import type { SavedCard } from "./db";

export function defaultSavedCardName(doc: EditorDocument, now = new Date()): string {
  const stamp = new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
  return `${doc.template.name} ${stamp}`;
}

export function createSavedCard(
  doc: EditorDocument,
  name: string,
  thumbnail: string,
  options?: { id?: string; now?: number },
): SavedCard {
  const now = options?.now ?? Date.now();
  return {
    id: options?.id ?? crypto.randomUUID(),
    name: name.trim() || defaultSavedCardName(doc),
    createdAt: now,
    updatedAt: now,
    thumbnail,
    doc,
  };
}

export function duplicateSavedCard(
  card: SavedCard,
  options?: { id?: string; now?: number },
): SavedCard {
  const now = options?.now ?? Date.now();
  return {
    ...card,
    id: options?.id ?? crypto.randomUUID(),
    name: `${card.name} のコピー`,
    createdAt: now,
    updatedAt: now,
  };
}

export function captureThumbnail(stage: Konva.Stage): string {
  const editorLayer = stage.findOne(".editor-ui");
  const wasVisible = editorLayer?.visible() ?? false;
  editorLayer?.hide();
  stage.draw();
  try {
    return stage.toDataURL({ pixelRatio: 0.3, mimeType: "image/png" });
  } finally {
    if (wasVisible) editorLayer?.show();
    stage.draw();
  }
}

export function jsonFilename(name: string): string {
  const safe =
    name
      .trim()
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "card";
  return `charashou-${safe}.json`;
}
