import type Konva from "konva";
import { useRef, useState } from "react";
import {
  createDefaultTemplate,
  type FieldKey,
  type FieldStyle,
  type ThemeConfig,
} from "./card/template";
import { CardPreview } from "./components/CardPreview";
import { PropertyPanel } from "./components/PropertyPanel";
import { exportPng } from "./export";

export function App() {
  const [template, setTemplate] = useState(createDefaultTemplate);
  const [photoDataUrl, setPhotoDataUrl] = useState("");
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

  const handleExport = async () => {
    if (!stageRef.current) return;
    await exportPng(stageRef.current);
  };

  return (
    <>
      <header className="topbar">
        <h1>
          キャラ証 <small>charashou</small>
        </h1>
        <button id="exportBtn" className="btn" type="button" onClick={handleExport}>
          PNGで保存
        </button>
      </header>

      <main className="app">
        <PropertyPanel
          template={template}
          onFieldValueChange={handleFieldChange}
          onFieldStyleChange={handleFieldStyleChange}
          onThemeChange={handleThemeChange}
          onPhotoChange={setPhotoDataUrl}
          onReset={() => setTemplate(createDefaultTemplate())}
        />

        <section className="stage">
          <div className="card-wrap">
            <CardPreview ref={stageRef} template={template} photoDataUrl={photoDataUrl} />
          </div>
          <p className="hint">
            左の項目を変えると即反映されます。顔写真もアップロード可。仕上がりは「PNGで保存」で3倍解像度に。
          </p>
        </section>
      </main>
    </>
  );
}
