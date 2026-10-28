import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
export const dynamic = "force-dynamic";
const SECTIONS=["word-playground","brain-logic","quiz-arena","riddle-corner","daily-challenge","memory-observation"];
const TYPES:Record<string,string[]>={"word-playground":["word","hidden","missing"],"brain-logic":["sequence","odd"],"quiz-arena":["quiz"],"riddle-corner":["riddle"],"daily-challenge":["daily"],"memory-observation":["memory","recall","spot"]};
const ADMIN_EMAIL="kochimonu@gmail.com", FREE_LIMIT=3, DAILY_LIMIT=10, DAILY_QUESTION_LIMIT=1;
const NO_MORE_TODAY="No more games in this section for today, please visit again tomorrow";
const headers={"Cache-Control":"no-store"};
const today=()=>new Date().toISOString().slice(0,10);
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
  await db.prepare("CREATE TABLE IF NOT EXISTS user_subscriptions(user_id TEXT PRIMARY KEY,status TEXT NOT NULL DEFAULT 'inactive',started_at TEXT,expires_at TEXT,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)").run();
  const acct=await db.prepare("SELECT role,email,full_name FROM users WHERE id=? LIMIT 1").bind(user.id).first<any>();
  const admin=String(acct?.role??"").toLowerCase()==="admin"||String(acct?.email??user.email).trim().toLowerCase()===ADMIN_EMAIL;
  const sub=await db.prepare("SELECT status,expires_at FROM user_subscriptions WHERE user_id=? LIMIT 1").bind(user.id).first<any>();
  const subscribed=!admin&&String(sub?.status??"").toLowerCase()==="active"&&(!sub?.expires_at||Date.parse(sub.expires_at)>Date.now());
  const date=today();
  if(consume){
   let body:any={};try{body=await req.json()}catch{}
   const section=body.sectionId,type=body.gameTypeId,challenge=typeof body.challengeId==="string"?body.challengeId.slice(0,160):"";
   if(!SECTIONS.includes(section)||!TYPES[section]?.includes(type))return NextResponse.json({error:"Choose a valid game and section."},{status:400,headers});
   if(admin)return NextResponse.json({sectionId:section,gameTypeId:type,remaining:999999,isAdmin:true,isSubscribed:true,unlimited:true},{headers});
   if(challenge){
    const prior=await db.prepare("SELECT played_at FROM game_challenge_history WHERE user_id=? AND game_type_id=? AND challenge_id=?").bind(user.id,type,challenge).first<any>();
    if(prior&&Date.now()-Date.parse(prior.played_at)<365*86400000)return NextResponse.json({error:"This challenge has already been played within the last 365 days.",repeated:true},{status:409,headers});
   }
   if(subscribed){
    const limit=section==="daily-challenge"?DAILY_QUESTION_LIMIT:DAILY_LIMIT;
    const changed=await db.prepare("INSERT INTO game_subscriber_usage_by_type(user_id,game_type_id,usage_date,plays_used) VALUES(?,?,?,1) ON CONFLICT(user_id,game_type_id,usage_date) DO UPDATE SET plays_used=plays_used+1 WHERE game_subscriber_usage_by_type.plays_used < ? RETURNING plays_used").bind(user.id,type,date,limit).first<any>();
    if(!changed){const all=await db.prepare("SELECT game_type_id,plays_used FROM game_subscriber_usage_by_type WHERE user_id=? AND usage_date=?").bind(user.id,date).all<any>();const usedTypes:Record<string,number>={};for(const row of all.results??[])usedTypes[row.game_type_id]=Number(row.plays_used??0);const sectionRemaining=section==="daily-challenge"?Math.max(0,1-(usedTypes.daily??0)):TYPES[section].reduce((n,t)=>n+Math.max(0,DAILY_LIMIT-(usedTypes[t]??0)),0);const message=sectionRemaining===0?NO_MORE_TODAY:"Today's limit for this game type is complete. Please choose another activity in this section.";return NextResponse.json({error:message,sectionId:section,gameTypeId:type,remaining:0,sectionRemaining,isSubscribed:true},{status:403,headers});}
    if(challenge)await db.prepare("INSERT INTO game_challenge_history(user_id,game_type_id,challenge_id,played_at) VALUES(?,?,?,?) ON CONFLICT(user_id,game_type_id,challenge_id) DO UPDATE SET played_at=excluded.played_at").bind(user.id,type,challenge,new Date().toISOString()).run();
    const all=await db.prepare("SELECT game_type_id,plays_used FROM game_subscriber_usage_by_type WHERE user_id=? AND usage_date=?").bind(user.id,date).all<any>();
    const usedTypes:Record<string,number>={};for(const row of all.results??[])usedTypes[row.game_type_id]=Number(row.plays_used??0);
    const sectionRemaining=section==="daily-challenge"?Math.max(0,1-(usedTypes.daily??0)):TYPES[section].reduce((n,t)=>n+Math.max(0,DAILY_LIMIT-(usedTypes[t]??0)),0);
    return NextResponse.json({sectionId:section,gameTypeId:type,remaining:Math.max(0,limit-Number(changed.plays_used??0)),sectionRemaining,isSubscribed:true},{headers});
   }
   const changed=await db.prepare("INSERT INTO game_free_trials_by_section(user_id,section_id,trials_used,updated_at) VALUES(?,?,1,?) ON CONFLICT(user_id,section_id) DO UPDATE SET trials_used=trials_used+1,updated_at=excluded.updated_at WHERE game_free_trials_by_section.trials_used < ? RETURNING trials_used").bind(user.id,section,new Date().toISOString(),FREE_LIMIT).first<any>();
   if(!changed)return NextResponse.json({error:"Your three free trials in this section have been used. Subscribe to continue.",sectionId:section,gameTypeId:type,remaining:0,sectionRemaining:0,freeTrialsExhausted:true,isSubscribed:false},{status:403,headers});
   if(challenge)await db.prepare("INSERT INTO game_challenge_history(user_id,game_type_id,challenge_id,played_at) VALUES(?,?,?,?) ON CONFLICT(user_id,game_type_id,challenge_id) DO UPDATE SET played_at=excluded.played_at").bind(user.id,type,challenge,new Date().toISOString()).run();
   const left=FREE_LIMIT-Number(changed.trials_used??0);
   return NextResponse.json({sectionId:section,gameTypeId:type,remaining:left,sectionRemaining:left,isSubscribed:false,freeTrialsRemaining:left},{headers});
  }
  const free=await db.prepare("SELECT section_id,trials_used FROM game_free_trials_by_section WHERE user_id=?").bind(user.id).all<any>();
  const usage=await db.prepare("SELECT game_type_id,plays_used FROM game_subscriber_usage_by_type WHERE user_id=? AND usage_date=?").bind(user.id,date).all<any>();
  const freeUsed:Record<string,number>={},usedByType:Record<string,number>={},remainingBySection:Record<string,number>={},remainingByType:Record<string,number>={};
  for(const s of SECTIONS)freeUsed[s]=0;for(const x of free.results??[])freeUsed[x.section_id]=Number(x.trials_used??0);for(const x of usage.results??[])usedByType[x.game_type_id]=Number(x.plays_used??0);
  for(const s of SECTIONS){remainingBySection[s]=admin?999999:subscribed?(s==="daily-challenge"?Math.max(0,1-(usedByType.daily??0)):TYPES[s].reduce((n,t)=>n+Math.max(0,DAILY_LIMIT-(usedByType[t]??0)),0)):Math.max(0,FREE_LIMIT-(freeUsed[s]??0));for(const t of TYPES[s])remainingByType[t]=admin?999999:subscribed?Math.max(0,(t==="daily"?DAILY_QUESTION_LIMIT:DAILY_LIMIT)-(usedByType[t]??0)):Math.max(0,FREE_LIMIT-(freeUsed[s]??0));}
  return NextResponse.json({isAdmin:admin,isSubscribed:subscribed,role:admin?"admin":subscribed?"subscriber":"free",remainingBySection,remainingByType,freeUsedBySection:freeUsed,usedByType,utcDate:date},{headers});
 }catch(error){console.error("Game access check failed:",error);return NextResponse.json({error:"Game access could not be verified."},{status:503,headers})}
}
