import {
  CREST_PRESETS,
  createPatternGenerator,
  type DecorationTarget,
  isDecorationPresetActive,
  PATTERN_PRESETS,
  type PatternKind,
  SEAL_PRESETS,
  WATERMARK_PRESETS,
} from "../card/decorations";
import {
  FONT_OPTIONS,
  type PatternGenerator,
  type RepeatTextWatermarkGenerator,
  type Template,
  type ThemeConfig,
} from "../card/template";

type ThemePanelProps = {
  template: Template;
  onChange: <Key extends keyof ThemeConfig>(key: Key, value: ThemeConfig[Key]) => void;
  onDecorationPreset: (target: DecorationTarget, presetId: string) => void;
  onWatermarkChange: (
    key: "text" | "opacity",
    value: RepeatTextWatermarkGenerator["text" | "opacity"],
  ) => void;
  onPatternChange: (generator: PatternGenerator, mergeKey: string) => void;
};

const PRESET_GROUPS = [
  { target: "crest", label: "校章", presets: CREST_PRESETS },
  { target: "seal", label: "印", presets: SEAL_PRESETS },
  { target: "watermark", label: "透かし", presets: WATERMARK_PRESETS },
] as const;

function PatternRange({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="field range-field">
      <span>{label}</span>
      <span className="range-control">
        <input
          aria-label={`地紋 ${label}`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <output>{value.toFixed(step < 1 ? 2 : 0)}</output>
      </span>
    </label>
  );
}

function PatternGeneratorPanel({
  template,
  generator,
  onDecorationPreset,
  onPatternChange,
}: {
  template: Template;
  generator: PatternGenerator;
  onDecorationPreset: ThemePanelProps["onDecorationPreset"];
  onPatternChange: ThemePanelProps["onPatternChange"];
}) {
  const change = (next: PatternGenerator, mergeKey: string) => onPatternChange(next, mergeKey);
  const usesThemeColor = generator.color === undefined;

  return (
    <section className="pattern-generator" aria-labelledby="pattern-generator-heading">
      <h3 id="pattern-generator-heading">背景地紋</h3>
      <fieldset className="preset-group">
        <legend>プリセット</legend>
        <div className="preset-options">
          {PATTERN_PRESETS.map((preset) => (
            <button
              key={preset.id}
              className="preset-button"
              type="button"
              aria-label={`背景 ${preset.label}`}
              aria-pressed={isDecorationPresetActive(template, "pattern", preset.id)}
              onClick={() => onDecorationPreset("pattern", preset.id)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="field">
        <span>種類</span>
        <select
          aria-label="地紋 種類"
          value={generator.kind}
          onChange={(event) =>
            change(createPatternGenerator(event.target.value as PatternKind), "kind")
          }
        >
          <option value="repeatText">反復テキスト</option>
          <option value="stripe">クロスライン</option>
          <option value="dots">ドット</option>
          <option value="rosetteLite">ロゼットLite</option>
        </select>
      </label>

      {generator.kind === "repeatText" ? (
        <>
          <label className="field">
            <span>テキスト</span>
            <input
              aria-label="地紋 テキスト"
              type="text"
              value={generator.text}
              onChange={(event) => change({ ...generator, text: event.target.value }, "text")}
            />
          </label>
          <PatternRange
            label="角度"
            value={generator.angle}
            min={-60}
            max={60}
            step={1}
            onChange={(angle) => change({ ...generator, angle }, "angle")}
          />
          <PatternRange
            label="間隔"
            value={generator.spacing}
            min={36}
            max={160}
            step={1}
            onChange={(spacing) => change({ ...generator, spacing }, "spacing")}
          />
        </>
      ) : null}

      {generator.kind === "stripe" ? (
        <>
          <PatternRange
            label="角度"
            value={generator.angle}
            min={-60}
            max={60}
            step={1}
            onChange={(angle) => change({ ...generator, angle }, "angle")}
          />
          <PatternRange
            label="間隔"
            value={generator.spacing}
            min={12}
            max={80}
            step={1}
            onChange={(spacing) => change({ ...generator, spacing }, "spacing")}
          />
          <PatternRange
            label="線幅"
            value={generator.strokeWidth}
            min={0.25}
            max={2}
            step={0.05}
            onChange={(strokeWidth) => change({ ...generator, strokeWidth }, "strokeWidth")}
          />
        </>
      ) : null}

      {generator.kind === "dots" ? (
        <>
          <PatternRange
            label="間隔"
            value={generator.spacing}
            min={12}
            max={80}
            step={1}
            onChange={(spacing) => change({ ...generator, spacing }, "spacing")}
          />
          <PatternRange
            label="半径"
            value={generator.radius}
            min={0.5}
            max={5}
            step={0.1}
            onChange={(radius) => change({ ...generator, radius }, "radius")}
          />
        </>
      ) : null}

      {generator.kind === "rosetteLite" ? (
        <>
          <PatternRange
            label="ループ数"
            value={generator.loops}
            min={4}
            max={16}
            step={1}
            onChange={(loops) => change({ ...generator, loops }, "loops")}
          />
          <PatternRange
            label="半径"
            value={generator.radius}
            min={8}
            max={40}
            step={1}
            onChange={(radius) => change({ ...generator, radius }, "radius")}
          />
          <PatternRange
            label="振幅"
            value={generator.amplitude}
            min={0.5}
            max={12}
            step={0.1}
            onChange={(amplitude) => change({ ...generator, amplitude }, "amplitude")}
          />
          <PatternRange
            label="線幅"
            value={generator.strokeWidth}
            min={0.25}
            max={2}
            step={0.05}
            onChange={(strokeWidth) => change({ ...generator, strokeWidth }, "strokeWidth")}
          />
        </>
      ) : null}

      <PatternRange
        label="濃さ"
        value={generator.opacity}
        min={0.01}
        max={0.25}
        step={0.005}
        onChange={(opacity) => change({ ...generator, opacity }, "opacity")}
      />

      <label className="pattern-theme-toggle">
        <input
          type="checkbox"
          checked={usesThemeColor}
          onChange={(event) =>
            change(
              {
                ...generator,
                color: event.target.checked ? undefined : template.theme.crestAccent,
              },
              "color",
            )
          }
        />
        <span>テーマ色を使用</span>
      </label>
      <label className="control-row">
        <span>地紋の色</span>
        <input
          aria-label="地紋 色"
          type="color"
          value={generator.color ?? template.theme.crestAccent}
          disabled={usesThemeColor}
          onChange={(event) => change({ ...generator, color: event.target.value }, "color")}
        />
      </label>
    </section>
  );
}

export function ThemePanel({
  template,
  onChange,
  onDecorationPreset,
  onWatermarkChange,
  onPatternChange,
}: ThemePanelProps) {
  const { theme } = template;
  const watermark = template.elements.find((element) => element.kind === "watermark");
  const watermarkText = watermark?.generator.text ?? theme.watermarkText;
  const watermarkOpacity = watermark?.generator.opacity ?? theme.watermarkOpacity;
  const pattern = template.elements.find((element) => element.kind === "pattern");

  return (
    <section className="property-section" aria-labelledby="theme-heading">
      <h2 id="theme-heading">全体テーマ</h2>
      <div className="theme-grid">
        <label className="control-row">
          <span>カード背景</span>
          <input
            type="color"
            value={theme.cardBg}
            onChange={(event) => onChange("cardBg", event.target.value)}
          />
        </label>
        <label className="control-row">
          <span>帯の色</span>
          <input
            type="color"
            value={theme.bandColor}
            onChange={(event) => onChange("bandColor", event.target.value)}
          />
        </label>
        <label className="control-row">
          <span>文字色</span>
          <input
            type="color"
            value={theme.textColor}
            onChange={(event) => onChange("textColor", event.target.value)}
          />
        </label>
        <label className="control-row">
          <span>校章アクセント</span>
          <input
            type="color"
            value={theme.crestAccent}
            onChange={(event) => onChange("crestAccent", event.target.value)}
          />
        </label>
      </div>

      <label className="field">
        <span>ベースフォント</span>
        <select
          value={theme.baseFont}
          onChange={(event) => onChange("baseFont", event.target.value)}
        >
          {FONT_OPTIONS.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </label>

      <section className="decoration-presets" aria-labelledby="decoration-presets-heading">
        <h3 id="decoration-presets-heading">装飾プリセット</h3>
        {PRESET_GROUPS.map((group) => (
          <fieldset className="preset-group" key={group.target}>
            <legend>{group.label}</legend>
            <div className="preset-options">
              {group.presets.map((preset) => (
                <button
                  key={preset.id}
                  className="preset-button"
                  type="button"
                  aria-label={`${group.label} ${preset.label}`}
                  aria-pressed={isDecorationPresetActive(template, group.target, preset.id)}
                  onClick={() => onDecorationPreset(group.target, preset.id)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
      </section>

      {pattern ? (
        <PatternGeneratorPanel
          template={template}
          generator={pattern.generator}
          onDecorationPreset={onDecorationPreset}
          onPatternChange={onPatternChange}
        />
      ) : null}

      <label className="field">
        <span>透かし文字</span>
        <input
          type="text"
          value={watermarkText}
          onChange={(event) => onWatermarkChange("text", event.target.value)}
        />
      </label>

      <label className="field range-field">
        <span>透かしの濃さ</span>
        <span className="range-control">
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.01"
            value={watermarkOpacity}
            onChange={(event) => onWatermarkChange("opacity", Number(event.target.value))}
          />
          <output>{watermarkOpacity.toFixed(2)}</output>
        </span>
      </label>
    </section>
  );
}
