import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

type B2Env = {
  B2_ENDPOINT?: string;
  B2_REGION?: string;
  B2_KEY_ID?: string;
  B2_APPLICATION_KEY?: string;
  B2_BUCKET?: string;
};

function env(): B2Env {
  const cloudflareEnv = getCloudflareContext().env as B2Env;
  return {
    B2_ENDPOINT: cloudflareEnv.B2_ENDPOINT || process.env.B2_ENDPOINT,
    B2_REGION: cloudflareEnv.B2_REGION || process.env.B2_REGION,
    B2_KEY_ID: cloudflareEnv.B2_KEY_ID || process.env.B2_KEY_ID,
    B2_APPLICATION_KEY: cloudflareEnv.B2_APPLICATION_KEY || process.env.B2_APPLICATION_KEY,
    B2_BUCKET: cloudflareEnv.B2_BUCKET || process.env.B2_BUCKET,
  };
}

function client() {
  const settings = env();
  if (!settings.B2_ENDPOINT || !settings.B2_REGION || !settings.B2_KEY_ID || !settings.B2_APPLICATION_KEY) {
    throw new Error("External file storage is not configured.");
  }
  return new S3Client({
    endpoint: settings.B2_ENDPOINT,
    region: settings.B2_REGION,
    credentials: { accessKeyId: settings.B2_KEY_ID, secretAccessKey: settings.B2_APPLICATION_KEY },
  });
}

function bucket() {
  const value = env().B2_BUCKET;
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
