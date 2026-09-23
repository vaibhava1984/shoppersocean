import crypto from "node:crypto";
import type {CloudflareEnv} from "../auth/types";
import {getAuthContext} from "../auth/clerk";
import {getUserByClerkId} from "../db/users";
import {createOrderAndPayment} from "../db/orders";

export type RazorpayPayment={status:string;method?:string;bank?:string;card?:{network?:string;last4?:string};error_code?:string;error_description?:string;amount?:number;currency?:string;created_at?:number};

export async function verifyRazorpayPayment(request:Request,env:CloudflareEnv,verifyToken:Parameters<typeof getAuthContext>[2],fetchPayment:(id:string)=>Promise<RazorpayPayment>){
 let auth;try{auth=await getAuthContext(request,env,verifyToken);}catch{return Response.json({error:"Not authorized"},{status:401});}
 if(!auth.user)return Response.json({error:"Authentication required"},{status:401});
 const user=await getUserByClerkId(env,auth.user.clerkUserId);if(!user)return Response.json({error:"User profile required"},{status:403});
 const b=await request.json() as any; const {razorpay_order_id,razorpay_payment_id,razorpay_signature,original_currency,original_amount,product_id,quantity=1,shipping_address,contact_number,email}=b;
 if(!razorpay_order_id||!razorpay_payment_id||!razorpay_signature||!product_id)return Response.json({error:"Incomplete payment details"},{status:400});
 const secret=env.RAZORPAY_KEY_SECRET;if(!secret)return Response.json({error:"Razorpay server credentials are not configured"},{status:500});
 const expected=crypto.createHmac("sha256",secret).update(razorpay_order_id+"|"+razorpay_payment_id).digest("hex");
 if(expected!==razorpay_signature)return Response.json({error:"Invalid payment signature"},{status:400});
 const payment=await fetchPayment(razorpay_payment_id);
 const status=payment.status==="captured"?"completed":payment.status==="authorized"?"authorized":payment.status==="failed"?"failed":payment.status==="refunded"?"refunded":"pending";
 if(status==="failed")return Response.json({error:"Payment failed",errorDetails:payment.error_description||"Unknown error"},{status:400});
 const amountInINR=Number(original_amount||0);
 const now=new Date().toISOString();
 const result=await createOrderAndPayment(env,{
  id:crypto.randomUUID(),user_id:user.id,product_id,quantity:Number(quantity),total_amount:amountInINR,currency:"INR",status,contact_number:contact_number||null,email:email||user.email,razorpay_order_id,order_date:now,shipping_address:shipping_address?JSON.stringify(shipping_address):null,display_amount:Number(original_amount||0),display_currency:original_currency||"INR",created_at:"",updated_at:""
 },{
  id:crypto.randomUUID(),order_id:"",razorpay_order_id,payment_id:razorpay_payment_id,signature:razorpay_signature,status,original_currency:original_currency||null,original_amount:Number(original_amount||0),amount_in_inr:amountInINR,payment_method:payment.method||null,bank:payment.bank||null,card_network:payment.card?.network||null,card_last4:payment.card?.last4||null,error_code:payment.error_code||null,error_description:payment.error_description||null,created_at:"",updated_at:""
 });
 return Response.json({success:true,message:"Order created and payment verified successfully",status,orderDetails:result.order,paymentDetails:{amount:Number(payment.amount||0)/100,currency:payment.currency,method:payment.method,status,created_at:payment.created_at}});
}
