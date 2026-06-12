import { forwardRef } from "react";
import type { FieldValues } from "../card/fields";

type CardPreviewProps = {
  values: FieldValues;
  photoDataUrl: string;
};

const WATERMARK = "COROND JOSHI GAKUIN  ".repeat(60);

export const CardPreview = forwardRef<HTMLDivElement, CardPreviewProps>(function CardPreview(
  { values, photoDataUrl },
  ref,
) {
  return (
    <div id="card" ref={ref}>
      <div className="wm" id="wm">
        {WATERMARK}
      </div>
      <div className="band"></div>

      <header className="chead">
        <div className="crest" id="crest">
          CR
        </div>
        <div className="school">
          <div className="school-jp" data-field="schoolName">
            {values.schoolName}
          </div>
          <div className="school-en" data-field="schoolRoman">
            {values.schoolRoman}
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
          <div className="title" data-field="title">
            {values.title}
          </div>
          <div className="row">
            <span className="lbl">学　年</span>
            <span className="val" data-field="grade">
              {values.grade}
            </span>
          </div>
          <div className="row">
            <span className="lbl">氏　名</span>
            <span className="val name">
              <b data-field="name">{values.name}</b>
              <i data-field="nameRoman">{values.nameRoman}</i>
            </span>
          </div>
          <div className="row">
            <span className="lbl">生年月日</span>
            <span className="val" data-field="birth">
              {values.birth}
            </span>
          </div>
          <div className="row">
            <span className="lbl">有効期限</span>
            <span className="val" data-field="expiry">
              {values.expiry}
            </span>
          </div>
        </div>
      </div>

      <div className="statement" data-field="statement">
        {values.statement}
      </div>
      <div className="issuer">
        <span data-field="issuer">{values.issuer}</span>
        <span className="seal">
          学院長
          <br />
          之印
        </span>
      </div>
    </div>
  );
});
