const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require("crypto");

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-southeast-2",
});

const IMAGES_BUCKET = process.env.IMAGES_BUCKET;

function generateKey(prefix, originalFilename) {
  const ext = originalFilename.split(".").pop().toLowerCase();
  const uniqueId = crypto.randomUUID();
  return `${prefix}/originals/${uniqueId}.${ext}`;
}

function getThumbnailKey(originalKey) {
  return originalKey.replace("/originals/", "/thumbnails/").replace(/\.[^.]+$/, ".webp");
}

async function getPresignedUploadUrl(key, contentType) {
  const command = new PutObjectCommand({
    Bucket: IMAGES_BUCKET,
    Key: key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });
  return url;
}

async function deleteS3Object(key) {
  await s3Client.send(
    new DeleteObjectCommand({ Bucket: IMAGES_BUCKET, Key: key })
  );
}

async function deleteImageWithThumbnail(originalKey) {
  const thumbnailKey = getThumbnailKey(originalKey);
  await Promise.all([
    deleteS3Object(originalKey),
    deleteS3Object(thumbnailKey).catch(() => {}),
  ]);
}

module.exports = {
  generateKey,
  getThumbnailKey,
  getPresignedUploadUrl,
  deleteS3Object,
  deleteImageWithThumbnail,
  IMAGES_BUCKET,
};
