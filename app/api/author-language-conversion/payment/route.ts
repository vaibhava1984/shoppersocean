import {NextResponse} from "next/server";
import {getD1} from "@/utils/cloudflare/d1";
import {requireUser} from "@/utils/auth/requireUser";
import {getCloudflareContext} from "@opennextjs/cloudflare";
export const dynamic="force-dynamic";
export const revalidate=0;
function hexBytes(value:string){if(!/^[0-9a-f]{64}$/i.test(value))return null;const out=new Uint8Array(32);for(let i=0;i<32;i++)out[i]=parseInt(value.slice(i*2,i*2+2),16);return out}
async function validSignature(orderId:string,paymentId:string,signature:string,secret:string){const bytes=hexBytes(signature);if(!bytes)return false;const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["verify"]);return crypto.subtle.verify("HMAC",key,bytes,new TextEncoder().encode(orderId+"|"+paymentId))}
function auth(id:string,secret:string){return "Basic "+btoa(id+":"+secret)}
async function ensure(db:any){await db.prepare("CREATE TABLE IF NOT EXISTS author_language_conversion_requests (id TEXT PRIMARY KEY,user_id TEXT NOT NULL,author_id TEXT NOT NULL,book_id TEXT NOT NULL,book_code TEXT NOT NULL,book_title TEXT NOT NULL,source_language TEXT NOT NULL,languages_json TEXT NOT NULL,total_amount INTEGER NOT NULL,status TEXT NOT NULL DEFAULT 'pending',review_token TEXT NOT NULL,created_at TEXT NOT NULL,reviewed_at TEXT,payment_order_id TEXT,payment_id TEXT,paid_at TEXT)").run();for(const col of ["approved_at TEXT","payment_deadline TEXT","acknowledged_at TEXT","approved_languages_json TEXT","rejected_languages_json TEXT","decided_languages_json TEXT"]){try{await db.prepare("ALTER TABLE author_language_conversion_requests ADD COLUMN "+col).run()}}}
export async function POST(req:Request){try{
const identity=await requireUser();if(!identity)return NextResponse.json({error:"Please sign in."},{status:401});
if(String(identity.user.publicMetadata.userrole||"").toUpperCase()==="ADMIN")return NextResponse.json({error:"Author access only."},{status:403});
const db=getD1();if(!db)return NextResponse.json({error:"Database unavailable."},{status:503});await ensure(db);
const author=await db.prepare("SELECT id FROM authors WHERE user_id=? AND COALESCE(is_deleted,0)=0 LIMIT 1").bind(identity.profile.id).first<any>();if(!author)return NextResponse.json({error:"Registered author access required."},{status:403});
const body=await req.json(),requestId=String(body.request_id||""),action=String(body.action||"");
let row=await db.prepare("SELECT * FROM author_language_conversion_requests WHERE id=? AND user_id=? AND author_id=? LIMIT 1").bind(requestId,identity.profile.id,author.id).first<any>();
if(!row)return NextResponse.json({error:"Conversion request not found."},{status:404});
if(action==="create"&&row.status==="pending"){
let approved:string[]=[];try{approved=JSON.parse(row.approved_languages_json||"[]")}catch{}
if(!approved.length)return NextResponse.json({error:"No language has been approved for payment yet."},{status:409});
const now=new Date().toISOString(),deadline=new Date(Date.now()+7*86400000).toISOString(),amount=approved.length*200;
const finalized=await db.prepare("UPDATE author_language_conversion_requests SET languages_json=?,total_amount=?,status='approved_payment_pending',reviewed_at=COALESCE(reviewed_at,?),approved_at=COALESCE(approved_at,?),payment_deadline=COALESCE(payment_deadline,?) WHERE id=? AND user_id=? AND status='pending' AND COALESCE(approved_languages_json,'[]')=? AND payment_id IS NULL").bind(JSON.stringify(approved),amount,now,now,deadline,row.id,identity.profile.id,String(row.approved_languages_json||"[]")).run();
if(!finalized.meta?.changes){row=await db.prepare("SELECT * FROM author_language_conversion_requests WHERE id=? AND user_id=? AND author_id=? LIMIT 1").bind(requestId,identity.profile.id,author.id).first<any>();if(row?.status!=="approved_payment_pending")return NextResponse.json({error:"The approved languages changed while payment was starting. Please refresh and try again."},{status:409});}
row=await db.prepare("SELECT * FROM author_language_conversion_requests WHERE id=? AND user_id=? AND author_id=? LIMIT 1").bind(requestId,identity.profile.id,author.id).first<any>();
}
if(row.status!=="approved_payment_pending")return NextResponse.json({error:"This request is not awaiting payment."},{status:409});
const deadline=Date.parse(String(row.payment_deadline||""));if(!Number.isFinite(deadline)||Date.now()>deadline){await db.prepare("UPDATE author_language_conversion_requests SET status='expired' WHERE id=? AND status='approved_payment_pending'").bind(row.id).run();return NextResponse.json({error:"The 7-day payment period has expired."},{status:410})}
const {env}=await getCloudflareContext(),keyId=String((env as any).RAZORPAY_KEY_ID||process.env.RAZORPAY_KEY_ID||""),secret=String((env as any).RAZORPAY_KEY_SECRET||process.env.RAZORPAY_KEY_SECRET||"");
if(!keyId||!secret)return NextResponse.json({error:"Razorpay is not configured."},{status:503});
const amount=Number(row.total_amount);if(!Number.isFinite(amount)||amount<=0)return NextResponse.json({error:"Invalid conversion amount."},{status:400});
if(action==="create"){
let order:any=null;
if(row.payment_order_id){const check=await fetch("https://api.razorpay.com/v1/orders/"+encodeURIComponent(String(row.payment_order_id)),{headers:{Authorization:auth(keyId,secret)},cache:"no-store"});if(check.ok){const existing=await check.json();if(Number(existing.amount)===Math.round(amount*100)&&String(existing.currency)==="INR"&&String(existing.notes?.request_id)===row.id&&String(existing.notes?.user_id)===identity.profile.id)order=existing}}
if(!order){const response=await fetch("https://api.razorpay.com/v1/orders",{method:"POST",headers:{Authorization:auth(keyId,secret),"Content-Type":"application/json"},body:JSON.stringify({amount:Math.round(amount*100),currency:"INR",receipt:"lang_"+crypto.randomUUID().replace(/-/g,"").slice(0,24),notes:{request_id:row.id,user_id:identity.profile.id,author_id:author.id,book_id:row.book_id,purpose:"author_language_conversion"}}),cache:"no-store"});order=await response.json();if(!response.ok||!order?.id)return NextResponse.json({error:"Unable to create the payment order. Please try again."},{status:502});await db.prepare("UPDATE author_language_conversion_requests SET payment_order_id=? WHERE id=? AND user_id=? AND status='approved_payment_pending'").bind(String(order.id),row.id,identity.profile.id).run()}
return NextResponse.json({orderId:String(order.id),amount:Number(order.amount),currency:"INR",keyId},{headers:{"Cache-Control":"no-store"}})}
if(action==="verify"){
const orderId=String(body.razorpay_order_id||""),paymentId=String(body.razorpay_payment_id||""),signature=String(body.razorpay_signature||"");
if(!orderId||!paymentId||!signature||orderId!==String(row.payment_order_id||""))return NextResponse.json({error:"Payment details do not match this request."},{status:400});
if(!await validSignature(orderId,paymentId,signature,secret))return NextResponse.json({error:"Invalid payment signature."},{status:400});
const [orderResponse,paymentResponse]=await Promise.all([fetch("https://api.razorpay.com/v1/orders/"+encodeURIComponent(orderId),{headers:{Authorization:auth(keyId,secret)},cache:"no-store"}),fetch("https://api.razorpay.com/v1/payments/"+encodeURIComponent(paymentId),{headers:{Authorization:auth(keyId,secret)},cache:"no-store"})]);
const [order,payment]=await Promise.all([orderResponse.json(),paymentResponse.json()]);
if(!orderResponse.ok||!paymentResponse.ok||String(order.id)!==orderId||String(payment.id)!==paymentId||String(payment.order_id)!==orderId||Number(order.amount)!==Math.round(amount*100)||Number(payment.amount)!==Math.round(amount*100)||String(order.currency)!=="INR"||String(payment.currency)!=="INR"||String(order.notes?.request_id)!==row.id||String(order.notes?.user_id)!==identity.profile.id||String(order.notes?.author_id)!==author.id||String(payment.status)!=="captured")return NextResponse.json({error:"Razorpay has not confirmed a captured payment matching this request."},{status:409});
const now=new Date().toISOString(),changed=await db.prepare("UPDATE author_language_conversion_requests SET status='paid_pending_upload',payment_id=?,paid_at=? WHERE id=? AND user_id=? AND status='approved_payment_pending' AND payment_order_id=?").bind(paymentId,now,row.id,identity.profile.id,orderId).run();
if(!changed.meta?.changes){const latest=await db.prepare("SELECT status,payment_id FROM author_language_conversion_requests WHERE id=? AND user_id=?").bind(row.id,identity.profile.id).first<any>();if(latest?.status!=="paid_pending_upload"||String(latest.payment_id)!==paymentId)return NextResponse.json({error:"Payment was verified but the request status could not be updated. Please contact support."},{status:409})}
return NextResponse.json({success:true,status:"paid_pending_upload",message:"Payment received."},{headers:{"Cache-Control":"no-store"}})}
return NextResponse.json({error:"Invalid payment action."},{status:400})
}catch(e){console.error("Author language conversion payment",e);return NextResponse.json({error:"Unable to process this payment. Please try again."},{status:500,headers:{"Cache-Control":"no-store"}})}}