import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
export const dynamic = "force-dynamic";
const SECTIONS=["word-playground","brain-logic","quiz-arena","riddle-corner","daily-challenge","memory-observation","classic-games"];
const TYPES:Record<string,string[]>={"word-playground":["word","hidden","missing"],"brain-logic":["sequence","odd"],"quiz-arena":["quiz"],"riddle-corner":["riddle"],"daily-challenge":["daily"],"memory-observation":["memory","recall","spot"],"classic-games":["tic","connect"]};
const ADMIN_EMAIL="kochimonu@gmail.com", FREE_LIMIT=3, DAILY_LIMIT=10, DAILY_QUESTION_LIMIT=10;
const NO_MORE_TODAY="Your today's quota on this section is exhausted. Please visit tomorrow.";
const headers={"Cache-Control":"no-store"};
const today=()=>new Date(Date.now()-2.5*60*60*1000).toISOString().slice(0,10); // India day boundary: 08:00 IST (02:30 UTC).
async function claimChallenge(db:D1Database,userId:string,type:string,challenge:string,playedAt:string){
 if(!challenge)return true;
 const cutoff=new Date(Date.now()-365*86400000).toISOString();
 const row=await db.prepare("INSERT INTO game_challenge_history(user_id,game_type_id,challenge_id,played_at) VALUES(?,?,?,?) ON CONFLICT(user_id,game_type_id,challenge_id) DO UPDATE SET played_at=excluded.played_at WHERE game_challenge_history.played_at <= ? RETURNING played_at").bind(userId,type,challenge,playedAt,cutoff).first<any>();
 return Boolean(row);
}
export async function GET(req:Request){return handle(req,false)}
export async function POST(req:Request){return handle(req,true)}
async function handle(req:Request,consume:boolean){
 try{
  const {getCloudflareContext}=await import("@opennextjs/cloudflare");const {env}=await getCloudflareContext();
  const db=(env as any).DB as D1Database|undefined,secret=(env as any).JWT_SECRET as string|undefined;
  if(!db||!secret)return NextResponse.json({error:"Game access is temporarily unavailable."},{status:503,headers});
  const user=await getCurrentUser(req,db,secret);if(!user)return NextResponse.json({error:"Please sign in to play."},{status:401,headers});
  await db.prepare("CREATE TABLE IF NOT EXISTS game_free_trials_by_section(user_id TEXT NOT NULL,section_id TEXT NOT NULL,trials_used INTEGER NOT NULL DEFAULT 0,updated_at TEXT NOT NULL,PRIMARY KEY(user_id,section_id))").run();
  await db.prepare("CREATE TABLE IF NOT EXISTS game_subscriber_usage_by_type(user_id TEXT NOT NULL,game_type_id TEXT NOT NULL,usage_date TEXT NOT NULL,plays_used INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(user_id,game_type_id,usage_date))").run();
  await db.prepare("CREATE TABLE IF NOT EXISTS game_challenge_history(user_id TEXT NOT NULL,game_type_id TEXT NOT NULL,challenge_id TEXT NOT NULL,played_at TEXT NOT NULL,PRIMARY KEY(user_id,game_type_id,challenge_id))").run();
  await db.prepare("CREATE TABLE IF NOT EXISTS game_question_reservations(user_id TEXT NOT NULL,game_type_id TEXT NOT NULL,challenge_id TEXT NOT NULL,question_text TEXT NOT NULL,session_id TEXT NOT NULL,reserved_at TEXT NOT NULL,PRIMARY KEY(user_id,game_type_id,challenge_id))").run();
  await db.prepare("CREATE TABLE IF NOT EXISTS user_subscriptions(user_id TEXT PRIMARY KEY,status TEXT NOT NULL DEFAULT 'inactive',started_at TEXT,expires_at TEXT,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)").run();
  const acct=await db.prepare("SELECT role,email,full_name FROM users WHERE id=? LIMIT 1").bind(user.id).first<any>();
  const admin=String(acct?.role??"").toLowerCase()==="admin"||String(acct?.email??user.email).trim().toLowerCase()===ADMIN_EMAIL;
  const sub=await db.prepare("SELECT status,expires_at FROM user_subscriptions WHERE user_id=? LIMIT 1").bind(user.id).first<any>();
  const expiryTime=sub?.expires_at?Date.parse(String(sub.expires_at)):0;
  const subscribed=!admin&&String(sub?.status??"").toLowerCase()==="active"&&Boolean(sub?.expires_at)&&Number.isFinite(expiryTime)&&expiryTime>Date.now();
  if(!admin&&String(sub?.status??"").toLowerCase()==="active"&&(!sub?.expires_at||!Number.isFinite(expiryTime)||expiryTime<=Date.now())){
   await db.prepare("UPDATE user_subscriptions SET status='expired',updated_at=? WHERE user_id=? AND status='active'").bind(new Date().toISOString(),user.id).run();
  }
  const date=today();
  if(consume){
   let body:any={};try{body=await req.json()}catch{}
   const section=body.sectionId,type=body.gameTypeId,challenge=typeof body.challengeId==="string"?body.challengeId.slice(0,160):"",questionText=typeof body.challengeQuestion==="string"?body.challengeQuestion.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu," ").trim().slice(0,300):"";
   const reserveQuestion=body.reserveQuestion===true,reservationSessionId=typeof body.reservationSessionId==="string"?body.reservationSessionId.slice(0,120):"";
   if(!SECTIONS.includes(section)||!TYPES[section]?.includes(type))return NextResponse.json({error:"Choose a valid game and section."},{status:400,headers});
   // Reserve a question when it is displayed, not only after an answer. This prevents repeats
   // from appearing on screen and shares the 365-day history across every game type.
   if(reserveQuestion){
    if(!challenge||!questionText||!reservationSessionId)return NextResponse.json({error:"A question reservation requires a challenge and session."},{status:400,headers});
    const existing=await db.prepare("SELECT question_text,session_id FROM game_question_reservations WHERE user_id=? AND game_type_id=? AND challenge_id=? LIMIT 1").bind(user.id,type,challenge).first<any>();
    if(existing){
     if(String(existing.session_id)===reservationSessionId&&String(existing.question_text)===questionText)return NextResponse.json({reserved:true},{headers});
     return NextResponse.json({error:"Please try another challenge.",repeated:true,skipQuestion:true,sectionId:section,gameTypeId:type},{status:409,headers});
    }
    const playedAt=new Date().toISOString(),cutoff=new Date(Date.now()-365*86400000).toISOString();
    const prior=await db.prepare("SELECT played_at FROM game_challenge_history WHERE user_id=? AND game_type_id=? AND challenge_id=?").bind(user.id,type,challenge).first<any>();
    const priorQuestion=await db.prepare("SELECT played_at FROM game_challenge_history WHERE user_id=? AND game_type_id=? AND challenge_id=?").bind(user.id,"__question__",questionText).first<any>();
    const rawQuestion=typeof body.challengeQuestion==="string"?body.challengeQuestion.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu," ").trim().slice(0,240):"";
    const priorLegacyQuestion=rawQuestion.length>=8?await db.prepare("SELECT played_at FROM game_challenge_history WHERE user_id=? AND played_at>? AND instr(lower(challenge_id),lower(?))>0 LIMIT 1").bind(user.id,cutoff,rawQuestion).first<any>():null;
    if((prior&&Date.now()-Date.parse(prior.played_at)<365*86400000)||(priorQuestion&&Date.now()-Date.parse(priorQuestion.played_at)<365*86400000)||priorLegacyQuestion||!await claimChallenge(db,user.id,"__question__",questionText,playedAt)){
     return NextResponse.json({error:"Please try another challenge.",repeated:true,skipQuestion:true,sectionId:section,gameTypeId:type},{status:409,headers});
    }
    await db.prepare("INSERT OR REPLACE INTO game_question_reservations(user_id,game_type_id,challenge_id,question_text,session_id,reserved_at) VALUES(?,?,?,?,?,?)").bind(user.id,type,challenge,questionText,reservationSessionId,playedAt).run();
    return NextResponse.json({reserved:true},{headers});
   }
   const activeReservation=questionText&&reservationSessionId?await db.prepare("SELECT question_text FROM game_question_reservations WHERE user_id=? AND game_type_id=? AND challenge_id=? AND session_id=? LIMIT 1").bind(user.id,type,challenge,reservationSessionId).first<any>():null;
   const isReservedForCurrentSession=Boolean(activeReservation&&String(activeReservation.question_text)===questionText);
   // Enforce the free section quota before touching daily usage; this prevents stale clients
   // from receiving another question after their free allowance has run out.
   if(!admin&&!subscribed&&section!=="daily-challenge"){
    const freeRow=await db.prepare("SELECT trials_used FROM game_free_trials_by_section WHERE user_id=? AND section_id=? LIMIT 1").bind(user.id,section).first<any>();
    if(Number(freeRow?.trials_used??0)>=FREE_LIMIT){
     return NextResponse.json({error:"Your three free trials in this section have been used. Subscribe to continue.",sectionId:section,gameTypeId:type,remaining:0,sectionRemaining:0,freeTrialsExhausted:true,isSubscribed:false,isAdmin:false},{status:403,headers});
    }
   }
   // Check the section's daily quota before duplicate-history checks so exhausted sections stop immediately.
   const limit=type==="daily"?DAILY_QUESTION_LIMIT:DAILY_LIMIT;
   const changed=await db.prepare("INSERT INTO game_subscriber_usage_by_type(user_id,game_type_id,usage_date,plays_used) VALUES(?,?,?,1) ON CONFLICT(user_id,game_type_id,usage_date) DO UPDATE SET plays_used=plays_used+1 WHERE game_subscriber_usage_by_type.plays_used < ? RETURNING plays_used").bind(user.id,type,date,limit).first<any>();
   if(!changed){
    const all=await db.prepare("SELECT game_type_id,plays_used FROM game_subscriber_usage_by_type WHERE user_id=? AND usage_date=?").bind(user.id,date).all<any>();
    const usedTypes:Record<string,number>={};for(const row of all.results??[])usedTypes[row.game_type_id]=Number(row.plays_used??0);
    const sectionRemaining=section==="daily-challenge"?Math.max(0,DAILY_QUESTION_LIMIT-(usedTypes.daily??0)):TYPES[section].reduce((n,t)=>n+Math.max(0,(t==="daily"?DAILY_QUESTION_LIMIT:DAILY_LIMIT)-(usedTypes[t]??0)),0);
    const message=NO_MORE_TODAY;
    return NextResponse.json({error:message,sectionId:section,gameTypeId:type,remaining:0,sectionRemaining,isAdmin:admin,isSubscribed:subscribed},{status:403,headers});
   }
   if(challenge){
    const prior=await db.prepare("SELECT played_at FROM game_challenge_history WHERE user_id=? AND game_type_id=? AND challenge_id=?").bind(user.id,type,challenge).first<any>();
    const priorQuestion=questionText?await db.prepare("SELECT played_at FROM game_challenge_history WHERE user_id=? AND game_type_id=? AND challenge_id=?").bind(user.id,"__question__",questionText).first<any>():null;
    const rawQuestion=typeof body.challengeQuestion==="string"?body.challengeQuestion.trim().slice(0,240):"";
    const priorLegacyQuestion=rawQuestion.length>=8?await db.prepare("SELECT played_at FROM game_challenge_history WHERE user_id=? AND played_at>? AND instr(lower(challenge_id),lower(?))>0 LIMIT 1").bind(user.id,new Date(Date.now()-365*86400000).toISOString(),rawQuestion).first<any>():null;
    if((prior&&Date.now()-Date.parse(prior.played_at)<365*86400000)||(!isReservedForCurrentSession&&priorQuestion&&Date.now()-Date.parse(priorQuestion.played_at)<365*86400000)||(!isReservedForCurrentSession&&priorLegacyQuestion)){
     await db.prepare("UPDATE game_subscriber_usage_by_type SET plays_used=plays_used-1 WHERE user_id=? AND game_type_id=? AND usage_date=? AND plays_used>0").bind(user.id,type,date).run();
     return NextResponse.json({error:"Please try another challenge.",repeated:true,skipQuestion:true,sectionId:section,gameTypeId:type},{status:409,headers});
    }
   }
   let freeTrialsUsed:number|null=null;
   if(!admin&&!subscribed&&section!=="daily-challenge"){
    const trial=await db.prepare("INSERT INTO game_free_trials_by_section(user_id,section_id,trials_used,updated_at) VALUES(?,?,1,?) ON CONFLICT(user_id,section_id) DO UPDATE SET trials_used=trials_used+1,updated_at=excluded.updated_at WHERE game_free_trials_by_section.trials_used < ? RETURNING trials_used").bind(user.id,section,new Date().toISOString(),FREE_LIMIT).first<any>();
    if(!trial){
     await db.prepare("UPDATE game_subscriber_usage_by_type SET plays_used=plays_used-1 WHERE user_id=? AND game_type_id=? AND usage_date=? AND plays_used>0").bind(user.id,type,date).run();
     return NextResponse.json({error:"Your three free trials in this section have been used. Subscribe to continue.",sectionId:section,gameTypeId:type,remaining:0,sectionRemaining:0,freeTrialsExhausted:true,isSubscribed:false},{status:403,headers});
    }
    freeTrialsUsed=Number(trial.trials_used??0);
   }
   const playedAt=new Date().toISOString();
   if((challenge&&!await claimChallenge(db,user.id,type,challenge,playedAt))||(questionText&&!isReservedForCurrentSession&&!await claimChallenge(db,user.id,"__question__",questionText,playedAt))){
    await db.prepare("UPDATE game_subscriber_usage_by_type SET plays_used=plays_used-1 WHERE user_id=? AND game_type_id=? AND usage_date=? AND plays_used>0").bind(user.id,type,date).run();
    if(freeTrialsUsed!==null)await db.prepare("UPDATE game_free_trials_by_section SET trials_used=trials_used-1 WHERE user_id=? AND section_id=? AND trials_used>0").bind(user.id,section).run();
    return NextResponse.json({error:"Please try another challenge.",repeated:true,skipQuestion:true,sectionId:section,gameTypeId:type},{status:409,headers});
   }
   if(isReservedForCurrentSession)await db.prepare("DELETE FROM game_question_reservations WHERE user_id=? AND game_type_id=? AND challenge_id=? AND session_id=?").bind(user.id,type,challenge,reservationSessionId).run();
   const all=await db.prepare("SELECT game_type_id,plays_used FROM game_subscriber_usage_by_type WHERE user_id=? AND usage_date=?").bind(user.id,date).all<any>();
   const usedTypes:Record<string,number>={};for(const row of all.results??[])usedTypes[row.game_type_id]=Number(row.plays_used??0);
   const dailyRemaining=Math.max(0,limit-Number(changed.plays_used??0));
   const dailySectionRemaining=section==="daily-challenge"?Math.max(0,1-(usedTypes.daily??0)):TYPES[section].reduce((n,t)=>n+Math.max(0,(t==="daily"?DAILY_QUESTION_LIMIT:DAILY_LIMIT)-(usedTypes[t]??0)),0);
   const sectionRemaining=admin||subscribed||section==="daily-challenge"?dailySectionRemaining:Math.min(dailySectionRemaining,Math.max(0,FREE_LIMIT-(freeTrialsUsed??0)));
   const remaining=admin||subscribed||section==="daily-challenge"?dailyRemaining:Math.min(dailyRemaining,Math.max(0,FREE_LIMIT-(freeTrialsUsed??0)));
   return NextResponse.json({sectionId:section,gameTypeId:type,remaining,sectionRemaining,isAdmin:admin,isSubscribed:subscribed,freeTrialsRemaining:freeTrialsUsed===null?undefined:Math.max(0,FREE_LIMIT-freeTrialsUsed)},{headers});
  }
  const free=await db.prepare("SELECT section_id,trials_used FROM game_free_trials_by_section WHERE user_id=?").bind(user.id).all<any>();
  const usage=await db.prepare("SELECT game_type_id,plays_used FROM game_subscriber_usage_by_type WHERE user_id=? AND usage_date=?").bind(user.id,date).all<any>();
  const freeUsed:Record<string,number>={},usedByType:Record<string,number>={},remainingBySection:Record<string,number>={},remainingByType:Record<string,number>={};
  for(const s of SECTIONS)freeUsed[s]=0;for(const x of free.results??[])freeUsed[x.section_id]=Number(x.trials_used??0);for(const x of usage.results??[])usedByType[x.game_type_id]=Number(x.plays_used??0);
  for(const s of SECTIONS){
   const dailySection=s==="daily-challenge"?Math.max(0,DAILY_QUESTION_LIMIT-(usedByType.daily??0)):TYPES[s].reduce((n,t)=>n+Math.max(0,(t==="daily"?DAILY_QUESTION_LIMIT:DAILY_LIMIT)-(usedByType[t]??0)),0);
   remainingBySection[s]=admin||s==="daily-challenge"||subscribed?dailySection:Math.min(dailySection,Math.max(0,FREE_LIMIT-(freeUsed[s]??0)));
   for(const t of TYPES[s])remainingByType[t]=Math.min(Math.max(0,(t==="daily"?DAILY_QUESTION_LIMIT:DAILY_LIMIT)-(usedByType[t]??0)),admin||subscribed||s==="daily-challenge"?Number.MAX_SAFE_INTEGER:Math.max(0,FREE_LIMIT-(freeUsed[s]??0)));
  }
  return NextResponse.json({isAdmin:admin,isSubscribed:subscribed,role:admin?"admin":subscribed?"subscriber":"free",remainingBySection,remainingByType,freeUsedBySection:freeUsed,usedByType,gameDay:date,resetTime:"08:00 Asia/Kolkata"},{headers});
 }catch(error){console.error("Game access check failed:",error);return NextResponse.json({error:"Game access could not be verified."},{status:503,headers})}
}
