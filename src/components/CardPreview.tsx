import { type CSSProperties, forwardRef } from "react";
import { type FieldKey, type FieldStyle, getTemplateField, type Template } from "../card/template";

type CardPreviewProps = {
  template: Template;
  photoDataUrl: string;
};

function toReactStyle(style?: FieldStyle): CSSProperties | undefined {
  if (!style) return undefined;

  return {
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    color: style.color,
    textAlign: style.align,
    display: style.align ? "inline-block" : undefined,
    width: style.align ? "100%" : undefined,
  };
}

export const CardPreview = forwardRef<HTMLDivElement, CardPreviewProps>(function CardPreview(
  { template, photoDataUrl },
  ref,
) {
  const field = (key: FieldKey) => getTemplateField(template, key);
  const cardStyle = {
    width: template.size.width,
    height: template.size.height,
    background: template.theme.cardBg,
    color: template.theme.textColor,
    fontFamily: template.theme.baseFont,
    "--pink": template.theme.bandColor,
    "--ink": template.theme.textColor,
    "--accent": template.theme.crestAccent,
  } as CSSProperties;
  const watermark = template.theme.watermarkText
    ? `${template.theme.watermarkText} `.repeat(60)
    : "";

  return (
    <div id="card" ref={ref} style={cardStyle}>
      <div className="wm" id="wm" style={{ opacity: template.theme.watermarkOpacity }}>
        {watermark}
      </div>
      <div className="band"></div>

      <header className="chead">
        <div className="crest" id="crest">
          CR
        </div>
        <div className="school">
          <div
            className="school-jp"
            data-field="schoolName"
            style={toReactStyle(field("schoolName").style)}
          >
            {field("schoolName").value}
          </div>
          <div
            className="school-en"
            data-field="schoolRoman"
            style={toReactStyle(field("schoolRoman").style)}
          >
            {field("schoolRoman").value}
          </div>
        </div>
      </header>

      <div className="cbody">
        <div className="photo">
          <img
            id="photo"
            className={photoDataUrl ? "on" : undefined}
            src={photoDataUrl || undefined}
            alt=""
          />
          <span className="photo-ph">PHOTO</span>
        </div>
        <div className="info">
          <div className="title" data-field="title" style={toReactStyle(field("title").style)}>
            {field("title").value}
          </div>
          <div className="row">
            <span className="lbl">学　年</span>
            <span className="val" data-field="grade" style={toReactStyle(field("grade").style)}>
              {field("grade").value}
            </span>
          </div>
          <div className="row">
            <span className="lbl">氏　名</span>
            <span className="val name">
              <b data-field="name" style={toReactStyle(field("name").style)}>
                {field("name").value}
              </b>
              <i data-field="nameRoman" style={toReactStyle(field("nameRoman").style)}>
                {field("nameRoman").value}
              </i>
            </span>
          </div>
          <div className="row">
            <span className="lbl">生年月日</span>
            <span className="val" data-field="birth" style={toReactStyle(field("birth").style)}>
              {field("birth").value}
            </span>
          </div>
          <div className="row">
            <span className="lbl">有効期限</span>
            <span className="val" data-field="expiry" style={toReactStyle(field("expiry").style)}>
              {field("expiry").value}
            </span>
          </div>
        </div>
      </div>

      <div
        className="statement"
        data-field="statement"
        style={toReactStyle(field("statement").style)}
      >
        {field("statement").value}
      </div>
      <div className="issuer">
        <span data-field="issuer" style={toReactStyle(field("issuer").style)}>
          {field("issuer").value}
        </span>
        <span className="seal">
          学院長
          <br />
          之印
        </span>
      </div>
    </div>
  );
});
