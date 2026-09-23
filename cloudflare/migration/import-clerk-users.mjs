#!/usr/bin/env node

/**
 * Safe Clerk user importer for Shoppers Ocean.
 *
 * Input: a JSON array containing exported user records:
 * {
 *   "id": "<existing Supabase user UUID>",
 *   "email": "<email>",
 *   "fullName": "<name>",
 *   "country": "<country>",
 *   "mobile": "<optional phone>",
 *   "address": "<optional address>",
 *   "role": "ADMIN|PUBLISHER|USER",
 *   "passwordDigest": "<bcrypt digest>",
 *   "passwordHasher": "bcrypt"
 * }
 *
 * The file must NEVER contain plaintext passwords.
 *
 * Required environment:
 *   CLERK_SECRET_KEY
 *
 * This script only creates/updates Clerk users. It does not delete or modify
 * Supabase users and does not touch D1/R2.
 */

const fs = require("node:fs");

const input = process.argv[2];
if (!input) {
  console.error("Usage: node cloudflare/migration/import-clerk-users.mjs <export.json>");
  process.exit(1);
}

const secret = process.env.CLERK_SECRET_KEY;
if (!secret) {
  console.error("CLERK_SECRET_KEY is required.");
  process.exit(1);
}

const records = JSON.parse(fs.readFileSync(input, "utf8"));
if (!Array.isArray(records)) {
  throw new Error("Migration input must be a JSON array.");
}

const allowedRoles = new Set(["ADMIN", "PUBLISHER", "USER"]);
const api = "https://api.clerk.com/v1";

async function clerk(path, options = {}) {
  const response = await fetch(api + path, {
    ...options,
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Clerk API ${response.status}: ${body}`);
  }
  return body ? JSON.parse(body) : null;
}

for (const record of records) {
  if (!record.id || !record.email || !record.passwordDigest) {
    throw new Error("Every record requires id, email and passwordDigest.");
  }
  if (record.passwordHasher !== "bcrypt") {
    throw new Error(`Unsupported passwordHasher for ${record.email}: ${record.passwordHasher}`);
  }
  if (record.passwordDigest.includes(" ")) {
    throw new Error(`Invalid passwordDigest for ${record.email}`);
  }

  const role = allowedRoles.has(record.role) ? record.role : "USER";
  const [firstName, ...rest] = String(record.fullName || "").trim().split(/\s+/);
  const lastName = rest.join(" ");

  const created = await clerk("/users", {
    method: "POST",
    body: JSON.stringify({
      external_id: record.id,
      first_name: firstName || undefined,
      last_name: lastName || undefined,
      email_address: [record.email],
      password_digest: record.passwordDigest,
      password_hasher: "bcrypt",
      skip_legal_checks: true,
      public_metadata: {
        role,
        country: record.country || "",
      },
      private_metadata: {
        supabase_user_id: record.id,
        mobile: record.mobile || "",
        address: record.address || "",
        migration_source: "supabase",
      },
    }),
  });

  console.log(`Imported ${record.email} as ${created.id}`);
}
