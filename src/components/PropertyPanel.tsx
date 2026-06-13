import type Konva from "konva";
import { type ChangeEvent, type KeyboardEvent, type RefObject, useRef, useState } from "react";
import type { DecorationTarget } from "../card/decorations";
import type { EditorDocument } from "../card/history";
import {
  PHOTO_ACCEPT,
  type PhotoAdjustmentKey,
  type PhotoState,
  validatePhotoFile,
} from "../card/photo";
import type {
  FieldKey,
  FieldStyle,
  RepeatTextWatermarkGenerator,
  Template,
  ThemeConfig,
} from "../card/template";
import { FieldEditor } from "./FieldEditor";
import { StoragePanel } from "./StoragePanel";
import { ThemePanel } from "./ThemePanel";

type PropertyPanelProps = {
  template: Template;
  photo: PhotoState;
  doc: EditorDocument;
  stageRef: RefObject<Konva.Stage | null>;
  currentCardId?: string;
  currentCardName?: string;
  autoSaveMessage: string;
  onFieldValueChange: (key: FieldKey, value: string) => void;
  onFieldStyleChange: (key: FieldKey, style: Partial<FieldStyle>) => void;
  onThemeChange: <Key extends keyof ThemeConfig>(key: Key, value: ThemeConfig[Key]) => void;
  onDecorationPreset: (target: DecorationTarget, presetId: string) => void;
  onWatermarkChange: (
    key: "text" | "opacity",
    value: RepeatTextWatermarkGenerator["text" | "opacity"],
  ) => void;
  onPhotoUpload: (dataUrl: string) => void;
  onPhotoAdjustment: (key: PhotoAdjustmentKey, value: number) => void;
  onLoadDocument: (doc: EditorDocument, card?: { id: string; name: string }) => void;
  onCurrentCardChange: (card?: { id: string; name: string }) => void;
  onReset: () => void;
};

const PANEL_TABS = [
  { id: "content", label: "内容" },
  { id: "design", label: "デザイン" },
  { id: "photo", label: "写真" },
  { id: "cards", label: "マイカード" },
] as const;

type PanelTabId = (typeof PANEL_TABS)[number]["id"];

export function PropertyPanel({
  template,
  photo,
  doc,
  stageRef,
  currentCardId,
  currentCardName,
  autoSaveMessage,
  onFieldValueChange,
  onFieldStyleChange,
  onThemeChange,
  onDecorationPreset,
  onWatermarkChange,
  onPhotoUpload,
  onPhotoAdjustment,
  onLoadDocument,
  onCurrentCardChange,
  onReset,
}: PropertyPanelProps) {
  const [photoError, setPhotoError] = useState("");
  const [activeTab, setActiveTab] = useState<PanelTabId>("content");
  const tabRefs = useRef<Partial<Record<PanelTabId, HTMLButtonElement>>>({});

  const selectTab = (tabId: PanelTabId, focus = false) => {
    setActiveTab(tabId);
    if (focus) tabRefs.current[tabId]?.focus();
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const currentIndex = PANEL_TABS.findIndex((tab) => tab.id === activeTab);
    let nextIndex: number | undefined;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % PANEL_TABS.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + PANEL_TABS.length) % PANEL_TABS.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = PANEL_TABS.length - 1;
    }

    if (nextIndex === undefined) return;
    event.preventDefault();
    selectTab(PANEL_TABS[nextIndex].id, true);
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validatePhotoFile(file);
    if (validationError) {
      setPhotoError(validationError);
      event.currentTarget.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPhotoError("");
        onPhotoUpload(reader.result);
      }
    };
    reader.onerror = () => setPhotoError("画像を読み込めませんでした。もう一度お試しください。");
    reader.readAsDataURL(file);
  };

  return (
    <aside className="panel property-panel" id="form">
      <div className="panel-tabs" role="tablist" aria-label="編集パネル">
        {PANEL_TABS.map((tab) => (
          <button
            key={tab.id}
            ref={(node) => {
              if (node) tabRefs.current[tab.id] = node;
            }}
            id={`panel-tab-${tab.id}`}
            className="panel-tab"
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => selectTab(tab.id)}
            onKeyDown={handleTabKeyDown}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        id="panel-content"
        className="tab-panel"
        role="tabpanel"
        aria-labelledby="panel-tab-content"
        hidden={activeTab !== "content"}
      >
        <section className="property-section" aria-labelledby="fields-heading">
          <h2 id="fields-heading">項目</h2>
          <div className="field-list">
            {template.fields.map((field) => (
              <FieldEditor
                key={field.key}
                field={field}
                fallbackColor={template.theme.textColor}
                onValueChange={(value) => onFieldValueChange(field.key, value)}
                onStyleChange={(style) => onFieldStyleChange(field.key, style)}
              />
            ))}
          </div>
        </section>
      </div>

      <div
        id="panel-design"
        className="tab-panel"
        role="tabpanel"
        aria-labelledby="panel-tab-design"
        hidden={activeTab !== "design"}
      >
        <ThemePanel
          template={template}
          onChange={onThemeChange}
          onDecorationPreset={onDecorationPreset}
          onWatermarkChange={onWatermarkChange}
        />
      </div>

      <div
        id="panel-photo"
        className="tab-panel"
        role="tabpanel"
        aria-labelledby="panel-tab-photo"
        hidden={activeTab !== "photo"}
      >
        <section className="property-section" aria-labelledby="photo-heading">
          <h2 id="photo-heading">写真</h2>
          <label className="field">
            <span>顔写真</span>
            <input type="file" accept={PHOTO_ACCEPT} onChange={handlePhotoChange} />
          </label>
          <p className="photo-help">PNG / JPEG / WebP、10MBまで</p>
          <p className="photo-error" role="alert" aria-live="assertive">
            {photoError}
          </p>
          <label className="field range-field">
            <span>ズーム</span>
            <span className="range-control">
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={photo.zoom}
                disabled={!photo.dataUrl}
                onChange={(event) => onPhotoAdjustment("zoom", Number(event.target.value))}
              />
              <output>{photo.zoom.toFixed(2)}</output>
            </span>
          </label>
          <label className="field range-field">
            <span>横位置</span>
            <span className="range-control">
              <input
                type="range"
                min="-1"
                max="1"
                step="0.05"
                value={photo.offsetX}
                disabled={!photo.dataUrl}
                onChange={(event) => onPhotoAdjustment("offsetX", Number(event.target.value))}
              />
              <output>{photo.offsetX.toFixed(2)}</output>
            </span>
          </label>
          <label className="field range-field">
            <span>縦位置</span>
            <span className="range-control">
              <input
                type="range"
                min="-1"
                max="1"
                step="0.05"
                value={photo.offsetY}
                disabled={!photo.dataUrl}
                onChange={(event) => onPhotoAdjustment("offsetY", Number(event.target.value))}
              />
              <output>{photo.offsetY.toFixed(2)}</output>
            </span>
          </label>
        </section>
      </div>

      <div
        id="panel-cards"
        className="tab-panel"
        role="tabpanel"
        aria-labelledby="panel-tab-cards"
        hidden={activeTab !== "cards"}
      >
        <StoragePanel
          doc={doc}
          stageRef={stageRef}
          currentCardId={currentCardId}
          currentCardName={currentCardName}
          autoSaveMessage={autoSaveMessage}
          onLoad={onLoadDocument}
          onCurrentCardChange={onCurrentCardChange}
        />
      </div>

      <button className="btn reset-btn" type="button" onClick={onReset}>
        既定に戻す
      </button>
    </aside>
  );
}
