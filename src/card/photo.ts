export const PHOTO_ACCEPT = "image/png,image/jpeg,image/webp";
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

export type PhotoState = {
  dataUrl: string;
  zoom: number;
  offsetX: number;
  offsetY: number;
};

export type PhotoAdjustmentKey = "zoom" | "offsetX" | "offsetY";

export const DEFAULT_PHOTO_STATE: PhotoState = {
  dataUrl: "",
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
};

const ALLOWED_PHOTO_TYPES = new Set(PHOTO_ACCEPT.split(","));

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function validatePhotoFile(file: File): string | undefined {
  if (!ALLOWED_PHOTO_TYPES.has(file.type)) {
    return "PNG、JPEG、WebP形式の画像を選択してください。";
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return "画像サイズは10MB以下にしてください。";
  }
  return undefined;
}

export function calculatePhotoCrop(
  image: { width: number; height: number },
  frame: { width: number; height: number },
  adjustment: Pick<PhotoState, "zoom" | "offsetX" | "offsetY">,
) {
  const targetRatio = frame.width / frame.height;
  const imageRatio = image.width / image.height;
  const baseWidth = imageRatio > targetRatio ? image.height * targetRatio : image.width;
  const baseHeight = imageRatio > targetRatio ? image.height : image.width / targetRatio;
  const zoom = clamp(adjustment.zoom, 1, 3);
  const width = baseWidth / zoom;
  const height = baseHeight / zoom;
  const offsetX = clamp(adjustment.offsetX, -1, 1);
  const offsetY = clamp(adjustment.offsetY, -1, 1);

  return {
    x: ((image.width - width) * (offsetX + 1)) / 2,
    y: ((image.height - height) * (offsetY + 1)) / 2,
    width,
    height,
  };
}
