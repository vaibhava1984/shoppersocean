import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { requireAdmin } from "@/utils/auth/requireUser";
import { ensureBookPricingTable } from "@/utils/book-pricing";

function parseBook(row: any) {
  let coverImages: string[] = [];
  try {
    const parsed = JSON.parse(String(row.cover_images ?? "[]"));
    if (Array.isArray(parsed)) coverImages = parsed;
  } catch {}
  return {
    ...row,
    id: String(row.id),
    author_id: row.author_id ? String(row.author_id) : "",
    author_name: row.author_name ?? row.joined_author_name ?? "",
    cover_images: coverImages,
    authors: row.joined_author_id
      ? { id: String(row.joined_author_id), name: row.joined_author_name ?? "" }
      : null,
  };
}

const BOOK_SELECT = `SELECT
  b.id,b.title,b.description,b.published_date,b.isbn,b.price,b.ratings,b.cover_images,
  b.binding,b.language,b.genre,b.publisher,b.pages,b.author_id,b.author_name,b.updated_at,
  bp.price_inr AS price_inr,bp.price_usd AS price_usd,bp.price_eur AS price_eur,bp.price_cny AS price_cny,bp.price_rub AS price_rub,
  a.id AS joined_author_id,a.name AS joined_author_name
  FROM books b
  LEFT JOIN authors a ON a.id=b.author_id
  LEFT JOIN book_pricing bp ON bp.book_id=b.id
`;

export async function GET(request: Request) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database is unavailable" }, { status: 503 });
    await ensureBookPricingTable(db);

    const requestedBookId = new URL(request.url).searchParams.get("id");
    if (requestedBookId) {
      const row = await db.prepare(
        BOOK_SELECT + " WHERE b.id=? AND COALESCE(b.is_deleted,0)=0 LIMIT 1"
      ).bind(requestedBookId).first<any>();
      if (!row) return NextResponse.json({ error: "Book not found" }, { status: 404 });
      return NextResponse.json({ book: parseBook(row) }, {
        headers: { "Cache-Control": "no-store" },
      });
    }

    // The list view does not display cover images. Avoid parsing and sending
    // potentially large base64 images for every book; load them only on edit.
    const { results = [] } = await db.prepare(
      BOOK_SELECT + " WHERE COALESCE(b.is_deleted,0)=0 ORDER BY b.created_at DESC"
    ).all<any>();

    return NextResponse.json({ books: results.map((row) => parseBook({ ...row, cover_images: "[]" })) }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    console.error("Admin books GET:", e);
    return NextResponse.json({ error: "Unable to load books" }, { status: 500 });
  }
}

async function saveBook(request: Request, id?: string) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  const db = getD1();
  if (!db) return NextResponse.json({ error: "Cloudflare database is unavailable" }, { status: 503 });

  const body = await request.json();
  await ensureBookPricingTable(db);
  const title = String(body.title ?? "").trim();
  const authorId = String(body.author_id ?? "").trim();
  if (!title || !authorId) return NextResponse.json({ error: "Book title and author are required" }, { status: 400 });

  const author = await db.prepare(
    "SELECT id,name FROM authors WHERE id=? AND COALESCE(is_deleted,0)=0 LIMIT 1"
  ).bind(authorId).first<any>();
  if (!author) return NextResponse.json({ error: "Author not found" }, { status: 404 });

  const priceINR = Number(body.price_inr ?? body.price ?? 0);
  const priceUSD = Number(body.price_usd ?? 0);
  const priceEUR = Number(body.price_eur ?? 0);
  const priceCNY = Number(body.price_cny ?? 0);
  const priceRUB = Number(body.price_rub ?? 0);
  if ([priceINR, priceUSD, priceEUR, priceCNY, priceRUB].some((value) => !Number.isFinite(value) || value <= 0)) {
    return NextResponse.json({ error: "Enter a valid positive price for INR, USD, EUR, CNY, and RUB." }, { status: 400 });
  }

  const coverImages = Array.isArray(body.cover_images) ? body.cover_images : [];
  const pages = Number(body.pages ?? 0);
  const genre = body.genre == null ? "" : String(body.genre);
  if (!Number.isFinite(pages) || pages <= 0) {
    return NextResponse.json({ error: "A valid number of pages is required" }, { status: 400 });
  }
  if (pages <= 50 && genre !== "Short Books") {
    return NextResponse.json(
      { error: "Books with 50 pages or fewer must be submitted in the 'Short Books' genre." },
      { status: 400 }
    );
  }
  if (pages > 50 && genre === "Short Books") {
    return NextResponse.json(
      { error: "Books with more than 50 pages must be submitted in a non-short-book genre." },
      { status: 400 }
    );
  }
  const now = new Date().toISOString();
  const savedId = id || crypto.randomUUID();

  const values = [
    title,
    body.description == null ? null : String(body.description),
    body.published_date == null ? null : String(body.published_date),
    body.isbn == null ? null : String(body.isbn),
    priceINR,
    Number(body.ratings ?? 0) || 0,
    JSON.stringify(coverImages),
    body.binding == null ? null : String(body.binding),
    body.language == null ? null : String(body.language),
    body.genre == null ? null : String(body.genre),
    body.publisher == null ? null : String(body.publisher),
    pages,
    authorId,
    String(author.name ?? ""),
    now,
  ];

  if (id) {
    const existing = await db.prepare("SELECT id FROM books WHERE id=? LIMIT 1").bind(id).first();
    if (!existing) return NextResponse.json({ error: "Book not found" }, { status: 404 });

    await db.prepare(
      `UPDATE books SET title=?,description=?,published_date=?,isbn=?,price=?,ratings=?,
       cover_images=?,binding=?,language=?,genre=?,publisher=?,pages=?,author_id=?,author_name=?,updated_at=?
       WHERE id=?`
    ).bind(...values, id).run();
  } else {
    await db.prepare(
      `INSERT INTO books
       (id,title,description,published_date,isbn,price,ratings,cover_images,binding,language,genre,publisher,pages,author_id,author_name,is_deleted,created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,?,?)`
    ).bind(savedId, ...values.slice(0, 14), now, now).run();
  }

  await db.prepare(
    `INSERT INTO book_pricing (book_id,price_inr,price_usd,price_eur,price_cny,price_rub,updated_at)
     VALUES (?,?,?,?,?,?,?)
     ON CONFLICT(book_id) DO UPDATE SET price_inr=excluded.price_inr,price_usd=excluded.price_usd,
       price_eur=excluded.price_eur,price_cny=excluded.price_cny,price_rub=excluded.price_rub,updated_at=excluded.updated_at`
  ).bind(savedId, priceINR, priceUSD, priceEUR, priceCNY, priceRUB, now).run();

  return NextResponse.json({ id: savedId, message: id ? "Book updated successfully" : "Book added successfully" });
}

export async function POST(request: Request) {
  try { return await saveBook(request); }
  catch (e) {
    console.error("Admin books POST:", e);
    return NextResponse.json({ error: "Unable to save book" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const id = String(body.id ?? "").trim();
    if (!id) return NextResponse.json({ error: "Book ID is required" }, { status: 400 });
    return await saveBook(new Request(request.url, { method: "POST", body: JSON.stringify(body) }), id);
  } catch (e) {
    console.error("Admin books PUT:", e);
    return NextResponse.json({ error: "Unable to update book" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database is unavailable" }, { status: 503 });
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "Book ID is required" }, { status: 400 });

    await db.prepare("UPDATE books SET is_deleted=1,updated_at=? WHERE id=?")
      .bind(new Date().toISOString(), String(id)).run();

    return NextResponse.json({ message: "Book deleted successfully" });
  } catch (e) {
    console.error("Admin books DELETE:", e);
    return NextResponse.json({ error: "Unable to delete book" }, { status: 500 });
  }
}
