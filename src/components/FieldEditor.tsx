import { type FieldSchema, type FieldStyle, FONT_OPTIONS } from "../card/template";

type FieldEditorProps = {
  field: FieldSchema;
  fallbackColor: string;
  onValueChange: (value: string) => void;
  onStyleChange: (style: Partial<FieldStyle>) => void;
};

export function FieldEditor({
  field,
  fallbackColor,
  onValueChange,
  onStyleChange,
}: FieldEditorProps) {
  const inputId = `field-${field.key}`;

  return (
    <div className="field-editor">
      <label className="field" htmlFor={inputId}>
        <span>{field.label}</span>
        {field.type === "textarea" ? (
          <textarea
            id={inputId}
            value={field.value}
            rows={2}
            onChange={(event) => onValueChange(event.target.value)}
          />
        ) : (
          <input
            id={inputId}
            type="text"
            value={field.value}
            onChange={(event) => onValueChange(event.target.value)}
          />
        )}
      </label>

      <details className="style-editor">
        <summary>スタイル</summary>
        <div className="style-grid">
          <label className="field">
            <span>フォント</span>
            <select
              aria-label={`${field.label} フォント`}
              value={field.style?.fontFamily ?? ""}
              onChange={(event) => onStyleChange({ fontFamily: event.target.value || undefined })}
            >
              <option value="">CSS既定</option>
              {FONT_OPTIONS.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>サイズ</span>
            <input
              aria-label={`${field.label} サイズ`}
              type="number"
              min="8"
              max="72"
              placeholder="CSS既定"
              value={field.style?.fontSize ?? ""}
              onChange={(event) =>
                onStyleChange({
                  fontSize: event.target.value ? Number(event.target.value) : undefined,
                })
              }
            />
          </label>

          <label className="field">
            <span>太さ</span>
            <select
              aria-label={`${field.label} 太さ`}
              value={field.style?.fontWeight ?? ""}
              onChange={(event) =>
                onStyleChange({
                  fontWeight: event.target.value
                    ? (Number(event.target.value) as FieldStyle["fontWeight"])
                    : undefined,
                })
              }
            >
              <option value="">CSS既定</option>
              <option value="400">400</option>
              <option value="500">500</option>
              <option value="700">700</option>
            </select>
          </label>

          <label className="field">
            <span>文字色</span>
            <input
              aria-label={`${field.label} 文字色`}
              type="color"
              value={field.style?.color ?? fallbackColor}
              onChange={(event) => onStyleChange({ color: event.target.value })}
            />
          </label>

          <label className="field">
            <span>揃え</span>
            <select
              aria-label={`${field.label} 揃え`}
              value={field.style?.align ?? ""}
              onChange={(event) =>
                onStyleChange({
                  align: (event.target.value || undefined) as FieldStyle["align"],
                })
              }
            >
              <option value="">CSS既定</option>
              <option value="left">左</option>
              <option value="center">中央</option>
              <option value="right">右</option>
            </select>
          </label>
        </div>
      </details>
    </div>
  );
}
