import type Konva from "konva";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { createHistoryState, type EditorDocument, historyReducer } from "./card/history";
import { DEFAULT_PHOTO_STATE, type PhotoAdjustmentKey } from "./card/photo";
import {
  createDefaultTemplate,
  type FieldKey,
  type FieldStyle,
  type TemplateElement,
  type TemplateElementChange,
  type ThemeConfig,
} from "./card/template";
import { CardPreview } from "./components/CardPreview";
import { PropertyPanel } from "./components/PropertyPanel";
import { exportPng } from "./export";
import { useDocumentPersistence } from "./storage/useDocumentPersistence";

export function App() {
  const [history, dispatch] = useReducer(historyReducer, undefined, () =>
    createHistoryState({
      template: createDefaultTemplate(),
      photo: { ...DEFAULT_PHOTO_STATE },
    }),
  );
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState("");
  const [currentCard, setCurrentCard] = useState<{ id: string; name: string }>();
  const stageRef = useRef<Konva.Stage>(null);
  const { template, photo } = history.present;
  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const handleLoadDocument = useCallback(
    (next: EditorDocument, card?: { id: string; name: string }) => {
      dispatch({ type: "LOAD", next });
      setCurrentCard(card);
    },
    [],
  );

  const { message: autoSaveMessage } = useDocumentPersistence(history.present, handleLoadDocument);

  const handleFieldChange = (key: FieldKey, value: string) => {
    dispatch({
      type: "EDIT",
      mergeKey: `field:${key}`,
      next: {
        ...history.present,
        template: {
          ...template,
          fields: template.fields.map((field) => (field.key === key ? { ...field, value } : field)),
        },
      },
    });
  };

  const handleFieldStyleChange = (key: FieldKey, style: Partial<FieldStyle>) => {
    const styleProperty = Object.keys(style)[0] ?? "batch";
    dispatch({
      type: "EDIT",
      mergeKey: `style:${key}:${styleProperty}`,
      next: {
        ...history.present,
        template: {
          ...template,
          fields: template.fields.map((field) =>
            field.key === key ? { ...field, style: { ...field.style, ...style } } : field,
          ),
        },
      },
    });
  };

  const handleThemeChange = <Key extends keyof ThemeConfig>(key: Key, value: ThemeConfig[Key]) => {
    dispatch({
      type: "EDIT",
      mergeKey: `theme:${key}`,
      next: {
        ...history.present,
        template: { ...template, theme: { ...template.theme, [key]: value } },
      },
    });
  };

  const handleElementChange = (id: string, change: TemplateElementChange) => {
    const changedElement = template.elements.find((element) => element.id === id);
    const fields =
      changedElement?.kind === "text" && changedElement.fieldKey && change.fontSize
        ? template.fields.map((field) =>
            field.key === changedElement.fieldKey
              ? { ...field, style: { ...field.style, fontSize: change.fontSize } }
              : field,
          )
        : template.fields;
    dispatch({
      type: "EDIT",
      next: {
        ...history.present,
        template: {
          ...template,
          fields,
          elements: template.elements.map((element) =>
            element.id === id ? ({ ...element, ...change } as TemplateElement) : element,
          ),
        },
      },
    });
  };

  const handlePhotoUpload = (dataUrl: string) => {
    dispatch({
      type: "EDIT",
      next: { template, photo: { dataUrl, zoom: 1, offsetX: 0, offsetY: 0 } },
    });
  };

  const handlePhotoAdjustment = (key: PhotoAdjustmentKey, value: number) => {
    dispatch({
      type: "EDIT",
      mergeKey: `photo:${key}`,
      next: { template, photo: { ...photo, [key]: value } },
    });
  };

  const handleReset = () => {
    dispatch({
      type: "RESET",
      next: { template: createDefaultTemplate(), photo },
    });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey || event.isComposing) return;
      const key = event.key.toLowerCase();
      const wantsUndo = key === "z" && !event.shiftKey;
      const wantsRedo = (key === "z" && event.shiftKey) || key === "y";

      if (wantsUndo && canUndo) {
        event.preventDefault();
        dispatch({ type: "UNDO" });
      } else if (wantsRedo && canRedo) {
        event.preventDefault();
        dispatch({ type: "REDO" });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canRedo, canUndo]);

  const handleExport = async () => {
    if (!stageRef.current || isExporting) return;
    setIsExporting(true);
    setExportMessage("保存中です。");
    try {
      await exportPng(stageRef.current);
      setExportMessage("PNGを保存しました。");
    } catch {
      setExportMessage("PNGの保存に失敗しました。もう一度お試しください。");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <header className="topbar">
        <h1>
          キャラ証 <small>charashou</small>
        </h1>
        <div className="topbar-actions">
          <div className="history-actions">
            <button
              className="history-btn"
              type="button"
              onClick={() => dispatch({ type: "UNDO" })}
              disabled={!canUndo}
              title="Ctrl+Z"
            >
              Undo
            </button>
            <button
              className="history-btn"
              type="button"
              onClick={() => dispatch({ type: "REDO" })}
              disabled={!canRedo}
              title="Ctrl+Shift+Z / Ctrl+Y"
            >
              Redo
            </button>
          </div>
          <div className="export-actions">
            <button
              id="exportBtn"
              className="btn export-button"
              type="button"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? "保存中…" : "PNGで保存"}
            </button>
            <p className="export-status" role="status" aria-live="polite">
              {exportMessage}
            </p>
          </div>
        </div>
      </header>

      <main className="app">
        <PropertyPanel
          template={template}
          doc={history.present}
          onFieldValueChange={handleFieldChange}
          onFieldStyleChange={handleFieldStyleChange}
          onThemeChange={handleThemeChange}
          photo={photo}
          stageRef={stageRef}
          currentCardId={currentCard?.id}
          currentCardName={currentCard?.name}
          autoSaveMessage={autoSaveMessage}
          onPhotoUpload={handlePhotoUpload}
          onPhotoAdjustment={handlePhotoAdjustment}
          onLoadDocument={handleLoadDocument}
          onCurrentCardChange={setCurrentCard}
          onReset={handleReset}
        />

        <section className="stage">
          <div className="card-wrap">
            <CardPreview
              ref={stageRef}
              template={template}
              photo={photo}
              onElementChange={handleElementChange}
            />
          </div>
          <p className="hint">
            左の項目を変えると即反映されます。顔写真もアップロード可。仕上がりは「PNGで保存」で3倍解像度に。
          </p>
        </section>
      </main>
    </>
  );
}
