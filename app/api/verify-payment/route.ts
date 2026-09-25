import { NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { Resend } from "resend";
import { getFirebaseUser } from "@/lib/firebase/session";
import { firestore } from "@/lib/firebase/admin";
import { convertCurrency, fetchExchangeRates } from "@/utils/currency";

function getRazorpay(){const keyId=process.env.RAZORPAY_KEY_ID,keySecret=process.env.RAZORPAY_KEY_SECRET;if(!keyId||!keySecret)throw new Error("Razorpay server credentials are not configured");return new Razorpay({key_id:keyId,key_secret:keySecret})}

export async function POST(req:Request){
 try{
  const razorpay=getRazorpay();
  const user=await getFirebaseUser();
  if(!user)return NextResponse.json({error:"Authentication required"},{status:401});
  const body=await req.json();
  const {razorpay_order_id,razorpay_payment_id,razorpay_signature,original_currency,original_amount,user_id,product_id,quantity,shipping_address,contact_number,email}=body;
  if(user_id&&user_id!==user.id)return NextResponse.json({error:"User mismatch"},{status:403});
  const rates=await fetchExchangeRates();
  const amountInINR=convertCurrency(original_amount,original_currency,"INR",rates);
  const secret=process.env.RAZORPAY_KEY_SECRET!;
  const expected=crypto.createHmac("sha256",secret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
  if(expected!==razorpay_signature)return NextResponse.json({error:"Invalid payment signature"},{status:400});
  const payment=await razorpay.payments.fetch(razorpay_payment_id);
  const paymentStatus=payment.status==="captured"?"completed":payment.status==="authorized"?"authorized":payment.status==="failed"?"failed":payment.status==="refunded"?"refunded":"pending";
  if(paymentStatus==="failed")return NextResponse.json({error:"Payment failed",errorDetails:payment.error_description||"Unknown error"},{status:400});

  const now=new Date().toISOString();
  const orderRef=firestore.collection("orders").doc();
  const paymentRef=firestore.collection("payments").doc(razorpay_payment_id);
  const bookRef=firestore.collection("books").doc(String(product_id));
  let orderDetails:any;
  let book:any=null;
  await firestore.runTransaction(async tx=>{
    const [bookSnap,paymentSnap]=await Promise.all([tx.get(bookRef),tx.get(paymentRef)]);
    if(paymentSnap.exists) throw new Error("PAYMENT_ALREADY_RECORDED");
    book=bookSnap.exists?{id:bookSnap.id,...bookSnap.data()}:null;
    orderDetails={id:orderRef.id,user_id:user.id,product_id,quantity:quantity||1,shipping_address:shipping_address||"",contact_number:contact_number||"",email:email||user.email||"",status:paymentStatus,order_date:now,total_amount:Number(amountInINR),display_amount:Number(original_amount),currency:"INR",display_currency:original_currency,razorpay_order_id};
    const paymentDetails={id:razorpay_payment_id,order_id:orderRef.id,razorpay_order_id,payment_id:razorpay_payment_id,signature:razorpay_signature,status:paymentStatus,original_currency,original_amount,amount_in_inr:Number(amountInINR),payment_method:payment.method,bank:payment.bank,card_network:payment.card?.network,card_last4:payment.card?.last4,error_code:payment.error_code,error_description:payment.error_description,created_at:now};
    tx.set(orderRef,orderDetails);tx.set(paymentRef,paymentDetails);
  });

  const resendApiKey=process.env.RESEND_API_KEY;
  if(!resendApiKey)throw new Error("RESEND_API_KEY is not configured");
  await new Resend(resendApiKey).emails.send({from:"no-reply@shoppersocean.com",to:"kochimonu@gmail.com",subject:"New Sale | Shoppers Ocean",html:`<p><strong>New Sale details:</strong></p><p><strong>Email:</strong> ${user.email||email||""}</p><p><strong>Book ID:</strong>${product_id}</p><p><strong>Book Name:</strong>${book?.title||""}</p>`});
  return NextResponse.json({success:true,message:"Order created and payment verified successfully",status:paymentStatus,orderDetails,paymentDetails:{amount:Number(payment.amount)/100,currency:payment.currency,method:payment.method,status:paymentStatus,created_at:payment.created_at}});
 }catch(error:any){
  console.error("Error verifying payment:",error);
  if(error?.message==="PAYMENT_ALREADY_RECORDED")return NextResponse.json({error:"Payment already recorded"},{status:409});
  return NextResponse.json({error:"Error verifying payment"},{status:500});
 }
}
