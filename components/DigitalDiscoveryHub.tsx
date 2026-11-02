"use client";
import GameQuotaNotice from "@/components/GameQuotaNotice";

import { useEffect, useRef, useState } from "react";
import GameQuotaPopup from "@/components/GameQuotaPopup";
import Link from "next/link";
import { internetQuestionBank } from "@/components/internetQuestionBank";
import { artificialIntelligenceQuestionBank } from "@/components/artificialIntelligenceQuestionBank";

type Question = { id:string; q:string; options:string[]; answer:number; fact:string };
type Area = { id:string; type:string; icon:string; title:string; intro:string; tone:string; questions:Question[] };

type Question = { id: string; q: string; options: string[]; answer: number; fact: string };
type Area = { id: string; type: string; icon: string; title: string; intro: string; tone: string; questions: Question[] };

const areas: Area[] = [
{ id:"internet",type:"internet",icon:"🌐",title:"Secrets of the Internet",intro:"Uncover how the connected world really works.",tone:"from-blue-600 to-cyan-500",questions:[...internetQuestionBank,
{id:"net-01",q:"What does DNS do when you open a website by its name?",options:["Finds the server's IP address","Charges your internet bill","Creates the website design","Encrypts your keyboard"],answer:0,fact:"DNS is like the internet's address book: it translates domain names into IP addresses."},
{id:"net-02",q:"Which device usually directs data between your home network and the internet?",options:["Printer","Router","Webcam","Monitor"],answer:1,fact:"A router forwards data between networks and often provides Wi-Fi to devices at home."},
{id:"net-03",q:"What does HTTPS add to a website connection?",options:["A bigger screen","Encrypted communication and identity checks","Unlimited storage","Faster typing"],answer:1,fact:"HTTPS uses TLS to protect data in transit and help verify the website's identity."},
{id:"net-04",q:"What is a web browser mainly used for?",options:["Displaying and interacting with websites","Repairing a phone battery","Creating Wi-Fi signals","Printing money"],answer:0,fact:"Browsers request web resources and render pages so people can interact with websites."},
{id:"net-05",q:"What does bandwidth describe?",options:["The colour of a cable","The potential data-carrying capacity of a connection","The age of a website","The number of apps installed"],answer:1,fact:"Bandwidth is the maximum data rate a connection can carry; actual speed can be lower."},
{id:"net-06",q:"What is a cookie in web browsing?",options:["A small piece of data stored by a website in your browser","A computer virus by definition","A type of screen","A Wi-Fi password"],answer:0,fact:"Cookies can remember settings or sign-in sessions, though some are also used for tracking."},
{id:"net-07",q:"Which system helps computers send data in small addressed units across networks?",options:["IP","JPEG","HTML","USB"],answer:0,fact:"Internet Protocol provides addressing and routing rules for packets moving between networks."},
{id:"net-08",q:"What does a search engine's crawler do?",options:["Visits pages to discover and index content","Cools the computer","Blocks every advertisement","Changes your screen brightness"],answer:0,fact:"Crawlers discover pages and collect information that a search engine may later index."},
{id:"net-09",q:"Why can a public Wi-Fi network be riskier than a trusted private network?",options:["It always damages batteries","Other users may be able to observe or imitate network activity","It makes files heavier","It disables all passwords"],answer:1,fact:"Use HTTPS, avoid sensitive actions on untrusted networks, and consider a reputable VPN when appropriate."},
{id:"net-10",q:"What is cloud storage?",options:["Saving files on remote internet-connected servers","Saving files only inside a keyboard","A weather forecast","A special type of monitor"],answer:0,fact:"Cloud storage keeps data on remote servers that you access over a network."}
]},
{ id:"artificial-intelligence",type:"artificial-intelligence",icon:"🤖",title:"Artificial Intelligence",intro:"Meet the systems that learn patterns and assist people.",tone:"from-violet-600 to-fuchsia-500",questions:[...artificialIntelligenceQuestionBank,
{id:"ai-01",q:"What is machine learning?",options:["A method where systems learn patterns from data","A way to wash computer parts","A faster internet cable","A screen repair technique"],answer:0,fact:"Machine learning uses data and algorithms to find patterns and make predictions or decisions."},
{id:"ai-02",q:"What is a training dataset used for?",options:["Teaching a model patterns","Charging a robot","Cleaning a camera lens","Measuring screen size"],answer:0,fact:"A training dataset provides examples from which a machine-learning model adjusts its parameters."},
{id:"ai-03",q:"What does an AI chatbot generate in response to a prompt?",options:["A response based on learned patterns and context","A guaranteed legal decision","A physical object","A new internet connection"],answer:0,fact:"Chatbots generate likely responses; they can still make mistakes and should be checked."},
{id:"ai-04",q:"Why should AI-generated facts be verified?",options:["AI systems can produce plausible but incorrect information","All facts change every minute","Verification slows computers permanently","AI cannot use language"],answer:0,fact:"A fluent answer is not proof of accuracy. Check important claims against reliable sources."},
{id:"ai-05",q:"What is computer vision?",options:["Helping computers interpret images and video","Making computer glasses","Increasing monitor size","A type of keyboard"],answer:0,fact:"Computer vision includes tasks such as object detection, image classification and image segmentation."},
{id:"ai-06",q:"What is a neural network loosely inspired by?",options:["Connected neurons in biological brains","Road traffic lights","Water pipes","Solar panels"],answer:0,fact:"Artificial neural networks use connected computational units; they are mathematical systems, not replicas of brains."},
{id:"ai-07",q:"What is generative AI designed to do?",options:["Create new text, images, audio or other content","Only store old files","Repair broken screens","Replace electricity"],answer:0,fact:"Generative models create content based on patterns learned during training and the input they receive."},
{id:"ai-08",q:"What is a prompt in an AI tool?",options:["The instruction or input given to the system","A computer's power cable","A type of memory chip","A printer cartridge"],answer:0,fact:"Clear prompts provide context, goals and constraints that can improve the usefulness of a response."},
{id:"ai-09",q:"Which is an example of a narrow AI task?",options:["Recognising faces in images","Having every human ability","Knowing everything without data","Feeling emotions exactly like a person"],answer:0,fact:"Most deployed AI is specialised for particular tasks rather than possessing general human-level abilities."},
{id:"ai-10",q:"What is an important responsible-AI practice?",options:["Protecting personal data and checking for bias","Sharing private data publicly","Assuming every output is fair","Removing human oversight from every decision"],answer:0,fact:"Privacy, fairness, transparency and human oversight are important parts of responsible AI."}
]},
{ id:"cyber-detective",type:"cyber-detective",icon:"🕵️",title:"Cyber Detective",intro:"Investigate digital clues and make safer online decisions.",tone:"from-emerald-600 to-teal-500",questions:[
{id:"cy-01",q:"A message says your bank account will close unless you click a strange link immediately. What is the safest move?",options:["Open the link quickly","Contact the bank through its official app or number","Reply with your password","Forward it to everyone"],answer:1,fact:"Urgency and unexpected links are common phishing tactics. Verify through a trusted channel."},
{id:"cy-02",q:"Which password is generally strongest?",options:["password123","Your name and birthday","A long, unique passphrase","The same password used everywhere"],answer:2,fact:"Use long unique passwords and a password manager; never reuse an important password."},
{id:"cy-03",q:"What does multi-factor authentication add?",options:["A second verification step","A brighter screen","Extra phone storage","Faster charging"],answer:0,fact:"MFA makes account access harder for attackers who obtain only your password."},
{id:"cy-04",q:"A caller asks for the one-time code sent to your phone. What should you do?",options:["Share it to prove your identity","Never share it; end the call and verify independently","Post it online","Send a screenshot"],answer:1,fact:"One-time codes can authorise sign-ins or payments. Legitimate support should not ask you to disclose them."},
{id:"cy-05",q:"What is ransomware?",options:["Malware that locks or encrypts data and demands payment","A safe photo editor","A type of Wi-Fi","A computer cooling fan"],answer:0,fact:"Backups kept separately and timely security updates help reduce ransomware risk."},
{id:"cy-06",q:"You receive an unexpected attachment from an unknown sender. What is safest?",options:["Open it to see what it is","Do not open it; verify the sender and scan/report it","Disable security tools","Forward it to your contacts"],answer:1,fact:"Unexpected attachments can contain malicious files or links. Verify before opening."},
{id:"cy-07",q:"What is social engineering?",options:["Manipulating people into revealing information or taking unsafe actions","Designing a social media logo","Building a website","Repairing a network cable"],answer:0,fact:"Attackers may impersonate trusted people or create urgency to influence decisions."},
{id:"cy-08",q:"A website address is misspelled by one letter but looks like a familiar brand. What might it be?",options:["A look-alike or typosquatting domain","A guaranteed official site","A faster browser","A harmless file format"],answer:0,fact:"Check the full domain carefully and use bookmarks or official apps for important services."},
{id:"cy-09",q:"Why are software updates important?",options:["They can fix security weaknesses","They always delete your photos","They reveal your password","They turn off encryption"],answer:0,fact:"Updates often patch vulnerabilities that attackers could otherwise exploit."},
{id:"cy-10",q:"You think an account has been compromised. What should you do first?",options:["Ignore all alerts","Use the official service to secure the account and change its password","Post your login details","Delete your device backups"],answer:1,fact:"Secure the account from a trusted device, revoke unknown sessions, enable MFA and contact the provider."}
]},
{ id:"technology-history",type:"technology-history",icon:"🕰️",title:"Technology Through Time",intro:"Trace the inventions that transformed everyday life.",tone:"from-amber-500 to-orange-600",questions:[
{id:"th-01",q:"Which invention made it possible to reproduce books efficiently in large numbers in Europe?",options:["Movable-type printing press","Steam locomotive","Telephone","Television"],answer:0,fact:"Gutenberg's press helped make printed books more widely available in 15th-century Europe."},
{id:"th-02",q:"Who is widely credited with inventing the practical telephone?",options:["Alexander Graham Bell","Isaac Newton","Marie Curie","Charles Darwin"],answer:0,fact:"Bell received a US patent for the telephone in 1876; the history includes several contributors."},
{id:"th-03",q:"Which energy source powered many early industrial steam engines?",options:["Coal","Wind from fans","Batteries","Solar cells"],answer:0,fact:"Coal-fired steam engines powered factories, mines and railways during the Industrial Revolution."},
{id:"th-04",q:"What was ENIAC?",options:["An early general-purpose electronic digital computer","A space telescope","A radio station","A printing machine"],answer:0,fact:"ENIAC was completed in the 1940s and used thousands of vacuum tubes."},
{id:"th-05",q:"Which invention allowed sound to be recorded and played back mechanically?",options:["Phonograph","Compass","Microscope","Thermometer"],answer:0,fact:"Thomas Edison's phonograph, developed in 1877, was an important early sound-recording device."},
{id:"th-06",q:"What did the first artificial satellite, Sputnik 1, orbit?",options:["Earth","The Moon","Mars","The Sun between planets"],answer:0,fact:"The Soviet Union launched Sputnik 1 in 1957, beginning the space age."},
{id:"th-07",q:"Which material became central to modern computer chips?",options:["Silicon","Wood","Cotton","Glass wool"],answer:0,fact:"Silicon is a semiconductor whose electrical properties can be controlled to build transistors."},
{id:"th-08",q:"What did the World Wide Web make easier?",options:["Linking and accessing information through web pages","Generating electricity","Measuring earthquakes","Launching aircraft"],answer:0,fact:"Tim Berners-Lee proposed the Web in 1989; it uses technologies such as URLs, HTTP and HTML."},
{id:"th-09",q:"Which technology enabled many early long-distance wireless voice broadcasts?",options:["Radio","Barcode","Touchscreen","Laser printer"],answer:0,fact:"Radio communication developed through contributions from many inventors and scientists in the late 19th and early 20th centuries."},
{id:"th-10",q:"What was a major advantage of the transistor over vacuum tubes?",options:["Smaller size and lower power use","It needed no electricity ever","It worked only underwater","It stored paper documents"],answer:0,fact:"Transistors helped make electronic devices smaller, more reliable and more energy-efficient."}
]},

];



export default function DigitalDiscoveryHub({ userId, initialAreaId, onExit }: { userId:string|null; initialAreaId?:string; onExit?:()=>void }) {
 const [active,setActive]=useState<Area|null>(null);
 const [index,setIndex]=useState(0);
 const [choice,setChoice]=useState<number|null>(null);
 const [message,setMessage]=useState("");
 const [quota,setQuota]=useState<number|null>(null);
 const [quotaReady,setQuotaReady]=useState(false);
 const [accessError,setAccessError]=useState("");
 const [isAdmin,setIsAdmin]=useState(false);
 const [isSubscribed,setIsSubscribed]=useState(false);
 const [reserved,setReserved]=useState(false);
 const [bankExhausted,setBankExhausted]=useState(false);
 const [soundOn,setSoundOn]=useState(true);
 const session=useRef("ddh-"+Date.now()+"-"+Math.random().toString(36).slice(2));
 const skippedRepeated=useRef(0);
 const headingRef=useRef<HTMLDivElement|null>(null);
 const advanceTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const question=active?.questions[index]??null;

 const playTone=(kind:"correct"|"wrong"|"tap")=>{
  if(!soundOn||typeof window==="undefined")return;
  const path=kind==="correct"?"/correct.mp3":kind==="wrong"?"/Lose.mp3":"/Tap.mp3";
  try{const audio=new Audio(path);audio.volume=0.85;void audio.play().catch(()=>{});}catch{}
 };

 const loadQuota=async(area:Area)=>{
  setQuotaReady(false);setAccessError("");
  try{
   const r=await fetch("/api/game-access",{cache:"no-store"});
   const d=await r.json();
   if(!r.ok)throw new Error(d.error||"Could not verify your game quota.");
   setIsAdmin(Boolean(d.isAdmin));setIsSubscribed(Boolean(d.isSubscribed));
   setQuota(d.isAdmin||d.isSubscribed?d.remainingByType?.[area.type]??0:d.remainingBySection?.["digital-discovery-hub"]??0);
   setQuotaReady(true);
  }catch(e){setAccessError(e instanceof Error?e.message:"Game quota could not be verified.");setQuotaReady(true);}
 };

 useEffect(()=>{
  if(!active||!question||!userId)return;
  let live=true;
  setReserved(false);setChoice(null);setMessage("");
  fetch("/api/game-access",{method:"POST",cache:"no-store",headers:{"Content-Type":"application/json"},body:JSON.stringify({
   sectionId:"digital-discovery-hub",gameTypeId:active.type,challengeId:question.id,
   challengeQuestion:question.q,reserveQuestion:true,reservationSessionId:session.current
  })}).then(async r=>{
   const d=await r.json();if(!live)return;
   if(d.repeated){
    skippedRepeated.current+=1;
    if(skippedRepeated.current>=active.questions.length){setBankExhausted(true);setMessage("You have completed every currently available challenge in this world.");return;}
    setIndex(v=>(v+1)%active.questions.length);return;
   }
   if(!r.ok){setAccessError(d.error||"This challenge could not be loaded.");return;}
   setReserved(true);
  }).catch(()=>{if(live)setAccessError("We could not verify a fresh challenge. Please try again.");});
  return()=>{live=false;};
 },[active?.id,question?.id,userId]);

 useEffect(()=>{
  if(active&&userId)void loadQuota(active);
 },[active?.id,userId]);

 useEffect(()=>{
  if(!active||choice===null||!message)return;
  if(advanceTimer.current)clearTimeout(advanceTimer.current);
  advanceTimer.current=setTimeout(()=>{
   setIndex(v=>(v+1)%active.questions.length);
   setChoice(null);setMessage("");setReserved(false);
  },5000);
  return()=>{if(advanceTimer.current)clearTimeout(advanceTimer.current);};
 },[active?.id,choice,message]);

 useEffect(()=>{
  if(!active)return;
  const timer=setTimeout(()=>{
   const node=headingRef.current;if(!node)return;
   const top=node.getBoundingClientRect().top+window.scrollY-82;
   window.scrollTo({top:Math.max(0,top),behavior:"smooth"});
   requestAnimationFrame(()=>{const current=headingRef.current;if(current){const y=current.getBoundingClientRect().top;if(y<35||y>120)window.scrollTo({top:Math.max(0,current.getBoundingClientRect().top+window.scrollY-82),behavior:"smooth"});}});
  },120);
  return()=>clearTimeout(timer);
 },[active?.id]);

 const begin=(area:Area)=>{
  if(advanceTimer.current)clearTimeout(advanceTimer.current);
  skippedRepeated.current=0;setActive(area);setIndex(0);setChoice(null);setMessage("");
  setBankExhausted(false);setAccessError("");setReserved(false);void loadQuota(area);
 };
 useEffect(()=>{if(!initialAreaId)return;const area=areas.find(item=>item.id===initialAreaId);if(area)begin(area);},[initialAreaId]);
 const record=(skip:boolean,i:number|null)=>{
  if(!active||!question||!userId||!reserved||choice!==null)return;
  if(!skip)playTone(i===question.answer?"correct":"wrong");
  setChoice(skip?-1:i);
  const selected=i===null?"":question.options[i];
  const explanation=skip
   ?`Skipped. The correct answer is ${question.options[question.answer]}. ${question.fact}`
   :i===question.answer
    ?`Correct! You chose “${selected}”. ${question.fact}`
    :`Not quite. You chose “${selected}”. The correct answer is “${question.options[question.answer]}”. ${question.fact}`;
  setMessage("Recording your answer…");
  void fetch("/api/game-access",{method:"POST",cache:"no-store",headers:{"Content-Type":"application/json"},body:JSON.stringify({
   sectionId:"digital-discovery-hub",gameTypeId:active.type,challengeId:question.id,
   challengeQuestion:question.q,reservationSessionId:session.current
  })}).then(async r=>{
   const d=await r.json();
   if(!r.ok){
    setMessage(d.error||"Your attempt could not be recorded.");
    if(d.freeTrialsExhausted||d.sectionRemaining===0)setQuota(0);
    return;
   }
   setQuota(isAdmin||isSubscribed?d.remaining:d.sectionRemaining);
   setMessage(explanation);
  }).catch(()=>{setMessage("Your attempt could not be recorded. Please check your connection.");});
 };

 const backToHub=()=>{
  if(advanceTimer.current)clearTimeout(advanceTimer.current);
  if(initialAreaId&&onExit){onExit();return;}setActive(null);setChoice(null);setMessage("");setReserved(false);setBankExhausted(false);
 };
 if(!active&& !initialAreaId)return <div className="space-y-5">
  <div className="overflow-hidden rounded-3xl border border-cyan-200/30 bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-900 p-6 text-white shadow-xl sm:p-8">
   <p className="text-xs font-black uppercase tracking-[.24em] text-cyan-200">Explore · Investigate · Discover</p>
   <h3 className="mt-2 text-3xl font-black sm:text-4xl">Digital Discovery Games</h3>
   <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">Four interactive worlds filled with internet discoveries, artificial intelligence, cyber safety and landmark inventions.</p>
   <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">4 discovery games</span><span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">40 starter challenges</span><span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">Fresh-question rotation</span></div>
  </div>
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
   {areas.map((a,n)=><button key={a.id} onClick={()=>begin(a)} className={`group relative min-h-40 overflow-hidden rounded-2xl border border-white/50 bg-gradient-to-br ${a.tone} p-5 text-left text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:scale-[1.015] hover:shadow-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300`}>
    <span className="absolute -right-2 -top-4 text-7xl opacity-20 transition group-hover:scale-110">{a.icon}</span><span className="text-3xl">{a.icon}</span>
    <span className="mt-3 block text-lg font-black">{String(n+1).padStart(2,"0")} · {a.title}</span>
    <span className="mt-1 block text-xs leading-5 text-white/90">{a.intro}</span>
    <span className="mt-3 inline-flex rounded-full border border-white/40 bg-white/20 px-3 py-1.5 text-xs font-extrabold">Play now →</span>
   </button>)}
  </div>
 </div>;
 if(!active)return <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-6 text-center font-bold text-cyan-900">Opening your discovery game…</div>;

 const noQuota=quota===0&&!isAdmin&&!isSubscribed;
 const dailyDone=quota===0&&(isAdmin||isSubscribed);
 return <div className="space-y-4">
  <div ref={headingRef} className={`relative scroll-mt-20 overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br ${active.tone} p-5 text-white shadow-xl sm:p-7`}>
   <div className="absolute -right-8 -top-10 text-8xl opacity-20">{active.icon}</div>
   <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
    <button onClick={backToHub} className="rounded-full border border-white/50 bg-gradient-to-r from-white/25 to-white/10 px-5 py-2.5 text-sm font-black text-white shadow-lg backdrop-blur transition hover:scale-[1.03] hover:bg-white/25">← Back to Quiz World</button>
    <div className="flex flex-wrap items-center gap-2">
     <span className="rounded-full border border-white/30 bg-black/15 px-3 py-2 text-xs font-black">{!quotaReady?"Checking quota…":`${quota??0} / ${isAdmin||isSubscribed?10:3} ${isAdmin||isSubscribed?"plays left today":"free trials left"}`}</span>
     <button onClick={()=>setSoundOn(v=>!v)} className="rounded-full border border-white/40 bg-white/15 px-3 py-2 text-xs font-extrabold text-white">{soundOn?"🔊 Sound on":"🔇 Sound off"}</button>
    </div>
   </div>
   <p className="relative mt-5 text-xs font-black uppercase tracking-[.22em] text-white/80">Digital Discovery · Game {areas.findIndex(a=>a.id===active.id)+1} of 4</p>
   <h2 className="relative mt-2 text-2xl font-black sm:text-3xl">{active.icon} {active.title}</h2>
   <p className="relative mt-2 max-w-2xl text-sm leading-6 text-white/90">{active.intro}</p>
  </div>

  {!userId?<div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center"><h4 className="text-xl font-black text-amber-900">Sign in to start playing</h4><Link href="/login" className="mt-4 inline-flex rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3 font-black text-slate-950 shadow">Sign In / Create Account →</Link></div>
  :!quotaReady?<div className="rounded-2xl border border-slate-200 bg-slate-50 p-7 text-center text-sm font-semibold text-slate-600">Checking your available quota…</div>
  :accessError?<div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-sm font-semibold text-amber-900">{accessError}</div>
  :noQuota?<GameQuotaNotice title="Your three free questions are complete!" description="Subscribe to continue exploring all four Digital Discovery games." />
  :dailyDone?<div className="rounded-2xl border border-slate-200 bg-slate-50 p-7 text-center"><h4 className="text-xl font-black text-slate-900">Today's game quota is complete</h4><p className="mt-2 text-sm text-slate-600">Please return after the daily reset at 8:00 AM IST.</p></div>
  :bankExhausted?<div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-7 text-center"><h4 className="text-xl font-black text-emerald-900">This game's available questions are complete</h4><p className="mt-2 text-sm text-emerald-800">{message}</p></div>
  :!question?<div className="rounded-2xl bg-slate-50 p-6">Loading your next question…</div>
  :<div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xl sm:p-6">
   <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><span className="rounded-full bg-gradient-to-r from-cyan-100 to-blue-100 px-3 py-1.5 text-xs font-black text-blue-900">Question {index+1}</span><span className="text-xs font-bold text-slate-500">{reserved?"Ready to play":"Loading fresh question…"}</span></div>
   <h3 className="text-lg font-black leading-7 text-slate-900 sm:text-xl">{question.q}</h3>
   <div className="mt-5 grid gap-3 sm:grid-cols-2">
    {question.options.map((option,i)=><button data-answer-choice key={option} disabled={!reserved||choice!==null} onClick={()=>record(false,i)} className={`rounded-2xl border-2 px-4 py-3.5 text-left text-sm font-extrabold shadow-sm transition duration-200 hover:-translate-y-0.5 disabled:cursor-default disabled:opacity-90 ${choice===i?(i===question.answer?"border-emerald-500 bg-gradient-to-r from-emerald-100 to-green-50 text-emerald-950":"border-rose-500 bg-gradient-to-r from-rose-100 to-pink-50 text-rose-950"):["border-sky-200 bg-gradient-to-br from-sky-50 to-cyan-100 text-sky-950 hover:border-sky-400","border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-100 text-violet-950 hover:border-violet-400","border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-100 text-amber-950 hover:border-amber-400","border-emerald-200 bg-gradient-to-br from-emerald-50 to-lime-100 text-emerald-950 hover:border-emerald-400"][i]}`}>{String.fromCharCode(65+i)}. {option}</button>)}
   </div>
   <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
    <button disabled={!reserved||choice!==null} onClick={()=>record(true,null)} className="rounded-full border border-fuchsia-300 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 px-6 py-2.5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-50">⏭ Skip question</button>
    <span className="text-[11px] font-semibold text-slate-500">Every answer and skip uses one question from your quota.</span>
   </div>
   {message&&<div role="status" aria-live="polite" className={`mt-4 rounded-2xl border p-4 text-sm leading-6 shadow-sm ${choice===question.answer?"border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-950":choice===-1?"border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-950":"border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50 text-rose-950"}`}><p className="font-black">{choice===-1?"Question skipped":choice===question.answer?"Correct answer!":"Wrong answer"}</p><p className="mt-1">{message}</p><p className="mt-2 text-[11px] font-bold opacity-70">Next question in 5 seconds…</p></div>}
  </div>}
 <GameQuotaPopup open={(noQuota || (quotaReady && quota===0)) && !isAdmin} isSubscribed={isSubscribed} resetKey={active?.id??''} /></div>;
}
