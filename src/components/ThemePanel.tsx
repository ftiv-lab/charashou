import { FONT_OPTIONS, type ThemeConfig } from "../card/template";

type ThemePanelProps = {
  theme: ThemeConfig;
  onChange: <Key extends keyof ThemeConfig>(key: Key, value: ThemeConfig[Key]) => void;
};

export function ThemePanel({ theme, onChange }: ThemePanelProps) {
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

      <label className="field">
        <span>透かし文字</span>
        <input
          type="text"
          value={theme.watermarkText}
          onChange={(event) => onChange("watermarkText", event.target.value)}
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
            value={theme.watermarkOpacity}
            onChange={(event) => onChange("watermarkOpacity", Number(event.target.value))}
          />
          <output>{theme.watermarkOpacity.toFixed(2)}</output>
        </span>
      </label>
    </section>
  );
}
