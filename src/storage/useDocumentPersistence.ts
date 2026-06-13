import { useEffect, useState } from "react";
import type { EditorDocument } from "../card/history";
import { db } from "./db";
import { parseEditorDocument } from "./schema";

export const AUTOSAVE_DELAY = 2000;

export function scheduleDebouncedSave(save: () => void | Promise<void>, delay = AUTOSAVE_DELAY) {
  const timer = window.setTimeout(() => void save(), delay);
  return () => window.clearTimeout(timer);
}

export function useDocumentPersistence(
  doc: EditorDocument,
  onRestore: (doc: EditorDocument) => void,
) {
  const [isReady, setIsReady] = useState(false);
  const [message, setMessage] = useState("自動保存を準備しています…");

  useEffect(() => {
    let active = true;
    void navigator.storage?.persist?.().catch(() => false);
    void db.meta
      .get("current")
      .then((entry) => {
        if (!active || !entry) return;
        onRestore(parseEditorDocument(entry.value));
        setMessage("前回の作業を復元しました。");
      })
      .catch(() => {
        if (active) setMessage("自動保存の復元に失敗しました。");
      })
      .finally(() => {
        if (active) setIsReady(true);
      });
    return () => {
      active = false;
    };
  }, [onRestore]);

  useEffect(() => {
    if (!isReady) return;
    let active = true;
    setMessage("自動保存を待機中…");
    const cancel = scheduleDebouncedSave(async () => {
      try {
        await db.meta.put({ key: "current", value: doc, updatedAt: Date.now() });
        if (active) setMessage("自動保存しました。");
      } catch {
        if (active) setMessage("自動保存に失敗しました。JSON書き出しをお試しください。");
      }
    });
    return () => {
      active = false;
      cancel();
    };
  }, [doc, isReady]);

  return { isReady, message };
}
