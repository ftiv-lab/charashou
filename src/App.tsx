import { useRef, useState } from "react";
import { DEFAULT_FIELD_VALUES, type FieldKey } from "./card/fields";
import { CardPreview } from "./components/CardPreview";
import { Form } from "./components/Form";
import { exportPng } from "./export";

export function App() {
  const [values, setValues] = useState(DEFAULT_FIELD_VALUES);
  const [photoDataUrl, setPhotoDataUrl] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  const handleFieldChange = (key: FieldKey, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleExport = async () => {
    if (!cardRef.current) return;
    await exportPng(cardRef.current);
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
        <Form values={values} onFieldChange={handleFieldChange} onPhotoChange={setPhotoDataUrl} />

        <section className="stage">
          <div className="card-wrap">
            <CardPreview ref={cardRef} values={values} photoDataUrl={photoDataUrl} />
          </div>
          <p className="hint">
            左の項目を変えると即反映されます。顔写真もアップロード可。仕上がりは「PNGで保存」で3倍解像度に。
          </p>
        </section>
      </main>
    </>
  );
}
