import { NextResponse } from "next/server";
import { createClient } from "@/utils/db/server";

function adminOnly(user: any) {
  return user && String(user.role || "").toUpperCase() === "ADMIN";
}

const BOOK_FIELDS = [
  "title","description","published_date","isbn","price","ratings","cover_images",
  "binding","language","genre","publisher","pages","author_id","author_name",
] as const;

const REQUIRED_AUTHORS = ["Vaibhav Ahuja", "Sumit Laley"];

async function ensureRequiredAuthors(db: any) {
  const { data: existing, error } = await db.from("authors")
    .select("id, name, is_deleted");
  if (error) throw error;

  const rows = existing || [];
  for (const name of REQUIRED_AUTHORS) {
    const match = rows.find((author: any) =>
      String(author.name || "").trim().toLowerCase() === name.toLowerCase()
    );
    if (match) {
      if (match.is_deleted) {
        const { error: updateError } = await db.from("authors")
          .update({ is_deleted: false, updated_at: new Date().toISOString() })
          .eq("id", match.id);
        if (updateError) throw updateError;
      }
      continue;
    }

    const { error: insertError } = await db.from("authors").insert({
      id: crypto.randomUUID(),
      name,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    if (insertError) throw insertError;
  }
}

export async function GET(request: Request) {
  try {
    const db = createClient();
    const { data: { user } } = await db.auth.getUser();
    if (!adminOnly(user)) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

    await ensureRequiredAuthors(db);

    const resource = new URL(request.url).searchParams.get("resource");
    if (resource === "books") {
      const { data, error } = await db.from("books")
        .select("id,title,description,published_date,isbn,price,ratings,cover_images,binding,language,genre,publisher,pages,author_id,author_name,updated_at,is_deleted")
        .eq("is_deleted", false)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      const books = (data || []).map((book: any) => ({
        ...book,
        cover_images: (() => {
          if (Array.isArray(book.cover_images)) return book.cover_images;
          if (typeof book.cover_images === "string") {
            try {
              const parsed = JSON.parse(book.cover_images);
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [];
            }
          }
          return [];
        })(),
      }));
      return NextResponse.json({ data: books });
    }

    const { data, error } = await db.from("authors")
      .select("id, name")
      .eq("is_deleted", false)
      .order("name");
    if (error) throw error;
    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error("Error loading authors:", error);
    return NextResponse.json({ error: "Failed to load authors" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = createClient();
    const { data: { user } } = await db.auth.getUser();
    if (!adminOnly(user)) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

    const body = await request.json();
    const book = body?.book || {};
    if (!String(book.title || "").trim()) return NextResponse.json({ error: "Book title is required" }, { status: 400 });
    if (!String(book.author_id || "").trim()) return NextResponse.json({ error: "Author is required" }, { status: 400 });

    const payload: Record<string, unknown> = {};
    for (const field of BOOK_FIELDS) {
      if (book[field] !== undefined) {
        payload[field] = field === "cover_images" && Array.isArray(book[field])
          ? JSON.stringify(book[field])
          : book[field];
      }
    }
    payload.id = crypto.randomUUID();
    payload.is_deleted = false;
    payload.isCompletelyFilled = Boolean(body.isCompletelyFilled);
    payload.updated_at = new Date().toISOString();

    const { data, error } = await db.from("books").insert(payload);
    if (error) throw error;
    return NextResponse.json({ data: data?.[0] || payload }, { status: 201 });
  } catch (error) {
    console.error("Error adding book:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to add book" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const db = createClient();
    const { data: { user } } = await db.auth.getUser();
    if (!adminOnly(user)) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

    const body = await request.json();
    const bookId = String(body?.bookId || "");
    const book = body?.book || {};
    if (!bookId) return NextResponse.json({ error: "Book ID is required" }, { status: 400 });
    if (!String(book.title || "").trim()) return NextResponse.json({ error: "Book title is required" }, { status: 400 });

    if (!String(book.author_id || "").trim()) return NextResponse.json({ error: "Author is required" }, { status: 400 });

    const payload: Record<string, unknown> = {};
    for (const field of BOOK_FIELDS) {
      if (book[field] !== undefined) {
        payload[field] = field === "cover_images" && Array.isArray(book[field])
          ? JSON.stringify(book[field])
          : book[field];
      }
    }
    payload.isCompletelyFilled = Boolean(body.isCompletelyFilled);
    payload.updated_at = new Date().toISOString();

    const { data, error } = await db.from("books").update(payload).eq("id", bookId);
    if (error) throw error;
    return NextResponse.json({ data: data?.[0] || payload });
  } catch (error) {
    console.error("Error updating book:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update book" }, { status: 500 });
  }
}


export async function DELETE(request: Request) {
  try {
    const db = createClient();
    const { data: { user } } = await db.auth.getUser();
    if (!adminOnly(user)) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

    const body = await request.json();
    const bookId = String(body?.bookId || "");
    if (!bookId) return NextResponse.json({ error: "Book ID is required" }, { status: 400 });

    const { data, error } = await db.from("books")
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq("id", bookId);
    if (error) throw error;
    return NextResponse.json({ data: data?.[0] || { id: bookId } });
  } catch (error) {
    console.error("Error deleting book:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to delete book" }, { status: 500 });
  }
}
