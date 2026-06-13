import type Konva from "konva";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import {
  Circle,
  Group,
  Image as KonvaImage,
  type KonvaNodeEvents,
  Layer,
  Line,
  Rect,
  Stage,
  Text,
  Transformer,
} from "react-konva";
import {
  createPatternMarks,
  getCrestOutlinePoints,
  resolveDecorationColor,
} from "../card/decorations";
import {
  elementChangeFromTransform,
  getGuideStops,
  isEditableElement,
  MIN_ELEMENT_SIZE,
  type SnapGuide,
  snapDragPosition,
  snapResizeBounds,
} from "../card/editor";
import { calculatePhotoCrop, type PhotoState } from "../card/photo";
import {
  getTemplateField,
  type PatternElement,
  type Template,
  type TemplateElement,
  type TemplateElementChange,
  type TextElement,
} from "../card/template";

type CardPreviewProps = {
  template: Template;
  photo: PhotoState;
  selectedElementId?: string;
  onSelectionChange: (id?: string) => void;
  onElementChange: (id: string, change: TemplateElementChange) => void;
};

type EditableNodeProps = KonvaNodeEvents & {
  draggable: true;
  listening: true;
  name: "editable-element";
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

function CardText({
  element,
  template,
  editableProps,
}: {
  element: TextElement;
  template: Template;
  editableProps?: EditableNodeProps;
}) {
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
      {...editableProps}
    />
  );
}

function PatternDecoration({ element, template }: { element: PatternElement; template: Template }) {
  const color = resolveDecorationColor(element.generator.color, template.theme.crestAccent);
  const { width, height } = element;
  const marks = createPatternMarks(element.generator, width, height);

  return (
    <Group
      id={element.id}
      x={element.x}
      y={element.y}
      width={width}
      height={height}
      clipX={0}
      clipY={0}
      clipWidth={width}
      clipHeight={height}
      opacity={element.generator.opacity}
      listening={false}
    >
      {marks.map((mark) => {
        if (mark.kind === "line") {
          return (
            <Line
              key={mark.id}
              x={mark.x}
              y={mark.y}
              rotation={mark.rotation}
              points={mark.points}
              stroke={color}
              strokeWidth={mark.strokeWidth}
              listening={false}
            />
          );
        }
        if (mark.kind === "dot") {
          return (
            <Circle
              key={mark.id}
              x={mark.x}
              y={mark.y}
              radius={mark.radius}
              fill={color}
              listening={false}
            />
          );
        }
        if (mark.kind === "text") {
          return (
            <Text
              key={mark.id}
              x={mark.x}
              y={mark.y}
              rotation={mark.rotation}
              text={mark.text}
              fontFamily={canvasFontFamily(template.theme.baseFont)}
              fontSize={mark.fontSize}
              fill={color}
              listening={false}
            />
          );
        }
        return (
          <Line
            key={mark.id}
            points={mark.points}
            stroke={color}
            strokeWidth={mark.strokeWidth}
            closed
            listening={false}
          />
        );
      })}
    </Group>
  );
}

function CardElement({
  element,
  template,
  photo,
  photoState,
  editableProps,
}: {
  element: TemplateElement;
  template: Template;
  photo?: HTMLImageElement;
  photoState: PhotoState;
  editableProps?: EditableNodeProps;
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
          rotation={element.generator.angle}
          text={element.generator.text ? `${element.generator.text} `.repeat(90) : ""}
          fontFamily={canvasFontFamily(element.fontFamily)}
          fontSize={element.fontSize}
          fill={template.theme.crestAccent}
          opacity={element.generator.opacity}
          letterSpacing={element.letterSpacing}
          lineHeight={element.lineHeight}
          wrap="word"
          listening={false}
        />
      );
    case "pattern":
      return <PatternDecoration element={element} template={template} />;
    case "crest": {
      const stroke = resolveDecorationColor(
        element.generator.strokeColor,
        template.theme.crestAccent,
      );
      const fill = resolveDecorationColor(element.generator.fillColor, template.theme.cardBg);
      const outline = getCrestOutlinePoints(element.generator.shape, element.width, element.height);
      return (
        <Group
          id={element.id}
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          listening={false}
          {...editableProps}
        >
          {outline ? (
            <Line points={outline} closed fill={fill} stroke={stroke} strokeWidth={2} />
          ) : (
            <Circle
              x={element.width / 2}
              y={element.height / 2}
              radius={Math.max(2, Math.min(element.width, element.height) / 2 - 1)}
              fill={fill}
              stroke={stroke}
              strokeWidth={2}
            />
          )}
          <Text
            width={element.width}
            height={element.height}
            text={element.generator.initials}
            fontFamily={canvasFontFamily(template.theme.baseFont)}
            fontSize={Math.max(10, Math.min(element.width, element.height) * 0.375)}
            fontStyle="bold"
            fill={stroke}
            align="center"
            verticalAlign="middle"
          />
        </Group>
      );
    }
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
          {...editableProps}
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
              crop={calculatePhotoCrop(
                { width: photo.naturalWidth, height: photo.naturalHeight },
                { width: element.width, height: element.height },
                photoState,
              )}
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
    case "seal": {
      const color = resolveDecorationColor(element.generator.color, template.theme.crestAccent);
      const sealSize = Math.min(element.width, element.height);
      return (
        <Group
          id={element.id}
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          rotation={element.rotation ?? 0}
          listening={false}
          {...editableProps}
        >
          <Circle
            x={element.width / 2}
            y={element.height / 2}
            radius={Math.max(2, sealSize / 2 - 1)}
            stroke={color}
            strokeWidth={2}
          />
          <Circle
            x={element.width / 2}
            y={element.height / 2}
            radius={Math.max(2, sealSize / 2 - 5)}
            stroke={color}
            strokeWidth={1}
          />
          <Text
            y={sealSize * 0.12}
            width={element.width}
            height={sealSize * 0.22}
            text={element.generator.outerText}
            fontFamily="Noto Sans JP"
            fontSize={Math.max(4, sealSize * 0.1)}
            fontStyle="bold"
            fill={color}
            align="center"
            verticalAlign="middle"
          />
          <Text
            y={sealSize * 0.29}
            width={element.width}
            height={sealSize * 0.52}
            text={element.generator.centerText}
            fontFamily="Noto Serif JP"
            fontSize={Math.max(9, sealSize * 0.36)}
            fontStyle="bold"
            fill={color}
            align="center"
            verticalAlign="middle"
          />
        </Group>
      );
    }
    case "text":
      return <CardText element={element} template={template} editableProps={editableProps} />;
  }
}

export const CardPreview = forwardRef<Konva.Stage, CardPreviewProps>(function CardPreview(
  { template, photo: photoState, selectedElementId, onSelectionChange, onElementChange },
  forwardedRef,
) {
  const photo = useLoadedImage(photoState.dataUrl);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [fontsReady, setFontsReady] = useState(false);
  const [guides, setGuides] = useState<SnapGuide[]>([]);
  const [hoveredElementId, setHoveredElementId] = useState<string>();

  useImperativeHandle(forwardedRef, () => stageRef.current as Konva.Stage);

  useEffect(() => {
    let active = true;
    document.fonts.ready.then(() => {
      if (active) setFontsReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const selectedElement = template.elements.find((element) => element.id === selectedElementId);
  const hoveredElement = template.elements.find((element) => element.id === hoveredElementId);

  const selectElement = (id?: string) => {
    onSelectionChange(id);
    if (!id) setGuides([]);
    stageRef.current?.container().parentElement?.focus();
  };

  useEffect(() => {
    const transformer = transformerRef.current;
    const stage = stageRef.current;
    if (!transformer || !stage) return;

    const node = selectedElement ? stage.findOne(`#${selectedElement.id}`) : undefined;
    transformer.nodes(node ? [node] : []);
    transformer.forceUpdate();
    transformer.getLayer()?.batchDraw();
  }, [selectedElement]);

  const editableProps = (element: TemplateElement): EditableNodeProps | undefined => {
    if (!isEditableElement(element)) return undefined;

    return {
      draggable: true,
      listening: true,
      name: "editable-element",
      onClick: (event) => {
        event.cancelBubble = true;
        selectElement(element.id);
      },
      onTap: (event) => {
        event.cancelBubble = true;
        selectElement(element.id);
      },
      onMouseEnter: (event) => {
        setHoveredElementId(element.id);
        const stage = event.target.getStage();
        if (stage) stage.container().style.cursor = "pointer";
      },
      onMouseLeave: (event) => {
        setHoveredElementId(undefined);
        const stage = event.target.getStage();
        if (stage) stage.container().style.cursor = "default";
      },
      onDragStart: (event) => {
        const stage = event.target.getStage();
        if (stage) stage.container().style.cursor = "grabbing";
      },
      onDragMove: (event) => {
        const node = event.target;
        const stops = getGuideStops(template.size, template.elements, element.id);
        const snapped = snapDragPosition(
          {
            x: node.x(),
            y: node.y(),
            width: element.width,
            height: element.height,
          },
          stops,
        );
        node.position({ x: snapped.x, y: snapped.y });
        setGuides(snapped.guides);
      },
      onDragEnd: (event) => {
        onElementChange(element.id, { x: event.target.x(), y: event.target.y() });
        setGuides([]);
        const stage = event.target.getStage();
        if (stage) stage.container().style.cursor = "pointer";
      },
      onTransformEnd: (event) => {
        const node = event.target;
        const transformElement =
          element.kind === "text" && element.fieldKey
            ? {
                ...element,
                fontSize:
                  getTemplateField(template, element.fieldKey).style?.fontSize ?? element.fontSize,
              }
            : element;
        const change = elementChangeFromTransform(transformElement, {
          x: node.x(),
          y: node.y(),
          scaleX: node.scaleX(),
          scaleY: node.scaleY(),
          rotation: node.rotation(),
        });
        node.scale({ x: 1, y: 1 });
        onElementChange(element.id, change);
        setGuides([]);
      },
    };
  };

  return (
    <div
      id="card"
      role="img"
      aria-label="カードプレビュー"
      data-renderer="konva"
      data-selected-element={selectedElementId ?? ""}
      data-hovered-element={hoveredElementId ?? ""}
      data-guide-count={guides.length}
      tabIndex={-1}
      style={{ width: template.size.width, height: template.size.height }}
    >
      <Stage
        ref={stageRef}
        width={template.size.width}
        height={template.size.height}
        onMouseDown={(event) => {
          if (event.target === event.target.getStage()) selectElement(undefined);
        }}
        onTouchStart={(event) => {
          if (event.target === event.target.getStage()) selectElement(undefined);
        }}
      >
        <Layer key={fontsReady ? "fonts-ready" : "fonts-loading"}>
          {template.elements.map((element) => (
            <CardElement
              key={element.id}
              element={element}
              template={template}
              photo={photo}
              photoState={photoState}
              editableProps={editableProps(element)}
            />
          ))}
        </Layer>
        <Layer name="editor-ui">
          {hoveredElement && hoveredElement.id !== selectedElementId ? (
            <Rect
              x={hoveredElement.x}
              y={hoveredElement.y}
              width={hoveredElement.width}
              height={hoveredElement.height}
              rotation={hoveredElement.rotation ?? 0}
              stroke="#3d7bff"
              strokeWidth={1}
              dash={[4, 3]}
              opacity={0.7}
              listening={false}
            />
          ) : null}
          {guides.map((guide) => (
            <Line
              key={`${guide.orientation}-${guide.position}`}
              points={
                guide.orientation === "vertical"
                  ? [guide.position, 0, guide.position, template.size.height]
                  : [0, guide.position, template.size.width, guide.position]
              }
              stroke="#3d7bff"
              strokeWidth={1}
              dash={[6, 4]}
              listening={false}
            />
          ))}
          <Transformer
            ref={transformerRef}
            rotateEnabled={false}
            flipEnabled={false}
            keepRatio={selectedElement?.kind === "crest" || selectedElement?.kind === "seal"}
            enabledAnchors={[
              "top-left",
              "top-center",
              "top-right",
              "middle-left",
              "middle-right",
              "bottom-left",
              "bottom-center",
              "bottom-right",
            ]}
            borderStroke="#3d7bff"
            borderStrokeWidth={1}
            anchorFill="#ffffff"
            anchorStroke="#3d7bff"
            anchorStrokeWidth={2}
            anchorSize={10}
            padding={4}
            boundBoxFunc={(oldBox, newBox) => {
              if (!selectedElement) return oldBox;
              if (
                Math.abs(newBox.width) < MIN_ELEMENT_SIZE ||
                Math.abs(newBox.height) < MIN_ELEMENT_SIZE
              ) {
                return oldBox;
              }
              const anchor = transformerRef.current?.getActiveAnchor() ?? "";
              const stops = getGuideStops(template.size, template.elements, selectedElement.id);
              const snapped = snapResizeBounds(
                {
                  x: newBox.x,
                  y: newBox.y,
                  width: Math.abs(newBox.width),
                  height: Math.abs(newBox.height),
                },
                anchor,
                stops,
              );
              setGuides(snapped.guides);
              return { ...newBox, ...snapped.bounds };
            }}
          />
        </Layer>
      </Stage>
    </div>
  );
});
