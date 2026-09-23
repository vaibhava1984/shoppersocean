import type { CloudflareEnv } from "../auth/types";
export type ReviewRow={id:string;description:string;rating:number;users:string;user_id:string;book_id:string;created_at:string};
export async function listReviews(env:CloudflareEnv,bookId:string){return env.DB.prepare("SELECT id,description,rating,users,user_id,book_id,created_at FROM testimonials WHERE book_id=?1 ORDER BY created_at DESC").bind(bookId).all<ReviewRow>();}
export async function addReview(env:CloudflareEnv,r:{id:string;bookId:string;userId:string;description:string;rating:number;users:string}){
 await env.DB.prepare("INSERT INTO testimonials(id,book_id,user_id,description,rating,users,created_at) VALUES(?1,?2,?3,?4,?5,?6,datetime('now'))").bind(r.id,r.bookId,r.userId,r.description,r.rating,r.users).run();
 return env.DB.prepare("SELECT id,description,rating,users,user_id,book_id,created_at FROM testimonials WHERE id=?1").bind(r.id).first<ReviewRow>();
}
