import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { requireUser } from "@/utils/auth/requireUser";
import { addAdminNotification } from "@/utils/adminNotifications";

async function ensureCommentReplies(db: any) {
  try { await db.prepare("ALTER TABLE testimonials ADD COLUMN parent_id TEXT").run(); } catch { /* already exists */ }
}

export async function GET(request: Request) {
  try {
    const bookId = new URL(request.url).searchParams.get("bookId");
    if (!bookId) return NextResponse.json({ error: "Book ID is required." }, { status: 400 });
    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database is unavailable" }, { status: 503 });
    await ensureCommentReplies(db);
    const { results = [] } = await db.prepare(
      `SELECT t.id,t.content AS description,t.rating,t.user_id,t.book_id,t.parent_id,t.created_at,
              CASE WHEN UPPER(COALESCE(u.role,'')) LIKE '%ADMIN%' THEN 'admin'
                   ELSE COALESCE(NULLIF(u.full_name,''),u.email,'Reader') END AS users,
              CASE WHEN UPPER(COALESCE(u.role,'')) LIKE '%ADMIN%' THEN 1 ELSE 0 END AS is_admin
       FROM testimonials t LEFT JOIN users u ON u.id=t.user_id
       WHERE t.book_id=? ORDER BY t.created_at ASC`
    ).bind(bookId).all<any>();
    return NextResponse.json({ reviews: results }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("Book comments GET:", e);
    return NextResponse.json({ error: "Unable to fetch comments." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const identity = await requireUser();
    if (!identity) return NextResponse.json({ error: "Please sign in to comment." }, { status: 401 });
    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database is unavailable" }, { status: 503 });
    await ensureCommentReplies(db);
    const body = await request.json();
    const bookId = String(body.bookId ?? "");
    const text = String(body.description ?? "").trim();
    const stars = Number(body.rating || 0);
    const parentId = body.parentId ? String(body.parentId) : null;
    if (!bookId || !text || text.length > 2000 || !Number.isInteger(stars) || stars < 0 || stars > 5)
      return NextResponse.json({ error: "Please provide a comment and an optional rating from 1 to 5." }, { status: 400 });
    const book = await db.prepare("SELECT id,title FROM books WHERE id=? AND COALESCE(is_deleted,0)=0 LIMIT 1").bind(bookId).first<any>();
    if (!book) return NextResponse.json({ error: "Book not found." }, { status: 404 });
    const userId = String(identity.profile.id);
    const isAdmin = String(identity.user.publicMetadata.userrole ?? "").trim().toUpperCase() === "ADMIN";
    if (parentId) {
      const parent = await db.prepare("SELECT id,user_id,parent_id FROM testimonials WHERE id=? AND book_id=? LIMIT 1").bind(parentId,bookId).first<any>();
      if (!parent) return NextResponse.json({ error: "The comment you are replying to could not be found." }, { status: 404 });
      if (!isAdmin && String(parent.user_id) === userId) return NextResponse.json({ error: "You cannot reply to your own comment." }, { status: 403 });
    } else if (stars < 0 || stars > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5, or omitted." }, { status: 400 });
    }
    const name = isAdmin ? "admin" : String(identity.profile.full_name || identity.profile.email || "Reader");
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await db.prepare("INSERT INTO testimonials(id,content,rating,user_id,book_id,approved,created_at,updated_at,parent_id) VALUES(?,?,?,?,?,?,?,?,?)")
      .bind(id,text,stars,userId,bookId,1,now,now,parentId).run();
    await addAdminNotification(db, {
      type: "book_review", title: parentId ? "New comment reply" : "New book comment",
      message: parentId ? name + " replied to a comment on “" + String(book.title || "a book") + "”. " : name + " commented on “" + String(book.title || "a book") + "”.",
      details: { reviewId: id, commentId: id, parentId, userId, name, bookId, bookTitle: String(book.title || ""), comment: text }
    });
    return NextResponse.json({ message: "Comment posted successfully.", review: {
      id, description: text, rating: stars, users: name, user_id: userId, book_id: bookId, parent_id: parentId, created_at: now, is_admin: isAdmin ? 1 : 0
    } }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("Book comments POST:", e);
    return NextResponse.json({ error: "Unable to submit comment." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const identity = await requireUser();
    if (!identity) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database is unavailable" }, { status: 503 });
    await ensureCommentReplies(db);
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "Comment ID is required." }, { status: 400 });
    const comment = await db.prepare("SELECT id,user_id FROM testimonials WHERE id=? LIMIT 1").bind(String(id)).first<any>();
    if (!comment) return NextResponse.json({ error: "Comment not found." }, { status: 404 });
    const isAdmin = String(identity.user.publicMetadata.userrole ?? "").trim().toUpperCase() === "ADMIN";
    if (!isAdmin && String(comment.user_id) !== String(identity.profile.id))
      return NextResponse.json({ error: "You can delete only your own comments." }, { status: 403 });
    const deleteTree = async (commentId: string): Promise<void> => {
      const { results: children = [] } = await db.prepare("SELECT id FROM testimonials WHERE parent_id=?").bind(commentId).all<any>();
      for (const child of children) await deleteTree(String(child.id));
      await db.prepare("DELETE FROM testimonials WHERE id=?").bind(commentId).run();
    };
    await deleteTree(String(id));
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("Book comments DELETE:", e);
    return NextResponse.json({ error: "Unable to delete comment." }, { status: 500 });
  }
}
