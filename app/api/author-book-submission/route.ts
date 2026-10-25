import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { requireUser } from "@/utils/auth/requireUser";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { putB2Object, deleteB2Object, getB2ObjectUrl } from "@/utils/cloudflare/b2";

const MAX_BOOK = 2 * 1024 * 1024;
const MAX_COVER = 200 * 1024;
const ADMIN_EMAIL = "kochimonu@gmail.com";
const BASE_URL = "https://www.shoppersocean.com";
const IMAGE_TYPES: Record<string, string> = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };

function escapeHtml(v: unknown) { return String(v ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }
function b64(bytes: Uint8Array) { let s=""; for(let i=0;i<bytes.length;i+=0x8000) s+=String.fromCharCode(...bytes.subarray(i,i+0x8000)); return btoa(s); }
async function ensureTable(db: any) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS author_book_submissions (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, author_name TEXT NOT NULL, email TEXT NOT NULL,
    book_key TEXT NOT NULL, cover_key TEXT NOT NULL, book_filename TEXT NOT NULL,
    cover_filename TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', submitted_at TEXT NOT NULL,
    review_token TEXT NOT NULL, reviewed_at TEXT, review_note TEXT
  )`).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_author_book_submissions_user ON author_book_submissions(user_id, submitted_at)").run();
}
async function sendEmail(env: any, payload: any) {
  const key = String(env.RESEND_API_KEY || "");
  if (!key) throw new Error("Email service is not configured.");
  const response = await fetch("https://api.resend.com/emails", {
    method:"POST", headers:{Authorization:"Bearer "+key,"Content-Type":"application/json"}, body:JSON.stringify(payload)
  });
  if (!response.ok) throw new Error("Unable to notify the review team ("+response.status+").");
}
export async function GET() {
  try {
    const identity = await requireUser();
    if (!identity) return NextResponse.json({error:"Authentication required"},{status:401});
    const db = getD1(); if (!db) return NextResponse.json({error:"Database unavailable"},{status:503});
    await ensureTable(db);
    const applicationAuthor = await db.prepare("SELECT full_name FROM author_applications WHERE user_id=? AND status='completed' ORDER BY created_at DESC LIMIT 1").bind(identity.profile.id).first<any>();
    const existingAuthor = await db.prepare("SELECT name FROM authors WHERE user_id=? AND COALESCE(is_deleted,0)=0 LIMIT 1").bind(identity.profile.id).first<any>();
    const author = applicationAuthor || (existingAuthor ? { full_name: existingAuthor.name } : null);
    if (!author) return NextResponse.json({status:"not_author"},{headers:{"Cache-Control":"no-store"}});
    const row = await db.prepare("SELECT status,submitted_at,reviewed_at FROM author_book_submissions WHERE user_id=? ORDER BY submitted_at DESC LIMIT 1").bind(identity.profile.id).first<any>();
    if (!row) return NextResponse.json({status:"available"},{headers:{"Cache-Control":"no-store"}});
    const submitted = new Date(row.submitted_at).getTime();
    const cooldownUntil = submitted + 24*60*60*1000;
    if (row.status === "pending") return NextResponse.json({status:"pending",submittedAt:row.submitted_at},{headers:{"Cache-Control":"no-store"}});
    if (row.status === "rejected") return NextResponse.json({status:"rejected",cooldownUntil:new Date(cooldownUntil).toISOString()},{headers:{"Cache-Control":"no-store"}});
    if (Date.now() < cooldownUntil) return NextResponse.json({status:"cooldown",cooldownUntil:new Date(cooldownUntil).toISOString()},{headers:{"Cache-Control":"no-store"}});
    return NextResponse.json({status:"available"},{headers:{"Cache-Control":"no-store"}});
  } catch(e) { console.error("Author book status:",e); return NextResponse.json({error:"Unable to check your submission status."},{status:500}); }
}
export async function POST(request: Request) {
  let bookKey="", coverKey="", submissionId="";
  try {
    const identity = await requireUser();
    if (!identity) return NextResponse.json({error:"Please sign in to submit your book."},{status:401});
    const db = getD1(); if (!db) return NextResponse.json({error:"Database unavailable."},{status:503});
    await ensureTable(db);
    const applicationAuthor = await db.prepare("SELECT full_name,email FROM author_applications WHERE user_id=? AND status='completed' ORDER BY created_at DESC LIMIT 1").bind(identity.profile.id).first<any>();
    const existingAuthor = await db.prepare("SELECT name FROM authors WHERE user_id=? AND COALESCE(is_deleted,0)=0 LIMIT 1").bind(identity.profile.id).first<any>();
    const author = applicationAuthor || (existingAuthor ? { full_name: existingAuthor.name, email: identity.profile.email } : null);
    if (!author) return NextResponse.json({error:"Only registered authors can submit books."},{status:403});
    const latest = await db.prepare("SELECT status,submitted_at FROM author_book_submissions WHERE user_id=? ORDER BY submitted_at DESC LIMIT 1").bind(identity.profile.id).first<any>();
    if (latest?.status === "pending") return NextResponse.json({error:"Your previous book is still under review."},{status:409});
    if (latest && Date.now()-new Date(latest.submitted_at).getTime() < 24*60*60*1000) return NextResponse.json({error:"You may submit one book every 24 hours. Please try again after the waiting period."},{status:429});
    const form = await request.formData();
    const book = form.get("book");
    const cover = form.get("cover");
    if (!(book instanceof File) || !(cover instanceof File) || !book.size || !cover.size) return NextResponse.json({error:"Please select both your DOCX manuscript and cover page."},{status:400});
    if (book.size > MAX_BOOK) return NextResponse.json({error:"Your DOCX manuscript must not exceed 2 MB."},{status:400});
    if (cover.size > MAX_COVER) return NextResponse.json({error:"Your cover image must not exceed 200 KB."},{status:400});
    if (!book.name.toLowerCase().endsWith(".docx") || !["application/vnd.openxmlformats-officedocument.wordprocessingml.document","application/octet-stream","application/zip"].includes(book.type || "application/octet-stream")) return NextResponse.json({error:"Dear author, only DOCX file format is supported"},{status:400});
    if (!IMAGE_TYPES[cover.type] || !cover.name.toLowerCase().match(/\.(jpe?g|png|webp)$/)) return NextResponse.json({error:"Please upload a JPG, PNG, or WebP cover image."},{status:400});
    const bookBytes = new Uint8Array(await book.arrayBuffer());
    const coverBytes = new Uint8Array(await cover.arrayBuffer());
    if (bookBytes[0] !== 0x50 || bookBytes[1] !== 0x4b) return NextResponse.json({error:"The selected file does not appear to be a valid DOCX document."},{status:400});
    if (cover.type==="image/jpeg" && !(coverBytes[0]===0xff && coverBytes[1]===0xd8) || cover.type==="image/png" && !(coverBytes[0]===0x89 && coverBytes[1]===0x50 && coverBytes[2]===0x4e && coverBytes[3]===0x47) || cover.type==="image/webp" && !(String.fromCharCode(...coverBytes.slice(0,4))==="RIFF" && String.fromCharCode(...coverBytes.slice(8,12))==="WEBP")) return NextResponse.json({error:"The selected cover file is not a valid supported image."},{status:400});
    const {env} = await getCloudflareContext();
    const id=crypto.randomUUID(), token=crypto.randomUUID()+crypto.randomUUID(), now=new Date().toISOString(); submissionId=id;
    const prefix="author-submissions/"+identity.profile.id+"/"+id;
    bookKey=prefix+"/manuscript.docx"; coverKey=prefix+"/cover"+IMAGE_TYPES[cover.type];
    await putB2Object(bookKey,bookBytes,"application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    await putB2Object(coverKey,coverBytes,cover.type);
    const authorName=String(author.full_name||identity.profile.full_name||"Author");
    const email=String(author.email||identity.profile.email||"");
    await db.prepare("INSERT INTO author_book_submissions(id,user_id,author_name,email,book_key,cover_key,book_filename,cover_filename,status,submitted_at,review_token) VALUES(?,?,?,?,?,?,?,?,?,?,?)")
      .bind(id,identity.profile.id,authorName,email,bookKey,coverKey,book.name,cover.name,"pending",now,token).run();
    const bookUrl=await getB2ObjectUrl(bookKey,600), coverUrl=await getB2ObjectUrl(coverKey,600);
    const [bookRes,coverRes]=await Promise.all([fetch(bookUrl),fetch(coverUrl)]);
    if(!bookRes.ok || !coverRes.ok) throw new Error("Could not prepare the uploaded files for review.");
    const [bookData,coverData]=await Promise.all([bookRes.arrayBuffer(),coverRes.arrayBuffer()]);
    const safeName=escapeHtml(authorName), safeEmail=escapeHtml(email);
    const approve=BASE_URL+"/api/author-book-review?token="+encodeURIComponent(token)+"&action=approve";
    const reject=BASE_URL+"/api/author-book-review?token="+encodeURIComponent(token)+"&action=reject";
    await sendEmail(env,{from:"no-reply@shoppersocean.com",to:ADMIN_EMAIL,subject:"Book submission awaiting review — "+authorName,html:`<div style="font-family:Arial,sans-serif;background:#f1f5f9;padding:28px;color:#1e293b"><div style="max-width:640px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #dbeafe"><div style="background:linear-gradient(135deg,#1d4ed8,#0891b2);padding:24px;color:white"><h1 style="margin:0">New Author Book Submission</h1></div><div style="padding:26px;line-height:1.7"><p>Dear admin,</p><p>Registered author <strong>${safeName}</strong> has submitted a book for review.</p><p><strong>Author:</strong> ${safeName}<br><strong>Email:</strong> ${safeEmail}<br><strong>Manuscript:</strong> ${escapeHtml(book.name)}<br><strong>Cover:</strong> ${escapeHtml(cover.name)}</p><p>The DOCX manuscript and cover page are attached to this email.</p><div style="margin:28px 0"><a href="${approve}" style="display:inline-block;background:#15803d;color:#fff;text-decoration:none;padding:13px 24px;border-radius:8px;font-weight:bold;margin-right:10px">Approve Book</a><a href="${reject}" style="display:inline-block;background:#b91c1c;color:#fff;text-decoration:none;padding:13px 24px;border-radius:8px;font-weight:bold">Reject Book</a></div><p style="font-size:13px;color:#64748b">Selecting a button opens a confirmation page before the decision is recorded.</p><p>Regards,<br>Shoppers Ocean</p></div></div></div>`,attachments:[{filename:book.name,content:b64(new Uint8Array(bookData))},{filename:cover.name,content:b64(new Uint8Array(coverData))}]});
    return NextResponse.json({success:true,status:"pending"},{headers:{"Cache-Control":"no-store"}});
  } catch(e) {
    console.error("Author book submission failed:",e);
    try { if(submissionId) { const db=getD1(); if(db) await db.prepare("DELETE FROM author_book_submissions WHERE id=? AND status='pending'").bind(submissionId).run(); } } catch {}
    try { if(bookKey) await deleteB2Object(bookKey); } catch {}
    try { if(coverKey) await deleteB2Object(coverKey); } catch {}
    return NextResponse.json({error:e instanceof Error ? e.message : "Your submission could not be completed. Please try again."},{status:500});
  }
}
