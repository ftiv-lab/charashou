import { useLiveQuery } from "dexie-react-hooks";
import type Konva from "konva";
import { type ChangeEvent, type RefObject, useEffect, useState } from "react";
import type { EditorDocument } from "../card/history";
import { db, type SavedCard } from "../storage/db";
import {
  captureThumbnail,
  createSavedCard,
  defaultSavedCardName,
  duplicateSavedCard,
  jsonFilename,
} from "../storage/savedCards";
import { parseEditorDocumentJson, serializeEditorDocument } from "../storage/schema";

type StoragePanelProps = {
  doc: EditorDocument;
  stageRef: RefObject<Konva.Stage | null>;
  currentCardId?: string;
  currentCardName?: string;
  autoSaveMessage: string;
  onLoad: (doc: EditorDocument, card?: Pick<SavedCard, "id" | "name">) => void;
  onCurrentCardChange: (card?: Pick<SavedCard, "id" | "name">) => void;
};

function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("invalid text"));
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.readAsText(file);
  });
}

function SavedCardItem({
  card,
  currentCardId,
  onLoad,
  onCurrentCardChange,
  setMessage,
}: {
  card: SavedCard;
  currentCardId?: string;
  onLoad: StoragePanelProps["onLoad"];
  onCurrentCardChange: StoragePanelProps["onCurrentCardChange"];
  setMessage: (message: string) => void;
}) {
  const [name, setName] = useState(card.name);

  useEffect(() => setName(card.name), [card.name]);

  const rename = async () => {
    const nextName = name.trim();
    if (!nextName) return;
    await db.cards.update(card.id, { name: nextName, updatedAt: Date.now() });
    if (currentCardId === card.id) onCurrentCardChange({ id: card.id, name: nextName });
    setMessage("名前を変更しました。");
  };

  return (
    <li className="saved-card">
      {card.thumbnail ? (
        <img src={card.thumbnail} alt="" className="saved-card-thumbnail" />
      ) : (
        <div className="saved-card-thumbnail saved-card-thumbnail-empty">NO PREVIEW</div>
      )}
      <div className="saved-card-body">
        <label className="field">
          <span>保存名</span>
          <input
            aria-label={`${card.name} の保存名`}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <time dateTime={new Date(card.updatedAt).toISOString()}>
          {new Date(card.updatedAt).toLocaleString("ja-JP")}
        </time>
        <div className="saved-card-actions">
          <button type="button" onClick={() => onLoad(card.doc, card)}>
            開く
          </button>
          <button
            type="button"
            onClick={async () => {
              await db.cards.add(duplicateSavedCard(card));
              setMessage("カードを複製しました。");
            }}
          >
            複製
          </button>
          <button type="button" onClick={rename}>
            改名
          </button>
          <button
            type="button"
            onClick={async () => {
              await db.cards.delete(card.id);
              if (currentCardId === card.id) onCurrentCardChange(undefined);
              setMessage("カードを削除しました。");
            }}
          >
            削除
          </button>
        </div>
      </div>
    </li>
  );
}

export function StoragePanel({
  doc,
  stageRef,
  currentCardId,
  currentCardName,
  autoSaveMessage,
  onLoad,
  onCurrentCardChange,
}: StoragePanelProps) {
  const cards = useLiveQuery(() => db.cards.orderBy("updatedAt").reverse().toArray(), []);
  const [saveName, setSaveName] = useState(() => defaultSavedCardName(doc));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentCardName) setSaveName(currentCardName);
  }, [currentCardName]);

  const thumbnail = () => {
    if (!stageRef.current) throw new Error("カードプレビューを取得できませんでした。");
    return captureThumbnail(stageRef.current);
  };

  const saveAsNew = async () => {
    try {
      const card = createSavedCard(doc, saveName, thumbnail());
      await db.cards.add(card);
      onCurrentCardChange(card);
      setSaveName(card.name);
      setError("");
      setMessage("カードを保存しました。");
    } catch {
      setError("カードを保存できませんでした。");
    }
  };

  const overwrite = async () => {
    if (!currentCardId) return saveAsNew();
    try {
      const nextName = saveName.trim() || currentCardName || defaultSavedCardName(doc);
      await db.cards.update(currentCardId, {
        name: nextName,
        updatedAt: Date.now(),
        thumbnail: thumbnail(),
        doc,
      });
      onCurrentCardChange({ id: currentCardId, name: nextName });
      setSaveName(nextName);
      setError("");
      setMessage("カードを上書き保存しました。");
    } catch {
      setError("カードを上書き保存できませんでした。");
    }
  };

  const exportJson = () => {
    const blob = new Blob([serializeEditorDocument(doc)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = jsonFilename(saveName);
    try {
      anchor.click();
      setMessage("JSONを書き出しました。");
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const importJson = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    try {
      const next = parseEditorDocumentJson(await readTextFile(file));
      onLoad(next);
      onCurrentCardChange(undefined);
      setSaveName(defaultSavedCardName(next));
      setError("");
      setMessage("JSONを読み込みました。");
    } catch {
      setError("JSONの形式が正しくありません。");
    } finally {
      input.value = "";
    }
  };

  return (
    <section className="property-section storage-section" aria-labelledby="storage-heading">
      <h2 id="storage-heading">保存・読込</h2>
      <p className="storage-note">ブラウザに保存。大事なものはJSON書き出しを。</p>
      <label className="field">
        <span>保存名</span>
        <input value={saveName} onChange={(event) => setSaveName(event.target.value)} />
      </label>
      <div className="storage-primary-actions">
        <button className="storage-command" type="button" onClick={overwrite}>
          {currentCardId ? "上書き保存" : "現在カードを保存"}
        </button>
        {currentCardId ? (
          <button className="storage-command" type="button" onClick={saveAsNew}>
            別名で保存
          </button>
        ) : null}
      </div>
      <div className="storage-primary-actions">
        <button className="storage-command" type="button" onClick={exportJson}>
          JSON書き出し
        </button>
        <label className="storage-command storage-file-command">
          JSON読み込み
          <input type="file" accept="application/json,.json" onChange={importJson} />
        </label>
      </div>
      <p className="storage-status" aria-live="polite">
        {autoSaveMessage}
      </p>
      {message ? (
        <p className="storage-action-status" aria-live="polite">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="storage-error" role="alert" aria-live="assertive">
          {error}
        </p>
      ) : null}
      <h3>保存カード</h3>
      {cards === undefined ? <p className="storage-note">読み込み中…</p> : null}
      {cards?.length === 0 ? <p className="storage-note">保存カードはまだありません。</p> : null}
      <ul className="saved-card-list">
        {cards?.map((card) => (
          <SavedCardItem
            key={card.id}
            card={card}
            currentCardId={currentCardId}
            onLoad={onLoad}
            onCurrentCardChange={onCurrentCardChange}
            setMessage={setMessage}
          />
        ))}
      </ul>
    </section>
  );
}
