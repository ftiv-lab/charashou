import type { FieldStyle, Template, TemplateElementChange, TextElement } from "../card/template";

type RightInspectorProps = {
  template: Template;
  element: TextElement;
  isOpen: boolean;
  onToggle: () => void;
  onFieldValueChange: (key: NonNullable<TextElement["fieldKey"]>, value: string) => void;
  onFieldStyleChange: (
    key: NonNullable<TextElement["fieldKey"]>,
    style: Partial<FieldStyle>,
  ) => void;
  onElementChange: (id: string, change: TemplateElementChange) => void;
};

export function getTextElementLabel(template: Template, element: TextElement): string {
  if (element.fieldKey) {
    return template.fields.find((field) => field.key === element.fieldKey)?.label ?? element.id;
  }
  return element.text?.trim() || element.id;
}

export function RightInspector({
  template,
  element,
  isOpen,
  onToggle,
  onFieldValueChange,
  onFieldStyleChange,
  onElementChange,
}: RightInspectorProps) {
  const field = element.fieldKey
    ? template.fields.find((candidate) => candidate.key === element.fieldKey)
    : undefined;
  const label = getTextElementLabel(template, element);
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
              <h2 id="right-inspector-heading">選択中：{label}（テキスト）</h2>
            </header>
            <div className="right-inspector-fields">
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
                  <span>X</span>
                  <input
                    aria-label="インスペクタ X"
                    type="number"
                    value={element.x}
                    onChange={(event) => {
                      if (event.target.value) {
                        onElementChange(element.id, { x: Number(event.target.value) });
                      }
                    }}
                  />
                </label>
                <label className="field">
                  <span>Y</span>
                  <input
                    aria-label="インスペクタ Y"
                    type="number"
                    value={element.y}
                    onChange={(event) => {
                      if (event.target.value) {
                        onElementChange(element.id, { y: Number(event.target.value) });
                      }
                    }}
                  />
                </label>
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
            </div>
          </>
        ) : null}
      </aside>
    </div>
  );
}
