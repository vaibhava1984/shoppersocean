"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Choice = { text: string; clue: string };
type Scene = { title: string; text: string; choices: Choice[] };

const scenes: Scene[] = [
 { title: "12:00 AM · ROOM 914", text: "You are alone in a hotel room. Three slow knocks sound from the corridor. You look through the peephole. The corridor is empty. Your phone lights up with a message from an unknown number: “Do not open the door. I am already inside.” A second message follows: “You have seven minutes.”", choices: [
  { text: "Keep the door locked and photograph the message.", clue: "phone" },
  { text: "Call the front desk without speaking loudly.", clue: "desk" },
  { text: "Move away from the entrance and quietly inspect the room.", clue: "room" },
  { text: "Reply: “Who are you, and where are you?”", clue: "reply" }
 ]},
 { title: "12:01 AM · THE SECOND SIGNAL", text: "The message is marked as delivered, but the sender has no number or contact name. Your phone briefly connects to a Wi-Fi device called ROOM-914-MIRROR. The hotel's Wi-Fi list shows no such device.", choices: [
  { text: "Screenshot the device name and connection time.", clue: "device" },
  { text: "Turn off Wi-Fi and use the mobile network to call for help.", clue: "network" },
  { text: "Check whether the hotel television is connected to the same device.", clue: "tv" },
  { text: "Send one short message asking the sender to prove they are inside.", clue: "proof" }
 ]},
 { title: "12:02 AM · THE EMPTY CORRIDOR", text: "A security monitor on the television shows your corridor. It looks empty, but the digital clock in the picture reads 11:42 PM. The image is twenty minutes old. Then three knocks sound again — this time from somewhere behind you.", choices: [
  { text: "Step into the bathroom and listen for the exact direction.", clue: "bathroom" },
  { text: "Check the wardrobe and the wall behind it from a safe distance.", clue: "wardrobe" },
  { text: "Call emergency services and report someone may be inside.", clue: "emergency" },
  { text: "Stay near the exit, keeping the door locked, and observe.", clue: "exit" }
 ]},
 { title: "12:03 AM · THE EXTRA DOOR", text: "Behind a hanging coat, you notice a narrow seam in the wall. The room plan beside the entrance shows Room 914 beside a staff-only service passage. You hear a faint metallic click from the other side of the seam.", choices: [
  { text: "Photograph the room plan and the seam.", clue: "plan" },
  { text: "Ask the front desk whether Room 914 has a concealed service access.", clue: "access" },
  { text: "Move a heavy chair in front of the seam without touching it.", clue: "block" },
  { text: "Speak clearly: “I know there is a passage. Come out.”", clue: "challenge" }
 ]},
 { title: "12:04 AM · THE VOICE", text: "A voice comes through the wall: “You were not meant to check the monitor.” Your phone receives another message: “The person at reception is not who you think.” The voice sounds strained, not angry. You hear a cough, then silence.", choices: [
  { text: "Ask the voice to state the name printed on the room key envelope.", clue: "name" },
  { text: "Ask the front desk to send two staff members and security together.", clue: "security" },
  { text: "Tell the voice you will not approach the hidden panel.", clue: "calm" },
  { text: "Record the voice and the incoming messages as evidence.", clue: "record" }
 ]},
 { title: "12:05 AM · THE HIDDEN DEVICE", text: "A small maintenance panel gives way slightly. Behind it you glimpse a hand, a hotel uniform sleeve and a tablet showing your room number. The tablet's screen displays the message thread you have been receiving. Someone inside the wall whispers: “Please. The manager locked me in here.”", choices: [
  { text: "Keep your distance and ask the person to identify themselves.", clue: "identify" },
  { text: "Ask them to slide their staff identity card into view.", clue: "card" },
  { text: "Tell them help is coming and ask whether they are injured.", clue: "help" },
  { text: "Do not open the panel; insist that hotel security open it from the staff passage.", clue: "staff" }
 ]}
];

const STORY_ID = "final-hour-story-v1";
const STORY_PROMPT = "The Final Hour: one complete branching hotel-room suspense story, ending and choices";
function shuffled<T>(items:T[]):T[] { const a=[...items]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }

export default function ThrillerZone({ userId }: { userId: string | null }) {
 const [scene,setScene]=useState(0),[clues,setClues]=useState<string[]>([]),[choice,setChoice]=useState<number|null>(null);
 const [quota,setQuota]=useState<number|null>(null),[dailyQuota,setDailyQuota]=useState<number|null>(null),[freeTrials,setFreeTrials]=useState<number|null>(null);
 const [admin,setAdmin]=useState(false),[subscribed,setSubscribed]=useState(false),[reserved,setReserved]=useState(false);
 const [loading,setLoading]=useState(true),[error,setError]=useState(""),[feedback,setFeedback]=useState("");
 const [soundOn,setSoundOn]=useState(true),[complete,setComplete]=useState(false),[ending,setEnding]=useState("");
 const session=useRef("final-hour-"+Date.now()+"-"+Math.random().toString(36).slice(2));
 const heading=useRef<HTMLDivElement|null>(null);
 const exhausted=quota===0&&!admin&&!subscribed;
 const options=useMemo(()=>scene<scenes.length?shuffled(scenes[scene].choices.map((x,i)=>({...x,index:i}))):[],[scene]);
 const playSound=(kind:"tap"|"correct"|"wrong")=>{if(!soundOn||typeof window==="undefined")return;const audio=new Audio(kind==="correct"?"/correct.mp3":kind==="wrong"?"/Lose.mp3":"/Tap.mp3");audio.volume=.75;void audio.play().catch(()=>{});};

 useEffect(()=>{if(!userId)return;let live=true;
  fetch("/api/game-access",{cache:"no-store"}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error||"Could not check access.");if(!live)return;setAdmin(Boolean(d.isAdmin));setSubscribed(Boolean(d.isSubscribed));setDailyQuota(Math.max(0,10-Number(d.usedByType?.["final-hour-story"]??0)));setFreeTrials(d.isAdmin||d.isSubscribed?null:Math.max(0,3-Number(d.freeUsedBySection?.["thriller-zone"]??0)));setQuota(d.isAdmin||d.isSubscribed?(d.remainingByType?.["final-hour-story"]??0):(d.remainingBySection?.["thriller-zone"]??0));})
  .catch(e=>{if(live)setError(e instanceof Error?e.message:"Could not verify access.");}).finally(()=>{if(live)setLoading(false);});
  return()=>{live=false;};
 },[userId]);

 useEffect(()=>{if(!userId||exhausted||error)return;let live=true;
  (async()=>{try{const r=await fetch("/api/game-access",{method:"POST",cache:"no-store",headers:{"Content-Type":"application/json"},body:JSON.stringify({sectionId:"thriller-zone",gameTypeId:"final-hour-story",challengeId:STORY_ID,challengeQuestion:STORY_PROMPT,reserveQuestion:true,reservationSessionId:session.current,previewMode:admin})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Could not prepare the story.");if(live)setReserved(true);}catch(e){if(live)setError(e instanceof Error?e.message:"Could not prepare the story.");}})();
  return()=>{live=false;};
 },[userId,admin,exhausted,error]);

 useEffect(()=>{if(heading.current){const t=setTimeout(()=>window.scrollTo({top:Math.max(0,heading.current!.getBoundingClientRect().top+window.scrollY-80),behavior:"smooth"}),100);return()=>clearTimeout(t);}},[scene,complete]);

 const choose=(index:number,clue:string)=>{if(choice!==null||complete||!reserved)return;playSound("tap");setChoice(index);setClues(v=>[...v,clue]);setFeedback("Decision recorded. The story is moving forward…");window.setTimeout(()=>{setChoice(null);setFeedback("");setScene(v=>v+1);},650);};

 const finish=async()=>{
  if(!userId||!reserved||complete)return;
  setLoading(true);setError("");
  try{
   const r=await fetch("/api/game-access",{method:"POST",cache:"no-store",headers:{"Content-Type":"application/json"},body:JSON.stringify({sectionId:"thriller-zone",gameTypeId:"final-hour-story",challengeId:STORY_ID,challengeQuestion:STORY_PROMPT,reservationSessionId:session.current,previewMode:admin})});
   const d=await r.json();if(!r.ok)throw new Error(d.error||"Could not record this playthrough.");
   setQuota(admin||subscribed?d.remaining:d.sectionRemaining);setDailyQuota(d.remaining);if(!admin&&!subscribed)setFreeTrials(d.freeTrialsRemaining??null);
   const careful=clues.some(x=>["phone","device","plan","record","card","staff","security","emergency"].includes(x));
   const kind=clues.includes("help")||clues.includes("calm")?"rescue":clues.includes("challenge")||clues.includes("block")?"confront":"evidence";
   setEnding(kind==="rescue"?"THE RESCUE: You keep your distance and coordinate help. The hidden panel is opened from the staff passage. The person inside is Elias, the hotel's night auditor. He was locked in the narrow maintenance compartment by the manager after discovering that the manager had been entering occupied rooms. Elias used a staff tablet connected to the room's mirrored hotel network to send the warnings.":kind==="confront"?"THE REVEAL: The panel opens from the staff passage. A frightened man in a hotel uniform steps out: Elias, the night auditor. The manager had trapped him in the maintenance compartment after Elias discovered unauthorised room entries. His staff tablet, paired to the room's mirrored network, sent the messages. The empty peephole and delayed camera feed were part of the cover-up.":"THE TRUTH: Security follows the service passage and opens the panel. The person inside is Elias, the hotel's night auditor. The manager locked him in the maintenance compartment after he discovered unauthorised room entries. Elias sent the warnings from a staff tablet paired to the room's mirrored hotel network. The corridor monitor was deliberately showing a delayed loop — which is why the peephole showed nobody.");
   setFeedback(careful?"Your decisions preserved useful evidence and helped establish the timeline.":"Your choices shaped how the final discovery unfolded.");setComplete(true);playSound("correct");
  }catch(e){setError(e instanceof Error?e.message:"Could not record this playthrough.");}
  finally{setLoading(false);}
 };

 return <div className="relative isolate overflow-hidden rounded-[2rem] border border-amber-200/30 bg-[#10152b] p-4 text-white shadow-2xl sm:p-7">
  <div className="pointer-events-none absolute inset-0 opacity-50" style={{backgroundImage:"radial-gradient(circle at 12% 15%,rgba(251,191,36,.28),transparent 32%),radial-gradient(circle at 88% 75%,rgba(168,85,247,.28),transparent 32%),radial-gradient(circle at 50% 45%,rgba(34,211,238,.14),transparent 38%)"}}/>
  <div ref={heading} className="relative overflow-hidden rounded-[1.7rem] border border-amber-100/25 bg-gradient-to-br from-[#493014] via-[#30214d] to-[#10152b] px-5 py-8 text-center sm:px-10 sm:py-12">
   <p className="text-[10px] font-black uppercase tracking-[.35em] text-amber-200">One story · Every decision matters · Multiple outcomes</p><div className="my-3 text-5xl">🔦</div>
   <h2 className="text-3xl font-black tracking-wide text-amber-100 sm:text-5xl">THE FINAL HOUR</h2>
   <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-indigo-100">A midnight hotel mystery told through your decisions. Follow the clues, decide whom to trust, and uncover who is already inside. This is one continuous thriller — not a quiz.</p>
  </div>
  <div className="relative mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/5 p-3">
   <span className="text-xs font-black uppercase tracking-wider text-cyan-100">Story progress · {complete?"Complete":`Scene ${Math.min(scene+1,scenes.length)} / ${scenes.length+1}`}</span>
   <div className="flex flex-wrap items-center gap-2"><button type="button" onClick={()=>{setSoundOn(v=>!v);if(!soundOn)playSound("tap");}} className="rounded-full border border-white/30 bg-black/20 px-3 py-2 text-xs font-black">{soundOn?"🔊 SOUND ON":"🔇 SOUND OFF"}</button><span className="rounded-full border border-white/30 bg-black/20 px-3 py-2 text-xs font-black">{String(dailyQuota??"…")} / 10 TODAY</span>{!admin&&!subscribed&&<span className="rounded-full border border-amber-200/50 bg-amber-300/15 px-3 py-2 text-xs font-black">{String(freeTrials??"…")} / 3 FREE TRIALS</span>}{(admin||subscribed)&&<span className="rounded-full border border-white/30 bg-black/20 px-3 py-2 text-xs font-black">{admin?"ADMIN PREVIEW":"SUBSCRIBER"}</span>}</div>
  </div>
  {error&&<div className="relative mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-800">{error}</div>}
  {exhausted&&<div className="relative mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">Your three free trials in Thriller Zone have been used. Subscribe to continue.</div>}
  {(loading&&!reserved)&&<div className="relative mt-4 rounded-2xl bg-white p-6 text-center font-bold text-slate-800">Preparing your thriller…</div>}
  {reserved&&!exhausted&&!complete&&scene<scenes.length&&<div className="relative mt-4 rounded-3xl bg-white p-4 text-slate-900 shadow-lg sm:p-6">
   <div className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-indigo-900">{scenes[scene].title}</div>
   <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5"><p className="text-xs font-black uppercase tracking-wider text-slate-500">What happens</p><p className="mt-2 text-sm font-semibold leading-7 text-slate-800">{scenes[scene].text}</p></div>
   <h3 className="mt-5 text-lg font-black leading-7 text-slate-950 sm:text-xl">What do you do?</h3>
   <div className="mt-5 grid gap-3 sm:grid-cols-2">{options.map((o,pos)=><button key={o.index} disabled={choice!==null||loading} onClick={()=>choose(o.index,o.clue)} className={"min-h-14 rounded-xl border border-white/70 bg-gradient-to-r "+["from-indigo-600 to-blue-700","from-fuchsia-600 to-purple-700","from-teal-600 to-emerald-700","from-orange-500 to-rose-600"][pos]+" px-4 py-3 text-left text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"}><span className="mr-2 font-black">{String.fromCharCode(65+pos)}.</span>{o.text}</button>)}</div>
   <p className="mt-4 text-xs font-semibold text-slate-500">{choice===null?"Choose the action you would genuinely take. Your decisions influence the final outcome.":"Decision recorded…"}</p>{feedback&&<div aria-live="polite" className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm font-semibold leading-6 text-indigo-950">{feedback}</div>}
  </div>}
  {reserved&&!exhausted&&!complete&&scene===scenes.length&&<div className="relative mt-4 rounded-3xl bg-white p-5 text-slate-900 shadow-lg sm:p-7"><div className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-rose-900">12:06 AM · THE LAST CHOICE</div><p className="mt-4 text-sm font-semibold leading-7 text-slate-800">The voice behind the panel says: “My name is Elias. I found the manager's duplicate key log. He saw me copy it and sealed this passage. The messages came from the tablet beside me. I sent the first one because I heard someone approaching your door.” Footsteps stop outside. A key enters the lock.</p><h3 className="mt-5 text-lg font-black">The handle begins to turn. What is your final move?</h3><div className="mt-4 grid gap-3 sm:grid-cols-2">{[{text:"Call out for hotel security and keep the door locked.",clue:"security"},{text:"Move to a safe position and tell Elias to stay behind the panel.",clue:"staff"},{text:"Switch on the room lights and loudly identify yourself.",clue:"challenge"},{text:"Call emergency services and give them the room number.",clue:"emergency"}].map((o,i)=><button key={i} onClick={()=>{setClues(v=>[...v,o.clue]);void finish();}} disabled={loading} className={"min-h-14 rounded-xl border border-white/70 bg-gradient-to-r "+["from-indigo-600 to-blue-700","from-fuchsia-600 to-purple-700","from-teal-600 to-emerald-700","from-orange-500 to-rose-600"][i]+" px-4 py-3 text-left text-sm font-bold text-white shadow-md disabled:opacity-60"}>{String.fromCharCode(65+i)}. {o.text}</button>)}</div></div>}
  {complete&&<div className="relative mt-4 rounded-3xl bg-white p-5 text-slate-900 shadow-lg sm:p-7"><div className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-900">Case closed · Final reveal</div><h3 className="mt-4 text-2xl font-black text-slate-950">Who was already inside?</h3><p className="mt-3 text-sm font-semibold leading-7 text-slate-800">{ending}</p><div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm font-semibold leading-6 text-indigo-950">{feedback}</div><p className="mt-4 text-xs font-bold text-slate-500">Your complete playthrough has been recorded as one Thriller Zone attempt.</p></div>}
 </div>;
}
