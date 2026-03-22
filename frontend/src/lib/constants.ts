const isDev = import.meta.env.DEV;

export const CLOUDFRONT_IMAGES_URL =
  import.meta.env.VITE_IMAGES_URL || "/images";

export function getImageUrl(s3Key: string): string {
  if (isDev) {
    return `/api/local-photos/${s3Key}`;
  }
  return `${CLOUDFRONT_IMAGES_URL}/${s3Key}`;
}

export function getFileUrl(s3Key: string): string {
  if (isDev) {
    return `/api/local-photos/${s3Key}`;
  }
  return `${CLOUDFRONT_IMAGES_URL}/${s3Key}`;
}

export function getThumbnailUrl(s3Key: string): string {
  if (isDev) {
    return `/api/local-photos/${s3Key}`;
  }
  const thumbnailKey = s3Key
    .replace("/originals/", "/thumbnails/")
    .replace(/\.[^.]+$/, ".webp");
  return `${CLOUDFRONT_IMAGES_URL}/${thumbnailKey}`;
}
