import { type ChangeEvent, useState } from "react";
import {
  PHOTO_ACCEPT,
  type PhotoAdjustmentKey,
  type PhotoState,
  validatePhotoFile,
} from "../card/photo";
import type { FieldKey, FieldStyle, Template, ThemeConfig } from "../card/template";
import { FieldEditor } from "./FieldEditor";
import { ThemePanel } from "./ThemePanel";

type PropertyPanelProps = {
  template: Template;
  photo: PhotoState;
  onFieldValueChange: (key: FieldKey, value: string) => void;
  onFieldStyleChange: (key: FieldKey, style: Partial<FieldStyle>) => void;
  onThemeChange: <Key extends keyof ThemeConfig>(key: Key, value: ThemeConfig[Key]) => void;
  onPhotoUpload: (dataUrl: string) => void;
  onPhotoAdjustment: (key: PhotoAdjustmentKey, value: number) => void;
  onReset: () => void;
};

export function PropertyPanel({
  template,
  photo,
  onFieldValueChange,
  onFieldStyleChange,
  onThemeChange,
  onPhotoUpload,
  onPhotoAdjustment,
  onReset,
}: PropertyPanelProps) {
  const [photoError, setPhotoError] = useState("");

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
      <ThemePanel theme={template.theme} onChange={onThemeChange} />

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

      <button className="btn reset-btn" type="button" onClick={onReset}>
        既定に戻す
      </button>
    </aside>
  );
}
