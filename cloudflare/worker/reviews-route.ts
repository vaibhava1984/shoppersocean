import type { CloudflareEnv } from "../auth/types";
import { getAuthContext } from "../auth/clerk";
import { getUserByClerkId } from "../db/users";
import { listReviews, addReview } from "../db/reviews";

export async function handleReviews(request:Request,env:CloudflareEnv,verifyToken:Parameters<typeof getAuthContext>[2]):Promise<Response>{
 const url=new URL(request.url); const bookId=url.searchParams.get("bookId");
 if(request.method==="GET"){if(!bookId)return Response.json({error:"Book ID is required."},{status:400});const r=await listReviews(env,bookId);return Response.json({reviews:r.results},{headers:{"Cache-Control":"no-store"}});}
 if(request.method!=="POST")return new Response("Method not allowed",{status:405});
 let auth;try{auth=await getAuthContext(request,env,verifyToken);}catch{return Response.json({error:"Please sign in to write a review."},{status:401});}
 if(!auth.user)return Response.json({error:"Please sign in to write a review."},{status:401});
 const user=await getUserByClerkId(env,auth.user.clerkUserId);if(!user)return Response.json({error:"User profile required."},{status:403});
 const body=await request.json() as {bookId?:string;description?:string;rating?:number}; const clean=String(body.description??"").trim();const rating=Number(body.rating);
 if(!body.bookId||!clean||!Number.isInteger(rating)||rating<1||rating>5)return Response.json({error:"Please provide a review and a rating from 1 to 5."},{status:400});
 const book=await env.DB.prepare("SELECT id FROM books WHERE id=?1 LIMIT 1").bind(body.bookId).first();if(!book)return Response.json({error:"Book not found."},{status:404});
 const duplicate=await env.DB.prepare("SELECT id FROM testimonials WHERE book_id=?1 AND user_id=?2 LIMIT 1").bind(body.bookId,user.id).first();if(duplicate)return Response.json({error:"You have already reviewed this book."},{status:409});
 const review=await addReview(env,{id:crypto.randomUUID(),bookId:body.bookId,userId:user.id,description:clean,rating,users:user.full_name||user.email||"Reader"});
 return Response.json({message:"Review submitted successfully.",review},{status:201,headers:{"Cache-Control":"no-store"}});
}
