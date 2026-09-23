/**
 * R2 migration manifest generator.
 *
 * This does not copy objects. It creates a deterministic mapping from each
 * Supabase private_book_files record to its future private R2 key. The actual
 * object transfer must be run with authorized storage/R2 credentials.
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const output = process.argv[2] ?? path.resolve("cloudflare/migration/r2-manifest.json");
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");

const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

function r2Key(bookId: string, fileId: string, fileName: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `books/${bookId}/${fileId}-${safeName}`;
}

async function main() {
  const { data, error } = await supabase
    .from("private_book_files")
    .select("id,book_id,file_path,file_name,file_type")
    .order("book_id")
    .order("file_name");

  if (error) throw new Error(error.message);

  const manifest = (data ?? []).map((file) => ({
    id: file.id,
    book_id: file.book_id,
    source_bucket: "books-content",
    source_key: file.file_path,
    file_name: file.file_name,
    file_type: file.file_type,
    r2_key: r2Key(file.book_id, file.id, file.file_name),
    status: "pending",
  }));

  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(manifest, null, 2), "utf8");
  console.log(JSON.stringify({ output, files: manifest.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
