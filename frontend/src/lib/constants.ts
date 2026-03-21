export const CLOUDFRONT_IMAGES_URL =
  import.meta.env.VITE_IMAGES_URL || "/images";

export function getImageUrl(s3Key: string): string {
  return `${CLOUDFRONT_IMAGES_URL}/${s3Key}`;
}

export function getThumbnailUrl(s3Key: string): string {
  const thumbnailKey = s3Key
    .replace("/originals/", "/thumbnails/")
    .replace(/\.[^.]+$/, ".webp");
  return `${CLOUDFRONT_IMAGES_URL}/${thumbnailKey}`;
}
