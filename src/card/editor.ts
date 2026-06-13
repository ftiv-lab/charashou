import type { EditableElement, TemplateElement, TemplateElementChange } from "./template";

export const SNAP_THRESHOLD = 5;
export const MIN_ELEMENT_SIZE = 12;

export type ElementBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type SnapGuide = {
  orientation: "vertical" | "horizontal";
  position: number;
};

type GuideStops = {
  vertical: number[];
  horizontal: number[];
};

export function isFrameElement(element: TemplateElement): boolean {
  return element.kind === "rect" || element.kind === "watermark";
}

export function isEditableElement(element: TemplateElement): element is EditableElement {
  return !isFrameElement(element);
}

export function getElementBounds(element: TemplateElement): ElementBounds {
  return {
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
  };
}

export function getGuideStops(
  cardSize: { width: number; height: number },
  elements: TemplateElement[],
  excludedId?: string,
): GuideStops {
  const vertical = [0, cardSize.width / 2, cardSize.width];
  const horizontal = [0, cardSize.height / 2, cardSize.height];

  for (const element of elements) {
    if (!isEditableElement(element) || element.id === excludedId) continue;
    vertical.push(element.x, element.x + element.width / 2, element.x + element.width);
    horizontal.push(element.y, element.y + element.height / 2, element.y + element.height);
  }

  return { vertical, horizontal };
}

function nearestSnap(points: number[], stops: number[], threshold: number) {
  let best: { offset: number; position: number } | undefined;

  for (const point of points) {
    for (const stop of stops) {
      const offset = stop - point;
      if (Math.abs(offset) > threshold) continue;
      if (!best || Math.abs(offset) < Math.abs(best.offset)) {
        best = { offset, position: stop };
      }
    }
  }

  return best;
}

export function snapDragPosition(
  bounds: ElementBounds,
  stops: GuideStops,
  threshold = SNAP_THRESHOLD,
): { x: number; y: number; guides: SnapGuide[] } {
  const verticalSnap = nearestSnap(
    [bounds.x, bounds.x + bounds.width / 2, bounds.x + bounds.width],
    stops.vertical,
    threshold,
  );
  const horizontalSnap = nearestSnap(
    [bounds.y, bounds.y + bounds.height / 2, bounds.y + bounds.height],
    stops.horizontal,
    threshold,
  );
  const guides: SnapGuide[] = [];

  if (verticalSnap) guides.push({ orientation: "vertical", position: verticalSnap.position });
  if (horizontalSnap) guides.push({ orientation: "horizontal", position: horizontalSnap.position });

  return {
    x: bounds.x + (verticalSnap?.offset ?? 0),
    y: bounds.y + (horizontalSnap?.offset ?? 0),
    guides,
  };
}

export function snapResizeBounds(
  bounds: ElementBounds,
  anchor: string,
  stops: GuideStops,
  threshold = SNAP_THRESHOLD,
): { bounds: ElementBounds; guides: SnapGuide[] } {
  const next = { ...bounds };
  const guides: SnapGuide[] = [];
  const right = bounds.x + bounds.width;
  const bottom = bounds.y + bounds.height;

  if (anchor.includes("left")) {
    const snap = nearestSnap([bounds.x], stops.vertical, threshold);
    if (snap) {
      next.x = snap.position;
      next.width = Math.max(MIN_ELEMENT_SIZE, right - snap.position);
      guides.push({ orientation: "vertical", position: snap.position });
    }
  } else if (anchor.includes("right")) {
    const snap = nearestSnap([right], stops.vertical, threshold);
    if (snap) {
      next.width = Math.max(MIN_ELEMENT_SIZE, snap.position - bounds.x);
      guides.push({ orientation: "vertical", position: snap.position });
    }
  }

  if (anchor.includes("top")) {
    const snap = nearestSnap([bounds.y], stops.horizontal, threshold);
    if (snap) {
      next.y = snap.position;
      next.height = Math.max(MIN_ELEMENT_SIZE, bottom - snap.position);
      guides.push({ orientation: "horizontal", position: snap.position });
    }
  } else if (anchor.includes("bottom")) {
    const snap = nearestSnap([bottom], stops.horizontal, threshold);
    if (snap) {
      next.height = Math.max(MIN_ELEMENT_SIZE, snap.position - bounds.y);
      guides.push({ orientation: "horizontal", position: snap.position });
    }
  }

  return { bounds: next, guides };
}

export function elementChangeFromTransform(
  element: TemplateElement,
  transform: {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation?: number;
  },
): TemplateElementChange {
  const scaleX = Math.max(0.01, Math.abs(transform.scaleX));
  const scaleY = Math.max(0.01, Math.abs(transform.scaleY));

  if (element.kind === "text") {
    return {
      x: transform.x,
      y: transform.y,
      width: Math.max(MIN_ELEMENT_SIZE, element.width * scaleX),
      height: Math.max(MIN_ELEMENT_SIZE, element.height * scaleY),
      fontSize: Math.max(8, element.fontSize * scaleY),
      rotation: transform.rotation ?? element.rotation ?? 0,
    };
  }

  return {
    x: transform.x,
    y: transform.y,
    width: Math.max(MIN_ELEMENT_SIZE, element.width * scaleX),
    height: Math.max(MIN_ELEMENT_SIZE, element.height * scaleY),
    rotation: transform.rotation ?? element.rotation ?? 0,
  };
}
