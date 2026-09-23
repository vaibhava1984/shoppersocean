/**
 * Supabase -> Cloudflare D1 migration exporter.
 *
 * No production data is stored in this repository. The script reads the
 * current Supabase project and creates a local D1-compatible SQL export.
 * Authentication credentials/password hashes are intentionally excluded.
 *
 * Required:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   npx tsx cloudflare/migration/export-public-data.ts ./cloudflare/migration/export.sql
 */

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const output = process.argv[2] ?? path.resolve("cloudflare/migration/export.sql");
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const pageSize = 1000;

function sqlValue(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "1" : "0";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  if (typeof value === "object") return "'" + JSON.stringify(value).replaceAll("'", "''") + "'";
  return "'" + String(value).replaceAll("'", "''") + "'";
}

async function readAll(table: string) {
  const rows: Record<string, unknown>[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase.from(table).select("*").range(from, from + pageSize - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...((data ?? []) as Record<string, unknown>[]));
    if (!data || data.length < pageSize) break;
  }
  return rows;
}

async function readAuthUsers() {
  const users: any[] = [];
  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`auth.users: ${error.message}`);
    users.push(...data.users);
    if (data.users.length < 1000) break;
  }
  return users;
}

function insertStatements(table: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return `-- ${table}: 0 rows\\n`;
  const columns = Object.keys(rows[0]);
  const lines = rows.map((row) => {
    const values = columns.map((column) => sqlValue(row[column])).join(", ");
    return `INSERT OR REPLACE INTO "${table}" ("${columns.join('", "')}") VALUES (${values});`;
  });
  return `-- ${table}: ${rows.length} rows\\n${lines.join("\\n")}\\n`;
}

async function main() {
  const [profiles, authUsers, roles, authors, books, files, orders, payments, testimonials, interests, layout] =
    await Promise.all([
      readAll("profiles"),
      readAuthUsers(),
      readAll("user_roles"),
      readAll("authors"),
      readAll("books"),
      readAll("private_book_files"),
      readAll("orders"),
      readAll("payments"),
      readAll("testimonials"),
      readAll("authors_interest_submission"),
      readAll("layout_settings"),
    ]);

  const authById = new Map(authUsers.map((u) => [u.id, u]));
  const roleByUser = new Map(roles.map((r) => [r.user_id, r.role]));

  // profiles + auth metadata become the D1 user record. Password hashes are
  // never written to this SQL export; they are handled by the Clerk import.
  const users = profiles.map((p) => {
    const auth = authById.get(p.id) ?? {};
    const metadata = auth.user_metadata ?? {};
    return {
      id: p.id,
      clerk_user_id: null,
      email: p.email ?? auth.email ?? "",
      full_name: p.full_name ?? metadata.full_name ?? metadata.name ?? "",
      country: metadata.country ?? "",
      mobile: auth.phone ?? metadata.mobile ?? "",
      address: metadata.address ?? "",
      role: roleByUser.get(p.id) ?? "user",
      created_at: p.created_at ?? auth.created_at ?? null,
      updated_at: p.updated_at ?? auth.updated_at ?? null,
    };
  });

  // private_book_files keeps the original Supabase path for auditability.
  // r2_key is deliberately blank until the R2 object migration maps each
  // verified object to its new private key.
  const filesForD1 = files.map((f) => ({ ...f, r2_key: null }));

  const chunks = [
    "-- Shoppers Ocean Supabase -> D1 data export.\n",
    "-- Generated locally; contains private application data.\n",
    "-- DO NOT commit this generated file to Git.\n",
    "PRAGMA foreign_keys = OFF;\n",
    insertStatements("users", users),
    insertStatements("authors", authors),
    insertStatements("books", books),
    insertStatements("private_book_files", filesForD1),
    insertStatements("orders", orders),
    insertStatements("payments", payments),
    insertStatements("testimonials", testimonials),
    insertStatements("authors_interest_submission", interests),
    insertStatements("layout_settings", layout),
    "PRAGMA foreign_keys = ON;\n",
  ];

  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, chunks.join("\n"), "utf8");

  console.log(JSON.stringify({
    output,
    counts: {
      users: users.length,
      auth_users_seen: authUsers.length,
      authors: authors.length,
      books: books.length,
      private_book_files: files.length,
      orders: orders.length,
      payments: payments.length,
      testimonials: testimonials.length,
      authors_interest_submission: interests.length,
      layout_settings: layout.length,
    },
    note: "Password hashes are excluded from this export and must be migrated to Clerk separately.",
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
