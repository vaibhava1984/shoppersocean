import crypto from "crypto";

type B2Config = { keyId: string; applicationKey: string; bucketId: string; bucketName: string; endpoint: string };

function config(): B2Config {
  const keyId = process.env.B2_KEY_ID;
  const applicationKey = process.env.B2_APPLICATION_KEY;
  const bucketId = process.env.B2_BUCKET_ID;
  const bucketName = process.env.B2_BUCKET_NAME;
  const endpoint = process.env.B2_ENDPOINT || "https://api.backblazeb2.com";
  if (!keyId || !applicationKey || !bucketId || !bucketName) throw new Error("Backblaze B2 storage is not configured");
  return { keyId, applicationKey, bucketId, bucketName, endpoint: endpoint.replace(/\/$/, "") };
}

let authCache: { authorizationToken: string; apiUrl: string; downloadUrl: string; expiresAt: number } | null = null;

async function authorizeAccount() {
  const cfg = config();
  if (authCache && authCache.expiresAt > Date.now() + 60_000) return authCache;
  const basic = Buffer.from(cfg.keyId + ":" + cfg.applicationKey).toString("base64");
  const response = await fetch(cfg.endpoint + "/b2api/v2/b2_authorize_account", { headers: { Authorization: "Basic " + basic }, cache: "no-store" });
  if (!response.ok) throw new Error("Backblaze authorization failed: " + await response.text());
  const data = await response.json() as { authorizationToken: string; apiUrl: string; downloadUrl: string };
  authCache = { ...data, expiresAt: Date.now() + 23 * 60 * 60 * 1000 };
  return authCache;
}

async function getUploadUrl() {
  const cfg = config();
  const auth = await authorizeAccount();
  const response = await fetch(auth.apiUrl + "/b2api/v2/b2_get_upload_url", { method: "POST", headers: { Authorization: auth.authorizationToken, "Content-Type": "application/json" }, body: JSON.stringify({ bucketId: cfg.bucketId }), cache: "no-store" });
  if (!response.ok) throw new Error("Backblaze upload URL failed: " + await response.text());
  return await response.json() as { uploadUrl: string; authorizationToken: string };
}

function encodeFileName(fileName: string) { return fileName.split("/").map(encodeURIComponent).join("/"); }

export async function uploadBookPdf(file: File, fileName: string) {
  const upload = await getUploadUrl();
  const bytes = Buffer.from(await file.arrayBuffer());
  const sha1 = crypto.createHash("sha1").update(bytes).digest("hex");
  const response = await fetch(upload.uploadUrl, { method: "POST", headers: { Authorization: upload.authorizationToken, "X-Bz-File-Name": encodeFileName(fileName), "Content-Type": "application/pdf", "X-Bz-Content-Sha1": sha1, "Content-Length": String(bytes.byteLength) }, body: bytes, cache: "no-store" });
  if (!response.ok) throw new Error("Backblaze upload failed: " + await response.text());
  return await response.json() as { fileId: string; fileName: string };
}

export async function deleteBookAsset(fileName: string, fileId?: string) {
  const cfg = config();
  const auth = await authorizeAccount();
  let resolvedFileId = fileId;
  let resolvedFileName = fileName;
  if (!resolvedFileId) {
    const response = await fetch(auth.apiUrl + "/b2api/v2/b2_list_file_versions", { method: "POST", headers: { Authorization: auth.authorizationToken, "Content-Type": "application/json" }, body: JSON.stringify({ bucketId: cfg.bucketId, prefix: fileName, maxFileCount: 100 }), cache: "no-store" });
    if (!response.ok) throw new Error("Backblaze file lookup failed: " + await response.text());
    const data = await response.json() as { files?: Array<{ fileId: string; fileName: string; action: string }> };
    const match = (data.files || []).find((f) => f.fileName === fileName && f.action === "upload");
    if (!match) return;
    resolvedFileId = match.fileId; resolvedFileName = match.fileName;
  }
  const response = await fetch(auth.apiUrl + "/b2api/v2/b2_delete_file_version", { method: "POST", headers: { Authorization: auth.authorizationToken, "Content-Type": "application/json" }, body: JSON.stringify({ fileId: resolvedFileId, fileName: resolvedFileName }), cache: "no-store" });
  if (!response.ok) throw new Error("Backblaze delete failed: " + await response.text());
}

export async function getBookPdfUrl(fileName: string) {
  const cfg = config();
  const auth = await authorizeAccount();
  const response = await fetch(auth.apiUrl + "/b2api/v2/b2_get_download_authorization", { method: "POST", headers: { Authorization: auth.authorizationToken, "Content-Type": "application/json" }, body: JSON.stringify({ bucketId: cfg.bucketId, fileNamePrefix: fileName, validDurationInSeconds: 300 }), cache: "no-store" });
  if (!response.ok) throw new Error("Backblaze download authorization failed: " + await response.text());
  const data = await response.json() as { authorizationToken: string };
  return auth.downloadUrl + "/file/" + encodeURIComponent(cfg.bucketName) + "/" + encodeFileName(fileName) + "?Authorization=" + encodeURIComponent(data.authorizationToken);
}