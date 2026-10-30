import {NextResponse} from "next/server";
import {getCurrentUser} from "@/lib/auth";
export const dynamic="force-dynamic";
const ADMIN_EMAIL="kochimonu@gmail.com",FREE_LIMIT=3,DAILY_LIMIT=10;
const TOPICS=["noun","pronoun","adjective","verb","adverb","articles","interjection","helping-verbs","modal-verbs","past-tense","present-tense","future-tense","conjunctions","conditionals","causative-verbs","punctuation","active-passive","direct-indirect","subject-verb-agreement","idioms-phrases"];
const headers={"Cache-Control":"no-store"};
const today=()=>new Date(Date.now()-2.5*60*60*1000).toISOString().slice(0,10);
async function setup(db:D1Database){
 await db.prepare("CREATE TABLE IF NOT EXISTS english_expert_free_usage(user_id TEXT NOT NULL,topic_id TEXT NOT NULL,attempts_used INTEGER NOT NULL DEFAULT 0,updated_at TEXT NOT NULL,PRIMARY KEY(user_id,topic_id))").run();
 await db.prepare("CREATE TABLE IF NOT EXISTS english_expert_daily_usage(user_id TEXT NOT NULL,topic_id TEXT NOT NULL,usage_date TEXT NOT NULL,attempts_used INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(user_id,topic_id,usage_date))").run();
 await db.prepare("CREATE TABLE IF NOT EXISTS english_expert_attempts(user_id TEXT NOT NULL,topic_id TEXT NOT NULL,question_id TEXT NOT NULL,created_at TEXT NOT NULL,PRIMARY KEY(user_id,question_id))").run();
 await db.prepare("CREATE TABLE IF NOT EXISTS english_expert_question_history(user_id TEXT NOT NULL,topic_id TEXT NOT NULL,question_id TEXT NOT NULL,first_seen_at TEXT NOT NULL,PRIMARY KEY(user_id,question_id))").run();
 await db.prepare("CREATE TABLE IF NOT EXISTS english_expert_question_history_v2(user_id TEXT NOT NULL,question_id TEXT NOT NULL,first_seen_at TEXT NOT NULL,PRIMARY KEY(user_id,question_id))").run();
 await db.prepare("INSERT OR IGNORE INTO english_expert_question_history_v2(user_id,question_id,first_seen_at) SELECT user_id,question_id,MIN(first_seen_at) FROM english_expert_question_history GROUP BY user_id,question_id").run();
 await db.prepare("CREATE TABLE IF NOT EXISTS user_subscriptions(user_id TEXT PRIMARY KEY,status TEXT NOT NULL DEFAULT 'inactive',started_at TEXT,expires_at TEXT,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)").run();
}
export async function GET(req:Request){return handle(req,false)}
export async function POST(req:Request){return handle(req,true)}
async function handle(req:Request,consume:boolean){
 try{
  const {getCloudflareContext}=await import("@opennextjs/cloudflare");const {env}=await getCloudflareContext();
  const db=(env as any).DB as D1Database|undefined,secret=(env as any).JWT_SECRET as string|undefined;
  if(!db||!secret)return NextResponse.json({error:"English Expert is temporarily unavailable."},{status:503,headers});
  const user=await getCurrentUser(req,db,secret);if(!user)return NextResponse.json({error:"Please sign in to use English Expert."},{status:401,headers});
  await setup(db);
  const account=await db.prepare("SELECT role,email FROM users WHERE id=? LIMIT 1").bind(user.id).first<any>();
  const admin=String(account?.role??"").toLowerCase()==="admin"||String(account?.email??user.email).trim().toLowerCase()===ADMIN_EMAIL;
  const sub=await db.prepare("SELECT status,expires_at FROM user_subscriptions WHERE user_id=? LIMIT 1").bind(user.id).first<any>();
  const expiry=sub?.expires_at?Date.parse(String(sub.expires_at)):0;
  const subscribed=!admin&&String(sub?.status??"").toLowerCase()==="active"&&Boolean(sub?.expires_at)&&Number.isFinite(expiry)&&expiry>Date.now();
  if(!admin&&String(sub?.status??"").toLowerCase()==="active"&&(!sub?.expires_at||!Number.isFinite(expiry)||expiry<=Date.now()))await db.prepare("UPDATE user_subscriptions SET status='expired',updated_at=? WHERE user_id=? AND status='active'").bind(new Date().toISOString(),user.id).run();
  const date=today();
  if(consume){
   let body:any={};try{body=await req.json()}catch{}
   const topic=String(body.topicId??""),questionId=String(body.questionId??"").slice(0,180),action=String(body.action??"answer");
   if(!TOPICS.includes(topic)||(action!=="check"&&!questionId))return NextResponse.json({error:"Choose a valid English grammar topic and question."},{status:400,headers});
   if(action==="check"){
    const paid=admin||subscribed;
    const row=paid
     ?await db.prepare("SELECT attempts_used FROM english_expert_daily_usage WHERE user_id=? AND topic_id=? AND usage_date=?").bind(user.id,topic,date).first<any>()
     :await db.prepare("SELECT attempts_used FROM english_expert_free_usage WHERE user_id=? AND topic_id=?").bind(user.id,topic).first<any>();
    const used=Number(row?.attempts_used??0),limit=paid?DAILY_LIMIT:FREE_LIMIT;
    const exhausted=used>=limit;
    return NextResponse.json({ok:!exhausted,topicId:topic,used,limit,remaining:Math.max(0,limit-used),quotaExhausted:exhausted&&paid,freeQuotaExhausted:exhausted&&!paid,usage:await readUsage(db,user.id,date,paid)},{status:exhausted?403:200,headers});
   }
   if(action==="reserve"){
    const totalQuestions=Number(body.totalQuestions);
    if(!Number.isInteger(totalQuestions)||totalQuestions<1||totalQuestions>1000||!questionId.startsWith(topic+":"))return NextResponse.json({error:"Invalid question rotation request."},{status:400,headers});
    const now=new Date().toISOString();
    const seen=await db.prepare("INSERT INTO english_expert_question_history_v2(user_id,question_id,first_seen_at) VALUES(?,?,?) ON CONFLICT(user_id,question_id) DO NOTHING RETURNING question_id").bind(user.id,questionId,now).first<any>();
    if(seen)return NextResponse.json({reserved:true,cycleReset:false},{headers});
    const progress=await db.prepare("SELECT COUNT(*) AS total FROM english_expert_question_history_v2 WHERE user_id=? AND question_id LIKE ?").bind(user.id,topic+":%").first<any>();
    const seenCount=Number(progress?.total??0);
    if(seenCount>=totalQuestions){
     await db.prepare("DELETE FROM english_expert_question_history_v2 WHERE user_id=? AND question_id LIKE ?").bind(user.id,topic+":%").run();
     const restarted=await db.prepare("INSERT INTO english_expert_question_history_v2(user_id,question_id,first_seen_at) VALUES(?,?,?) ON CONFLICT(user_id,question_id) DO NOTHING RETURNING question_id").bind(user.id,questionId,now).first<any>();
     if(restarted)return NextResponse.json({reserved:true,cycleReset:true},{headers});
    }
    return NextResponse.json({repeated:true,skipQuestion:true},{status:409,headers});
   }
   const claimed=await db.prepare("INSERT INTO english_expert_attempts(user_id,topic_id,question_id,created_at) VALUES(?,?,?,?) ON CONFLICT(user_id,topic_id,question_id) DO NOTHING RETURNING question_id").bind(user.id,topic,questionId,new Date().toISOString()).first<any>();
   if(!claimed)return NextResponse.json({error:"This question has already been attempted.",alreadyRecorded:true},{status:409,headers});
   let row:any;
   if(subscribed||admin){
    row=await db.prepare("INSERT INTO english_expert_daily_usage(user_id,topic_id,usage_date,attempts_used) VALUES(?,?,?,1) ON CONFLICT(user_id,topic_id,usage_date) DO UPDATE SET attempts_used=attempts_used+1 WHERE english_expert_daily_usage.attempts_used<? RETURNING attempts_used").bind(user.id,topic,date,DAILY_LIMIT).first<any>();
    if(!row){await db.prepare("DELETE FROM english_expert_attempts WHERE user_id=? AND topic_id=? AND question_id=?").bind(user.id,topic,questionId).run();return NextResponse.json({error:"Your daily quota on this topic is exhausted. Please visit tomorrow.",topicId:topic,quotaExhausted:true,usage:await readUsage(db,user.id,date,true)},{status:403,headers});}
   }else{
    row=await db.prepare("INSERT INTO english_expert_free_usage(user_id,topic_id,attempts_used,updated_at) VALUES(?,?,1,?) ON CONFLICT(user_id,topic_id) DO UPDATE SET attempts_used=attempts_used+1,updated_at=excluded.updated_at WHERE english_expert_free_usage.attempts_used<? RETURNING attempts_used").bind(user.id,topic,new Date().toISOString(),FREE_LIMIT).first<any>();
    if(!row){await db.prepare("DELETE FROM english_expert_attempts WHERE user_id=? AND topic_id=? AND question_id=?").bind(user.id,topic,questionId).run();return NextResponse.json({error:"Your free quota on this section has been exhausted, please subscribe to play further.",topicId:topic,freeQuotaExhausted:true,usage:await readUsage(db,user.id,date,false)},{status:403,headers});}
   }
   const usage=await readUsage(db,user.id,date,subscribed||admin);
   return NextResponse.json({ok:true,usage,topicRemaining:Math.max(0,(subscribed||admin?DAILY_LIMIT:FREE_LIMIT)-Number(row.attempts_used??0))},{headers});
  }
  const usage=await readUsage(db,user.id,date,subscribed||admin);
  return NextResponse.json({usage,isAdmin:admin,isSubscribed:subscribed,role:admin?"admin":subscribed?"subscriber":"free",gameDay:date},{headers});
 }catch(e){console.error("English Expert access failed:",e);return NextResponse.json({error:"English Expert quota could not be verified."},{status:503,headers});}
}
async function readUsage(db:D1Database,userId:string,date:string,paid:boolean){
 const [free,daily]=await Promise.all([db.prepare("SELECT topic_id,attempts_used FROM english_expert_free_usage WHERE user_id=?").bind(userId).all<any>(),db.prepare("SELECT topic_id,attempts_used FROM english_expert_daily_usage WHERE user_id=? AND usage_date=?").bind(userId,date).all<any>()]);
 const usage:Record<string,number>={};
 for(const t of TOPICS){const f=Number((free.results??[]).find((r:any)=>r.topic_id===t)?.attempts_used??0),d=Number((daily.results??[]).find((r:any)=>r.topic_id===t)?.attempts_used??0);usage[t]=paid?d:f;}
 return usage;
}