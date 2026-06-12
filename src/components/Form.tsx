import type { ChangeEvent } from "react";
import { FIELDS, type FieldKey, type FieldValues } from "../card/fields";

type FormProps = {
  values: FieldValues;
  onFieldChange: (key: FieldKey, value: string) => void;
  onPhotoChange: (dataUrl: string) => void;
};

export function Form({ values, onFieldChange, onPhotoChange }: FormProps) {
  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onPhotoChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <section className="panel" id="form">
      {FIELDS.map((field) => (
        <label className="field" key={field.key}>
          <span>{field.label}</span>
          <input
            type="text"
            value={values[field.key]}
            onChange={(event) => onFieldChange(field.key, event.target.value)}
          />
        </label>
      ))}

      <label className="field">
        <span>顔写真</span>
        <input type="file" accept="image/*" onChange={handlePhotoChange} />
      </label>
    </section>
  );
}
