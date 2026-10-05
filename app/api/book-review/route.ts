import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { requireUser } from "@/utils/auth/requireUser";

export async function GET(request: Request) {
  try {
    const bookId = new URL(request.url).searchParams.get("bookId");
    if (!bookId) return NextResponse.json({ error: "Book ID is required." }, { status: 400 });

    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database is unavailable" }, { status: 503 });

    const { results = [] } = await db.prepare(
      `SELECT t.id,t.content AS description,t.rating,t.user_id,t.book_id,t.created_at,
              COALESCE(NULLIF(u.full_name,''),u.email,'Reader') AS users
       FROM testimonials t
       LEFT JOIN users u ON u.id=t.user_id
       WHERE t.book_id=?
       ORDER BY t.created_at DESC`
    ).bind(bookId).all<any>();

    return NextResponse.json({ reviews: results }, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (e) {
    console.error("Book reviews GET:", e);
    return NextResponse.json({ error: "Unable to fetch reviews." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const identity = await requireUser();
    if (!identity) return NextResponse.json({ error: "Please sign in to write a review." }, { status: 401 });

    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database is unavailable" }, { status: 503 });

    const { bookId, description, rating } = await request.json();
    const text = String(description ?? "").trim();
    const stars = Number(rating);

    if (!bookId || !text || !Number.isInteger(stars) || stars < 1 || stars > 5) {
      return NextResponse.json({ error: "Please provide a review and a rating from 1 to 5." }, { status: 400 });
    }

    const book = await db.prepare(
      "SELECT id FROM books WHERE id=? AND COALESCE(is_deleted,0)=0 LIMIT 1"
    ).bind(String(bookId)).first();
    if (!book) return NextResponse.json({ error: "Book not found." }, { status: 404 });

    const userId = String(identity.profile.id);
    const existing = await db.prepare(
      "SELECT id FROM testimonials WHERE book_id=? AND user_id=? LIMIT 1"
    ).bind(String(bookId),userId).first();
    if (existing) return NextResponse.json({ error: "You have already reviewed this book." }, { status: 409 });

    const name = String(
      identity.profile.full_name ||
      identity.user.emailAddresses?.[0]?.emailAddress ||
      "Reader"
    );

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await db.prepare(
      "INSERT INTO testimonials(id,content,rating,user_id,book_id,approved,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)"
    ).bind(id,text,stars,userId,String(bookId),1,now,now).run();

    return NextResponse.json({
      message: "Review submitted successfully.",
      review: {
        id, description: text, rating: stars, users: name, user_id: userId, book_id: String(bookId), created_at: now
      }
    }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("Book reviews POST:", e);
    return NextResponse.json({ error: "Unable to submit your review." }, { status: 500 });
  }
}
