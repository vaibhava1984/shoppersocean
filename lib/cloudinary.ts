import crypto from "crypto";

function config() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) throw new Error("Cloudinary storage is not configured");
  return { cloudName, apiKey, apiSecret };
}

function signParams(params: Record<string, string | number>, apiSecret: string) {
  const serialized = Object.keys(params).sort().map((key) => `${key}=${params[key]}`).join("&");
  return crypto.createHash("sha1").update(serialized + apiSecret).digest("hex");
}

function deliverySignature(path: string, apiSecret: string) {
  return crypto.createHash("sha1").update(path + apiSecret).digest().toString("base64url").slice(0, 8);
}

export async function uploadBookPdf(file: File, publicId: string) {
  const { cloudName, apiKey, apiSecret } = config();
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { public_id: publicId, timestamp, type: "authenticated" };
  const body = new FormData();
  body.append("file", file);
  body.append("api_key", apiKey);
  body.append("public_id", publicId);
  body.append("timestamp", String(timestamp));
  body.append("type", "authenticated");
  body.append("signature", signParams(params, apiSecret));
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body, cache: "no-store" });
  if (!response.ok) throw new Error(`Cloudinary upload failed: ${await response.text()}`);
  return await response.json() as { public_id: string; version?: number; format?: string };
}

export async function deleteBookAsset(publicId: string) {
  const { cloudName, apiKey, apiSecret } = config();
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { public_id: publicId, timestamp, type: "authenticated" };
  const body = new URLSearchParams({
    public_id: publicId, timestamp: String(timestamp), type: "authenticated",
    api_key: apiKey, signature: signParams(params, apiSecret),
  });
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, { method: "POST", body, cache: "no-store" });
  if (!response.ok) throw new Error(`Cloudinary delete failed: ${await response.text()}`);
}

export function getBookPdfUrl(publicId: string) {
  const { cloudName, apiSecret } = config();
  const publicName = `${publicId}.pdf`;
  const signature = deliverySignature(publicName, apiSecret);
  return `https://res.cloudinary.com/${cloudName}/image/authenticated/s--${signature}--/${publicName}`;
}
