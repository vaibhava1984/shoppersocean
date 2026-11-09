import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
export const dynamic = "force-dynamic";
const SECTIONS=["quiz-world","word-playground","brain-logic","quiz-arena","world-knowledge-quiz","riddle-corner","daily-challenge","memory-observation","classic-games","digital-discovery-hub","mystery-mansion","puzzle-universe","world-explorer","creative-studio","mind-lab","world-records-arena","mystery-quiz","word-differences","one-word-substitute"];
const TYPES:Record<string,string[]>={"quiz-world":["trivio"],"word-playground":["word","hidden","missing"],"brain-logic":["sequence","odd"],"quiz-arena":["quiz"],"world-knowledge-quiz":["worldquiz"],"riddle-corner":["riddle"],"daily-challenge":["daily"],"memory-observation":["memory","recall","spot","jigsaw"],"classic-games":["tic","chess"],"digital-discovery-hub":["internet","artificial-intelligence","cyber-detective","technology-history","quiz"],"mystery-mansion":["crime-scene","locked-room","secret-code","master-deception","riddle"],"puzzle-universe":["pattern-master","missing-piece","word-puzzle","sequence"],"world-explorer":["geography-quest","world-culture","landmark-adventure","worldquiz"],"creative-studio":["design-detective","pixel-artist","storyboard-challenge","odd"],"mind-lab":["mind-memory","mind-pattern","mind-focus","mind-logic","mind-speed","mind-spatial","worldquiz"],"world-records-arena":["world-records","quiz"],"mystery-quiz":["mystery-quiz"],"word-differences":["confusing-words"],"one-word-substitute":["one-word-substitute"]};
const QUESTION_BANK_SIZES:Record<string,number>={trivio:285,riddle:109,"mystery-quiz":90};
const ADMIN_EMAIL="kochimonu@gmail.com", FREE_LIMIT=3, DAILY_LIMIT=10;
const NO_MORE_TODAY="Your quota for this section today has been exhausted. Please visit tomorrow to play again.";
const headers={"Cache-Control":"no-store"};
const sectionFreeLimit=(_section:string)=>FREE_LIMIT;
const typeLimit=(_type:string)=>DAILY_LIMIT;
const today=()=>new Date(Date.now()-2.5*60*60*1000).toISOString().slice(0,10); // India day boundary: 08:00 IST (02:30 UTC).
const sectionDailyRemaining=(section:string,used:Record<string,number>)=>TYPES[section].reduce((n,t)=>n+Math.max(0,typeLimit(t)-(used[t]??0)),0);
async function claimChallenge(db:D1Database,userId:string,type:string,challenge:string,playedAt:string){
 if(!challenge)return true;
 const row=await db.prepare("INSERT INTO game_challenge_history(user_id,game_type_id,challenge_id,played_at) VALUES(?,?,?,?) ON CONFLICT(user_id,game_type_id,challenge_id) DO NOTHING RETURNING played_at").bind(userId,type,challenge,playedAt).first<any>();
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
  await db.prepare("CREATE TABLE IF NOT EXISTS game_free_trials_by_type(user_id TEXT NOT NULL,game_type_id TEXT NOT NULL,trials_used INTEGER NOT NULL DEFAULT 0,updated_at TEXT NOT NULL,PRIMARY KEY(user_id,game_type_id))").run();
  await db.prepare("CREATE TABLE IF NOT EXISTS game_subscriber_usage_by_type(user_id TEXT NOT NULL,game_type_id TEXT NOT NULL,usage_date TEXT NOT NULL,plays_used INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(user_id,game_type_id,usage_date))").run();
  await db.prepare("CREATE TABLE IF NOT EXISTS game_challenge_history(user_id TEXT NOT NULL,game_type_id TEXT NOT NULL,challenge_id TEXT NOT NULL,played_at TEXT NOT NULL,PRIMARY KEY(user_id,game_type_id,challenge_id))").run();
  // Preserve existing per-game usage; games with no attempt history start with three free attempts.
  await db.prepare("INSERT OR IGNORE INTO game_free_trials_by_type(user_id,game_type_id,trials_used,updated_at) SELECT user_id,game_type_id,CASE WHEN COUNT(*)>3 THEN 3 ELSE COUNT(*) END,MAX(played_at) FROM game_challenge_history GROUP BY user_id,game_type_id").run();
  await db.prepare("CREATE TABLE IF NOT EXISTS game_answered_questions(user_id TEXT NOT NULL,section_id TEXT NOT NULL,question_key TEXT NOT NULL,answered_at TEXT NOT NULL,PRIMARY KEY(user_id,section_id,question_key))").run();
  await db.prepare("CREATE TABLE IF NOT EXISTS game_question_reservations(user_id TEXT NOT NULL,game_type_id TEXT NOT NULL,challenge_id TEXT NOT NULL,question_text TEXT NOT NULL,session_id TEXT NOT NULL,reserved_at TEXT NOT NULL,PRIMARY KEY(user_id,game_type_id,challenge_id))").run();
  await db.prepare("CREATE TABLE IF NOT EXISTS game_picture_pair_quota_reset_v2(user_id TEXT NOT NULL,usage_date TEXT NOT NULL,PRIMARY KEY(user_id,usage_date))").run();
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
  // One-time correction for the site owner only: the old Picture Pair build allowed one attempt.
  // Reset only this account's jigsaw usage for today; no other account or game quota is touched.
  if(String(acct?.email??user.email).trim().toLowerCase()===ADMIN_EMAIL){
   const reset=await db.prepare("INSERT OR IGNORE INTO game_picture_pair_quota_reset_v2(user_id,usage_date) VALUES(?,?) RETURNING user_id").bind(user.id,date).first<any>();
   if(reset){
    await db.prepare("UPDATE game_subscriber_usage_by_type SET plays_used=0 WHERE user_id=? AND game_type_id='jigsaw' AND usage_date=?").bind(user.id,date).run();
    await db.prepare("UPDATE game_free_trials_by_section SET trials_used=0,updated_at=? WHERE user_id=? AND section_id='memory-observation'").bind(new Date().toISOString(),user.id).run();
   }
  }
    if(consume){
   let body:any={};try{body=await req.json()}catch{}
   const section=body.sectionId,type=body.gameTypeId,challenge=typeof body.challengeId==="string"?body.challengeId.slice(0,160):"",questionText=typeof body.challengeQuestion==="string"?body.challengeQuestion.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu," ").trim().slice(0,300):"";
   const reserveQuestion=body.reserveQuestion===true,reservationSessionId=typeof body.reservationSessionId==="string"?body.reservationSessionId.slice(0,120):"";
   const previewMode=body.previewMode===true&&admin;
   if(!SECTIONS.includes(section)||!TYPES[section]?.includes(type))return NextResponse.json({error:"Choose a valid game and section."},{status:400,headers});
   // A question bank can restart only after every unique question was answered by this user.
   if(body.resetQuestionBank===true){
    const pairs=Array.isArray(body.bankQuestionPairs)?body.bankQuestionPairs.filter((x:any)=>x&&typeof x.challengeId==="string"&&typeof x.questionKey==="string").slice(0,500):[];
    const expectedBankSize=QUESTION_BANK_SIZES[type];
    const uniqueBankKeys=new Set(pairs.map((x:any)=>String(x.questionKey).normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu," ").trim().slice(0,300)));
    if(!expectedBankSize||pairs.length!==expectedBankSize||uniqueBankKeys.size!==expectedBankSize)return NextResponse.json({error:"The complete question bank is required before a reset."},{status:400,headers});
    for(const pair of pairs){
     const key=String(pair.questionKey).normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu," ").trim().slice(0,300);
     const aliases=Array.isArray(pair.legacyChallengeIds)?pair.legacyChallengeIds.filter((x:any)=>typeof x==="string").map((x:string)=>x.slice(0,160)): [String(pair.challengeId).slice(0,160)];
     const placeholders=aliases.map(()=>"?").join(",");
     const legacy=aliases.length?await db.prepare("SELECT 1 AS ok FROM game_challenge_history WHERE user_id=? AND game_type_id=? AND challenge_id IN ("+placeholders+") LIMIT 1").bind(user.id,type,...aliases).first<any>():null;
     const done=await db.prepare("SELECT 1 AS ok FROM game_answered_questions WHERE user_id=? AND section_id=? AND question_key=?").bind(user.id,section,key).first<any>();
     if(!done&&!legacy)return NextResponse.json({bankReset:false,bankComplete:false},{headers});
    }
    const keys=[...new Set(pairs.map((x:any)=>String(x.questionKey).normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu," ").trim().slice(0,300)))];
    const placeholders=keys.map(()=>"?").join(",");
    await db.prepare("DELETE FROM game_answered_questions WHERE user_id=? AND section_id=? AND question_key IN ("+placeholders+")").bind(user.id,section,...keys).run();
    await db.prepare("DELETE FROM game_challenge_history WHERE user_id=? AND game_type_id=?").bind(user.id,type).run();
    await db.prepare("DELETE FROM game_question_reservations WHERE user_id=? AND game_type_id=?").bind(user.id,type).run();
    return NextResponse.json({bankReset:true,bankComplete:true},{headers});
   }
   // Display reservations are temporary; permanent history is written only after an answer.
   if(reserveQuestion){
    if(previewMode)return NextResponse.json({reserved:true,previewMode:true},{headers});
    // Unanswered reservations are durable: leaving a section or starting a new browser session must not discard the question.
    const reservationIndex=await db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND name='game_question_reservations_user_type_question_unique'").first<any>();
    if(!reservationIndex){
     await db.prepare("DROP INDEX IF EXISTS game_question_reservations_user_question_unique").run();
     await db.prepare("DELETE FROM game_question_reservations WHERE rowid NOT IN (SELECT MIN(rowid) FROM game_question_reservations GROUP BY user_id,game_type_id,question_text)").run();
     await db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS game_question_reservations_user_type_question_unique ON game_question_reservations(user_id,game_type_id,question_text)").run();
    }
    if(!challenge||!questionText||!reservationSessionId)return NextResponse.json({error:"A question reservation requires a challenge and session."},{status:400,headers});
    // Resume the user's pending question before considering any new candidate. A new component
    // mount creates a new session ID, so transfer the reservation to this session and return
    // the original challenge ID. Viewing the question never consumes quota or marks it answered.
    const pending=await db.prepare("SELECT challenge_id,question_text FROM game_question_reservations WHERE user_id=? AND game_type_id=? ORDER BY reserved_at ASC LIMIT 1").bind(user.id,type).first<any>();
    if(pending){
     const pendingId=String(pending.challenge_id??"");
     const pendingText=String(pending.question_text??"");
     const alreadyAnswered=await db.prepare("SELECT 1 AS ok FROM game_answered_questions WHERE user_id=? AND section_id=? AND question_key=? LIMIT 1").bind(user.id,section,pendingText).first<any>();
     const alreadyPlayed=pendingId?await db.prepare("SELECT 1 AS ok FROM game_challenge_history WHERE user_id=? AND game_type_id=? AND challenge_id=? LIMIT 1").bind(user.id,type,pendingId).first<any>():null;
     if(alreadyAnswered||alreadyPlayed){
      await db.prepare("DELETE FROM game_question_reservations WHERE user_id=? AND game_type_id=? AND challenge_id=?").bind(user.id,type,pendingId).run();
     }else{
      await db.prepare("UPDATE game_question_reservations SET session_id=? WHERE user_id=? AND game_type_id=? AND challenge_id=?").bind(reservationSessionId,user.id,type,pendingId).run();
      return NextResponse.json({reserved:true,resumed:true,challengeId:pendingId,questionText:pendingText},{headers});
     }
    }
    const playedAt=new Date().toISOString();
    const prior=await db.prepare("SELECT played_at FROM game_challenge_history WHERE user_id=? AND game_type_id=? AND challenge_id=?").bind(user.id,type,challenge).first<any>();
    const priorQuestion=await db.prepare("SELECT answered_at FROM game_answered_questions WHERE user_id=? AND section_id=? AND question_key=?").bind(user.id,section,questionText).first<any>();
    const aliases=Array.isArray(body.legacyChallengeIds)?body.legacyChallengeIds.filter((x:any)=>typeof x==="string").map((x:string)=>x.slice(0,160)).slice(0,30):[];
    const aliasPlaceholders=aliases.map(()=>"?").join(",");
    const priorAlias=aliases.length?await db.prepare("SELECT 1 AS ok FROM game_challenge_history WHERE user_id=? AND game_type_id=? AND challenge_id IN ("+aliasPlaceholders+") LIMIT 1").bind(user.id,type,...aliases).first<any>():null;
    if(prior||priorQuestion||priorAlias){
     await db.prepare("DELETE FROM game_question_reservations WHERE user_id=? AND game_type_id=? AND challenge_id=?").bind(user.id,type,challenge).run();
     return NextResponse.json({error:"Please try another challenge.",repeated:true,skipQuestion:true,sectionId:section,gameTypeId:type},{status:409,headers});
    }
    const existing=await db.prepare("SELECT question_text,session_id FROM game_question_reservations WHERE user_id=? AND game_type_id=? AND question_text=? LIMIT 1").bind(user.id,type,questionText).first<any>();
    if(existing){
     await db.prepare("UPDATE game_question_reservations SET session_id=? WHERE user_id=? AND game_type_id=? AND question_text=?").bind(reservationSessionId,user.id,type,questionText).run();
     return NextResponse.json({reserved:true,resumed:true,challengeId:challenge,questionText},{headers});
    }
    await db.prepare("INSERT OR IGNORE INTO game_question_reservations(user_id,game_type_id,challenge_id,question_text,session_id,reserved_at) VALUES(?,?,?,?,?,?)").bind(user.id,type,challenge,questionText,reservationSessionId,playedAt).run();
    const acquired=await db.prepare("SELECT 1 AS ok FROM game_question_reservations WHERE user_id=? AND game_type_id=? AND challenge_id=? AND question_text=? AND session_id=? LIMIT 1").bind(user.id,type,challenge,questionText,reservationSessionId).first<any>();
    if(!acquired)return NextResponse.json({error:"Please try another challenge.",repeated:true,skipQuestion:true,sectionId:section,gameTypeId:type},{status:409,headers});
    return NextResponse.json({reserved:true},{headers});
   }
   const activeReservation=questionText&&reservationSessionId?await db.prepare("SELECT question_text FROM game_question_reservations WHERE user_id=? AND game_type_id=? AND challenge_id=? AND session_id=? LIMIT 1").bind(user.id,type,challenge,reservationSessionId).first<any>():null;
   const isReservedForCurrentSession=Boolean(activeReservation&&String(activeReservation.question_text)===questionText);
   // Enforce the free section quota before touching daily usage; this prevents stale clients
   // from receiving another question after their free allowance has run out.
   if(!admin&&!subscribed){
    const freeRow=await db.prepare("SELECT trials_used FROM game_free_trials_by_type WHERE user_id=? AND game_type_id=? LIMIT 1").bind(user.id,type).first<any>();
    if(Number(freeRow?.trials_used??0)>=FREE_LIMIT){
     return NextResponse.json({error:"Your free quota for this game has been exhausted. Please subscribe to enjoy further.",sectionId:section,gameTypeId:type,remaining:0,sectionRemaining:0,freeTrialsExhausted:true,isSubscribed:false,isAdmin:false},{status:403,headers});
    }
   }
   // Check the section's daily quota before duplicate-history checks so exhausted sections stop immediately.
   const limit=typeLimit(type);
   const changed=previewMode?{plays_used:0}:await db.prepare("INSERT INTO game_subscriber_usage_by_type(user_id,game_type_id,usage_date,plays_used) VALUES(?,?,?,1) ON CONFLICT(user_id,game_type_id,usage_date) DO UPDATE SET plays_used=plays_used+1 WHERE game_subscriber_usage_by_type.plays_used < ? RETURNING plays_used").bind(user.id,type,date,limit).first<any>();
   if(!changed){
    const all=await db.prepare("SELECT game_type_id,plays_used FROM game_subscriber_usage_by_type WHERE user_id=? AND usage_date=?").bind(user.id,date).all<any>();
    const usedTypes:Record<string,number>={};for(const row of all.results??[])usedTypes[row.game_type_id]=Number(row.plays_used??0);
    const sectionRemaining=sectionDailyRemaining(section,usedTypes);
    const message=NO_MORE_TODAY;
    return NextResponse.json({error:message,sectionId:section,gameTypeId:type,remaining:0,sectionRemaining,isAdmin:admin,isSubscribed:subscribed},{status:403,headers});
   }
   if(challenge){
    const prior=await db.prepare("SELECT played_at FROM game_challenge_history WHERE user_id=? AND game_type_id=? AND challenge_id=?").bind(user.id,type,challenge).first<any>();
    const priorQuestion=questionText?await db.prepare("SELECT answered_at FROM game_answered_questions WHERE user_id=? AND section_id=? AND question_key=?").bind(user.id,section,questionText).first<any>():null;
    if(!previewMode&&(prior||priorQuestion)){
     await db.prepare("UPDATE game_subscriber_usage_by_type SET plays_used=plays_used-1 WHERE user_id=? AND game_type_id=? AND usage_date=? AND plays_used>0").bind(user.id,type,date).run();
     return NextResponse.json({error:"Please try another challenge.",repeated:true,skipQuestion:true,sectionId:section,gameTypeId:type},{status:409,headers});
    }
   }
   let freeTrialsUsed:number|null=null;
   if(!admin&&!subscribed){
    const trial=await db.prepare("INSERT INTO game_free_trials_by_type(user_id,game_type_id,trials_used,updated_at) VALUES(?,?,1,?) ON CONFLICT(user_id,game_type_id) DO UPDATE SET trials_used=trials_used+1,updated_at=excluded.updated_at WHERE game_free_trials_by_type.trials_used < ? RETURNING trials_used").bind(user.id,type,new Date().toISOString(),FREE_LIMIT).first<any>();
    if(!trial){
     await db.prepare("UPDATE game_subscriber_usage_by_type SET plays_used=plays_used-1 WHERE user_id=? AND game_type_id=? AND usage_date=? AND plays_used>0").bind(user.id,type,date).run();
     return NextResponse.json({error:"Your free quota for this game has been exhausted. Please subscribe to enjoy further.",sectionId:section,gameTypeId:type,remaining:0,sectionRemaining:0,freeTrialsExhausted:true,isSubscribed:false},{status:403,headers});
    }
    freeTrialsUsed=Number(trial.trials_used??0);
   }
   const playedAt=new Date().toISOString();
   if(!previewMode){
    const savedQuestion=questionText?await db.prepare("INSERT INTO game_answered_questions(user_id,section_id,question_key,answered_at) VALUES(?,?,?,?) ON CONFLICT(user_id,section_id,question_key) DO NOTHING RETURNING question_key").bind(user.id,section,questionText,playedAt).first<any>():{question_key:""};
    if(!savedQuestion){
     await db.prepare("UPDATE game_subscriber_usage_by_type SET plays_used=plays_used-1 WHERE user_id=? AND game_type_id=? AND usage_date=? AND plays_used>0").bind(user.id,type,date).run();
     if(freeTrialsUsed!==null)await db.prepare("UPDATE game_free_trials_by_type SET trials_used=trials_used-1 WHERE user_id=? AND game_type_id=? AND trials_used>0").bind(user.id,type).run();
     return NextResponse.json({error:"Please try another challenge.",repeated:true,skipQuestion:true,sectionId:section,gameTypeId:type},{status:409,headers});
    }
    if(challenge&&!await claimChallenge(db,user.id,type,challenge,playedAt)){
     await db.prepare("DELETE FROM game_answered_questions WHERE user_id=? AND section_id=? AND question_key=?").bind(user.id,section,questionText).run();
     await db.prepare("UPDATE game_subscriber_usage_by_type SET plays_used=plays_used-1 WHERE user_id=? AND game_type_id=? AND usage_date=? AND plays_used>0").bind(user.id,type,date).run();
     if(freeTrialsUsed!==null)await db.prepare("UPDATE game_free_trials_by_type SET trials_used=trials_used-1 WHERE user_id=? AND game_type_id=? AND trials_used>0").bind(user.id,type).run();
     return NextResponse.json({error:"Please try another challenge.",repeated:true,skipQuestion:true,sectionId:section,gameTypeId:type},{status:409,headers});
    }
   }
   if(isReservedForCurrentSession)await db.prepare("DELETE FROM game_question_reservations WHERE user_id=? AND game_type_id=? AND challenge_id=? AND session_id=?").bind(user.id,type,challenge,reservationSessionId).run();
   const all=previewMode?{results:[] as any[]}:await db.prepare("SELECT game_type_id,plays_used FROM game_subscriber_usage_by_type WHERE user_id=? AND usage_date=?").bind(user.id,date).all<any>();
   const usedTypes:Record<string,number>={};for(const row of all.results??[])usedTypes[row.game_type_id]=Number(row.plays_used??0);
   const dailyRemaining=previewMode?limit:Math.max(0,limit-Number(changed.plays_used??0));
   const dailySectionRemaining=sectionDailyRemaining(section,usedTypes);
   const sectionRemaining=admin||subscribed?dailySectionRemaining:Math.min(dailySectionRemaining,Math.max(0,FREE_LIMIT-(freeTrialsUsed??0)));
   const remaining=admin||subscribed?dailyRemaining:Math.min(dailyRemaining,Math.max(0,FREE_LIMIT-(freeTrialsUsed??0)));
   return NextResponse.json({sectionId:section,gameTypeId:type,remaining,sectionRemaining,isAdmin:admin,isSubscribed:subscribed,freeTrialsRemaining:freeTrialsUsed===null?undefined:Math.max(0,sectionFreeLimit(section)-freeTrialsUsed)},{headers});
  }
  const free=await db.prepare("SELECT game_type_id,trials_used FROM game_free_trials_by_type WHERE user_id=?").bind(user.id).all<any>();
  const usage=await db.prepare("SELECT game_type_id,plays_used FROM game_subscriber_usage_by_type WHERE user_id=? AND usage_date=?").bind(user.id,date).all<any>();
  const freeUsed:Record<string,number>={},usedByType:Record<string,number>={},remainingBySection:Record<string,number>={},remainingByType:Record<string,number>={};
  for(const x of free.results??[])freeUsed[x.game_type_id]=Number(x.trials_used??0);for(const x of usage.results??[])usedByType[x.game_type_id]=Number(x.plays_used??0);
  for(const s of SECTIONS){
   const dailySection=sectionDailyRemaining(s,usedByType);
   remainingBySection[s]=admin||subscribed?dailySection:Math.min(dailySection,TYPES[s].reduce((n,t)=>n+Math.max(0,FREE_LIMIT-(freeUsed[t]??0)),0));
   for(const t of TYPES[s])remainingByType[t]=Math.min(Math.max(0,typeLimit(t)-(usedByType[t]??0)),admin||subscribed?Number.MAX_SAFE_INTEGER:Math.max(0,FREE_LIMIT-(freeUsed[t]??0)));
  }
  return NextResponse.json({isAdmin:admin,isSubscribed:subscribed,role:admin?"admin":subscribed?"subscriber":"free",remainingBySection,remainingByType,freeUsedByType:freeUsed,usedByType,gameDay:date,resetTime:"08:00 Asia/Kolkata"},{headers});
 }catch(error){console.error("Game access check failed:",error);return NextResponse.json({error:"Game access could not be verified."},{status:503,headers})}
}
