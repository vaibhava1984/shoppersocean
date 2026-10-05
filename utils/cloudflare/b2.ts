const encoder = new TextEncoder();

function env(name: string) {
  const value = process.env[name];
  if (!value) throw new Error("Missing Backblaze B2 configuration: " + name);
  return value;
}

function hex(bytes: Uint8Array) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function awsEncode(value: string) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}

function canonicalPath(bucket: string, key: string) {
  return "/" + awsEncode(bucket) + "/" + key.split("/").map(awsEncode).join("/");
}

async function sha256(value: string | Uint8Array) {
  const data = typeof value === "string" ? encoder.encode(value) : value;
  return hex(new Uint8Array(await crypto.subtle.digest("SHA-256", data)));
}

async function hmac(key: ArrayBuffer | Uint8Array, value: string) {
  const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(value)));
}

async function signingKey(secret: string, date: string, region: string) {
  const kDate = await hmac(encoder.encode("AWS4" + secret), date);
  const kRegion = await hmac(kDate, region);
  const kService = await hmac(kRegion, "s3");
  return hmac(kService, "aws4_request");
}

function amzDateParts(date = new Date()) {
  const iso = date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  return { amzDate: iso, shortDate: iso.slice(0, 8) };
}

function getConfig() {
  return {
    accessKeyId: env("B2_KEY_ID"),
    secretKey: env("B2_APPLICATION_KEY"),
    bucket: env("B2_BUCKET"),
    endpoint: env("B2_ENDPOINT").replace(/^https?:\/\//, "").replace(/\/$/, ""),
    region: env("B2_REGION"),
  };
}

async function signRequest(method: string, key: string, payloadHash: string, contentType?: string) {
  const cfg = getConfig();
  const { amzDate, shortDate } = amzDateParts();
  const host = cfg.endpoint;
  const uri = canonicalPath(cfg.bucket, key);
  const headers: Record<string, string> = {
    host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };
  if (contentType) headers["content-type"] = contentType;

  const signedHeaderNames = Object.keys(headers).sort();
  const canonicalHeaders = signedHeaderNames.map((name) => name + ":" + headers[name].trim() + "\n").join("");
  const signedHeaders = signedHeaderNames.join(";");
  const canonicalRequest = [
    method,
    uri,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");
  const scope = shortDate + "/" + cfg.region + "/s3/aws4_request";
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, await sha256(canonicalRequest)].join("\n");
  const signature = hex(await hmac(await signingKey(cfg.secretKey, shortDate, cfg.region), stringToSign));

  return {
    url: "https://" + host + uri,
    headers: {
      "X-Amz-Date": amzDate,
      "X-Amz-Content-Sha256": payloadHash,
      "Authorization": "AWS4-HMAC-SHA256 Credential=" + cfg.accessKeyId + "/" + scope + ", SignedHeaders=" + signedHeaders + ", Signature=" + signature,
      ...(contentType ? { "Content-Type": contentType } : {}),
    },
  };
}

export async function getB2ObjectUrl(key: string, expiresInSeconds = 900) {
  const cfg = getConfig();
  const { amzDate, shortDate } = amzDateParts();
  const host = cfg.endpoint;
  const uri = canonicalPath(cfg.bucket, key);

  // Backblaze's S3-compatible presigned URLs use us-east-1 in the
  // SigV4 credential scope even when the bucket endpoint is regional
  // (for example s3.us-west-004.backblazeb2.com).
  const signingRegion = "us-east-1";

  const params = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": cfg.accessKeyId + "/" + shortDate + "/" + signingRegion + "/s3/aws4_request",
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(expiresInSeconds),
    "X-Amz-SignedHeaders": "host",
  });
  const canonicalQuery = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => awsEncode(k) + "=" + awsEncode(v))
    .join("&");
  const canonicalHeaders = "host:" + host + "\n";
  const canonicalRequest = ["GET", uri, canonicalQuery, canonicalHeaders, "host", "UNSIGNED-PAYLOAD"].join("\n");
  const scope = shortDate + "/" + signingRegion + "/s3/aws4_request";
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, await sha256(canonicalRequest)].join("\n");
  const signature = hex(await hmac(await signingKey(cfg.secretKey, shortDate, signingRegion), stringToSign));
  return "https://" + host + uri + "?" + canonicalQuery + "&X-Amz-Signature=" + signature;
}

export async function getB2SignedRequest(method: "GET" | "HEAD", key: string) {
  // B2 S3 GET/HEAD requests use the SHA-256 of the empty request body.
  // This avoids rejected private-object reads caused by UNSIGNED-PAYLOAD.
  const emptyPayloadHash = await sha256(new Uint8Array());
  return signRequest(method, key, emptyPayloadHash);
}

export async function putB2Object(key: string, bytes: Uint8Array, contentType: string) {
  const signed = await signRequest("PUT", key, await sha256(bytes), contentType);
  const response = await fetch(signed.url, {
    method: "PUT",
    headers: signed.headers,
    body: bytes,
  });
  if (!response.ok) {
    throw new Error("Backblaze B2 upload failed with status " + response.status);
  }
}

export async function deleteB2Object(key: string) {
  const signed = await signRequest("DELETE", key, await sha256(new Uint8Array()));
  const response = await fetch(signed.url, {
    method: "DELETE",
    headers: signed.headers,
  });
  if (!response.ok && response.status !== 404) {
    throw new Error("Backblaze B2 delete failed with status " + response.status);
  }
}
