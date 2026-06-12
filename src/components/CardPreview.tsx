import type Konva from "konva";
import { forwardRef, useEffect, useState } from "react";
import { Circle, Group, Image as KonvaImage, Layer, Rect, Stage, Text } from "react-konva";
import {
  getTemplateField,
  type Template,
  type TemplateElement,
  type TextElement,
} from "../card/template";

type CardPreviewProps = {
  template: Template;
  photoDataUrl: string;
};

function canvasFontFamily(value: string): string {
  return value.split(",")[0].replace(/"/g, "").trim();
}

function fontStyle(weight: 400 | 500 | 700 | undefined): string {
  if (weight === 700) return "bold";
  if (weight === 500) return "500";
  return "normal";
}

function useLoadedImage(src: string): HTMLImageElement | undefined {
  const [image, setImage] = useState<HTMLImageElement>();

  useEffect(() => {
    if (!src) {
      setImage(undefined);
      return;
    }

    const nextImage = new Image();
    nextImage.onload = () => setImage(nextImage);
    nextImage.onerror = () => setImage(undefined);
    nextImage.src = src;

    return () => {
      nextImage.onload = null;
      nextImage.onerror = null;
    };
  }, [src]);

  return image;
}

function coverCrop(image: HTMLImageElement, width: number, height: number) {
  const targetRatio = width / height;
  const imageRatio = image.naturalWidth / image.naturalHeight;

  if (imageRatio > targetRatio) {
    const cropWidth = image.naturalHeight * targetRatio;
    return {
      x: (image.naturalWidth - cropWidth) / 2,
      y: 0,
      width: cropWidth,
      height: image.naturalHeight,
    };
  }

  const cropHeight = image.naturalWidth / targetRatio;
  return {
    x: 0,
    y: (image.naturalHeight - cropHeight) / 2,
    width: image.naturalWidth,
    height: cropHeight,
  };
}

function CardText({ element, template }: { element: TextElement; template: Template }) {
  const field = element.fieldKey ? getTemplateField(template, element.fieldKey) : undefined;
  const style = field?.style;

  return (
    <Text
      id={element.id}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation ?? 0}
      text={field?.value ?? element.text ?? ""}
      fontFamily={canvasFontFamily(
        style?.fontFamily ?? element.fontFamily ?? template.theme.baseFont,
      )}
      fontSize={style?.fontSize ?? element.fontSize}
      fontStyle={fontStyle(style?.fontWeight ?? element.fontWeight)}
      fill={style?.color ?? element.color ?? template.theme.textColor}
      align={style?.align ?? element.align ?? "left"}
      verticalAlign={element.verticalAlign ?? "top"}
      letterSpacing={element.letterSpacing ?? 0}
      lineHeight={element.lineHeight ?? 1.2}
      wrap="none"
      listening={false}
    />
  );
}

function CardElement({
  element,
  template,
  photo,
}: {
  element: TemplateElement;
  template: Template;
  photo?: HTMLImageElement;
}) {
  switch (element.kind) {
    case "rect":
      return (
        <Rect
          id={element.id}
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          cornerRadius={element.cornerRadius}
          fill={element.role === "background" ? template.theme.cardBg : template.theme.bandColor}
          stroke={element.role === "background" ? "#d9cad3" : undefined}
          strokeWidth={element.role === "background" ? 2 : 0}
          listening={false}
        />
      );
    case "watermark":
      return (
        <Text
          id={element.id}
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          rotation={element.rotation ?? 0}
          text={template.theme.watermarkText ? `${template.theme.watermarkText} `.repeat(90) : ""}
          fontFamily={canvasFontFamily(element.fontFamily)}
          fontSize={element.fontSize}
          fill={element.color}
          opacity={template.theme.watermarkOpacity}
          letterSpacing={element.letterSpacing}
          lineHeight={element.lineHeight}
          wrap="word"
          listening={false}
        />
      );
    case "crest":
      return (
        <Group
          id={element.id}
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          listening={false}
        >
          <Circle
            x={element.width / 2}
            y={element.height / 2}
            radius={element.width / 2 - 1}
            stroke={template.theme.crestAccent}
            strokeWidth={2}
          />
          <Text
            width={element.width}
            height={element.height}
            text="CR"
            fontFamily={canvasFontFamily(template.theme.baseFont)}
            fontSize={24}
            fontStyle="bold"
            fill={template.theme.crestAccent}
            align="center"
            verticalAlign="middle"
          />
        </Group>
      );
    case "image":
      return (
        <Group
          id={element.id}
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          clipX={0}
          clipY={0}
          clipWidth={element.width}
          clipHeight={element.height}
          listening={false}
        >
          <Rect
            width={element.width}
            height={element.height}
            fill="#cfe8f3"
            stroke="#ffffff"
            strokeWidth={1}
          />
          {photo ? (
            <KonvaImage
              image={photo}
              width={element.width}
              height={element.height}
              crop={coverCrop(photo, element.width, element.height)}
            />
          ) : (
            <Text
              width={element.width}
              height={element.height}
              text="PHOTO"
              fontFamily="Noto Sans JP"
              fontSize={13}
              fill="#7fa9bd"
              letterSpacing={2}
              align="center"
              verticalAlign="middle"
            />
          )}
        </Group>
      );
    case "seal":
      return (
        <Group
          id={element.id}
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          rotation={element.rotation ?? 0}
          listening={false}
        >
          <Rect
            width={element.width}
            height={element.height}
            stroke="#c0392b"
            strokeWidth={2}
            cornerRadius={6}
          />
          <Text
            width={element.width}
            height={element.height}
            text={"学院長\n之印"}
            fontFamily="Noto Serif JP"
            fontSize={11}
            fontStyle="bold"
            fill="#c0392b"
            align="center"
            verticalAlign="middle"
            lineHeight={1.1}
          />
        </Group>
      );
    case "text":
      return <CardText element={element} template={template} />;
  }
}

export const CardPreview = forwardRef<Konva.Stage, CardPreviewProps>(function CardPreview(
  { template, photoDataUrl },
  ref,
) {
  const photo = useLoadedImage(photoDataUrl);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    let active = true;
    document.fonts.ready.then(() => {
      if (active) setFontsReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div
      id="card"
      role="img"
      aria-label="カードプレビュー"
      data-renderer="konva"
      style={{ width: template.size.width, height: template.size.height }}
    >
      <Stage ref={ref} width={template.size.width} height={template.size.height}>
        <Layer key={fontsReady ? "fonts-ready" : "fonts-loading"} listening={false}>
          {template.elements.map((element) => (
            <CardElement key={element.id} element={element} template={template} photo={photo} />
          ))}
        </Layer>
      </Stage>
    </div>
  );
});
