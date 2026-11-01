"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type BrainQuestion = {
  id: string;
  category: string;
  scenario: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

// Real-world judgement problems. Distractors are deliberately plausible and close.
const questionBank: BrainQuestion[] = [
  {id:"life-001",category:"Money & decisions",scenario:"A shop displays a jacket at 20% off. At the counter, the cashier applies another 10% discount to the reduced price. The original price is ₹2,000.",question:"What is the final price?",options:["₹1,400","₹1,440","₹1,500","₹1,560"],answer:1,explanation:"First discount: ₹2,000 × 0.80 = ₹1,600. The second discount is 10% of ₹1,600, or ₹160. Final price: ₹1,440."},
  {id:"life-002",category:"Everyday logic",scenario:"You are driving to an appointment 30 km away. For the first 15 km, roadworks reduce your average speed to 30 km/h. The remaining 15 km are clear and you average 60 km/h.",question:"How long does the whole journey take, excluding stops?",options:["30 minutes","40 minutes","45 minutes","50 minutes"],answer:2,explanation:"The first half takes 30 minutes; the second half takes 15 minutes. Total: 45 minutes."},
  {id:"life-003",category:"Evidence & inference",scenario:"A meeting room is found locked. The access log records Maya entering at 2:05 pm and leaving at 2:40 pm. The room's wall clock stopped at 2:20 pm. A colleague says the clock was working normally at 2:30 pm.",question:"Which conclusion is justified by the evidence?",options:["Maya stopped the clock","The colleague's statement conflicts with the stopped clock","The access log must be incorrect","The room was entered by someone else"],answer:1,explanation:"A clock stopped at 2:20 could not be observed working normally at 2:30. The evidence identifies a contradiction, but does not prove who caused it."},
  {id:"life-004",category:"Planning under pressure",scenario:"You have 40 minutes before a train departs. The station is 15 minutes away. You must print a ticket (5 minutes), collect a parcel (12 minutes), and reach the platform 5 minutes before departure. The parcel counter and printer are in the same building.",question:"What is the latest you can leave home and still complete all tasks?",options:["3 minutes from now","5 minutes from now","8 minutes from now","10 minutes from now"],answer:0,explanation:"You need 15 minutes travel + 5 printing + 12 collection + 5 platform buffer = 37 minutes. With 40 minutes available, you can leave 3 minutes after the 40-minute countdown begins."},
  {id:"life-005",category:"Risk judgement",scenario:"A phone falls into a sink full of water while its charger is plugged into a nearby wall socket. The phone is still connected to the charging cable.",question:"What is the safest first action?",options:["Pull the phone out by its cable","Switch off power at the breaker if safe to reach","Use a dry towel to lift the phone","Unplug the cable while standing in the water"],answer:1,explanation:"Do not touch the phone, cable, water or socket. Isolate power at the breaker from a dry, safe position, then seek appropriate help."},
  {id:"life-006",category:"Fair comparison",scenario:"Two delivery services advertise their performance. Service A delivered 92 of 100 parcels on time last week. Service B delivered 460 of 500 parcels on time.",question:"Which service had the higher on-time delivery rate?",options:["Service A by 2 percentage points","Service B by 2 percentage points","Both were equal","Service A by 4 percentage points"],answer:2,explanation:"92/100 is 92%. 460/500 is also 92%. The larger number of parcels does not change the rate."},
  {id:"life-007",category:"Practical reasoning",scenario:"A water tank is filled by Pipe A in 6 hours and by Pipe B in 3 hours. Both pipes are opened together, and there is no leak.",question:"How long will the tank take to fill?",options:["1 hour 30 minutes","2 hours","2 hours 15 minutes","3 hours"],answer:1,explanation:"Pipe A fills 1/6 per hour and Pipe B fills 1/3. Together they fill 1/2 per hour, so the tank takes 2 hours."},
  {id:"life-008",category:"Reading the details",scenario:"A café offers a 'buy 2, get the 3rd at half price' deal. Each coffee costs ₹120. You buy three coffees, all at the same price.",question:"What is the effective average price per coffee?",options:["₹90","₹95","₹100","₹105"],answer:2,explanation:"You pay ₹120 + ₹120 + ₹60 = ₹300. Dividing by three gives ₹100 per coffee."},
  {id:"life-009",category:"Scheduling",scenario:"Four tasks must be completed. Filing takes 20 minutes and must happen before dispatch. Packing takes 30 minutes and must happen before dispatch. Calling the client takes 10 minutes and can happen at any time. Dispatch takes 5 minutes.",question:"What is the shortest possible completion time if you can work on only one task at a time?",options:["55 minutes","60 minutes","65 minutes","70 minutes"],answer:2,explanation:"All four tasks take 20 + 30 + 10 + 5 = 65 minutes. The dependencies do not add time because no task can overlap another."},
  {id:"life-010",category:"Spot the assumption",scenario:"A building manager says, 'The lift was working at 9 am, so it cannot be the reason the delivery was late at 11 am.' No inspection or later status record is available.",question:"What is the main flaw in the manager's reasoning?",options:["A lift cannot stop between 9 am and 11 am","The statement assumes the lift's condition never changed","Delivery delays are always caused by traffic","The lift must have been overloaded"],answer:1,explanation:"Evidence that the lift worked at 9 am does not establish its condition two hours later. The manager assumes an unchanged state without evidence."},
  {id:"life-011",category:"Percentages",scenario:"A household reduces its monthly electricity use from 250 units to 220 units. The following month, use rises by 30 units.",question:"Compared with the original 250 units, what is the final position?",options:["12% higher","The same","12% lower","8% lower"],answer:1,explanation:"220 + 30 = 250 units, exactly the original amount."},
  {id:"life-012",category:"Queue strategy",scenario:"You are in a queue with 8 people ahead of you. A second counter opens and serves the next person in the queue, then alternates with the first counter. Both counters serve one person every 2 minutes.",question:"Assuming the queue is shared fairly, how many minutes until the 9th person (you) is served?",options:["8 minutes","10 minutes","12 minutes","14 minutes"],answer:1,explanation:"Two people are served every 2 minutes. Eight people ahead require four such rounds, or 8 minutes; your turn is in the next round at 10 minutes."},
  {id:"life-013",category:"Evidence & inference",scenario:"A restaurant bill is ₹1,800. Three friends agree to split it equally. One friend has already paid a ₹300 deposit toward the bill, and the restaurant deducts that deposit from the total.",question:"How much should each friend contribute in total, counting the deposit as part of the payer's share?",options:["₹500 each; payer adds nothing","₹600 each; payer has already paid ₹300","₹500 each; payer adds ₹200","₹600 each; payer adds ₹300"],answer:3,explanation:"Each person’s total share is ₹600. The deposit-paying friend has already covered ₹300 and owes ₹300 more; the other two each pay ₹600."},
  {id:"life-014",category:"Probability",scenario:"A drawer contains 4 black socks and 4 navy socks. The room is dark, and you cannot distinguish their colours by touch. You take socks one at a time without putting any back.",question:"What is the minimum number you must take to guarantee a matching-colour pair?",options:["2","3","4","5"],answer:1,explanation:"There are only two colours. In the worst case, the first two are one black and one navy; the third must match one of them."},
  {id:"life-015",category:"Consumer judgement",scenario:"A 750 ml bottle costs ₹90. A 1 litre bottle of the same product costs ₹116. There are no other fees or quality differences.",question:"Which is the better value per litre?",options:["750 ml bottle by ₹4 per litre","1 litre bottle by ₹4 per litre","Both cost the same per litre","750 ml bottle by ₹8 per litre"],answer:1,explanation:"₹90 ÷ 0.75 = ₹120 per litre. The larger bottle costs ₹116 per litre, so it is cheaper by ₹4 per litre."},
  {id:"life-016",category:"Workplace judgement",scenario:"A colleague asks you to approve a report. The totals on its summary page match, but one supporting invoice is dated after the report's stated submission date.",question:"What is the most responsible next step?",options:["Approve it because the totals match","Reject the entire report immediately","Ask for clarification and verify the invoice date before approval","Change the invoice date to match the report"],answer:2,explanation:"A date inconsistency needs verification. It may be an error or a legitimate later adjustment; neither automatic approval nor an unsupported accusation is justified."},
  {id:"life-017",category:"Time and distance",scenario:"A bus leaves every 20 minutes. You arrive at the stop at 10:07. The previous bus left at 10:00, and the schedule is being followed exactly.",question:"When is the next bus due?",options:["10:15","10:20","10:25","10:30"],answer:2,explanation:"The timetable runs at 10:00, 10:20, 10:40 and so on. The next bus is due at 10:20."},
  {id:"life-018",category:"Detect the hidden cost",scenario:"A printer costs ₹4,000 and uses cartridges costing ₹900 each. Another printer costs ₹5,200 and uses cartridges costing ₹500 each. You expect to use exactly four cartridges, and ignore all other costs.",question:"Which option costs less overall?",options:["First printer by ₹200","Second printer by ₹200","First printer by ₹400","Second printer by ₹400"],answer:3,explanation:"First option: ₹4,000 + 4×₹900 = ₹7,600. Second: ₹5,200 + 4×₹500 = ₹7,200. The second is cheaper by ₹400."},
  {id:"life-019",category:"Logical deduction",scenario:"Three boxes are labelled 'Tea', 'Coffee' and 'Mixed'. Every label is wrong. You may take one item from one box without looking inside.",question:"From which labelled box should you take an item to identify all three boxes?",options:["The box labelled Tea","The box labelled Coffee","The box labelled Mixed","Any box; all choices work equally"],answer:2,explanation:"Because every label is wrong, the box marked Mixed cannot be mixed. One item reveals whether it contains only tea or only coffee; the remaining labels can then be corrected by elimination."},
  {id:"life-020",category:"Practical planning",scenario:"You need 18 litres of paint. Shop A sells 5-litre tins for ₹1,100. Shop B sells 3-litre tins for ₹690. You cannot buy partial tins, and both paints are identical.",question:"What is the lowest cost way to buy at least 18 litres?",options:["Four 5-litre tins for ₹4,400","Six 3-litre tins for ₹4,140","Three 5-litre tins and one 3-litre tin for ₹3,990","Five 3-litre tins and one 5-litre tin for ₹4,550"],answer:2,explanation:"Six 3-litre tins give exactly 18 litres for ₹4,140. Four 5-litre tins cost ₹4,400; the mixed option gives 18 litres for ₹3,990, which is actually lower."},
  {id:"life-021",category:"Check the conclusion",scenario:"A manager notices that sales rose in the week after a new sign was installed outside a store. No other data has been collected.",question:"What can the manager safely conclude?",options:["The sign caused the increase","The increase happened after the sign was installed, but cause is not established","The sign will increase sales every week","The store's prices must have fallen"],answer:1,explanation:"A sequence in time does not prove causation. Other factors may explain the increase; more evidence or a controlled comparison is needed."},
  {id:"life-022",category:"Resource allocation",scenario:"A team has 12 hours of staff time. Task A needs 5 hours, Task B needs 4 hours, and Task C needs 6 hours. A and B must both be completed; C is optional.",question:"How much time remains for Task C after A and B?",options:["2 hours","3 hours","4 hours","5 hours"],answer:1,explanation:"A and B use 5 + 4 = 9 hours. Of the 12 available, 3 hours remain."},
  {id:"life-023",category:"Everyday probability",scenario:"A weather app says there is a 30% chance of rain on Saturday and a 30% chance on Sunday. Treat the two days as independent for this question.",question:"What is the probability it rains on both days?",options:["9%","30%","49%","60%"],answer:0,explanation:"For independent events, multiply the probabilities: 0.30 × 0.30 = 0.09, or 9%."},
  {id:"life-024",category:"Negotiation & fairness",scenario:"A shared taxi fare is ₹840. Four passengers travel the entire route, but one passenger joins only for the final quarter of the distance. They agree to split the fare in proportion to distance travelled.",question:"How much should the late-joining passenger pay?",options:["₹120","₹140","₹168","₹210"],answer:0,explanation:"The three full-route passengers account for 3 distance-units and the late passenger for half a unit. The late passenger pays 0.5 ÷ 3.5 × ₹840 = ₹120."}
];

function shuffled<T>(items:T[]):T[] {
  const copy=[...items];
  for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}
  return copy;
}

export default function BrainBattleArena({userId}:{userId:string|null}) {
  const [question,setQuestion]=useState<BrainQuestion|null>(null);
  const [choice,setChoice]=useState<number|null>(null);
  const [feedback,setFeedback]=useState("");
  const [quota,setQuota]=useState<number|null>(null);
  const [admin,setAdmin]=useState(false);
  const [subscribed,setSubscribed]=useState(false);
  const [reserved,setReserved]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [finished,setFinished]=useState(false);
  const [round,setRound]=useState(0);
  const [bankExhausted,setBankExhausted]=useState(false);
  const [soundOn,setSoundOn]=useState(true);
  const session=useRef("brain-battle-"+Date.now()+"-"+Math.random().toString(36).slice(2));
  const heading=useRef<HTMLDivElement|null>(null);
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const preview=admin;
  const exhausted=quota===0&&!admin&&!subscribed;
  const playSound=(kind:"tap"|"correct"|"wrong")=>{if(!soundOn||typeof window==="undefined")return;const audio=new Audio(kind==="correct"?"/correct.mp3":kind==="wrong"?"/Lose.mp3":"/Tap.mp3");audio.volume=0.8;void audio.play().catch(()=>{});};

  useEffect(()=>{
    if(!userId)return;
    let live=true;
    fetch("/api/game-access",{cache:"no-store"}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error||"Could not check access.");if(!live)return;setAdmin(Boolean(d.isAdmin));setSubscribed(Boolean(d.isSubscribed));setQuota(d.isAdmin||d.isSubscribed?(d.remainingByType?.["master-deception-case"]??0):(d.remainingBySection?.["brain-battle-arena"]??0));}).catch(e=>{if(live)setError(e instanceof Error?e.message:"Could not verify access.");});
    return()=>{live=false;};
  },[userId]);

  useEffect(()=>{
    if(!userId||exhausted||finished)return;
    let live=true;
    setLoading(true);setError("");setFeedback("");setQuestion(null);setChoice(null);setReserved(false);setBankExhausted(false);
    const candidates=shuffled(questionBank);
    (async()=>{
      for(const candidate of candidates){
        if(!live)return;
        try{
          const r=await fetch("/api/game-access",{method:"POST",cache:"no-store",headers:{"Content-Type":"application/json"},body:JSON.stringify({sectionId:"brain-battle-arena",gameTypeId:"master-deception-case",challengeId:candidate.id,challengeQuestion:candidate.scenario+" "+candidate.question,reserveQuestion:true,reservationSessionId:session.current,previewMode:preview})});
          const d=await r.json();
          if(r.status===409&&d.skipQuestion)continue;
          if(!r.ok)throw new Error(d.error||"Could not prepare this challenge.");
          if(!live)return;
          setQuestion(candidate);setReserved(true);setLoading(false);return;
        }catch(e){if(!live)return;setError(e instanceof Error?e.message:"Could not prepare this challenge.");setLoading(false);return;}
      }
      if(live){setBankExhausted(true);setLoading(false);}
    })();
    return()=>{live=false;};
  },[userId,round,exhausted,finished,preview]);

  useEffect(()=>{if(question&&heading.current){const t=setTimeout(()=>window.scrollTo({top:Math.max(0,heading.current!.getBoundingClientRect().top+window.scrollY-80),behavior:"smooth"}),100);return()=>clearTimeout(t);}},[question]);

  const options=useMemo(()=>question?shuffled(question.options.map((label,index)=>({label,index}))):[],[question]);
  const submit=async(index:number)=>{
    if(!question||!userId||!reserved||finished||choice!==null)return;
    playSound(index===question.answer?"correct":"wrong");
    setChoice(index);setFinished(true);setFeedback("Checking your reasoning…");
    try{
      const r=await fetch("/api/game-access",{method:"POST",cache:"no-store",headers:{"Content-Type":"application/json"},body:JSON.stringify({sectionId:"brain-battle-arena",gameTypeId:"master-deception-case",challengeId:question.id,challengeQuestion:question.scenario+" "+question.question,reservationSessionId:session.current,previewMode:preview})});
      const d=await r.json();
      if(!r.ok)throw new Error(d.error||"Could not record this attempt.");
      setQuota(admin||subscribed?d.remaining:d.sectionRemaining);
      const correct=index===question.answer;
      setFeedback((correct?"CORRECT — excellent judgement. ":"NOT QUITE — review the reasoning. ")+question.explanation);
      timer.current=setTimeout(()=>{setFinished(false);setRound(v=>v+1);},6500);
    }catch(e){setFinished(false);setFeedback(e instanceof Error?e.message:"Could not record this attempt.");}
  };

  return <div className="relative isolate overflow-hidden rounded-[2rem] border border-amber-200/30 bg-[#10152b] p-4 text-white shadow-2xl sm:p-7"><div className="pointer-events-none absolute inset-0 opacity-50" style={{backgroundImage:"radial-gradient(circle at 12% 15%,rgba(251,191,36,.28),transparent 32%),radial-gradient(circle at 88% 75%,rgba(168,85,247,.28),transparent 32%),radial-gradient(circle at 50% 45%,rgba(34,211,238,.14),transparent 38%)"}} />
    <div className="relative overflow-hidden rounded-[1.7rem] border border-amber-100/25 bg-gradient-to-br from-[#493014] via-[#30214d] to-[#10152b] px-5 py-8 text-center sm:px-10 sm:py-12">
      <p className="text-[10px] font-black uppercase tracking-[.35em] text-amber-200">Real life · Sharp thinking · Smart decisions</p>
      <div className="my-3 text-5xl">🧠</div>
      <h2 className="text-3xl font-black tracking-wide text-amber-100 sm:text-5xl">BRAIN BATTLE ARENA</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-indigo-100">One challenging MCQ game built around everyday situations. Read the details, question assumptions, compare close answers and choose the most defensible decision.</p>
    </div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/5 p-3">
      <span className="text-xs font-black uppercase tracking-wider text-cyan-100">Real-life brain challenge · Question {round+1}</span>
      <div className="flex flex-wrap items-center gap-2"><button type="button" onClick={()=>{setSoundOn(v=>!v);if(!soundOn)playSound("tap");}} className="rounded-full border border-white/30 bg-black/20 px-3 py-2 text-xs font-black">{soundOn?"🔊 SOUND ON":"🔇 SOUND OFF"}</button><span className="rounded-full border border-white/30 bg-black/20 px-3 py-2 text-xs font-black">{admin?"ADMIN PREVIEW":subscribed?"SUBSCRIBER":String(quota??"…")+" trials left"}</span></div>
    </div>
    {error&&<div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-800">{error}</div>}
    {exhausted&&<div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">Your three free trials in Brain Battle Arena have been used. Subscribe to continue.</div>}
    {loading&&<div className="mt-4 rounded-2xl bg-white p-6 text-center font-bold text-slate-800">Finding a fresh challenge…</div>}
    {bankExhausted&&<div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-bold text-amber-950">You have completed every available challenge in this question bank. No question will be repeated.</div>}
    {question&&!exhausted&&<div className="mt-4 rounded-3xl bg-white p-4 text-slate-900 shadow-lg sm:p-6">
      <div className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-indigo-900">{question.category}</div>
      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
        <p className="text-xs font-black uppercase tracking-wider text-slate-500">Situation</p>
        <p className="mt-2 text-sm font-semibold leading-7 text-slate-800">{question.scenario}</p>
      </div>
      <h3 className="mt-5 text-lg font-black leading-7 text-slate-950 sm:text-xl">{question.question}</h3>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {options.map((option,position)=><button key={option.index} disabled={!reserved||finished} onClick={()=>void submit(option.index)} className={"min-h-14 rounded-xl border border-white/70 bg-gradient-to-r "+["from-indigo-600 to-blue-700","from-fuchsia-600 to-purple-700","from-teal-600 to-emerald-700","from-orange-500 to-rose-600"][position]+" px-4 py-3 text-left text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 "+(choice===option.index?(option.index===question.answer?"ring-4 ring-emerald-300":"ring-4 ring-rose-300"):"")}><span className="mr-2 font-black">{String.fromCharCode(65+position)}.</span>{option.label}</button>)}
      </div>
      <p className="mt-4 text-xs font-semibold text-slate-500">{!reserved?"Preparing your question…":finished?"Answer recorded. A fresh question will appear shortly.":"Choose the single best answer. Read every detail before deciding."}</p>
      {feedback&&<div aria-live="polite" className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm font-semibold leading-6 text-indigo-950">{feedback}</div>}
    </div>}
    <p className="mt-4 text-center text-[10px] leading-5 text-indigo-200/70">Questions rotate through the bank. Previously completed questions are skipped for the existing 365-day repeat-protection period. Your three free trials and all existing access rules remain unchanged.</p>
  </div>;
}
