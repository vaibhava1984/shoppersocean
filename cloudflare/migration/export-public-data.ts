/**
 * Supabase -> Cloudflare D1 migration exporter.
 *
 * This script contains NO production data. It reads the current Supabase
 * public tables using environment variables and writes a D1-compatible SQL
 * file locally. It deliberately does not touch Supabase or Cloudflare.
 *
 * Required environment:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   npx tsx cloudflare/migration/export-public-data.ts ./cloudflare/migration/export.sql
 *
 * The generated file is intentionally ignored by git. Do not commit it:
 * it contains user/order data.
 */

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const output = process.argv[2] ?? path.resolve("cloudflare/migration/export.sql");
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const pageSize = 1000;

function sqlValue(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "1" : "0";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  if (typeof value === "object") {
    return "'" + JSON.stringify(value).replaceAll("'", "''") + "'";
  }
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
  // profiles are intentionally transformed into the D1 users table.
  // Authentication credentials are NOT exported here; Clerk migration is a
  // separate protected step so password hashes never enter this SQL file.
  const [profiles, authors, books, files, orders, payments, testimonials, interests, layout] =
    await Promise.all([
      readAll("profiles"),
      readAll("authors"),
      readAll("books"),
      readAll("private_book_files"),
      readAll("orders"),
      readAll("payments"),
      readAll("testimonials"),
      readAll("authors_interest_submission"),
      readAll("layout_settings"),
    ]);

  const users = profiles.map((p) => ({
    id: p.id,
    clerk_user_id: null,
    email: p.email ?? "",
    full_name: p.full_name ?? "",
    country: "",
    mobile: "",
    address: "",
    role: "user",
    created_at: p.created_at ?? null,
    updated_at: p.updated_at ?? null,
  }));

  const chunks = [
    "-- Shoppers Ocean Supabase -> D1 data export.\n",
    "-- Generated locally; contains private application data.\n",
    "PRAGMA foreign_keys = OFF;\n",
    insertStatements("users", users),
    insertStatements("authors", authors),
    insertStatements("books", books),
    insertStatements("private_book_files", files.map((f) => ({ ...f, r2_key: null }))),
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
      authors: authors.length,
      books: books.length,
      private_book_files: files.length,
      orders: orders.length,
      payments: payments.length,
      testimonials: testimonials.length,
      authors_interest_submission: interests.length,
      layout_settings: layout.length,
    },
    note: "Authentication/password hashes and R2 objects are intentionally handled separately.",
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
