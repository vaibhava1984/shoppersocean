import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function client() {
  const endpoint = process.env.B2_ENDPOINT;
  const region = process.env.B2_REGION;
  const accessKeyId = process.env.B2_KEY_ID;
  const secretAccessKey = process.env.B2_APPLICATION_KEY;

  if (!endpoint || !region || !accessKeyId || !secretAccessKey) {
    throw new Error("External file storage is not configured.");
  }

  return new S3Client({
    endpoint,
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function bucket() {
  const value = process.env.B2_BUCKET;
  if (!value) throw new Error("External file storage bucket is not configured.");
  return value;
}

export async function uploadBookFile(key: string, body: Uint8Array, contentType = "application/pdf") {
  await client().send(new PutObjectCommand({
    Bucket: bucket(),
    Key: key,
    Body: body,
    ContentType: contentType,
  }));
  return key;
}

export async function getBookFileUrl(key: string, expiresIn = 900) {
  return getSignedUrl(client(), new GetObjectCommand({ Bucket: bucket(), Key: key }), { expiresIn });
}

export async function deleteBookFile(key: string) {
  await client().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
}
