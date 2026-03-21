const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');

const s3 = new S3Client({});
const THUMBNAIL_WIDTH = 400;
const THUMBNAIL_QUALITY = 80;

exports.handler = async (event) => {
  const record = event.Records[0];
  const bucket = record.s3.bucket.name;
  const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

  if (key.includes('/thumbnails/')) {
    return { statusCode: 200, body: 'Skipping thumbnail of thumbnail' };
  }

  const thumbnailKey = key.replace('/originals/', '/thumbnails/');

  try {
    const { Body, ContentType } = await s3.send(
      new GetObjectCommand({ Bucket: bucket, Key: key })
    );

    const inputBuffer = Buffer.from(await Body.transformToByteArray());

    const thumbnailBuffer = await sharp(inputBuffer)
      .resize(THUMBNAIL_WIDTH, null, { withoutEnlargement: true })
      .webp({ quality: THUMBNAIL_QUALITY })
      .toBuffer();

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: thumbnailKey.replace(/\.[^.]+$/, '.webp'),
        Body: thumbnailBuffer,
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=31536000, immutable',
      })
    );

    console.log(`Generated thumbnail: ${thumbnailKey}`);
    return { statusCode: 200, body: `Thumbnail created for ${key}` };
  } catch (err) {
    console.error(`Error processing ${key}:`, err);
    throw err;
  }
};
