import type Konva from "konva";
import { useRef, useState } from "react";
import { DEFAULT_PHOTO_STATE, type PhotoAdjustmentKey, type PhotoState } from "./card/photo";
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

export function App() {
  const [template, setTemplate] = useState(createDefaultTemplate);
  const [photo, setPhoto] = useState<PhotoState>(DEFAULT_PHOTO_STATE);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState("");
  const stageRef = useRef<Konva.Stage>(null);

  const handleFieldChange = (key: FieldKey, value: string) => {
    setTemplate((current) => ({
      ...current,
      fields: current.fields.map((field) => (field.key === key ? { ...field, value } : field)),
    }));
  };

  const handleFieldStyleChange = (key: FieldKey, style: Partial<FieldStyle>) => {
    setTemplate((current) => ({
      ...current,
      fields: current.fields.map((field) =>
        field.key === key ? { ...field, style: { ...field.style, ...style } } : field,
      ),
    }));
  };

  const handleThemeChange = <Key extends keyof ThemeConfig>(key: Key, value: ThemeConfig[Key]) => {
    setTemplate((current) => ({
      ...current,
      theme: { ...current.theme, [key]: value },
    }));
  };

  const handleElementChange = (id: string, change: TemplateElementChange) => {
    setTemplate((current) => {
      const changedElement = current.elements.find((element) => element.id === id);
      const fields =
        changedElement?.kind === "text" && changedElement.fieldKey && change.fontSize
          ? current.fields.map((field) =>
              field.key === changedElement.fieldKey
                ? { ...field, style: { ...field.style, fontSize: change.fontSize } }
                : field,
            )
          : current.fields;

      return {
        ...current,
        fields,
        elements: current.elements.map((element) =>
          element.id === id ? ({ ...element, ...change } as TemplateElement) : element,
        ),
      };
    });
  };

  const handlePhotoUpload = (dataUrl: string) => {
    setPhoto({ dataUrl, zoom: 1, offsetX: 0, offsetY: 0 });
  };

  const handlePhotoAdjustment = (key: PhotoAdjustmentKey, value: number) => {
    setPhoto((current) => ({ ...current, [key]: value }));
  };

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
        <div className="export-actions">
          <button
            id="exportBtn"
            className="btn"
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
      </header>

      <main className="app">
        <PropertyPanel
          template={template}
          onFieldValueChange={handleFieldChange}
          onFieldStyleChange={handleFieldStyleChange}
          onThemeChange={handleThemeChange}
          photo={photo}
          onPhotoUpload={handlePhotoUpload}
          onPhotoAdjustment={handlePhotoAdjustment}
          onReset={() => setTemplate(createDefaultTemplate())}
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
