import type { PhotoAdjustmentKey, PhotoState } from "../card/photo";
import type {
  EditableElement,
  FieldStyle,
  Template,
  TemplateElementChange,
  TextElement,
} from "../card/template";

type RightInspectorProps = {
  template: Template;
  element: EditableElement;
  photo: PhotoState;
  isOpen: boolean;
  onToggle: () => void;
  onFieldValueChange: (key: NonNullable<TextElement["fieldKey"]>, value: string) => void;
  onFieldStyleChange: (
    key: NonNullable<TextElement["fieldKey"]>,
    style: Partial<FieldStyle>,
  ) => void;
  onElementChange: (id: string, change: TemplateElementChange) => void;
  onPhotoAdjustment: (key: PhotoAdjustmentKey, value: number) => void;
};

export function getEditableElementLabel(template: Template, element: EditableElement): string {
  if (element.kind === "image") return "写真";
  if (element.kind === "crest") return "校章";
  if (element.kind === "seal") return "印";
  if (element.fieldKey) {
    return template.fields.find((field) => field.key === element.fieldKey)?.label ?? element.id;
  }
  return element.text?.trim() || element.id;
}

function getElementTypeLabel(element: EditableElement): string {
  if (element.kind === "text") return "テキスト";
  if (element.kind === "image") return "写真";
  if (element.kind === "crest") return "校章";
  return "印";
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="field">
      <span>{label.replace("インスペクタ ", "")}</span>
      <input
        aria-label={label}
        type="number"
        value={value}
        onChange={(event) => {
          if (event.target.value) onChange(Number(event.target.value));
        }}
      />
    </label>
  );
}

function TextControls({
  template,
  element,
  onFieldValueChange,
  onFieldStyleChange,
  onElementChange,
}: Pick<
  RightInspectorProps,
  "template" | "onFieldValueChange" | "onFieldStyleChange" | "onElementChange"
> & { element: TextElement }) {
  const field = element.fieldKey
    ? template.fields.find((candidate) => candidate.key === element.fieldKey)
    : undefined;
  const content = field?.value ?? element.text ?? "";
  const fontSize = field?.style?.fontSize ?? element.fontSize;
  const color = field?.style?.color ?? element.color ?? template.theme.textColor;

  const changeContent = (value: string) => {
    if (element.fieldKey) onFieldValueChange(element.fieldKey, value);
    else onElementChange(element.id, { text: value });
  };

  const changeFontSize = (value: number) => {
    if (element.fieldKey) onFieldStyleChange(element.fieldKey, { fontSize: value });
    else onElementChange(element.id, { fontSize: value });
  };

  const changeColor = (value: string) => {
    if (element.fieldKey) onFieldStyleChange(element.fieldKey, { color: value });
    else onElementChange(element.id, { color: value });
  };

  return (
    <section className="right-inspector-section" aria-labelledby="inspector-text-heading">
      <h3 id="inspector-text-heading">テキスト</h3>
      <label className="field" htmlFor={`inspector-content-${element.id}`}>
        <span>内容</span>
        {field?.type === "textarea" ? (
          <textarea
            id={`inspector-content-${element.id}`}
            aria-label="インスペクタ 内容"
            rows={3}
            value={content}
            onChange={(event) => changeContent(event.target.value)}
          />
        ) : (
          <input
            id={`inspector-content-${element.id}`}
            aria-label="インスペクタ 内容"
            type="text"
            value={content}
            onChange={(event) => changeContent(event.target.value)}
          />
        )}
      </label>
      <div className="right-inspector-grid">
        <label className="field">
          <span>文字サイズ</span>
          <input
            aria-label="インスペクタ 文字サイズ"
            type="number"
            min="8"
            max="72"
            value={fontSize}
            onChange={(event) => {
              if (event.target.value) changeFontSize(Number(event.target.value));
            }}
          />
        </label>
        <label className="field inspector-color-field">
          <span>文字色</span>
          <input
            aria-label="インスペクタ 文字色"
            type="color"
            value={color}
            onChange={(event) => changeColor(event.target.value)}
          />
        </label>
      </div>
    </section>
  );
}

function PhotoControls({
  photo,
  onPhotoAdjustment,
}: Pick<RightInspectorProps, "photo" | "onPhotoAdjustment">) {
  const controls: Array<{
    key: PhotoAdjustmentKey;
    label: string;
    min: number;
    max: number;
    step: number;
  }> = [
    { key: "zoom", label: "ズーム", min: 1, max: 3, step: 0.05 },
    { key: "offsetX", label: "横位置", min: -1, max: 1, step: 0.05 },
    { key: "offsetY", label: "縦位置", min: -1, max: 1, step: 0.05 },
  ];

  return (
    <section className="right-inspector-section" aria-labelledby="inspector-photo-heading">
      <h3 id="inspector-photo-heading">写真調整</h3>
      {controls.map((control) => (
        <label className="field range-field" key={control.key}>
          <span>{control.label}</span>
          <span className="range-control">
            <input
              aria-label={`インスペクタ ${control.label}`}
              type="range"
              min={control.min}
              max={control.max}
              step={control.step}
              value={photo[control.key]}
              disabled={!photo.dataUrl}
              onChange={(event) => onPhotoAdjustment(control.key, Number(event.target.value))}
            />
            <output>{photo[control.key].toFixed(2)}</output>
          </span>
        </label>
      ))}
    </section>
  );
}

export function RightInspector({
  template,
  element,
  photo,
  isOpen,
  onToggle,
  onFieldValueChange,
  onFieldStyleChange,
  onElementChange,
  onPhotoAdjustment,
}: RightInspectorProps) {
  const label = getEditableElementLabel(template, element);
  const typeLabel = getElementTypeLabel(element);

  return (
    <div className={`right-inspector-shell${isOpen ? " is-open" : ""}`}>
      <button
        className="right-inspector-toggle"
        type="button"
        aria-label={isOpen ? "インスペクタを閉じる" : "インスペクタを開く"}
        aria-expanded={isOpen}
        aria-controls="right-inspector"
        onClick={onToggle}
      >
        {isOpen ? "›" : "‹"}
      </button>
      <aside
        id="right-inspector"
        className="right-inspector"
        aria-labelledby="right-inspector-heading"
        aria-hidden={!isOpen}
      >
        {isOpen ? (
          <>
            <header className="right-inspector-header">
              <h2 id="right-inspector-heading">
                選択中：{label}（{typeLabel}）
              </h2>
            </header>
            <div className="right-inspector-fields">
              <section
                className="right-inspector-section"
                aria-labelledby="inspector-position-heading"
              >
                <h3 id="inspector-position-heading">位置・サイズ</h3>
                <div className="right-inspector-grid">
                  <NumberField
                    label="インスペクタ X"
                    value={element.x}
                    onChange={(x) => onElementChange(element.id, { x })}
                  />
                  <NumberField
                    label="インスペクタ Y"
                    value={element.y}
                    onChange={(y) => onElementChange(element.id, { y })}
                  />
                  <NumberField
                    label="インスペクタ 幅"
                    value={element.width}
                    onChange={(width) => onElementChange(element.id, { width })}
                  />
                  <NumberField
                    label="インスペクタ 高さ"
                    value={element.height}
                    onChange={(height) => onElementChange(element.id, { height })}
                  />
                </div>
              </section>
              {element.kind === "text" ? (
                <TextControls
                  template={template}
                  element={element}
                  onFieldValueChange={onFieldValueChange}
                  onFieldStyleChange={onFieldStyleChange}
                  onElementChange={onElementChange}
                />
              ) : null}
              {element.kind === "image" ? (
                <PhotoControls photo={photo} onPhotoAdjustment={onPhotoAdjustment} />
              ) : null}
            </div>
          </>
        ) : null}
      </aside>
    </div>
  );
}
