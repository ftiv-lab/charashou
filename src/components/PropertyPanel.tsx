import type { ChangeEvent } from "react";
import type { FieldKey, FieldStyle, Template, ThemeConfig } from "../card/template";
import { FieldEditor } from "./FieldEditor";
import { ThemePanel } from "./ThemePanel";

type PropertyPanelProps = {
  template: Template;
  onFieldValueChange: (key: FieldKey, value: string) => void;
  onFieldStyleChange: (key: FieldKey, style: Partial<FieldStyle>) => void;
  onThemeChange: <Key extends keyof ThemeConfig>(key: Key, value: ThemeConfig[Key]) => void;
  onPhotoChange: (dataUrl: string) => void;
  onReset: () => void;
};

export function PropertyPanel({
  template,
  onFieldValueChange,
  onFieldStyleChange,
  onThemeChange,
  onPhotoChange,
  onReset,
}: PropertyPanelProps) {
  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onPhotoChange(reader.result);
      }
    };
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
          <input type="file" accept="image/*" onChange={handlePhotoChange} />
        </label>
      </section>

      <button className="btn reset-btn" type="button" onClick={onReset}>
        既定に戻す
      </button>
    </aside>
  );
}
