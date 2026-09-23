import type {CloudflareEnv} from "../auth/types";
import {getAuthContext} from "../auth/clerk";
import {getUserByClerkId} from "../db/users";
import {getUserOrders} from "../db/orders";

export async function handleOrders(request:Request,env:CloudflareEnv,verifyToken:Parameters<typeof getAuthContext>[2]):Promise<Response>{
 let auth;try{auth=await getAuthContext(request,env,verifyToken);}catch{return Response.json({error:"Not authorized"},{status:401});}
 if(!auth.user)return Response.json({error:"Authentication required"},{status:401});
 const user=await getUserByClerkId(env,auth.user.clerkUserId);if(!user)return Response.json({error:"User profile required"},{status:403});
 const rows=await getUserOrders(env,user.id);
 return Response.json({orders:rows.results},{headers:{"Cache-Control":"private, no-store"}});
}
