import { NextResponse } from "next/server";
import { createClient } from "@/utils/db/server";

function adminOnly(user: any) {
  return user && String(user.role || "").toUpperCase() === "ADMIN";
}

const BOOK_FIELDS = [
  "title","description","published_date","isbn","price","ratings","cover_images",
  "binding","language","genre","publisher","pages","author_id","author_name",
] as const;

export async function GET() {
  try {
    const db = createClient();
    const { data: { user } } = await db.auth.getUser();
    if (!adminOnly(user)) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

    const { data, error } = await db.from("authors")
      .select("author_id, name")
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
    for (const field of BOOK_FIELDS) if (book[field] !== undefined) payload[field] = book[field];
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
    for (const field of BOOK_FIELDS) if (book[field] !== undefined) payload[field] = book[field];
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
