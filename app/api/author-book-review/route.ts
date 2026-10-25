import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "edge";
const ADMIN_EMAIL = "kochimonu@gmail.com";
function escapeHtml(v: unknown) { return String(v ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }
function page(title:string,body:string,status=200) {
 return new Response(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)} | Shoppers Ocean</title></head><body style="margin:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#1e293b;padding:24px"><main style="max-width:620px;margin:7vh auto;background:white;border:1px solid #dbeafe;border-radius:16px;overflow:hidden;box-shadow:0 12px 30px #0f172a12"><header style="background:linear-gradient(135deg,#1d4ed8,#0891b2);padding:25px;color:white"><h1 style="margin:0;font-size:25px">Shoppers Ocean</h1></header><section style="padding:28px;line-height:1.7"><h2>${escapeHtml(title)}</h2>${body}</section></main></body></html>`,{status,headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"}});
}
async function getSubmission(token:string) {
 const db=getD1(); if(!db) throw new Error("Database unavailable");
 return await db.prepare("SELECT * FROM author_book_submissions WHERE review_token=? LIMIT 1").bind(token).first<any>();
}
export async function GET(request:Request) {
 const url=new URL(request.url), token=url.searchParams.get("token")||"", action=url.searchParams.get("action")||"";
 if(!token || !["approve","reject"].includes(action)) return page("Invalid review link","<p>This review link is invalid or incomplete.</p>",400);
 try {
  const row=await getSubmission(token);
  if(!row) return page("Review link unavailable","<p>This submission could not be found. It may have already been processed.</p>",404);
  if(row.status!=="pending") return page("Already reviewed",`<p>This book submission has already been marked <strong>${escapeHtml(row.status)}</strong>.</p>`);
  const decision=action==="approve"?"Approve this book":"Reject this book";
  const note=action==="approve"?"The author will be notified that the submission has been approved.":"The author will be notified that the submission was not approved.";
  return page(decision,`<p>You are reviewing the manuscript submitted by <strong>${escapeHtml(row.author_name)}</strong> (${escapeHtml(row.email)}).</p><p>${note}</p><form method="post" action="/api/author-book-review"><input type="hidden" name="token" value="${escapeHtml(token)}"><input type="hidden" name="action" value="${escapeHtml(action)}"><button type="submit" style="border:0;border-radius:8px;background:${action==="approve"?"#15803d":"#b91c1c"};color:#fff;padding:14px 22px;font-size:16px;font-weight:bold;cursor:pointer">${decision}</button></form><p style="font-size:13px;color:#64748b">This action is final for this review.</p>`);
 } catch(e) { console.error("Book review link:",e); return page("Unable to load review","<p>Please try again later.</p>",500); }
}
export async function POST(request:Request) {
 try {
  const form=await request.formData(), token=String(form.get("token")||""), action=String(form.get("action")||"");
  if(!token || !["approve","reject"].includes(action)) return page("Invalid request","<p>The review request is invalid.</p>",400);
  const db=getD1(); if(!db) return page("Service unavailable","<p>The database is currently unavailable.</p>",503);
  const row=await db.prepare("SELECT * FROM author_book_submissions WHERE review_token=? LIMIT 1").bind(token).first<any>();
  if(!row) return page("Submission not found","<p>This review link is invalid or expired.</p>",404);
  if(row.status!=="pending") return page("Already reviewed",`<p>This submission has already been marked ${escapeHtml(row.status)}.</p>`);
  const status=action==="approve"?"approved":"rejected", now=new Date().toISOString();
  const changed=await db.prepare("UPDATE author_book_submissions SET status=?,reviewed_at=? WHERE id=? AND status='pending'").bind(status,now,row.id).run();
  if(!changed.meta?.changes) return page("Already reviewed","<p>This submission was already processed by another request.</p>",409);
  const {env}=await getCloudflareContext(), key=String(env.RESEND_API_KEY||"");
  if(key && row.email) {
   const approved=action==="approve";
   const html=`<div style="font-family:Arial,sans-serif;line-height:1.8;color:#1e293b;background:#f1f5f9;padding:24px"><div style="max-width:600px;margin:auto;background:#fff;border-radius:14px;padding:28px;border:1px solid #dbeafe"><h2 style="color:${approved?"#15803d":"#b91c1c"}">${approved?"Your Book Submission Has Been Approved":"An Update on Your Book Submission"}</h2><p>Dear ${escapeHtml(row.author_name)},</p><p>${approved?"Congratulations! Your submitted book has been approved by the Shoppers Ocean review team. You may return to Create Your Flipbook and submit another book once your 24-hour submission interval has passed.":"We’re sorry, but after review, your submitted book could not be approved because it did not meet Shoppers Ocean’s Community Guidelines or Author Policies. We appreciate your understanding and encourage you to review the policies before submitting another book."}</p><p><a href="https://www.shoppersocean.com/create-your-flipbook" style="display:inline-block;background:#1d4ed8;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">Visit Create Your Flipbook</a></p><p>Warm regards,<br>Team Shoppers Ocean</p></div></div>`;
   const sent=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:"Bearer "+key,"Content-Type":"application/json"},body:JSON.stringify({from:"no-reply@shoppersocean.com",to:row.email,subject:approved?"Your Shoppers Ocean Book Has Been Approved":"Update on Your Shoppers Ocean Book Submission",html})});
   if(!sent.ok) console.error("Book decision email failed:",sent.status,await sent.text().catch(()=> ""));
  }
  return page(status==="approved"?"Book approved successfully":"Book submission rejected",`<p>The submission from <strong>${escapeHtml(row.author_name)}</strong> has been marked <strong>${status}</strong>.</p><p>The author has been notified by email when the email service is available.</p>`);
 } catch(e) { console.error("Book review action:",e); return page("Unable to process decision","<p>Please try again later.</p>",500); }
}
