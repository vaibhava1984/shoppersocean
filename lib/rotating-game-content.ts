import { DAILY_GK_QUESTIONS, getDailyGKQuestion, getDailyGKOptions } from "@/lib/daily-knowledge";
import { WORD_QUIZ_BANK } from "@/data/word-quiz-bank";
export { getDailyGKQuestion };
export type Puzzle = { id:string; question:string; answer:string; clue?:string; pattern?:string; options?:string[]; correctIndex?:number; explanation?:string; topic?:string };
const DAY_MS=86400000;
function seedFor(date:string,slot:number){return Math.floor(Date.parse(date+"T00:00:00Z")/DAY_MS)*37+Math.max(0,Math.floor(slot));}
function hash(n:number){let x=n|0;x=Math.imul(x^(x>>>16),0x45d9f3b);x=Math.imul(x^(x>>>16),0x45d9f3b);return (x^(x>>>16))>>>0;}
function rng(seed:number){let x=hash(seed)||1;return()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}
function shuffled<T>(values:T[],seed:number){const out=[...values],random=rng(seed);for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
const answers=[...new Set(DAILY_GK_QUESTIONS.map(x=>x.answer))];
const capitalAnswers=[...new Set(DAILY_GK_QUESTIONS.filter(x=>x.id.startsWith("capital-")).map(x=>x.answer))];
const longAnswers=capitalAnswers.filter(a=>!(/[^A-Za-z]/.test(a))&&a.length>=7);
function factorial(n:number){let value=1;for(let i=2;i<=n;i++)value*=i;return value;}
function multisetPermutations(chars:string[]){let total=factorial(chars.length);const counts:Record<string,number>={};for(const ch of chars)counts[ch]=(counts[ch]??0)+1;for(const count of Object.values(counts))total/=factorial(count);return Math.floor(total);}
function rankPermutation(sortedChars:string[],target:string){const pool=[...sortedChars].sort();let rank=0;for(let i=0;i<target.length;i++){const current=target[i];for(const ch of [...new Set(pool)].sort()){if(ch>=current)break;const at=pool.indexOf(ch);pool.splice(at,1);rank+=multisetPermutations(pool);pool.splice(at,0,ch);}const at=pool.indexOf(current);if(at<0)return 0;pool.splice(at,1);}return rank;}
function unrankPermutation(chars:string[],rank:number){const pool=[...chars].sort(),out:string[]=[];for(let i=0;i<chars.length;i++){for(const ch of [...new Set(pool)].sort()){const at=pool.indexOf(ch);pool.splice(at,1);const count=multisetPermutations(pool);if(rank<count){out.push(ch);break;}rank-=count;pool.splice(at,0,ch);}}return out.join("");}
export function getWordPuzzle(date:string,slot:number):Puzzle & {pattern:string}{
 const seed=seedFor(date,slot),cycleSeed=((seed%4000)+4000)%4000,answer=longAnswers[cycleSeed%longAnswers.length],letters=answer.toUpperCase().replace(/[^A-Z]/g,"").split("").sort(),original=answer.toUpperCase().replace(/[^A-Z]/g,"");
 const rank=rankPermutation(letters,original),permutations=multisetPermutations(letters),rawRank=Math.floor(cycleSeed/longAnswers.length);
 const safeRank=rawRank>=rank?rawRank+1:rawRank;
 const scrambled=unrankPermutation(letters,safeRank%permutations);
 return {id:"word:"+answer+":"+scrambled,question:"Rearrange these letters to make a capital city.",answer,pattern:scrambled};
}
export function getHiddenPuzzle(date:string,slot:number):Puzzle & {clue:string;options:string[];correctIndex:number;explanation:string;topic:string}{
 const seed=seedFor(date,slot),index=((Math.floor(seed)%WORD_QUIZ_BANK.length)+WORD_QUIZ_BANK.length)%WORD_QUIZ_BANK.length,item=WORD_QUIZ_BANK[index];
 const options=shuffled([...item.options],seed+419);
 return {id:item.id,question:item.question,clue:item.clue,answer:item.answer,options,correctIndex:options.indexOf(item.answer),explanation:item.explanation,topic:item.topic};
}

const MISSING_WORD_CHALLENGES:Array<{id:string;sentence:string;answer:string;clue:string;options:string[]}>= [
  {
    "id": "missing-001-01",
    "sentence": "the archivist's catalogue was ____ because every date, source, correction, and tiny annotation was recorded.",
    "answer": "meticulous",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "meticulous",
      "methodical",
      "thorough",
      "precise"
    ]
  },
  {
    "id": "missing-001-02",
    "sentence": "Because every date, source, correction, and tiny annotation was recorded, the archivist's catalogue seemed ____ to everyone involved.",
    "answer": "meticulous",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "meticulous",
      "methodical",
      "thorough",
      "precise"
    ]
  },
  {
    "id": "missing-001-03",
    "sentence": "The review described the archivist's catalogue as ____; every date, source, correction, and tiny annotation was recorded.",
    "answer": "meticulous",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "meticulous",
      "methodical",
      "thorough",
      "precise"
    ]
  },
  {
    "id": "missing-001-04",
    "sentence": "After considering the evidence, observers agreed that the archivist's catalogue remained ____, since every date, source, correction, and tiny annotation was recorded.",
    "answer": "meticulous",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "meticulous",
      "methodical",
      "thorough",
      "precise"
    ]
  },
  {
    "id": "missing-001-05",
    "sentence": "It became clear that the archivist's catalogue was ____ when every date, source, correction, and tiny annotation was recorded.",
    "answer": "meticulous",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "meticulous",
      "methodical",
      "thorough",
      "precise"
    ]
  },
  {
    "id": "missing-001-06",
    "sentence": "Throughout the discussion, the archivist's catalogue appeared ____: every date, source, correction, and tiny annotation was recorded.",
    "answer": "meticulous",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "meticulous",
      "methodical",
      "thorough",
      "precise"
    ]
  },
  {
    "id": "missing-002-01",
    "sentence": "the new recruit was ____ because she accepted the assignment only after several reminders.",
    "answer": "reluctant",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "reluctant",
      "hesitant",
      "unwilling",
      "resistant"
    ]
  },
  {
    "id": "missing-002-02",
    "sentence": "Because she accepted the assignment only after several reminders, the new recruit seemed ____ to everyone involved.",
    "answer": "reluctant",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "reluctant",
      "hesitant",
      "unwilling",
      "resistant"
    ]
  },
  {
    "id": "missing-002-03",
    "sentence": "The review described the new recruit as ____; she accepted the assignment only after several reminders.",
    "answer": "reluctant",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "reluctant",
      "hesitant",
      "unwilling",
      "resistant"
    ]
  },
  {
    "id": "missing-002-04",
    "sentence": "After considering the evidence, observers agreed that the new recruit remained ____, since she accepted the assignment only after several reminders.",
    "answer": "reluctant",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "reluctant",
      "hesitant",
      "unwilling",
      "resistant"
    ]
  },
  {
    "id": "missing-002-05",
    "sentence": "It became clear that the new recruit was ____ when she accepted the assignment only after several reminders.",
    "answer": "reluctant",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "reluctant",
      "hesitant",
      "unwilling",
      "resistant"
    ]
  },
  {
    "id": "missing-002-06",
    "sentence": "Throughout the discussion, the new recruit appeared ____: she accepted the assignment only after several reminders.",
    "answer": "reluctant",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "reluctant",
      "hesitant",
      "unwilling",
      "resistant"
    ]
  },
  {
    "id": "missing-003-01",
    "sentence": "the analyst was ____ because he demanded independent evidence before accepting the claim.",
    "answer": "skeptical",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "skeptical",
      "doubtful",
      "suspicious",
      "unconvinced"
    ]
  },
  {
    "id": "missing-003-02",
    "sentence": "Because he demanded independent evidence before accepting the claim, the analyst seemed ____ to everyone involved.",
    "answer": "skeptical",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "skeptical",
      "doubtful",
      "suspicious",
      "unconvinced"
    ]
  },
  {
    "id": "missing-003-03",
    "sentence": "The review described the analyst as ____; he demanded independent evidence before accepting the claim.",
    "answer": "skeptical",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "skeptical",
      "doubtful",
      "suspicious",
      "unconvinced"
    ]
  },
  {
    "id": "missing-003-04",
    "sentence": "After considering the evidence, observers agreed that the analyst remained ____, since he demanded independent evidence before accepting the claim.",
    "answer": "skeptical",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "skeptical",
      "doubtful",
      "suspicious",
      "unconvinced"
    ]
  },
  {
    "id": "missing-003-05",
    "sentence": "It became clear that the analyst was ____ when he demanded independent evidence before accepting the claim.",
    "answer": "skeptical",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "skeptical",
      "doubtful",
      "suspicious",
      "unconvinced"
    ]
  },
  {
    "id": "missing-003-06",
    "sentence": "Throughout the discussion, the analyst appeared ____: he demanded independent evidence before accepting the claim.",
    "answer": "skeptical",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "skeptical",
      "doubtful",
      "suspicious",
      "unconvinced"
    ]
  },
  {
    "id": "missing-004-01",
    "sentence": "the coastal village was ____ because it recovered quickly after repeated storms damaged the harbour.",
    "answer": "resilient",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "resilient",
      "durable",
      "flexible",
      "hardy"
    ]
  },
  {
    "id": "missing-004-02",
    "sentence": "Because it recovered quickly after repeated storms damaged the harbour, the coastal village seemed ____ to everyone involved.",
    "answer": "resilient",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "resilient",
      "durable",
      "flexible",
      "hardy"
    ]
  },
  {
    "id": "missing-004-03",
    "sentence": "The review described the coastal village as ____; it recovered quickly after repeated storms damaged the harbour.",
    "answer": "resilient",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "resilient",
      "durable",
      "flexible",
      "hardy"
    ]
  },
  {
    "id": "missing-004-04",
    "sentence": "After considering the evidence, observers agreed that the coastal village remained ____, since it recovered quickly after repeated storms damaged the harbour.",
    "answer": "resilient",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "resilient",
      "durable",
      "flexible",
      "hardy"
    ]
  },
  {
    "id": "missing-004-05",
    "sentence": "It became clear that the coastal village was ____ when it recovered quickly after repeated storms damaged the harbour.",
    "answer": "resilient",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "resilient",
      "durable",
      "flexible",
      "hardy"
    ]
  },
  {
    "id": "missing-004-06",
    "sentence": "Throughout the discussion, the coastal village appeared ____: it recovered quickly after repeated storms damaged the harbour.",
    "answer": "resilient",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "resilient",
      "durable",
      "flexible",
      "hardy"
    ]
  },
  {
    "id": "missing-005-01",
    "sentence": "the explanation was ____ because it fitted the evidence without relying on unlikely assumptions.",
    "answer": "plausible",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "plausible",
      "credible",
      "probable",
      "convincing"
    ]
  },
  {
    "id": "missing-005-02",
    "sentence": "Because it fitted the evidence without relying on unlikely assumptions, the explanation seemed ____ to everyone involved.",
    "answer": "plausible",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "plausible",
      "credible",
      "probable",
      "convincing"
    ]
  },
  {
    "id": "missing-005-03",
    "sentence": "The review described the explanation as ____; it fitted the evidence without relying on unlikely assumptions.",
    "answer": "plausible",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "plausible",
      "credible",
      "probable",
      "convincing"
    ]
  },
  {
    "id": "missing-005-04",
    "sentence": "After considering the evidence, observers agreed that the explanation remained ____, since it fitted the evidence without relying on unlikely assumptions.",
    "answer": "plausible",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "plausible",
      "credible",
      "probable",
      "convincing"
    ]
  },
  {
    "id": "missing-005-05",
    "sentence": "It became clear that the explanation was ____ when it fitted the evidence without relying on unlikely assumptions.",
    "answer": "plausible",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "plausible",
      "credible",
      "probable",
      "convincing"
    ]
  },
  {
    "id": "missing-005-06",
    "sentence": "Throughout the discussion, the explanation appeared ____: it fitted the evidence without relying on unlikely assumptions.",
    "answer": "plausible",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "plausible",
      "credible",
      "probable",
      "convincing"
    ]
  },
  {
    "id": "missing-006-01",
    "sentence": "the executive summary was ____ because it conveyed the findings in a few carefully chosen sentences.",
    "answer": "concise",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "concise",
      "succinct",
      "brief",
      "compact"
    ]
  },
  {
    "id": "missing-006-02",
    "sentence": "Because it conveyed the findings in a few carefully chosen sentences, the executive summary seemed ____ to everyone involved.",
    "answer": "concise",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "concise",
      "succinct",
      "brief",
      "compact"
    ]
  },
  {
    "id": "missing-006-03",
    "sentence": "The review described the executive summary as ____; it conveyed the findings in a few carefully chosen sentences.",
    "answer": "concise",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "concise",
      "succinct",
      "brief",
      "compact"
    ]
  },
  {
    "id": "missing-006-04",
    "sentence": "After considering the evidence, observers agreed that the executive summary remained ____, since it conveyed the findings in a few carefully chosen sentences.",
    "answer": "concise",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "concise",
      "succinct",
      "brief",
      "compact"
    ]
  },
  {
    "id": "missing-006-05",
    "sentence": "It became clear that the executive summary was ____ when it conveyed the findings in a few carefully chosen sentences.",
    "answer": "concise",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "concise",
      "succinct",
      "brief",
      "compact"
    ]
  },
  {
    "id": "missing-006-06",
    "sentence": "Throughout the discussion, the executive summary appeared ____: it conveyed the findings in a few carefully chosen sentences.",
    "answer": "concise",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "concise",
      "succinct",
      "brief",
      "compact"
    ]
  },
  {
    "id": "missing-007-01",
    "sentence": "the referee's decision was ____ because the official had no personal connection to either team.",
    "answer": "impartial",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "impartial",
      "neutral",
      "unbiased",
      "objective"
    ]
  },
  {
    "id": "missing-007-02",
    "sentence": "Because the official had no personal connection to either team, the referee's decision seemed ____ to everyone involved.",
    "answer": "impartial",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "impartial",
      "neutral",
      "unbiased",
      "objective"
    ]
  },
  {
    "id": "missing-007-03",
    "sentence": "The review described the referee's decision as ____; the official had no personal connection to either team.",
    "answer": "impartial",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "impartial",
      "neutral",
      "unbiased",
      "objective"
    ]
  },
  {
    "id": "missing-007-04",
    "sentence": "After considering the evidence, observers agreed that the referee's decision remained ____, since the official had no personal connection to either team.",
    "answer": "impartial",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "impartial",
      "neutral",
      "unbiased",
      "objective"
    ]
  },
  {
    "id": "missing-007-05",
    "sentence": "It became clear that the referee's decision was ____ when the official had no personal connection to either team.",
    "answer": "impartial",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "impartial",
      "neutral",
      "unbiased",
      "objective"
    ]
  },
  {
    "id": "missing-007-06",
    "sentence": "Throughout the discussion, the referee's decision appeared ____: the official had no personal connection to either team.",
    "answer": "impartial",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "impartial",
      "neutral",
      "unbiased",
      "objective"
    ]
  },
  {
    "id": "missing-008-01",
    "sentence": "the contract clause was ____ because its wording could reasonably support two different interpretations.",
    "answer": "ambiguous",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "ambiguous",
      "vague",
      "unclear",
      "equivocal"
    ]
  },
  {
    "id": "missing-008-02",
    "sentence": "Because its wording could reasonably support two different interpretations, the contract clause seemed ____ to everyone involved.",
    "answer": "ambiguous",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "ambiguous",
      "vague",
      "unclear",
      "equivocal"
    ]
  },
  {
    "id": "missing-008-03",
    "sentence": "The review described the contract clause as ____; its wording could reasonably support two different interpretations.",
    "answer": "ambiguous",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "ambiguous",
      "vague",
      "unclear",
      "equivocal"
    ]
  },
  {
    "id": "missing-008-04",
    "sentence": "After considering the evidence, observers agreed that the contract clause remained ____, since its wording could reasonably support two different interpretations.",
    "answer": "ambiguous",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "ambiguous",
      "vague",
      "unclear",
      "equivocal"
    ]
  },
  {
    "id": "missing-008-05",
    "sentence": "It became clear that the contract clause was ____ when its wording could reasonably support two different interpretations.",
    "answer": "ambiguous",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "ambiguous",
      "vague",
      "unclear",
      "equivocal"
    ]
  },
  {
    "id": "missing-008-06",
    "sentence": "Throughout the discussion, the contract clause appeared ____: its wording could reasonably support two different interpretations.",
    "answer": "ambiguous",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "ambiguous",
      "vague",
      "unclear",
      "equivocal"
    ]
  },
  {
    "id": "missing-009-01",
    "sentence": "the office software was ____ because the manufacturer had stopped supporting it many years earlier.",
    "answer": "obsolete",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "obsolete",
      "outdated",
      "antiquated",
      "archaic"
    ]
  },
  {
    "id": "missing-009-02",
    "sentence": "Because the manufacturer had stopped supporting it many years earlier, the office software seemed ____ to everyone involved.",
    "answer": "obsolete",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "obsolete",
      "outdated",
      "antiquated",
      "archaic"
    ]
  },
  {
    "id": "missing-009-03",
    "sentence": "The review described the office software as ____; the manufacturer had stopped supporting it many years earlier.",
    "answer": "obsolete",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "obsolete",
      "outdated",
      "antiquated",
      "archaic"
    ]
  },
  {
    "id": "missing-009-04",
    "sentence": "After considering the evidence, observers agreed that the office software remained ____, since the manufacturer had stopped supporting it many years earlier.",
    "answer": "obsolete",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "obsolete",
      "outdated",
      "antiquated",
      "archaic"
    ]
  },
  {
    "id": "missing-009-05",
    "sentence": "It became clear that the office software was ____ when the manufacturer had stopped supporting it many years earlier.",
    "answer": "obsolete",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "obsolete",
      "outdated",
      "antiquated",
      "archaic"
    ]
  },
  {
    "id": "missing-009-06",
    "sentence": "Throughout the discussion, the office software appeared ____: the manufacturer had stopped supporting it many years earlier.",
    "answer": "obsolete",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "obsolete",
      "outdated",
      "antiquated",
      "archaic"
    ]
  },
  {
    "id": "missing-010-01",
    "sentence": "the porcelain vase was ____ because even a slight impact could crack it.",
    "answer": "fragile",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "fragile",
      "delicate",
      "brittle",
      "breakable"
    ]
  },
  {
    "id": "missing-010-02",
    "sentence": "Because even a slight impact could crack it, the porcelain vase seemed ____ to everyone involved.",
    "answer": "fragile",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "fragile",
      "delicate",
      "brittle",
      "breakable"
    ]
  },
  {
    "id": "missing-010-03",
    "sentence": "The review described the porcelain vase as ____; even a slight impact could crack it.",
    "answer": "fragile",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "fragile",
      "delicate",
      "brittle",
      "breakable"
    ]
  },
  {
    "id": "missing-010-04",
    "sentence": "After considering the evidence, observers agreed that the porcelain vase remained ____, since even a slight impact could crack it.",
    "answer": "fragile",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "fragile",
      "delicate",
      "brittle",
      "breakable"
    ]
  },
  {
    "id": "missing-010-05",
    "sentence": "It became clear that the porcelain vase was ____ when even a slight impact could crack it.",
    "answer": "fragile",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "fragile",
      "delicate",
      "brittle",
      "breakable"
    ]
  },
  {
    "id": "missing-010-06",
    "sentence": "Throughout the discussion, the porcelain vase appeared ____: even a slight impact could crack it.",
    "answer": "fragile",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "fragile",
      "delicate",
      "brittle",
      "breakable"
    ]
  },
  {
    "id": "missing-011-01",
    "sentence": "the region's water supply was ____ because the reservoir held too little to meet the population's needs.",
    "answer": "scarce",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "scarce",
      "rare",
      "limited",
      "insufficient"
    ]
  },
  {
    "id": "missing-011-02",
    "sentence": "Because the reservoir held too little to meet the population's needs, the region's water supply seemed ____ to everyone involved.",
    "answer": "scarce",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "scarce",
      "rare",
      "limited",
      "insufficient"
    ]
  },
  {
    "id": "missing-011-03",
    "sentence": "The review described the region's water supply as ____; the reservoir held too little to meet the population's needs.",
    "answer": "scarce",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "scarce",
      "rare",
      "limited",
      "insufficient"
    ]
  },
  {
    "id": "missing-011-04",
    "sentence": "After considering the evidence, observers agreed that the region's water supply remained ____, since the reservoir held too little to meet the population's needs.",
    "answer": "scarce",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "scarce",
      "rare",
      "limited",
      "insufficient"
    ]
  },
  {
    "id": "missing-011-05",
    "sentence": "It became clear that the region's water supply was ____ when the reservoir held too little to meet the population's needs.",
    "answer": "scarce",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "scarce",
      "rare",
      "limited",
      "insufficient"
    ]
  },
  {
    "id": "missing-011-06",
    "sentence": "Throughout the discussion, the region's water supply appeared ____: the reservoir held too little to meet the population's needs.",
    "answer": "scarce",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "scarce",
      "rare",
      "limited",
      "insufficient"
    ]
  },
  {
    "id": "missing-012-01",
    "sentence": "the harvest was ____ because the fields produced far more grain than the village could store.",
    "answer": "abundant",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "abundant",
      "plentiful",
      "ample",
      "copious"
    ]
  },
  {
    "id": "missing-012-02",
    "sentence": "Because the fields produced far more grain than the village could store, the harvest seemed ____ to everyone involved.",
    "answer": "abundant",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "abundant",
      "plentiful",
      "ample",
      "copious"
    ]
  },
  {
    "id": "missing-012-03",
    "sentence": "The review described the harvest as ____; the fields produced far more grain than the village could store.",
    "answer": "abundant",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "abundant",
      "plentiful",
      "ample",
      "copious"
    ]
  },
  {
    "id": "missing-012-04",
    "sentence": "After considering the evidence, observers agreed that the harvest remained ____, since the fields produced far more grain than the village could store.",
    "answer": "abundant",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "abundant",
      "plentiful",
      "ample",
      "copious"
    ]
  },
  {
    "id": "missing-012-05",
    "sentence": "It became clear that the harvest was ____ when the fields produced far more grain than the village could store.",
    "answer": "abundant",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "abundant",
      "plentiful",
      "ample",
      "copious"
    ]
  },
  {
    "id": "missing-012-06",
    "sentence": "Throughout the discussion, the harvest appeared ____: the fields produced far more grain than the village could store.",
    "answer": "abundant",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "abundant",
      "plentiful",
      "ample",
      "copious"
    ]
  },
  {
    "id": "missing-013-01",
    "sentence": "the argument was ____ because each point followed logically from the one before it.",
    "answer": "coherent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "coherent",
      "logical",
      "consistent",
      "orderly"
    ]
  },
  {
    "id": "missing-013-02",
    "sentence": "Because each point followed logically from the one before it, the argument seemed ____ to everyone involved.",
    "answer": "coherent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "coherent",
      "logical",
      "consistent",
      "orderly"
    ]
  },
  {
    "id": "missing-013-03",
    "sentence": "The review described the argument as ____; each point followed logically from the one before it.",
    "answer": "coherent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "coherent",
      "logical",
      "consistent",
      "orderly"
    ]
  },
  {
    "id": "missing-013-04",
    "sentence": "After considering the evidence, observers agreed that the argument remained ____, since each point followed logically from the one before it.",
    "answer": "coherent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "coherent",
      "logical",
      "consistent",
      "orderly"
    ]
  },
  {
    "id": "missing-013-05",
    "sentence": "It became clear that the argument was ____ when each point followed logically from the one before it.",
    "answer": "coherent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "coherent",
      "logical",
      "consistent",
      "orderly"
    ]
  },
  {
    "id": "missing-013-06",
    "sentence": "Throughout the discussion, the argument appeared ____: each point followed logically from the one before it.",
    "answer": "coherent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "coherent",
      "logical",
      "consistent",
      "orderly"
    ]
  },
  {
    "id": "missing-014-01",
    "sentence": "the apprentice was ____ because she practised daily and checked every task with care.",
    "answer": "diligent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "diligent",
      "industrious",
      "conscientious",
      "hardworking"
    ]
  },
  {
    "id": "missing-014-02",
    "sentence": "Because she practised daily and checked every task with care, the apprentice seemed ____ to everyone involved.",
    "answer": "diligent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "diligent",
      "industrious",
      "conscientious",
      "hardworking"
    ]
  },
  {
    "id": "missing-014-03",
    "sentence": "The review described the apprentice as ____; she practised daily and checked every task with care.",
    "answer": "diligent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "diligent",
      "industrious",
      "conscientious",
      "hardworking"
    ]
  },
  {
    "id": "missing-014-04",
    "sentence": "After considering the evidence, observers agreed that the apprentice remained ____, since she practised daily and checked every task with care.",
    "answer": "diligent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "diligent",
      "industrious",
      "conscientious",
      "hardworking"
    ]
  },
  {
    "id": "missing-014-05",
    "sentence": "It became clear that the apprentice was ____ when she practised daily and checked every task with care.",
    "answer": "diligent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "diligent",
      "industrious",
      "conscientious",
      "hardworking"
    ]
  },
  {
    "id": "missing-014-06",
    "sentence": "Throughout the discussion, the apprentice appeared ____: she practised daily and checked every task with care.",
    "answer": "diligent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "diligent",
      "industrious",
      "conscientious",
      "hardworking"
    ]
  },
  {
    "id": "missing-015-01",
    "sentence": "the mountain pass was ____ because its steep cliffs and violent weather discouraged even experienced climbers.",
    "answer": "formidable",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "formidable",
      "daunting",
      "intimidating",
      "imposing"
    ]
  },
  {
    "id": "missing-015-02",
    "sentence": "Because its steep cliffs and violent weather discouraged even experienced climbers, the mountain pass seemed ____ to everyone involved.",
    "answer": "formidable",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "formidable",
      "daunting",
      "intimidating",
      "imposing"
    ]
  },
  {
    "id": "missing-015-03",
    "sentence": "The review described the mountain pass as ____; its steep cliffs and violent weather discouraged even experienced climbers.",
    "answer": "formidable",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "formidable",
      "daunting",
      "intimidating",
      "imposing"
    ]
  },
  {
    "id": "missing-015-04",
    "sentence": "After considering the evidence, observers agreed that the mountain pass remained ____, since its steep cliffs and violent weather discouraged even experienced climbers.",
    "answer": "formidable",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "formidable",
      "daunting",
      "intimidating",
      "imposing"
    ]
  },
  {
    "id": "missing-015-05",
    "sentence": "It became clear that the mountain pass was ____ when its steep cliffs and violent weather discouraged even experienced climbers.",
    "answer": "formidable",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "formidable",
      "daunting",
      "intimidating",
      "imposing"
    ]
  },
  {
    "id": "missing-015-06",
    "sentence": "Throughout the discussion, the mountain pass appeared ____: its steep cliffs and violent weather discouraged even experienced climbers.",
    "answer": "formidable",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "formidable",
      "daunting",
      "intimidating",
      "imposing"
    ]
  },
  {
    "id": "missing-016-01",
    "sentence": "the investment decision was ____ because it protected the family's savings instead of chasing risky returns.",
    "answer": "prudent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "prudent",
      "cautious",
      "judicious",
      "sensible"
    ]
  },
  {
    "id": "missing-016-02",
    "sentence": "Because it protected the family's savings instead of chasing risky returns, the investment decision seemed ____ to everyone involved.",
    "answer": "prudent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "prudent",
      "cautious",
      "judicious",
      "sensible"
    ]
  },
  {
    "id": "missing-016-03",
    "sentence": "The review described the investment decision as ____; it protected the family's savings instead of chasing risky returns.",
    "answer": "prudent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "prudent",
      "cautious",
      "judicious",
      "sensible"
    ]
  },
  {
    "id": "missing-016-04",
    "sentence": "After considering the evidence, observers agreed that the investment decision remained ____, since it protected the family's savings instead of chasing risky returns.",
    "answer": "prudent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "prudent",
      "cautious",
      "judicious",
      "sensible"
    ]
  },
  {
    "id": "missing-016-05",
    "sentence": "It became clear that the investment decision was ____ when it protected the family's savings instead of chasing risky returns.",
    "answer": "prudent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "prudent",
      "cautious",
      "judicious",
      "sensible"
    ]
  },
  {
    "id": "missing-016-06",
    "sentence": "Throughout the discussion, the investment decision appeared ____: it protected the family's savings instead of chasing risky returns.",
    "answer": "prudent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "prudent",
      "cautious",
      "judicious",
      "sensible"
    ]
  },
  {
    "id": "missing-017-01",
    "sentence": "the correction was ____ because it concerned a formatting detail rather than the report's conclusions.",
    "answer": "trivial",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "trivial",
      "minor",
      "insignificant",
      "petty"
    ]
  },
  {
    "id": "missing-017-02",
    "sentence": "Because it concerned a formatting detail rather than the report's conclusions, the correction seemed ____ to everyone involved.",
    "answer": "trivial",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "trivial",
      "minor",
      "insignificant",
      "petty"
    ]
  },
  {
    "id": "missing-017-03",
    "sentence": "The review described the correction as ____; it concerned a formatting detail rather than the report's conclusions.",
    "answer": "trivial",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "trivial",
      "minor",
      "insignificant",
      "petty"
    ]
  },
  {
    "id": "missing-017-04",
    "sentence": "After considering the evidence, observers agreed that the correction remained ____, since it concerned a formatting detail rather than the report's conclusions.",
    "answer": "trivial",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "trivial",
      "minor",
      "insignificant",
      "petty"
    ]
  },
  {
    "id": "missing-017-05",
    "sentence": "It became clear that the correction was ____ when it concerned a formatting detail rather than the report's conclusions.",
    "answer": "trivial",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "trivial",
      "minor",
      "insignificant",
      "petty"
    ]
  },
  {
    "id": "missing-017-06",
    "sentence": "Throughout the discussion, the correction appeared ____: it concerned a formatting detail rather than the report's conclusions.",
    "answer": "trivial",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "trivial",
      "minor",
      "insignificant",
      "petty"
    ]
  },
  {
    "id": "missing-018-01",
    "sentence": "the discovery was ____ because it changed how scientists understood the origin of the disease.",
    "answer": "profound",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "profound",
      "deep",
      "meaningful",
      "insightful"
    ]
  },
  {
    "id": "missing-018-02",
    "sentence": "Because it changed how scientists understood the origin of the disease, the discovery seemed ____ to everyone involved.",
    "answer": "profound",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "profound",
      "deep",
      "meaningful",
      "insightful"
    ]
  },
  {
    "id": "missing-018-03",
    "sentence": "The review described the discovery as ____; it changed how scientists understood the origin of the disease.",
    "answer": "profound",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "profound",
      "deep",
      "meaningful",
      "insightful"
    ]
  },
  {
    "id": "missing-018-04",
    "sentence": "After considering the evidence, observers agreed that the discovery remained ____, since it changed how scientists understood the origin of the disease.",
    "answer": "profound",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "profound",
      "deep",
      "meaningful",
      "insightful"
    ]
  },
  {
    "id": "missing-018-05",
    "sentence": "It became clear that the discovery was ____ when it changed how scientists understood the origin of the disease.",
    "answer": "profound",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "profound",
      "deep",
      "meaningful",
      "insightful"
    ]
  },
  {
    "id": "missing-018-06",
    "sentence": "Throughout the discussion, the discovery appeared ____: it changed how scientists understood the origin of the disease.",
    "answer": "profound",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "profound",
      "deep",
      "meaningful",
      "insightful"
    ]
  },
  {
    "id": "missing-019-01",
    "sentence": "the proposal was ____ because the available staff, budget, and timetable made it achievable.",
    "answer": "feasible",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "feasible",
      "practical",
      "workable",
      "possible"
    ]
  },
  {
    "id": "missing-019-02",
    "sentence": "Because the available staff, budget, and timetable made it achievable, the proposal seemed ____ to everyone involved.",
    "answer": "feasible",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "feasible",
      "practical",
      "workable",
      "possible"
    ]
  },
  {
    "id": "missing-019-03",
    "sentence": "The review described the proposal as ____; the available staff, budget, and timetable made it achievable.",
    "answer": "feasible",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "feasible",
      "practical",
      "workable",
      "possible"
    ]
  },
  {
    "id": "missing-019-04",
    "sentence": "After considering the evidence, observers agreed that the proposal remained ____, since the available staff, budget, and timetable made it achievable.",
    "answer": "feasible",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "feasible",
      "practical",
      "workable",
      "possible"
    ]
  },
  {
    "id": "missing-019-05",
    "sentence": "It became clear that the proposal was ____ when the available staff, budget, and timetable made it achievable.",
    "answer": "feasible",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "feasible",
      "practical",
      "workable",
      "possible"
    ]
  },
  {
    "id": "missing-019-06",
    "sentence": "Throughout the discussion, the proposal appeared ____: the available staff, budget, and timetable made it achievable.",
    "answer": "feasible",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "feasible",
      "practical",
      "workable",
      "possible"
    ]
  },
  {
    "id": "missing-020-01",
    "sentence": "the politician was ____ because a series of public scandals had made his name widely disliked.",
    "answer": "notorious",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "notorious",
      "infamous",
      "disreputable",
      "dishonoured"
    ]
  },
  {
    "id": "missing-020-02",
    "sentence": "Because a series of public scandals had made his name widely disliked, the politician seemed ____ to everyone involved.",
    "answer": "notorious",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "notorious",
      "infamous",
      "disreputable",
      "dishonoured"
    ]
  },
  {
    "id": "missing-020-03",
    "sentence": "The review described the politician as ____; a series of public scandals had made his name widely disliked.",
    "answer": "notorious",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "notorious",
      "infamous",
      "disreputable",
      "dishonoured"
    ]
  },
  {
    "id": "missing-020-04",
    "sentence": "After considering the evidence, observers agreed that the politician remained ____, since a series of public scandals had made his name widely disliked.",
    "answer": "notorious",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "notorious",
      "infamous",
      "disreputable",
      "dishonoured"
    ]
  },
  {
    "id": "missing-020-05",
    "sentence": "It became clear that the politician was ____ when a series of public scandals had made his name widely disliked.",
    "answer": "notorious",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "notorious",
      "infamous",
      "disreputable",
      "dishonoured"
    ]
  },
  {
    "id": "missing-020-06",
    "sentence": "Throughout the discussion, the politician appeared ____: a series of public scandals had made his name widely disliked.",
    "answer": "notorious",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "notorious",
      "infamous",
      "disreputable",
      "dishonoured"
    ]
  },
  {
    "id": "missing-021-01",
    "sentence": "the workshop tool was ____ because it could perform several different tasks with equal ease.",
    "answer": "versatile",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "versatile",
      "adaptable",
      "flexible",
      "multipurpose"
    ]
  },
  {
    "id": "missing-021-02",
    "sentence": "Because it could perform several different tasks with equal ease, the workshop tool seemed ____ to everyone involved.",
    "answer": "versatile",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "versatile",
      "adaptable",
      "flexible",
      "multipurpose"
    ]
  },
  {
    "id": "missing-021-03",
    "sentence": "The review described the workshop tool as ____; it could perform several different tasks with equal ease.",
    "answer": "versatile",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "versatile",
      "adaptable",
      "flexible",
      "multipurpose"
    ]
  },
  {
    "id": "missing-021-04",
    "sentence": "After considering the evidence, observers agreed that the workshop tool remained ____, since it could perform several different tasks with equal ease.",
    "answer": "versatile",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "versatile",
      "adaptable",
      "flexible",
      "multipurpose"
    ]
  },
  {
    "id": "missing-021-05",
    "sentence": "It became clear that the workshop tool was ____ when it could perform several different tasks with equal ease.",
    "answer": "versatile",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "versatile",
      "adaptable",
      "flexible",
      "multipurpose"
    ]
  },
  {
    "id": "missing-021-06",
    "sentence": "Throughout the discussion, the workshop tool appeared ____: it could perform several different tasks with equal ease.",
    "answer": "versatile",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "versatile",
      "adaptable",
      "flexible",
      "multipurpose"
    ]
  },
  {
    "id": "missing-022-01",
    "sentence": "the description was ____ because readers could picture the colours, sounds, and movement clearly.",
    "answer": "vivid",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "vivid",
      "graphic",
      "striking",
      "lifelike"
    ]
  },
  {
    "id": "missing-022-02",
    "sentence": "Because readers could picture the colours, sounds, and movement clearly, the description seemed ____ to everyone involved.",
    "answer": "vivid",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "vivid",
      "graphic",
      "striking",
      "lifelike"
    ]
  },
  {
    "id": "missing-022-03",
    "sentence": "The review described the description as ____; readers could picture the colours, sounds, and movement clearly.",
    "answer": "vivid",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "vivid",
      "graphic",
      "striking",
      "lifelike"
    ]
  },
  {
    "id": "missing-022-04",
    "sentence": "After considering the evidence, observers agreed that the description remained ____, since readers could picture the colours, sounds, and movement clearly.",
    "answer": "vivid",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "vivid",
      "graphic",
      "striking",
      "lifelike"
    ]
  },
  {
    "id": "missing-022-05",
    "sentence": "It became clear that the description was ____ when readers could picture the colours, sounds, and movement clearly.",
    "answer": "vivid",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "vivid",
      "graphic",
      "striking",
      "lifelike"
    ]
  },
  {
    "id": "missing-022-06",
    "sentence": "Throughout the discussion, the description appeared ____: readers could picture the colours, sounds, and movement clearly.",
    "answer": "vivid",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "vivid",
      "graphic",
      "striking",
      "lifelike"
    ]
  },
  {
    "id": "missing-023-01",
    "sentence": "the judge was ____ because she enforced the rules firmly and allowed no special treatment.",
    "answer": "stern",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "stern",
      "strict",
      "severe",
      "harsh"
    ]
  },
  {
    "id": "missing-023-02",
    "sentence": "Because she enforced the rules firmly and allowed no special treatment, the judge seemed ____ to everyone involved.",
    "answer": "stern",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "stern",
      "strict",
      "severe",
      "harsh"
    ]
  },
  {
    "id": "missing-023-03",
    "sentence": "The review described the judge as ____; she enforced the rules firmly and allowed no special treatment.",
    "answer": "stern",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "stern",
      "strict",
      "severe",
      "harsh"
    ]
  },
  {
    "id": "missing-023-04",
    "sentence": "After considering the evidence, observers agreed that the judge remained ____, since she enforced the rules firmly and allowed no special treatment.",
    "answer": "stern",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "stern",
      "strict",
      "severe",
      "harsh"
    ]
  },
  {
    "id": "missing-023-05",
    "sentence": "It became clear that the judge was ____ when she enforced the rules firmly and allowed no special treatment.",
    "answer": "stern",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "stern",
      "strict",
      "severe",
      "harsh"
    ]
  },
  {
    "id": "missing-023-06",
    "sentence": "Throughout the discussion, the judge appeared ____: she enforced the rules firmly and allowed no special treatment.",
    "answer": "stern",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "stern",
      "strict",
      "severe",
      "harsh"
    ]
  },
  {
    "id": "missing-024-01",
    "sentence": "the warning was ____ because its meaning was suggested indirectly rather than stated outright.",
    "answer": "subtle",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "subtle",
      "faint",
      "slight",
      "delicate"
    ]
  },
  {
    "id": "missing-024-02",
    "sentence": "Because its meaning was suggested indirectly rather than stated outright, the warning seemed ____ to everyone involved.",
    "answer": "subtle",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "subtle",
      "faint",
      "slight",
      "delicate"
    ]
  },
  {
    "id": "missing-024-03",
    "sentence": "The review described the warning as ____; its meaning was suggested indirectly rather than stated outright.",
    "answer": "subtle",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "subtle",
      "faint",
      "slight",
      "delicate"
    ]
  },
  {
    "id": "missing-024-04",
    "sentence": "After considering the evidence, observers agreed that the warning remained ____, since its meaning was suggested indirectly rather than stated outright.",
    "answer": "subtle",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "subtle",
      "faint",
      "slight",
      "delicate"
    ]
  },
  {
    "id": "missing-024-05",
    "sentence": "It became clear that the warning was ____ when its meaning was suggested indirectly rather than stated outright.",
    "answer": "subtle",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "subtle",
      "faint",
      "slight",
      "delicate"
    ]
  },
  {
    "id": "missing-024-06",
    "sentence": "Throughout the discussion, the warning appeared ____: its meaning was suggested indirectly rather than stated outright.",
    "answer": "subtle",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "subtle",
      "faint",
      "slight",
      "delicate"
    ]
  },
  {
    "id": "missing-025-01",
    "sentence": "the investigator was ____ because she continued searching despite repeated setbacks.",
    "answer": "persistent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "persistent",
      "tenacious",
      "steadfast",
      "determined"
    ]
  },
  {
    "id": "missing-025-02",
    "sentence": "Because she continued searching despite repeated setbacks, the investigator seemed ____ to everyone involved.",
    "answer": "persistent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "persistent",
      "tenacious",
      "steadfast",
      "determined"
    ]
  },
  {
    "id": "missing-025-03",
    "sentence": "The review described the investigator as ____; she continued searching despite repeated setbacks.",
    "answer": "persistent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "persistent",
      "tenacious",
      "steadfast",
      "determined"
    ]
  },
  {
    "id": "missing-025-04",
    "sentence": "After considering the evidence, observers agreed that the investigator remained ____, since she continued searching despite repeated setbacks.",
    "answer": "persistent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "persistent",
      "tenacious",
      "steadfast",
      "determined"
    ]
  },
  {
    "id": "missing-025-05",
    "sentence": "It became clear that the investigator was ____ when she continued searching despite repeated setbacks.",
    "answer": "persistent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "persistent",
      "tenacious",
      "steadfast",
      "determined"
    ]
  },
  {
    "id": "missing-025-06",
    "sentence": "Throughout the discussion, the investigator appeared ____: she continued searching despite repeated setbacks.",
    "answer": "persistent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "persistent",
      "tenacious",
      "steadfast",
      "determined"
    ]
  },
  {
    "id": "missing-026-01",
    "sentence": "the rainfall was ____ because it lasted only a few minutes before the clouds cleared.",
    "answer": "transient",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "transient",
      "temporary",
      "fleeting",
      "brief"
    ]
  },
  {
    "id": "missing-026-02",
    "sentence": "Because it lasted only a few minutes before the clouds cleared, the rainfall seemed ____ to everyone involved.",
    "answer": "transient",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "transient",
      "temporary",
      "fleeting",
      "brief"
    ]
  },
  {
    "id": "missing-026-03",
    "sentence": "The review described the rainfall as ____; it lasted only a few minutes before the clouds cleared.",
    "answer": "transient",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "transient",
      "temporary",
      "fleeting",
      "brief"
    ]
  },
  {
    "id": "missing-026-04",
    "sentence": "After considering the evidence, observers agreed that the rainfall remained ____, since it lasted only a few minutes before the clouds cleared.",
    "answer": "transient",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "transient",
      "temporary",
      "fleeting",
      "brief"
    ]
  },
  {
    "id": "missing-026-05",
    "sentence": "It became clear that the rainfall was ____ when it lasted only a few minutes before the clouds cleared.",
    "answer": "transient",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "transient",
      "temporary",
      "fleeting",
      "brief"
    ]
  },
  {
    "id": "missing-026-06",
    "sentence": "Throughout the discussion, the rainfall appeared ____: it lasted only a few minutes before the clouds cleared.",
    "answer": "transient",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "transient",
      "temporary",
      "fleeting",
      "brief"
    ]
  },
  {
    "id": "missing-027-01",
    "sentence": "the lakeside scene was ____ because the water remained still and the surrounding forest was quiet.",
    "answer": "serene",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "serene",
      "calm",
      "peaceful",
      "tranquil"
    ]
  },
  {
    "id": "missing-027-02",
    "sentence": "Because the water remained still and the surrounding forest was quiet, the lakeside scene seemed ____ to everyone involved.",
    "answer": "serene",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "serene",
      "calm",
      "peaceful",
      "tranquil"
    ]
  },
  {
    "id": "missing-027-03",
    "sentence": "The review described the lakeside scene as ____; the water remained still and the surrounding forest was quiet.",
    "answer": "serene",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "serene",
      "calm",
      "peaceful",
      "tranquil"
    ]
  },
  {
    "id": "missing-027-04",
    "sentence": "After considering the evidence, observers agreed that the lakeside scene remained ____, since the water remained still and the surrounding forest was quiet.",
    "answer": "serene",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "serene",
      "calm",
      "peaceful",
      "tranquil"
    ]
  },
  {
    "id": "missing-027-05",
    "sentence": "It became clear that the lakeside scene was ____ when the water remained still and the surrounding forest was quiet.",
    "answer": "serene",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "serene",
      "calm",
      "peaceful",
      "tranquil"
    ]
  },
  {
    "id": "missing-027-06",
    "sentence": "Throughout the discussion, the lakeside scene appeared ____: the water remained still and the surrounding forest was quiet.",
    "answer": "serene",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "serene",
      "calm",
      "peaceful",
      "tranquil"
    ]
  },
  {
    "id": "missing-028-01",
    "sentence": "the crowd was ____ because the group shouted threats at anyone who approached.",
    "answer": "hostile",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "hostile",
      "antagonistic",
      "aggressive",
      "unfriendly"
    ]
  },
  {
    "id": "missing-028-02",
    "sentence": "Because the group shouted threats at anyone who approached, the crowd seemed ____ to everyone involved.",
    "answer": "hostile",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "hostile",
      "antagonistic",
      "aggressive",
      "unfriendly"
    ]
  },
  {
    "id": "missing-028-03",
    "sentence": "The review described the crowd as ____; the group shouted threats at anyone who approached.",
    "answer": "hostile",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "hostile",
      "antagonistic",
      "aggressive",
      "unfriendly"
    ]
  },
  {
    "id": "missing-028-04",
    "sentence": "After considering the evidence, observers agreed that the crowd remained ____, since the group shouted threats at anyone who approached.",
    "answer": "hostile",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "hostile",
      "antagonistic",
      "aggressive",
      "unfriendly"
    ]
  },
  {
    "id": "missing-028-05",
    "sentence": "It became clear that the crowd was ____ when the group shouted threats at anyone who approached.",
    "answer": "hostile",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "hostile",
      "antagonistic",
      "aggressive",
      "unfriendly"
    ]
  },
  {
    "id": "missing-028-06",
    "sentence": "Throughout the discussion, the crowd appeared ____: the group shouted threats at anyone who approached.",
    "answer": "hostile",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "hostile",
      "antagonistic",
      "aggressive",
      "unfriendly"
    ]
  },
  {
    "id": "missing-029-01",
    "sentence": "the receptionist was ____ because she greeted every visitor with patience and good manners.",
    "answer": "courteous",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "courteous",
      "polite",
      "respectful",
      "civil"
    ]
  },
  {
    "id": "missing-029-02",
    "sentence": "Because she greeted every visitor with patience and good manners, the receptionist seemed ____ to everyone involved.",
    "answer": "courteous",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "courteous",
      "polite",
      "respectful",
      "civil"
    ]
  },
  {
    "id": "missing-029-03",
    "sentence": "The review described the receptionist as ____; she greeted every visitor with patience and good manners.",
    "answer": "courteous",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "courteous",
      "polite",
      "respectful",
      "civil"
    ]
  },
  {
    "id": "missing-029-04",
    "sentence": "After considering the evidence, observers agreed that the receptionist remained ____, since she greeted every visitor with patience and good manners.",
    "answer": "courteous",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "courteous",
      "polite",
      "respectful",
      "civil"
    ]
  },
  {
    "id": "missing-029-05",
    "sentence": "It became clear that the receptionist was ____ when she greeted every visitor with patience and good manners.",
    "answer": "courteous",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "courteous",
      "polite",
      "respectful",
      "civil"
    ]
  },
  {
    "id": "missing-029-06",
    "sentence": "Throughout the discussion, the receptionist appeared ____: she greeted every visitor with patience and good manners.",
    "answer": "courteous",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "courteous",
      "polite",
      "respectful",
      "civil"
    ]
  },
  {
    "id": "missing-030-01",
    "sentence": "the glass panel was ____ because anyone could see through it without distortion.",
    "answer": "transparent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "transparent",
      "clear",
      "obvious",
      "open"
    ]
  },
  {
    "id": "missing-030-02",
    "sentence": "Because anyone could see through it without distortion, the glass panel seemed ____ to everyone involved.",
    "answer": "transparent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "transparent",
      "clear",
      "obvious",
      "open"
    ]
  },
  {
    "id": "missing-030-03",
    "sentence": "The review described the glass panel as ____; anyone could see through it without distortion.",
    "answer": "transparent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "transparent",
      "clear",
      "obvious",
      "open"
    ]
  },
  {
    "id": "missing-030-04",
    "sentence": "After considering the evidence, observers agreed that the glass panel remained ____, since anyone could see through it without distortion.",
    "answer": "transparent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "transparent",
      "clear",
      "obvious",
      "open"
    ]
  },
  {
    "id": "missing-030-05",
    "sentence": "It became clear that the glass panel was ____ when anyone could see through it without distortion.",
    "answer": "transparent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "transparent",
      "clear",
      "obvious",
      "open"
    ]
  },
  {
    "id": "missing-030-06",
    "sentence": "Throughout the discussion, the glass panel appeared ____: anyone could see through it without distortion.",
    "answer": "transparent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "transparent",
      "clear",
      "obvious",
      "open"
    ]
  },
  {
    "id": "missing-031-01",
    "sentence": "the captain was ____ because she chose a course quickly and accepted responsibility for it.",
    "answer": "decisive",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "decisive",
      "resolute",
      "firm",
      "determined"
    ]
  },
  {
    "id": "missing-031-02",
    "sentence": "Because she chose a course quickly and accepted responsibility for it, the captain seemed ____ to everyone involved.",
    "answer": "decisive",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "decisive",
      "resolute",
      "firm",
      "determined"
    ]
  },
  {
    "id": "missing-031-03",
    "sentence": "The review described the captain as ____; she chose a course quickly and accepted responsibility for it.",
    "answer": "decisive",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "decisive",
      "resolute",
      "firm",
      "determined"
    ]
  },
  {
    "id": "missing-031-04",
    "sentence": "After considering the evidence, observers agreed that the captain remained ____, since she chose a course quickly and accepted responsibility for it.",
    "answer": "decisive",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "decisive",
      "resolute",
      "firm",
      "determined"
    ]
  },
  {
    "id": "missing-031-05",
    "sentence": "It became clear that the captain was ____ when she chose a course quickly and accepted responsibility for it.",
    "answer": "decisive",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "decisive",
      "resolute",
      "firm",
      "determined"
    ]
  },
  {
    "id": "missing-031-06",
    "sentence": "Throughout the discussion, the captain appeared ____: she chose a course quickly and accepted responsibility for it.",
    "answer": "decisive",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "decisive",
      "resolute",
      "firm",
      "determined"
    ]
  },
  {
    "id": "missing-032-01",
    "sentence": "the signature was ____ because experts confirmed it was not forged or copied.",
    "answer": "authentic",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "authentic",
      "genuine",
      "real",
      "legitimate"
    ]
  },
  {
    "id": "missing-032-02",
    "sentence": "Because experts confirmed it was not forged or copied, the signature seemed ____ to everyone involved.",
    "answer": "authentic",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "authentic",
      "genuine",
      "real",
      "legitimate"
    ]
  },
  {
    "id": "missing-032-03",
    "sentence": "The review described the signature as ____; experts confirmed it was not forged or copied.",
    "answer": "authentic",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "authentic",
      "genuine",
      "real",
      "legitimate"
    ]
  },
  {
    "id": "missing-032-04",
    "sentence": "After considering the evidence, observers agreed that the signature remained ____, since experts confirmed it was not forged or copied.",
    "answer": "authentic",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "authentic",
      "genuine",
      "real",
      "legitimate"
    ]
  },
  {
    "id": "missing-032-05",
    "sentence": "It became clear that the signature was ____ when experts confirmed it was not forged or copied.",
    "answer": "authentic",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "authentic",
      "genuine",
      "real",
      "legitimate"
    ]
  },
  {
    "id": "missing-032-06",
    "sentence": "Throughout the discussion, the signature appeared ____: experts confirmed it was not forged or copied.",
    "answer": "authentic",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "authentic",
      "genuine",
      "real",
      "legitimate"
    ]
  },
  {
    "id": "missing-033-01",
    "sentence": "the safety inspection was ____ because every employee had to complete it before entering the plant.",
    "answer": "mandatory",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "mandatory",
      "compulsory",
      "obligatory",
      "required"
    ]
  },
  {
    "id": "missing-033-02",
    "sentence": "Because every employee had to complete it before entering the plant, the safety inspection seemed ____ to everyone involved.",
    "answer": "mandatory",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "mandatory",
      "compulsory",
      "obligatory",
      "required"
    ]
  },
  {
    "id": "missing-033-03",
    "sentence": "The review described the safety inspection as ____; every employee had to complete it before entering the plant.",
    "answer": "mandatory",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "mandatory",
      "compulsory",
      "obligatory",
      "required"
    ]
  },
  {
    "id": "missing-033-04",
    "sentence": "After considering the evidence, observers agreed that the safety inspection remained ____, since every employee had to complete it before entering the plant.",
    "answer": "mandatory",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "mandatory",
      "compulsory",
      "obligatory",
      "required"
    ]
  },
  {
    "id": "missing-033-05",
    "sentence": "It became clear that the safety inspection was ____ when every employee had to complete it before entering the plant.",
    "answer": "mandatory",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "mandatory",
      "compulsory",
      "obligatory",
      "required"
    ]
  },
  {
    "id": "missing-033-06",
    "sentence": "Throughout the discussion, the safety inspection appeared ____: every employee had to complete it before entering the plant.",
    "answer": "mandatory",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "mandatory",
      "compulsory",
      "obligatory",
      "required"
    ]
  },
  {
    "id": "missing-034-01",
    "sentence": "the workshop was ____ because attendance was a personal choice rather than a requirement.",
    "answer": "optional",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "optional",
      "voluntary",
      "elective",
      "discretionary"
    ]
  },
  {
    "id": "missing-034-02",
    "sentence": "Because attendance was a personal choice rather than a requirement, the workshop seemed ____ to everyone involved.",
    "answer": "optional",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "optional",
      "voluntary",
      "elective",
      "discretionary"
    ]
  },
  {
    "id": "missing-034-03",
    "sentence": "The review described the workshop as ____; attendance was a personal choice rather than a requirement.",
    "answer": "optional",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "optional",
      "voluntary",
      "elective",
      "discretionary"
    ]
  },
  {
    "id": "missing-034-04",
    "sentence": "After considering the evidence, observers agreed that the workshop remained ____, since attendance was a personal choice rather than a requirement.",
    "answer": "optional",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "optional",
      "voluntary",
      "elective",
      "discretionary"
    ]
  },
  {
    "id": "missing-034-05",
    "sentence": "It became clear that the workshop was ____ when attendance was a personal choice rather than a requirement.",
    "answer": "optional",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "optional",
      "voluntary",
      "elective",
      "discretionary"
    ]
  },
  {
    "id": "missing-034-06",
    "sentence": "Throughout the discussion, the workshop appeared ____: attendance was a personal choice rather than a requirement.",
    "answer": "optional",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "optional",
      "voluntary",
      "elective",
      "discretionary"
    ]
  },
  {
    "id": "missing-035-01",
    "sentence": "the canyon was ____ because its scale stretched far beyond what visitors could see at once.",
    "answer": "immense",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "immense",
      "vast",
      "enormous",
      "colossal"
    ]
  },
  {
    "id": "missing-035-02",
    "sentence": "Because its scale stretched far beyond what visitors could see at once, the canyon seemed ____ to everyone involved.",
    "answer": "immense",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "immense",
      "vast",
      "enormous",
      "colossal"
    ]
  },
  {
    "id": "missing-035-03",
    "sentence": "The review described the canyon as ____; its scale stretched far beyond what visitors could see at once.",
    "answer": "immense",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "immense",
      "vast",
      "enormous",
      "colossal"
    ]
  },
  {
    "id": "missing-035-04",
    "sentence": "After considering the evidence, observers agreed that the canyon remained ____, since its scale stretched far beyond what visitors could see at once.",
    "answer": "immense",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "immense",
      "vast",
      "enormous",
      "colossal"
    ]
  },
  {
    "id": "missing-035-05",
    "sentence": "It became clear that the canyon was ____ when its scale stretched far beyond what visitors could see at once.",
    "answer": "immense",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "immense",
      "vast",
      "enormous",
      "colossal"
    ]
  },
  {
    "id": "missing-035-06",
    "sentence": "Throughout the discussion, the canyon appeared ____: its scale stretched far beyond what visitors could see at once.",
    "answer": "immense",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "immense",
      "vast",
      "enormous",
      "colossal"
    ]
  },
  {
    "id": "missing-036-01",
    "sentence": "the insect was ____ because it was barely visible without a magnifying glass.",
    "answer": "minuscule",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "minuscule",
      "tiny",
      "minute",
      "microscopic"
    ]
  },
  {
    "id": "missing-036-02",
    "sentence": "Because it was barely visible without a magnifying glass, the insect seemed ____ to everyone involved.",
    "answer": "minuscule",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "minuscule",
      "tiny",
      "minute",
      "microscopic"
    ]
  },
  {
    "id": "missing-036-03",
    "sentence": "The review described the insect as ____; it was barely visible without a magnifying glass.",
    "answer": "minuscule",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "minuscule",
      "tiny",
      "minute",
      "microscopic"
    ]
  },
  {
    "id": "missing-036-04",
    "sentence": "After considering the evidence, observers agreed that the insect remained ____, since it was barely visible without a magnifying glass.",
    "answer": "minuscule",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "minuscule",
      "tiny",
      "minute",
      "microscopic"
    ]
  },
  {
    "id": "missing-036-05",
    "sentence": "It became clear that the insect was ____ when it was barely visible without a magnifying glass.",
    "answer": "minuscule",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "minuscule",
      "tiny",
      "minute",
      "microscopic"
    ]
  },
  {
    "id": "missing-036-06",
    "sentence": "Throughout the discussion, the insect appeared ____: it was barely visible without a magnifying glass.",
    "answer": "minuscule",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "minuscule",
      "tiny",
      "minute",
      "microscopic"
    ]
  },
  {
    "id": "missing-037-01",
    "sentence": "the driver was ____ because he slowed near the school and checked both mirrors.",
    "answer": "cautious",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "cautious",
      "wary",
      "vigilant",
      "careful"
    ]
  },
  {
    "id": "missing-037-02",
    "sentence": "Because he slowed near the school and checked both mirrors, the driver seemed ____ to everyone involved.",
    "answer": "cautious",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "cautious",
      "wary",
      "vigilant",
      "careful"
    ]
  },
  {
    "id": "missing-037-03",
    "sentence": "The review described the driver as ____; he slowed near the school and checked both mirrors.",
    "answer": "cautious",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "cautious",
      "wary",
      "vigilant",
      "careful"
    ]
  },
  {
    "id": "missing-037-04",
    "sentence": "After considering the evidence, observers agreed that the driver remained ____, since he slowed near the school and checked both mirrors.",
    "answer": "cautious",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "cautious",
      "wary",
      "vigilant",
      "careful"
    ]
  },
  {
    "id": "missing-037-05",
    "sentence": "It became clear that the driver was ____ when he slowed near the school and checked both mirrors.",
    "answer": "cautious",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "cautious",
      "wary",
      "vigilant",
      "careful"
    ]
  },
  {
    "id": "missing-037-06",
    "sentence": "Throughout the discussion, the driver appeared ____: he slowed near the school and checked both mirrors.",
    "answer": "cautious",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "cautious",
      "wary",
      "vigilant",
      "careful"
    ]
  },
  {
    "id": "missing-038-01",
    "sentence": "the supervisor was ____ because he ignored repeated warnings about unsafe equipment.",
    "answer": "negligent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "negligent",
      "careless",
      "inattentive",
      "remiss"
    ]
  },
  {
    "id": "missing-038-02",
    "sentence": "Because he ignored repeated warnings about unsafe equipment, the supervisor seemed ____ to everyone involved.",
    "answer": "negligent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "negligent",
      "careless",
      "inattentive",
      "remiss"
    ]
  },
  {
    "id": "missing-038-03",
    "sentence": "The review described the supervisor as ____; he ignored repeated warnings about unsafe equipment.",
    "answer": "negligent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "negligent",
      "careless",
      "inattentive",
      "remiss"
    ]
  },
  {
    "id": "missing-038-04",
    "sentence": "After considering the evidence, observers agreed that the supervisor remained ____, since he ignored repeated warnings about unsafe equipment.",
    "answer": "negligent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "negligent",
      "careless",
      "inattentive",
      "remiss"
    ]
  },
  {
    "id": "missing-038-05",
    "sentence": "It became clear that the supervisor was ____ when he ignored repeated warnings about unsafe equipment.",
    "answer": "negligent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "negligent",
      "careless",
      "inattentive",
      "remiss"
    ]
  },
  {
    "id": "missing-038-06",
    "sentence": "Throughout the discussion, the supervisor appeared ____: he ignored repeated warnings about unsafe equipment.",
    "answer": "negligent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "negligent",
      "careless",
      "inattentive",
      "remiss"
    ]
  },
  {
    "id": "missing-039-01",
    "sentence": "the donor was ____ because she gave a large portion of her savings to the relief fund.",
    "answer": "generous",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "generous",
      "charitable",
      "munificent",
      "giving"
    ]
  },
  {
    "id": "missing-039-02",
    "sentence": "Because she gave a large portion of her savings to the relief fund, the donor seemed ____ to everyone involved.",
    "answer": "generous",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "generous",
      "charitable",
      "munificent",
      "giving"
    ]
  },
  {
    "id": "missing-039-03",
    "sentence": "The review described the donor as ____; she gave a large portion of her savings to the relief fund.",
    "answer": "generous",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "generous",
      "charitable",
      "munificent",
      "giving"
    ]
  },
  {
    "id": "missing-039-04",
    "sentence": "After considering the evidence, observers agreed that the donor remained ____, since she gave a large portion of her savings to the relief fund.",
    "answer": "generous",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "generous",
      "charitable",
      "munificent",
      "giving"
    ]
  },
  {
    "id": "missing-039-05",
    "sentence": "It became clear that the donor was ____ when she gave a large portion of her savings to the relief fund.",
    "answer": "generous",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "generous",
      "charitable",
      "munificent",
      "giving"
    ]
  },
  {
    "id": "missing-039-06",
    "sentence": "Throughout the discussion, the donor appeared ____: she gave a large portion of her savings to the relief fund.",
    "answer": "generous",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "generous",
      "charitable",
      "munificent",
      "giving"
    ]
  },
  {
    "id": "missing-040-01",
    "sentence": "the household was ____ because they repaired old items and avoided unnecessary purchases.",
    "answer": "frugal",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "frugal",
      "thrifty",
      "economical",
      "sparing"
    ]
  },
  {
    "id": "missing-040-02",
    "sentence": "Because they repaired old items and avoided unnecessary purchases, the household seemed ____ to everyone involved.",
    "answer": "frugal",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "frugal",
      "thrifty",
      "economical",
      "sparing"
    ]
  },
  {
    "id": "missing-040-03",
    "sentence": "The review described the household as ____; they repaired old items and avoided unnecessary purchases.",
    "answer": "frugal",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "frugal",
      "thrifty",
      "economical",
      "sparing"
    ]
  },
  {
    "id": "missing-040-04",
    "sentence": "After considering the evidence, observers agreed that the household remained ____, since they repaired old items and avoided unnecessary purchases.",
    "answer": "frugal",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "frugal",
      "thrifty",
      "economical",
      "sparing"
    ]
  },
  {
    "id": "missing-040-05",
    "sentence": "It became clear that the household was ____ when they repaired old items and avoided unnecessary purchases.",
    "answer": "frugal",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "frugal",
      "thrifty",
      "economical",
      "sparing"
    ]
  },
  {
    "id": "missing-040-06",
    "sentence": "Throughout the discussion, the household appeared ____: they repaired old items and avoided unnecessary purchases.",
    "answer": "frugal",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "frugal",
      "thrifty",
      "economical",
      "sparing"
    ]
  },
  {
    "id": "missing-041-01",
    "sentence": "the banquet was ____ because the hosts decorated every table with costly flowers and fine silver.",
    "answer": "lavish",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "lavish",
      "extravagant",
      "opulent",
      "sumptuous"
    ]
  },
  {
    "id": "missing-041-02",
    "sentence": "Because the hosts decorated every table with costly flowers and fine silver, the banquet seemed ____ to everyone involved.",
    "answer": "lavish",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "lavish",
      "extravagant",
      "opulent",
      "sumptuous"
    ]
  },
  {
    "id": "missing-041-03",
    "sentence": "The review described the banquet as ____; the hosts decorated every table with costly flowers and fine silver.",
    "answer": "lavish",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "lavish",
      "extravagant",
      "opulent",
      "sumptuous"
    ]
  },
  {
    "id": "missing-041-04",
    "sentence": "After considering the evidence, observers agreed that the banquet remained ____, since the hosts decorated every table with costly flowers and fine silver.",
    "answer": "lavish",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "lavish",
      "extravagant",
      "opulent",
      "sumptuous"
    ]
  },
  {
    "id": "missing-041-05",
    "sentence": "It became clear that the banquet was ____ when the hosts decorated every table with costly flowers and fine silver.",
    "answer": "lavish",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "lavish",
      "extravagant",
      "opulent",
      "sumptuous"
    ]
  },
  {
    "id": "missing-041-06",
    "sentence": "Throughout the discussion, the banquet appeared ____: the hosts decorated every table with costly flowers and fine silver.",
    "answer": "lavish",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "lavish",
      "extravagant",
      "opulent",
      "sumptuous"
    ]
  },
  {
    "id": "missing-042-01",
    "sentence": "the speaker was ____ because she explained complicated ideas clearly and confidently.",
    "answer": "articulate",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "articulate",
      "eloquent",
      "expressive",
      "fluent"
    ]
  },
  {
    "id": "missing-042-02",
    "sentence": "Because she explained complicated ideas clearly and confidently, the speaker seemed ____ to everyone involved.",
    "answer": "articulate",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "articulate",
      "eloquent",
      "expressive",
      "fluent"
    ]
  },
  {
    "id": "missing-042-03",
    "sentence": "The review described the speaker as ____; she explained complicated ideas clearly and confidently.",
    "answer": "articulate",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "articulate",
      "eloquent",
      "expressive",
      "fluent"
    ]
  },
  {
    "id": "missing-042-04",
    "sentence": "After considering the evidence, observers agreed that the speaker remained ____, since she explained complicated ideas clearly and confidently.",
    "answer": "articulate",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "articulate",
      "eloquent",
      "expressive",
      "fluent"
    ]
  },
  {
    "id": "missing-042-05",
    "sentence": "It became clear that the speaker was ____ when she explained complicated ideas clearly and confidently.",
    "answer": "articulate",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "articulate",
      "eloquent",
      "expressive",
      "fluent"
    ]
  },
  {
    "id": "missing-042-06",
    "sentence": "Throughout the discussion, the speaker appeared ____: she explained complicated ideas clearly and confidently.",
    "answer": "articulate",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "articulate",
      "eloquent",
      "expressive",
      "fluent"
    ]
  },
  {
    "id": "missing-043-01",
    "sentence": "the defendant was ____ because he sincerely regretted the harm his actions had caused.",
    "answer": "remorseful",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "remorseful",
      "contrite",
      "repentant",
      "regretful"
    ]
  },
  {
    "id": "missing-043-02",
    "sentence": "Because he sincerely regretted the harm his actions had caused, the defendant seemed ____ to everyone involved.",
    "answer": "remorseful",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "remorseful",
      "contrite",
      "repentant",
      "regretful"
    ]
  },
  {
    "id": "missing-043-03",
    "sentence": "The review described the defendant as ____; he sincerely regretted the harm his actions had caused.",
    "answer": "remorseful",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "remorseful",
      "contrite",
      "repentant",
      "regretful"
    ]
  },
  {
    "id": "missing-043-04",
    "sentence": "After considering the evidence, observers agreed that the defendant remained ____, since he sincerely regretted the harm his actions had caused.",
    "answer": "remorseful",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "remorseful",
      "contrite",
      "repentant",
      "regretful"
    ]
  },
  {
    "id": "missing-043-05",
    "sentence": "It became clear that the defendant was ____ when he sincerely regretted the harm his actions had caused.",
    "answer": "remorseful",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "remorseful",
      "contrite",
      "repentant",
      "regretful"
    ]
  },
  {
    "id": "missing-043-06",
    "sentence": "Throughout the discussion, the defendant appeared ____: he sincerely regretted the harm his actions had caused.",
    "answer": "remorseful",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "remorseful",
      "contrite",
      "repentant",
      "regretful"
    ]
  },
  {
    "id": "missing-044-01",
    "sentence": "the audience was ____ because they showed no interest or concern when the announcement was made.",
    "answer": "indifferent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "indifferent",
      "apathetic",
      "detached",
      "unconcerned"
    ]
  },
  {
    "id": "missing-044-02",
    "sentence": "Because they showed no interest or concern when the announcement was made, the audience seemed ____ to everyone involved.",
    "answer": "indifferent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "indifferent",
      "apathetic",
      "detached",
      "unconcerned"
    ]
  },
  {
    "id": "missing-044-03",
    "sentence": "The review described the audience as ____; they showed no interest or concern when the announcement was made.",
    "answer": "indifferent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "indifferent",
      "apathetic",
      "detached",
      "unconcerned"
    ]
  },
  {
    "id": "missing-044-04",
    "sentence": "After considering the evidence, observers agreed that the audience remained ____, since they showed no interest or concern when the announcement was made.",
    "answer": "indifferent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "indifferent",
      "apathetic",
      "detached",
      "unconcerned"
    ]
  },
  {
    "id": "missing-044-05",
    "sentence": "It became clear that the audience was ____ when they showed no interest or concern when the announcement was made.",
    "answer": "indifferent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "indifferent",
      "apathetic",
      "detached",
      "unconcerned"
    ]
  },
  {
    "id": "missing-044-06",
    "sentence": "Throughout the discussion, the audience appeared ____: they showed no interest or concern when the announcement was made.",
    "answer": "indifferent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "indifferent",
      "apathetic",
      "detached",
      "unconcerned"
    ]
  },
  {
    "id": "missing-045-01",
    "sentence": "the necklace was ____ because its tiny links and carefully fitted stones required hours of work.",
    "answer": "intricate",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "intricate",
      "elaborate",
      "complex",
      "detailed"
    ]
  },
  {
    "id": "missing-045-02",
    "sentence": "Because its tiny links and carefully fitted stones required hours of work, the necklace seemed ____ to everyone involved.",
    "answer": "intricate",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "intricate",
      "elaborate",
      "complex",
      "detailed"
    ]
  },
  {
    "id": "missing-045-03",
    "sentence": "The review described the necklace as ____; its tiny links and carefully fitted stones required hours of work.",
    "answer": "intricate",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "intricate",
      "elaborate",
      "complex",
      "detailed"
    ]
  },
  {
    "id": "missing-045-04",
    "sentence": "After considering the evidence, observers agreed that the necklace remained ____, since its tiny links and carefully fitted stones required hours of work.",
    "answer": "intricate",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "intricate",
      "elaborate",
      "complex",
      "detailed"
    ]
  },
  {
    "id": "missing-045-05",
    "sentence": "It became clear that the necklace was ____ when its tiny links and carefully fitted stones required hours of work.",
    "answer": "intricate",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "intricate",
      "elaborate",
      "complex",
      "detailed"
    ]
  },
  {
    "id": "missing-045-06",
    "sentence": "Throughout the discussion, the necklace appeared ____: its tiny links and carefully fitted stones required hours of work.",
    "answer": "intricate",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "intricate",
      "elaborate",
      "complex",
      "detailed"
    ]
  },
  {
    "id": "missing-046-01",
    "sentence": "the expedition was ____ because the team crossed steep terrain in extreme heat for several days.",
    "answer": "arduous",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "arduous",
      "strenuous",
      "demanding",
      "difficult"
    ]
  },
  {
    "id": "missing-046-02",
    "sentence": "Because the team crossed steep terrain in extreme heat for several days, the expedition seemed ____ to everyone involved.",
    "answer": "arduous",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "arduous",
      "strenuous",
      "demanding",
      "difficult"
    ]
  },
  {
    "id": "missing-046-03",
    "sentence": "The review described the expedition as ____; the team crossed steep terrain in extreme heat for several days.",
    "answer": "arduous",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "arduous",
      "strenuous",
      "demanding",
      "difficult"
    ]
  },
  {
    "id": "missing-046-04",
    "sentence": "After considering the evidence, observers agreed that the expedition remained ____, since the team crossed steep terrain in extreme heat for several days.",
    "answer": "arduous",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "arduous",
      "strenuous",
      "demanding",
      "difficult"
    ]
  },
  {
    "id": "missing-046-05",
    "sentence": "It became clear that the expedition was ____ when the team crossed steep terrain in extreme heat for several days.",
    "answer": "arduous",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "arduous",
      "strenuous",
      "demanding",
      "difficult"
    ]
  },
  {
    "id": "missing-046-06",
    "sentence": "Throughout the discussion, the expedition appeared ____: the team crossed steep terrain in extreme heat for several days.",
    "answer": "arduous",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "arduous",
      "strenuous",
      "demanding",
      "difficult"
    ]
  },
  {
    "id": "missing-047-01",
    "sentence": "the witness was ____ because she told the investigator exactly what she had seen without softening it.",
    "answer": "candid",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "candid",
      "frank",
      "open",
      "honest"
    ]
  },
  {
    "id": "missing-047-02",
    "sentence": "Because she told the investigator exactly what she had seen without softening it, the witness seemed ____ to everyone involved.",
    "answer": "candid",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "candid",
      "frank",
      "open",
      "honest"
    ]
  },
  {
    "id": "missing-047-03",
    "sentence": "The review described the witness as ____; she told the investigator exactly what she had seen without softening it.",
    "answer": "candid",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "candid",
      "frank",
      "open",
      "honest"
    ]
  },
  {
    "id": "missing-047-04",
    "sentence": "After considering the evidence, observers agreed that the witness remained ____, since she told the investigator exactly what she had seen without softening it.",
    "answer": "candid",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "candid",
      "frank",
      "open",
      "honest"
    ]
  },
  {
    "id": "missing-047-05",
    "sentence": "It became clear that the witness was ____ when she told the investigator exactly what she had seen without softening it.",
    "answer": "candid",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "candid",
      "frank",
      "open",
      "honest"
    ]
  },
  {
    "id": "missing-047-06",
    "sentence": "Throughout the discussion, the witness appeared ____: she told the investigator exactly what she had seen without softening it.",
    "answer": "candid",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "candid",
      "frank",
      "open",
      "honest"
    ]
  },
  {
    "id": "missing-048-01",
    "sentence": "the diplomat was ____ because she handled sensitive questions carefully without causing offence.",
    "answer": "discreet",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "discreet",
      "tactful",
      "prudent",
      "circumspect"
    ]
  },
  {
    "id": "missing-048-02",
    "sentence": "Because she handled sensitive questions carefully without causing offence, the diplomat seemed ____ to everyone involved.",
    "answer": "discreet",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "discreet",
      "tactful",
      "prudent",
      "circumspect"
    ]
  },
  {
    "id": "missing-048-03",
    "sentence": "The review described the diplomat as ____; she handled sensitive questions carefully without causing offence.",
    "answer": "discreet",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "discreet",
      "tactful",
      "prudent",
      "circumspect"
    ]
  },
  {
    "id": "missing-048-04",
    "sentence": "After considering the evidence, observers agreed that the diplomat remained ____, since she handled sensitive questions carefully without causing offence.",
    "answer": "discreet",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "discreet",
      "tactful",
      "prudent",
      "circumspect"
    ]
  },
  {
    "id": "missing-048-05",
    "sentence": "It became clear that the diplomat was ____ when she handled sensitive questions carefully without causing offence.",
    "answer": "discreet",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "discreet",
      "tactful",
      "prudent",
      "circumspect"
    ]
  },
  {
    "id": "missing-048-06",
    "sentence": "Throughout the discussion, the diplomat appeared ____: she handled sensitive questions carefully without causing offence.",
    "answer": "discreet",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "discreet",
      "tactful",
      "prudent",
      "circumspect"
    ]
  },
  {
    "id": "missing-049-01",
    "sentence": "the spokesperson was ____ because he avoided giving a direct answer when asked about the missing funds.",
    "answer": "evasive",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "evasive",
      "indirect",
      "elusive",
      "noncommittal"
    ]
  },
  {
    "id": "missing-049-02",
    "sentence": "Because he avoided giving a direct answer when asked about the missing funds, the spokesperson seemed ____ to everyone involved.",
    "answer": "evasive",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "evasive",
      "indirect",
      "elusive",
      "noncommittal"
    ]
  },
  {
    "id": "missing-049-03",
    "sentence": "The review described the spokesperson as ____; he avoided giving a direct answer when asked about the missing funds.",
    "answer": "evasive",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "evasive",
      "indirect",
      "elusive",
      "noncommittal"
    ]
  },
  {
    "id": "missing-049-04",
    "sentence": "After considering the evidence, observers agreed that the spokesperson remained ____, since he avoided giving a direct answer when asked about the missing funds.",
    "answer": "evasive",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "evasive",
      "indirect",
      "elusive",
      "noncommittal"
    ]
  },
  {
    "id": "missing-049-05",
    "sentence": "It became clear that the spokesperson was ____ when he avoided giving a direct answer when asked about the missing funds.",
    "answer": "evasive",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "evasive",
      "indirect",
      "elusive",
      "noncommittal"
    ]
  },
  {
    "id": "missing-049-06",
    "sentence": "Throughout the discussion, the spokesperson appeared ____: he avoided giving a direct answer when asked about the missing funds.",
    "answer": "evasive",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "evasive",
      "indirect",
      "elusive",
      "noncommittal"
    ]
  },
  {
    "id": "missing-050-01",
    "sentence": "the storm was ____ because it was expected to arrive within the next few hours.",
    "answer": "imminent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "imminent",
      "impending",
      "approaching",
      "forthcoming"
    ]
  },
  {
    "id": "missing-050-02",
    "sentence": "Because it was expected to arrive within the next few hours, the storm seemed ____ to everyone involved.",
    "answer": "imminent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "imminent",
      "impending",
      "approaching",
      "forthcoming"
    ]
  },
  {
    "id": "missing-050-03",
    "sentence": "The review described the storm as ____; it was expected to arrive within the next few hours.",
    "answer": "imminent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "imminent",
      "impending",
      "approaching",
      "forthcoming"
    ]
  },
  {
    "id": "missing-050-04",
    "sentence": "After considering the evidence, observers agreed that the storm remained ____, since it was expected to arrive within the next few hours.",
    "answer": "imminent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "imminent",
      "impending",
      "approaching",
      "forthcoming"
    ]
  },
  {
    "id": "missing-050-05",
    "sentence": "It became clear that the storm was ____ when it was expected to arrive within the next few hours.",
    "answer": "imminent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "imminent",
      "impending",
      "approaching",
      "forthcoming"
    ]
  },
  {
    "id": "missing-050-06",
    "sentence": "Throughout the discussion, the storm appeared ____: it was expected to arrive within the next few hours.",
    "answer": "imminent",
    "clue": "Read the whole sentence and choose the word that best matches its precise meaning.",
    "options": [
      "imminent",
      "impending",
      "approaching",
      "forthcoming"
    ]
  }
];
export function getMissingPuzzle(date:string,slot:number):Puzzle & {clue:string;pattern:string}{
 const seed=seedFor(date,slot),index=((seed%MISSING_WORD_CHALLENGES.length)+MISSING_WORD_CHALLENGES.length)%MISSING_WORD_CHALLENGES.length,item=MISSING_WORD_CHALLENGES[index];
 return {id:item.id,question:item.sentence.replace("____","_____"),clue:item.clue,answer:item.answer,pattern:"_____",options:shuffled(item.options,seed+29)};
}
export function getSequencePuzzle(date:string,slot:number):Puzzle & {explanation:string}{
 const seed=seedFor(date,slot),a=2+(seed%1000),step=1+((seed*7)%23),curve=1+((seed*13)%17);
 const nums=[0,1,2,3,4].map(i=>a+i*step+i*i*curve),next=a+5*step+25*curve;
 return {id:"sequence:"+nums.join(",")+":"+next,question:nums.join(", ") + ", ?",answer:String(next),explanation:"The sequence adds a steady step and a growing square-based amount."};
}
const oddWordSets=[
 {o:["Saturn","Jupiter","Neptune","Sirius"],a:"Sirius",why:"Sirius is a star; the others are planets."},
 {o:["Kilogram","Metre","Second","Celsius"],a:"Celsius",why:"Celsius is a temperature scale; the others are SI base units."},
 {o:["Shark","Whale","Dolphin","Octopus"],a:"Octopus",why:"Octopus is a mollusc; the others are vertebrates."},
 {o:["Mercury","Iron","Copper","Oxygen"],a:"Oxygen",why:"Oxygen is a gas at room temperature; the others are metals."},
 {o:["Violin","Trumpet","Clarinet","Oboe"],a:"Violin",why:"Violin is a string instrument; the others are wind instruments."},
 {o:["Amazon","Nile","Danube","Sahara"],a:"Sahara",why:"Sahara is a desert; the others are rivers."},
 {o:["Everest","Kilimanjaro","Aconcagua","Amazon"],a:"Amazon",why:"Amazon is a river; the others are mountains."},
 {o:["Copper","Bronze","Brass","Steel"],a:"Copper",why:"Copper is an element; the others are alloys."},
 {o:["Square","Rectangle","Rhombus","Sphere"],a:"Sphere",why:"Sphere is three-dimensional; the others are plane shapes."},
 {o:["January","March","May","June"],a:"June",why:"June has 30 days; the others have 31."},
 {o:["Oxygen","Hydrogen","Nitrogen","Water"],a:"Water",why:"Water is a compound; the others are elements."},
 {o:["Cheetah","Leopard","Jaguar","Wolf"],a:"Wolf",why:"Wolf belongs to the dog family; the others are big cats."},
 {o:["Novel","Biography","Atlas","Poetry"],a:"Atlas",why:"Atlas is a book of maps; the others are literary forms."},
 {o:["Ruby","Sapphire","Emerald","Quartz"],a:"Quartz",why:"Quartz is a mineral family; the others are precious gemstones."},
 {o:["North","South","East","Up"],a:"Up",why:"Up is vertical; the others are compass directions."},
 {o:["Piano","Harp","Guitar","Drum"],a:"Drum",why:"Drum is a percussion instrument; the others are string instruments."},
 {o:["Ant","Bee","Butterfly","Spider"],a:"Spider",why:"Spider is an arachnid; the others are insects."},
 {o:["Liver","Heart","Lung","Femur"],a:"Femur",why:"Femur is a bone; the others are organs."},
 {o:["Venus","Mars","Earth","Moon"],a:"Moon",why:"Moon is a natural satellite; the others are planets."},
 {o:["Gold","Silver","Platinum","Diamond"],a:"Diamond",why:"Diamond is a form of carbon; the others are metals."},
 {o:["Poet","Novelist","Playwright","Publisher"],a:"Publisher",why:"Publisher produces and distributes works; the others create literary works."},
 {o:["Cairo","Tokyo","Lisbon","Sahara"],a:"Sahara",why:"Sahara is a desert; the others are cities."},
 {o:["Frog","Salamander","Newt","Lizard"],a:"Lizard",why:"Lizard is a reptile; the others are amphibians."},
 {o:["Square","Cube","Pyramid","Cylinder"],a:"Square",why:"Square is two-dimensional; the others are three-dimensional solids."},
 {o:["Carbon","Oxygen","Helium","Granite"],a:"Granite",why:"Granite is a rock; the others are chemical elements."},
 {o:["Rose","Daisy","Sunflower","Moss"],a:"Moss",why:"Moss is non-flowering; the others are flowering plants."},
 {o:["Monday","Tuesday","Friday","April"],a:"April",why:"April is a month; the others are weekdays."},
 {o:["Lake","Pond","Reservoir","Mountain"],a:"Mountain",why:"Mountain is a landform; the others are bodies of water."},
 {o:["Compass","Thermometer","Barometer","Microscope"],a:"Microscope",why:"Microscope magnifies tiny objects; the others measure direction or weather."},
 {o:["Cobalt","Nickel","Iron","Granite"],a:"Granite",why:"Granite is a rock; the others are metals."},
 {o:["Falcon","Eagle","Hawk","Penguin"],a:"Penguin",why:"Penguin is flightless; the others are birds adapted for flight."},
 {o:["Mercury","Venus","Earth","Pluto"],a:"Pluto",why:"Pluto is classified as a dwarf planet; the others are planets."},
 {o:["Asia","Africa","Europe","Pacific"],a:"Pacific",why:"Pacific is an ocean; the others are continents."},
 {o:["Soprano","Alto","Tenor","Violin"],a:"Violin",why:"Violin is an instrument; the others are vocal ranges."},
 {o:["Rectangle","Pentagon","Hexagon","Triangle"],a:"Rectangle",why:"Rectangle has four sides; the others listed have three, five or six."},
 {o:["Oak","Pine","Maple","Mushroom"],a:"Mushroom",why:"Mushroom is a fungus; the others are trees."},
 {o:["Copper","Aluminium","Iron","Plastic"],a:"Plastic",why:"Plastic is not a metal; the others are metals."},
 {o:["Hockey","Tennis","Badminton","Piano"],a:"Piano",why:"Piano is a musical instrument; the others are sports."},
 {o:["Dolphin","Seal","Walrus","Crocodile"],a:"Crocodile",why:"Crocodile is a reptile; the others are mammals."},
 {o:["Earth","Mars","Jupiter","Andromeda"],a:"Andromeda",why:"Andromeda is a galaxy; the others are planets."},
 {o:["Kilometre","Centimetre","Millimetre","Litre"],a:"Litre",why:"Litre measures volume; the others measure length."},
 {o:["Rose","Tulip","Lily","Pine"],a:"Pine",why:"Pine is a tree; the others are flowering plants."},
 {o:["Chess","Checkers","Go","Swimming"],a:"Swimming",why:"Swimming is a physical sport; the others are board games."},
 {o:["Sodium","Potassium","Calcium","Salt"],a:"Salt",why:"Salt is a compound; the others are elements."},
 {o:["Whale","Bat","Dolphin","Penguin"],a:"Penguin",why:"Penguin is a bird; the others are mammals."},
 {o:["Spring","Summer","Autumn","January"],a:"January",why:"January is a month; the others are seasons."},
 {o:["Mercury","Mars","Jupiter","Europa"],a:"Europa",why:"Europa is a moon; the others are planets."},
 {o:["Poem","Essay","Novel","Dictionary"],a:"Dictionary",why:"Dictionary is a reference work; the others are literary compositions."},
 {o:["Triangle","Pentagon","Octagon","Circle"],a:"Circle",why:"Circle has no straight sides; the others are polygons."},
 {o:["Atlantic","Indian","Arctic","Mediterranean"],a:"Mediterranean",why:"Mediterranean is a sea; the others are oceans."},
 {o:["Bee","Ant","Wasp","Scorpion"],a:"Scorpion",why:"Scorpion is an arachnid; the others are insects."},

 {o:["Violin","Cello","Flute","Viola"],a:"Flute",why:"Flute is a wind instrument; the others are string instruments."},
 {o:["Eagle","Falcon","Owl","Dolphin"],a:"Dolphin",why:"Dolphin is a mammal; the others are birds."},
 {o:["Mercury","Venus","Mars","Europa"],a:"Europa",why:"Europa is a moon; the others are planets."},
 {o:["Novel","Poem","Play","Compass"],a:"Compass",why:"Compass is a navigation tool; the others are literary forms."},
 {o:["Copper","Silver","Gold","Granite"],a:"Granite",why:"Granite is a rock; the others are metals."},
 {o:["Rose","Tulip","Orchid","Fern"],a:"Fern",why:"Fern reproduces by spores; the others are flowering plants."},
 {o:["Whisper","Murmur","Shout","Silence"],a:"Silence",why:"Silence is the absence of sound; the others are ways of speaking."},
 {o:["Painter","Sculptor","Composer","Gallery"],a:"Gallery",why:"A gallery is a place; the others are creators."},
 {o:["January","April","August","Tuesday"],a:"Tuesday",why:"Tuesday is a weekday; the others are months."},
 {o:["Maple","Oak","Pine","Lily"],a:"Lily",why:"Lily is a flowering plant; the others are trees."}
];
export function getOddPuzzle(date:string,slot:number):Puzzle & {options:string[];explanation:string}{
 const seed=seedFor(date,slot),item=oddWordSets[((seed%oddWordSets.length)+oddWordSets.length)%oddWordSets.length],options=shuffled(item.o,seed+17);
 return {id:"odd:"+item.a+":"+options.join(","),question:"Read the words carefully. Which one does not belong with the others?",options,answer:item.a,explanation:item.why};
}
const answerPools:Record<string,string[]>={
 capital:Array.from(new Set(DAILY_GK_QUESTIONS.filter(x=>x.id.startsWith("capital-")).map(x=>x.answer))),
 element:Array.from(new Set(DAILY_GK_QUESTIONS.filter(x=>x.id.startsWith("element-")).map(x=>x.answer))),
 science:Array.from(new Set(DAILY_GK_QUESTIONS.filter(x=>x.id.startsWith("science-")).map(x=>x.answer))),
 geography:Array.from(new Set(DAILY_GK_QUESTIONS.filter(x=>x.id.startsWith("geography-")).map(x=>x.answer)))
};
type ExtendedQuizItem={id:string;q:string;a:string;o:[string,string,string,string];topic:string};
const extendedQuizBank:ExtendedQuizItem[]=[
{id:"leaf-pigment",q:"Which pigment gives most healthy leaves their green colour?",a:"Chlorophyll",o:["Chlorophyll","Melanin","Keratin","Haemoglobin"],topic:"Nature"},
{id:"bat-navigation",q:"How do many bats locate insects in darkness?",a:"Echolocation",o:["Echolocation","Magnetic ink","Infrared vision","Scent trails alone"],topic:"Nature"},
{id:"tide-driver",q:"Which celestial body's gravity is the main driver of Earth's ocean tides?",a:"The Moon",o:["The Moon","Mars","The North Star","The asteroid belt"],topic:"Earth Science"},
{id:"rock-lava",q:"What kind of rock forms when molten rock cools and solidifies?",a:"Igneous rock",o:["Igneous rock","Sedimentary rock","Metamorphic rock","Limestone soil"],topic:"Earth Science"},
{id:"humidity-tool",q:"Which instrument is designed to measure humidity in the air?",a:"Hygrometer",o:["Hygrometer","Anemometer","Altimeter","Caliper"],topic:"Weather"},
{id:"lightning-thunder",q:"Why is lightning usually seen before its thunder is heard?",a:"Light travels faster than sound",o:["Light travels faster than sound","Thunder begins only after rain stops","Lightning occurs closer to the ground","Clouds absorb the first sound waves"],topic:"Weather"},
{id:"plant-thorns",q:"In many dry-climate plants, what is one advantage of having leaves reduced to spines?",a:"Less water is lost from the leaf surface",o:["Less water is lost from the leaf surface","More sunlight is absorbed by roots","Seeds are produced without flowers","The plant no longer needs minerals"],topic:"Nature"},
{id:"bee-dance",q:"What information can a honeybee communicate with its waggle dance?",a:"The direction and distance of a food source",o:["The direction and distance of a food source","The age of every bee in the hive","The temperature of distant rivers","The exact number of flowers in a field"],topic:"Nature"},
{id:"polar-insulation",q:"Which combination helps polar bears stay warm in Arctic conditions?",a:"Dense fur and a thick layer of body fat",o:["Dense fur and a thick layer of body fat","Bare skin and long exposed ears","Thin scales and hollow bones","Feathers and a waterproof beak"],topic:"Nature"},
{id:"ecosystem-keystone",q:"What makes a species a keystone species in an ecosystem?",a:"Its effects on the ecosystem are unusually large for its abundance",o:["Its effects on the ecosystem are unusually large for its abundance","It is always the largest animal in the habitat","It lives only in one country","It produces the most seeds of every species"],topic:"Ecology"},
{id:"monotreme",q:"Which animal is a mammal that lays eggs?",a:"Platypus",o:["Platypus","Otter","Koala","Dolphin"],topic:"Nature"},
{id:"lichen",q:"A lichen is best described as a close partnership involving a fungus and which other organism?",a:"An alga or cyanobacterium",o:["An alga or cyanobacterium","A small flowering tree","A freshwater fish","A parasitic worm"],topic:"Nature"},
{id:"pollination",q:"What happens during pollination in flowering plants?",a:"Pollen is transferred to a flower's receptive stigma",o:["Pollen is transferred to a flower's receptive stigma","A seed absorbs water and sprouts","Roots take minerals from the soil","A fruit releases its stored sugar"],topic:"Nature"},
{id:"bird-migration",q:"What is seasonal migration in birds?",a:"Regular movement between regions at different times of year",o:["Regular movement between regions at different times of year","A change from feathers to fur","A permanent loss of flight","The daily opening of a nest"],topic:"Nature"},
{id:"watershed",q:"What is a watershed in geography?",a:"An area of land draining into a shared water system",o:["An area of land draining into a shared water system","A deep ocean trench","A mountain made entirely of ice","A wall built across a desert"],topic:"Geography"},
{id:"fjord",q:"What is a fjord?",a:"A deep, narrow sea inlet bordered by steep sides",o:["A deep, narrow sea inlet bordered by steep sides","A broad grassland with scattered trees","A low island made by coral alone","A river delta in a dry desert"],topic:"Geography"},
{id:"isthmus",q:"Which landform is a narrow strip of land connecting two larger land areas?",a:"Isthmus",o:["Isthmus","Peninsula","Archipelago","Plateau"],topic:"Geography"},
{id:"delta-formation",q:"How does a river delta commonly form?",a:"Sediment is deposited where a river enters a slower body of water",o:["Sediment is deposited where a river enters a slower body of water","A glacier cuts a deep valley below sea level","Wind removes every layer of bedrock","A volcano collapses into a circular lake"],topic:"Geography"},
{id:"equator",q:"Which imaginary line circles Earth at zero degrees latitude?",a:"The Equator",o:["The Equator","The Prime Meridian","The Tropic of Cancer","The Arctic Circle"],topic:"Geography"},
{id:"isobar-weather",q:"On a weather map, what does an isobar connect?",a:"Places with equal air pressure",o:["Places with equal air pressure","Places at equal altitude","Cities with equal populations","Rivers with equal flow speed"],topic:"Weather"},
{id:"cumulonimbus",q:"Which cloud type is most associated with thunderstorms and towering vertical growth?",a:"Cumulonimbus",o:["Cumulonimbus","Cirrus","Stratus","Cirrostratus"],topic:"Weather"},
{id:"monsoon",q:"What most distinguishes a monsoon climate pattern?",a:"A seasonal change in prevailing winds that often brings wet and dry periods",o:["A seasonal change in prevailing winds that often brings wet and dry periods","A daily reversal of ocean tides only","Rainfall that occurs exclusively at night","A permanent absence of seasonal changes"],topic:"Weather"},
{id:"iris",q:"Which part of the human eye adjusts the size of the pupil?",a:"Iris",o:["Iris","Retina","Cornea","Optic nerve"],topic:"Human Body"},
{id:"tendon",q:"What tissue connects a muscle to a bone?",a:"Tendon",o:["Tendon","Ligament","Cartilage","Epidermis"],topic:"Human Body"},
{id:"bile-production",q:"Which organ produces bile to help with digestion?",a:"Liver",o:["Liver","Pancreas","Spleen","Urinary bladder"],topic:"Human Body"},
{id:"bile-storage",q:"Which organ stores bile before it is released into the digestive tract?",a:"Gallbladder",o:["Gallbladder","Appendix","Thyroid gland","Adrenal gland"],topic:"Human Body"},
{id:"retina",q:"Which part of the eye contains light-sensitive cells that begin visual signalling?",a:"Retina",o:["Retina","Iris","Eyelid","Tear duct"],topic:"Human Body"},
{id:"kidney",q:"What is a key function of the kidneys?",a:"Filtering blood and helping form urine",o:["Filtering blood and helping form urine","Producing bile for fat digestion","Pumping air into the lungs","Making digestive chewing movements"],topic:"Human Body"},
{id:"bone-marrow",q:"Where are most new blood cells produced in an adult human?",a:"Bone marrow",o:["Bone marrow","Outer skin layer","Gallbladder","Lens of the eye"],topic:"Human Body"},
{id:"enzyme",q:"What is the main role of an enzyme in a living organism?",a:"To speed up a chemical reaction",o:["To speed up a chemical reaction","To store every genetic instruction","To form the body's outer skeleton","To carry oxygen only in plants"],topic:"Biology"},
{id:"antigen",q:"What is an antigen in immunology?",a:"A substance that can be recognised by the immune system and trigger a response",o:["A substance that can be recognised by the immune system and trigger a response","A hormone that carries oxygen","A cell that digests food in the stomach","A mineral stored only in teeth"],topic:"Biology"},
{id:"biodegradable",q:"What does biodegradable mean when describing a material?",a:"It can be broken down by biological processes",o:["It can be broken down by biological processes","It dissolves instantly in any liquid","It can never change form","It is always made from metal"],topic:"Environment"},
{id:"acid-rain",q:"Which emissions are major contributors to acid rain?",a:"Sulfur dioxide and nitrogen oxides",o:["Sulfur dioxide and nitrogen oxides","Oxygen and water vapour alone","Helium and neon","Hydrogen and argon alone"],topic:"Environment"},
{id:"compost",q:"What is mature compost mainly made from?",a:"Decomposed organic material",o:["Decomposed organic material","Crushed glass and metal","Fresh petroleum","Unprocessed granite"],topic:"Environment"},
{id:"wind-renewable",q:"Why is wind energy classed as renewable?",a:"Wind is continually replenished by atmospheric processes",o:["Wind is continually replenished by atmospheric processes","Wind turbines create new fossil fuels","Wind never changes direction","Wind energy requires no equipment"],topic:"Environment"},
{id:"silk-road",q:"The historic Silk Road linked East Asia with western regions largely through which broad area?",a:"Central Asia",o:["Central Asia","The Caribbean islands","Southern Antarctica","The Amazon basin"],topic:"History"},
{id:"cuneiform",q:"Which ancient writing system used wedge-shaped marks pressed into clay?",a:"Cuneiform",o:["Cuneiform","Linear B","Runic script","Morse code"],topic:"History"},
{id:"rosetta-stone",q:"What major scholarly achievement did the Rosetta Stone help make possible?",a:"Deciphering Egyptian hieroglyphs",o:["Deciphering Egyptian hieroglyphs","Translating the first Latin Bible","Reading the Indus script completely","Reconstructing the Roman road network"],topic:"History"},
{id:"magna-carta",q:"Which medieval document is famous for placing limits on the English king's authority?",a:"Magna Carta",o:["Magna Carta","Edict of Milan","Treaty of Tordesillas","Code of Hammurabi"],topic:"History"},
{id:"gutenberg",q:"Which invention is Johannes Gutenberg especially associated with in European history?",a:"Movable-type printing press",o:["Movable-type printing press","The magnetic compass","The steam turbine","The mechanical clock"],topic:"History"},
{id:"machu-picchu",q:"In which present-day country is Machu Picchu located?",a:"Peru",o:["Peru","Bolivia","Ecuador","Chile"],topic:"History"},
{id:"angkor-wat",q:"Angkor Wat is a famous historic temple complex in which country?",a:"Cambodia",o:["Cambodia","Thailand","Laos","Myanmar"],topic:"History"},
{id:"archaeology",q:"What is the main focus of archaeology?",a:"Studying past human societies through material remains",o:["Studying past human societies through material remains","Predicting daily weather from cloud shapes","Classifying only living insects","Mapping the movement of current satellites"],topic:"History"},
{id:"artifact",q:"In archaeology, what is an artifact?",a:"An object made or modified by people",o:["An object made or modified by people","A naturally occurring mountain range","A written forecast of future events","A species found only in the ocean"],topic:"History"},
{id:"fresco",q:"What is a fresco in visual art?",a:"A painting made on freshly applied plaster",o:["A painting made on freshly applied plaster","A sculpture carved from a single tree","A woven cloth used as a map","A drawing made only with charcoal"],topic:"Art"},
{id:"sonnet",q:"What is a sonnet traditionally defined as?",a:"A poem of fourteen lines",o:["A poem of fourteen lines","A play written for two actors","A prose story without paragraphs","A song with no repeated sounds"],topic:"Literature"},
{id:"haiku",q:"Haiku is a traditional short poetic form associated with which country?",a:"Japan",o:["Japan","Spain","Egypt","Brazil"],topic:"Literature"},
{id:"odyssey",q:"Which ancient Greek poet is traditionally credited with the epic poem The Odyssey?",a:"Homer",o:["Homer","Sophocles","Herodotus","Aristophanes"],topic:"Literature"},
{id:"palindrome",q:"What is a palindrome?",a:"A sequence that reads the same forwards and backwards",o:["A sequence that reads the same forwards and backwards","A word borrowed from another language","A poem with no punctuation","A sentence containing only verbs"],topic:"Language"},
{id:"etymology",q:"What does etymology study?",a:"The origins and historical development of words",o:["The origins and historical development of words","The soundproofing of buildings","The formation of mountain ranges","The classification of musical instruments"],topic:"Language"},
{id:"homophone",q:"Which term describes words that sound alike but have different meanings, and often different spellings?",a:"Homophones",o:["Homophones","Synonyms","Antonyms","Acronyms"],topic:"Language"},
{id:"metaphor",q:"Which figure of speech describes one thing as another to suggest a comparison without using “like” or “as”?",a:"Metaphor",o:["Metaphor","Simile","Alliteration","Onomatopoeia"],topic:"Language"},
{id:"oxymoron",q:"Which phrase is an example of an oxymoron?",a:"Deafening silence",o:["Deafening silence","The blue ocean","A bright lamp","The gentle breeze"],topic:"Language"},
{id:"prefix",q:"In the word “preview,” what is “pre-”?",a:"A prefix",o:["A prefix","A suffix","A root word","A plural ending"],topic:"Language"},
{id:"oboe",q:"Which orchestral instrument commonly uses a double reed?",a:"Oboe",o:["Oboe","Flute","French horn","Timpani"],topic:"Music"},
{id:"chiaroscuro",q:"In painting, what does chiaroscuro refer to?",a:"The use of strong contrasts between light and dark",o:["The use of strong contrasts between light and dark","A painting made only from blue pigments","A technique for weaving coloured thread","A method of carving letters in stone"],topic:"Art"},
{id:"persistence-memory",q:"Who painted The Persistence of Memory, famous for its melting-looking clocks?",a:"Salvador Dalí",o:["Salvador Dalí","René Magritte","Claude Monet","Pablo Picasso"],topic:"Art"},
{id:"hamlet",q:"Who wrote the tragedy Hamlet?",a:"William Shakespeare",o:["William Shakespeare","Christopher Marlowe","Charles Dickens","Geoffrey Chaucer"],topic:"Literature"},
{id:"mayonnaise",q:"Mayonnaise is an example of which kind of food mixture?",a:"An emulsion",o:["An emulsion","A crystal","A fermentation culture","A suspension of sand"],topic:"Food Science"},
{id:"bread-fermentation",q:"What gas produced by yeast helps bread dough rise?",a:"Carbon dioxide",o:["Carbon dioxide","Helium","Chlorine","Neon"],topic:"Food Science"},
{id:"maillard",q:"Which process is chiefly responsible for the browning of seared bread crust and roasted foods?",a:"Maillard reaction",o:["Maillard reaction","Osmosis","Photosynthesis","Crystallisation"],topic:"Food Science"},
{id:"white-balance",q:"In photography, what does white balance primarily adjust?",a:"The colour cast caused by the lighting",o:["The colour cast caused by the lighting","The physical weight of the camera","The lens's focal length","The number of pictures stored on a card"],topic:"Photography"},
{id:"shutter-speed",q:"In photography, what does shutter speed control?",a:"How long the sensor is exposed to light",o:["How long the sensor is exposed to light","How many lenses a camera has","The camera's screen size","The colour name of the subject"],topic:"Photography"},
{id:"negative-space",q:"In visual design, what is negative space?",a:"The relatively empty area around and between subjects",o:["The relatively empty area around and between subjects","A photograph with reversed colours","The shadow printed below every object","A design that uses only dark colours"],topic:"Design"},
{id:"dns",q:"What does the Domain Name System mainly do on the internet?",a:"Maps domain names to network addresses",o:["Maps domain names to network addresses","Encrypts every file on a computer","Creates electricity for routers","Measures a website's physical weight"],topic:"Technology"},
{id:"firewall",q:"What is the main purpose of a network firewall?",a:"To filter network traffic according to security rules",o:["To filter network traffic according to security rules","To increase a screen's brightness","To repair damaged keyboard keys","To translate every web page into audio"],topic:"Technology"},
{id:"api",q:"In software, what is an API primarily used for?",a:"Letting software components communicate through defined rules",o:["Letting software components communicate through defined rules","Compressing a laptop's battery","Replacing all databases with images","Preventing every program from exchanging data"],topic:"Technology"},
{id:"cache",q:"Why does software use a cache?",a:"To keep likely-needed data for faster access",o:["To keep likely-needed data for faster access","To permanently delete every old file","To turn a web address into a password","To prevent a computer from using memory"],topic:"Technology"},
{id:"gps",q:"What does a GPS receiver use to estimate its location?",a:"Signals from navigation satellites",o:["Signals from navigation satellites","The colour of nearby roads","The Earth's magnetic poles alone","Signals from underwater microphones"],topic:"Technology"},
{id:"qr",q:"What kind of code is a QR code?",a:"A two-dimensional barcode",o:["A two-dimensional barcode","A type of fingerprint sensor","A printed musical scale","A satellite navigation antenna"],topic:"Technology"},
{id:"open-source",q:"What is a defining feature of open-source software?",a:"Its source code is available under a licence that permits specified reuse",o:["Its source code is available under a licence that permits specified reuse","It can only run without an internet connection","It never receives updates","It cannot be used by businesses"],topic:"Technology"},
{id:"end-to-end",q:"In end-to-end encryption, who should be able to decrypt the message content?",a:"The communicating endpoints",o:["The communicating endpoints","Every router carrying the message","Any person who knows the sender's name","All public websites"],topic:"Technology"},
{id:"algorithm",q:"What is an algorithm?",a:"A defined sequence of steps for solving a problem or completing a task",o:["A defined sequence of steps for solving a problem or completing a task","A physical cable connecting two buildings","A picture format used only for photographs","A rule that prevents all software updates"],topic:"Technology"},
{id:"watermark",q:"In document publishing, what is a watermark commonly used for?",a:"Showing ownership, status or a document identifier",o:["Showing ownership, status or a document identifier","Increasing the paper's thickness","Replacing every page number","Making text readable only upside down"],topic:"Publishing"},
{id:"cold-chain",q:"What is the purpose of a cold chain when transporting food or medicine?",a:"Keeping items within a required temperature range",o:["Keeping items within a required temperature range","Moving every package only at night","Removing all labels from the packaging","Making products heavier before delivery"],topic:"Everyday Knowledge"},
{id:"honing",q:"What does honing a kitchen knife mainly do?",a:"Realigns the cutting edge",o:["Realigns the cutting edge","Adds a new handle automatically","Removes rust by freezing the blade","Changes the metal into ceramic"],topic:"Everyday Knowledge"},
{id:"dough-rest",q:"Why is bread dough often allowed to rest after kneading?",a:"It gives the dough time to relax and become easier to shape",o:["It gives the dough time to relax and become easier to shape","It removes all gluten from the flour","It turns yeast into salt","It prevents any gas from forming"],topic:"Food Science"},
{id:"cast-iron",q:"Why does a cast-iron pan tend to retain heat well once heated?",a:"It has substantial thermal mass",o:["It has substantial thermal mass","It contains a built-in electrical heater","It reflects all heat away from food","It produces heat through magnetism"],topic:"Everyday Knowledge"},
{id:"paper-origin",q:"Which civilisation is credited with developing early paper-making in ancient times?",a:"China",o:["China","Ancient Greece","The Inca Empire","Medieval Iceland"],topic:"History"},
{id:"guilds",q:"In many medieval European towns, what was a craft guild mainly concerned with?",a:"Regulating a trade, training members and maintaining standards",o:["Regulating a trade, training members and maintaining standards","Choosing the weather for harvests","Managing ocean tides","Translating every book into Latin"],topic:"History"},
{id:"palimpsest",q:"What is a palimpsest?",a:"A manuscript page reused after earlier writing was erased or scraped away",o:["A manuscript page reused after earlier writing was erased or scraped away","A stone used only to sharpen swords","A map showing underground rivers","A musical instrument made of reeds"],topic:"History"},
{id:"sextant",q:"Which historic navigation instrument measures angles between celestial objects and the horizon?",a:"Sextant",o:["Sextant","Abacus","Thermometer","Pendulum clock"],topic:"Exploration"},
{id:"compass-rose",q:"On a traditional map, what does a compass rose show?",a:"Directions",o:["Directions","Population density","Elevation above sea level","The age of the paper"],topic:"Geography"},
{id:"glacier-carve",q:"Which landform is commonly carved by a moving valley glacier?",a:"A U-shaped valley",o:["A U-shaped valley","A coral atoll","A sand dune ridge","A river levee formed by floods"],topic:"Earth Science"},
{id:"metamorphic",q:"What usually causes existing rock to become metamorphic rock?",a:"Heat and pressure changing the rock without fully melting it",o:["Heat and pressure changing the rock without fully melting it","Only loose sand settling at a river mouth","Water freezing inside a cloud","Wind arranging shells on a beach"],topic:"Earth Science"},
{id:"seed-bank",q:"Why do conservationists maintain seed banks?",a:"To preserve plant genetic diversity for future use",o:["To preserve plant genetic diversity for future use","To make all plants flower at the same time","To replace every natural habitat","To prevent seeds from ever germinating"],topic:"Environment"},
{id:"animal-camouflage",q:"What is camouflage most directly useful for in wild animals?",a:"Blending into surroundings to avoid detection",o:["Blending into surroundings to avoid detection","Producing food from sunlight","Keeping track of calendar dates","Making bones softer"],topic:"Nature"},
{id:"food-web",q:"What does a food web represent in an ecosystem?",a:"Interconnected feeding relationships among organisms",o:["Interconnected feeding relationships among organisms","The route used by one migrating bird only","A map of underground mineral deposits","A list of weather forecasts for farms"],topic:"Ecology"},
{id:"coral-bleaching",q:"What commonly causes coral bleaching?",a:"Stress that leads corals to lose their symbiotic algae",o:["Stress that leads corals to lose their symbiotic algae","Corals growing too many shells","A sudden increase in sand on mountain tops","Fish removing all salt from seawater"],topic:"Ecology"},
{id:"library-catalogue",q:"What is the main purpose of a library catalogue?",a:"Helping users locate and identify library materials",o:["Helping users locate and identify library materials","Recording the weather in each reading room","Translating all novels automatically","Deciding which books are historically true"],topic:"Everyday Knowledge"},
{id:"archipelago",q:"What is an archipelago?",a:"A group or chain of islands",o:["A group or chain of islands","A flat plain beside a river","A narrow land bridge","A mountain pass filled with snow"],topic:"Geography"},
{id:"peninsula",q:"Which description best defines a peninsula?",a:"Land surrounded by water on most, but not all, sides",o:["Land surrounded by water on most, but not all, sides","Land completely enclosed by other land","A group of islands far offshore","A deep valley carved by a river"],topic:"Geography"},
{id:"delta-vs-estuary",q:"What is a common feature of an estuary?",a:"Fresh water from rivers mixes with salty seawater",o:["Fresh water from rivers mixes with salty seawater","A glacier covers the river's entire course","Only rainwater can enter it","It is always far from the coast"],topic:"Geography"},
{id:"mangrove",q:"Why are mangrove forests important along many tropical coasts?",a:"They shelter wildlife and help protect shorelines from erosion",o:["They shelter wildlife and help protect shorelines from erosion","They prevent all tides from reaching land","They grow only on dry mountain peaks","They turn seawater into fresh water instantly"],topic:"Environment"},
{id:"museum-provenance",q:"In a museum, what does an object's provenance describe?",a:"Its documented history of ownership and origin",o:["Its documented history of ownership and origin","The object's weight under water","The paint colour used in the gallery","The daily weather where it is displayed"],topic:"Art"},
{id:"restoration",q:"What is the main aim of conservation restoration for an old artwork?",a:"Stabilising and preserving it while respecting its original material",o:["Stabilising and preserving it while respecting its original material","Making it look brand new regardless of evidence","Replacing every original part with plastic","Changing the artist's style to a modern one"],topic:"Art"},
{id:"soundproofing",q:"Which approach most directly reduces sound passing through a wall?",a:"Adding suitable mass and acoustic insulation",o:["Adding suitable mass and acoustic insulation","Painting the wall a darker colour","Using a brighter light nearby","Placing a mirror on the ceiling"],topic:"Everyday Science"},
{id:"thermos",q:"How does a vacuum layer help a thermos keep a drink hot or cold?",a:"It reduces heat transfer by conduction and convection",o:["It reduces heat transfer by conduction and convection","It creates heat from stored sunlight","It removes all molecules from the drink","It makes the container's outside radioactive"],topic:"Everyday Science"},
{id:"lighthouse",q:"What is the main purpose of a lighthouse's light?",a:"To help vessels identify coastlines and navigation hazards",o:["To help vessels identify coastlines and navigation hazards","To measure the depth of every ocean","To send fresh water to ships","To predict the exact time of high tide"],topic:"Exploration"},
{id:"weather-vane",q:"What does a weather vane indicate?",a:"The direction from which the wind is blowing",o:["The direction from which the wind is blowing","The amount of rainfall yesterday","The air's chemical composition","The distance to the nearest river"],topic:"Weather"},
{id:"greenhouse-effect",q:"What is the greenhouse effect in Earth's atmosphere?",a:"Certain gases absorb and re-emit outgoing infrared energy",o:["Certain gases absorb and re-emit outgoing infrared energy","Ozone creates the planet's gravity","Clouds stop all sunlight from reaching the ground","Oceans produce all atmospheric nitrogen"],topic:"Climate"},
{id:"museum-curator",q:"What is a museum curator's central responsibility?",a:"Researching, caring for and interpreting a collection",o:["Researching, caring for and interpreting a collection","Writing every visitor's travel itinerary","Building all the objects in the collection","Controlling the city's public transport"],topic:"Culture"},
{id:"atlas",q:"What is an atlas?",a:"A collection of maps",o:["A collection of maps","A list of musical scores","A catalogue of medicines","A book of weather instruments"],topic:"Geography"},
{id:"fable",q:"What is a common feature of a fable?",a:"A brief story that conveys a lesson, often using animal characters",o:["A brief story that conveys a lesson, often using animal characters","A legal document listing property boundaries","A poem with exactly fourteen lines","A report containing only measurements"],topic:"Literature"},
{id:"stage-directions",q:"In a play script, what do stage directions usually describe?",a:"Actions, movements or setting details for a performance",o:["Actions, movements or setting details for a performance","The retail price of each printed copy","The biography of every reader","The hidden meaning of every rhyme"],topic:"Theatre"},
{id:"subtitle",q:"What is the main purpose of subtitles in a video?",a:"Displaying spoken dialogue or relevant audio information as text",o:["Displaying spoken dialogue or relevant audio information as text","Increasing the video frame rate","Changing the camera's focus automatically","Removing the need for any soundtrack"],topic:"Media"},
{id:"public-domain",q:"What does public domain generally mean for a work?",a:"It is not protected by copyright restrictions that would otherwise limit use",o:["It is not protected by copyright restrictions that would otherwise limit use","It can only be read in a public library","Its author must remain anonymous","It is available only to government offices"],topic:"Publishing"},
{id:"fair-trade",q:"What is a central aim of fair-trade certification?",a:"Supporting more equitable trading conditions for producers",o:["Supporting more equitable trading conditions for producers","Guaranteeing that every product is locally made","Ensuring no product ever travels by ship","Replacing all quality standards with one price"],topic:"Everyday Knowledge"},
{id:"reusable",q:"What is the practical environmental advantage of reusing a durable container?",a:"It can reduce demand for new materials and single-use packaging",o:["It can reduce demand for new materials and single-use packaging","It makes every waste stream disappear","It guarantees the container needs no cleaning","It increases the amount of packaging used each time"],topic:"Environment"},
{id:"urban-canopy",q:"What is an urban tree canopy?",a:"The layer of tree crowns covering parts of a town or city",o:["The layer of tree crowns covering parts of a town or city","A glass roof on every city building","An underground train network","A map of a city's sewer pipes"],topic:"Environment"},
{id:"compass-magnet",q:"Why does a magnetic compass needle align roughly north–south?",a:"It responds to Earth's magnetic field",o:["It responds to Earth's magnetic field","It follows the Sun's heat only","It is pulled toward the nearest ocean","It detects radio stations in the ground"],topic:"Navigation"},
{id:"optical-fibre",q:"How does optical fibre carry information over long distances?",a:"As pulses of light guided through the fibre",o:["As pulses of light guided through the fibre","As sound waves moving through solid glass","As ink marks inside the cable","As magnetic north changes along the route"],topic:"Technology"},
{id:"e-ink",q:"What is a common advantage of e-ink displays in e-readers?",a:"They can remain readable in bright light and use little power for static pages",o:["They can remain readable in bright light and use little power for static pages","They produce continuous paper without a screen","They always show full-colour video more smoothly than OLED","They work only when connected to a printer"],topic:"Technology"},
{id:"metadata",q:"In a digital photo, what can metadata record?",a:"Details such as capture time, camera settings or location",o:["Details such as capture time, camera settings or location","The complete meaning of the image","The photographer's future plans","An automatic guarantee that the image is authentic"],topic:"Technology"},
{id:"accessibility-alt",q:"What is the purpose of alt text on a meaningful web image?",a:"To describe the image for people who cannot see it",o:["To describe the image for people who cannot see it","To make the image file larger","To hide the image from all search engines","To change the image's colour profile"],topic:"Technology"},
{id:"font-serif",q:"What visual feature distinguishes a serif typeface?",a:"Small finishing strokes at the ends of some letterforms",o:["Small finishing strokes at the ends of some letterforms","Letters are always slanted to the right","Every letter has the same width","All characters are drawn without curves"],topic:"Design"},
{id:"storyboard",q:"In film-making, what is a storyboard mainly used for?",a:"Planning scenes visually before filming or animation",o:["Planning scenes visually before filming or animation","Storing the finished film's soundtrack","Recording audience ticket sales","Testing the chemical safety of costumes"],topic:"Media"},
{id:"soundtrack",q:"What is a film soundtrack?",a:"The recorded audio elements accompanying the film",o:["The recorded audio elements accompanying the film","The list of camera lenses used on set","A map of the filming location","The printed captions only"],topic:"Media"},
{id:"green-room",q:"In theatre, what does “green room” usually refer to?",a:"A backstage waiting or preparation area for performers",o:["A backstage waiting or preparation area for performers","A room where every wall must be green","The public ticket office","A store for gardening tools only"],topic:"Theatre"},
{id:"dovetail",q:"In woodworking, what is a dovetail joint valued for?",a:"Its interlocking shape helps resist being pulled apart",o:["Its interlocking shape helps resist being pulled apart","It joins wood without any contact","It makes timber transparent","It is used only to sharpen blades"],topic:"Craft"},
{id:"kiln",q:"What is a kiln used for in pottery?",a:"Firing clay at high temperatures",o:["Firing clay at high temperatures","Washing pigment out of fabric","Weaving threads into cloth","Measuring the wind at sea"],topic:"Craft"},
{id:"loom",q:"What does a loom do?",a:"Interlaces threads to make fabric",o:["Interlaces threads to make fabric","Fires clay into pottery","Cuts glass into lenses","Presses ink onto metal type"],topic:"Craft"},
{id:"fermentation",q:"What is fermentation in food-making?",a:"Microorganisms transform ingredients, often producing acids, gases or alcohol",o:["Microorganisms transform ingredients, often producing acids, gases or alcohol","Food is frozen until every molecule stops moving","All water is removed by sunlight alone","Ingredients are mixed without any chemical change"],topic:"Food Science"},
{id:"emulsion",q:"What helps keep the oil and water phases mixed in a stable emulsion such as mayonnaise?",a:"An emulsifier such as lecithin in egg yolk",o:["An emulsifier such as lecithin in egg yolk","A piece of dry paper","A magnetic field alone","A layer of crushed glass"],topic:"Food Science"},
{id:"smoke-point",q:"What does an oil's smoke point describe?",a:"The temperature at which it begins producing visible smoke",o:["The temperature at which it begins producing visible smoke","The temperature at which it freezes solid","The time it takes to cool in a fridge","The amount of salt it contains"],topic:"Food Science"},
{id:"kilometre-marker",q:"What is the main purpose of roadside kilometre markers?",a:"To indicate a position or distance along the route",o:["To indicate a position or distance along the route","To show the age of the nearby trees","To measure a vehicle's fuel level","To tell drivers the temperature inside their cars"],topic:"Everyday Knowledge"},
{id:"braille",q:"Which system allows many blind or low-vision readers to read by touch?",a:"Braille",o:["Braille","Semaphore","Morse code by sight only","Phonetic alphabet"],topic:"Accessibility"},
{id:"sign-language",q:"What is sign language?",a:"A language that uses visual-manual signs and grammar",o:["A language that uses visual-manual signs and grammar","A universal code made only of road signs","A system that replaces grammar with random gestures","A written alphabet that can only be whispered"],topic:"Language"},
{id:"oral-history",q:"What does oral history collect as a source for understanding the past?",a:"Recorded recollections and testimonies from people",o:["Recorded recollections and testimonies from people","Only the chemical composition of old coins","Predictions of future political events","Measurements of the height of buildings"],topic:"History"},
{id:"conservation",q:"In heritage conservation, why are repairs often documented carefully?",a:"To preserve a record of what is original and what was changed",o:["To preserve a record of what is original and what was changed","To make every future repair impossible","To prove the object was made yesterday","To replace the need to inspect the object"],topic:"Culture"},
{id:"night-sky-dark-adaptation",q:"Why do stars often become easier to see after spending time in darkness?",a:"The eyes gradually adapt to low light",o:["The eyes gradually adapt to low light","Stars become physically brighter after sunset","The atmosphere removes every cloud","The Moon switches off distant stars"],topic:"Astronomy"},
{id:"moon-phases",q:"What mainly causes the Moon's changing phases as seen from Earth?",a:"We see changing portions of its sunlit half as it orbits Earth",o:["We see changing portions of its sunlit half as it orbits Earth","Earth's shadow covers the Moon every night","The Moon produces changing amounts of its own light","Clouds permanently hide parts of the Moon"],topic:"Astronomy"},
{id:"aurora",q:"What produces Earth's auroras near the polar regions?",a:"Charged particles interact with gases in the upper atmosphere",o:["Charged particles interact with gases in the upper atmosphere","Moonlight reflects off polar ice only","Ocean waves generate coloured clouds","Volcanic ash forms a permanent light curtain"],topic:"Astronomy"},
{id:"telescope",q:"What is the central purpose of an astronomical telescope?",a:"Collecting and focusing light or other electromagnetic signals from distant objects",o:["Collecting and focusing light or other electromagnetic signals from distant objects","Creating stars by magnifying empty space","Measuring the weight of the atmosphere directly","Changing the orbit of planets for observation"],topic:"Astronomy"},
{id:"planetary-rings",q:"What are Saturn's prominent rings made mainly of?",a:"Numerous pieces of ice and rocky material",o:["Numerous pieces of ice and rocky material","A solid metal hoop","Clouds of burning gas only","A continuous ocean surrounding the planet"],topic:"Astronomy"}
];
export function getQuizPuzzle(date:string,slot:number):Puzzle & {options:string[];correctIndex:number;topic:string}{
 const seed=seedFor(date,slot),scienceQuestions=DAILY_GK_QUESTIONS.filter(item=>item.id.startsWith("science-"));
 const scienceTopics=new Set(["Nature","Earth Science","Weather","Ecology","Human Body","Biology","Environment","Food Science","Everyday Science","Climate","Astronomy"]);
 const scienceExtendedQuizBank=extendedQuizBank.filter(item=>scienceTopics.has(item.topic));
 const total=scienceQuestions.length+scienceExtendedQuizBank.length,index=((seed%total)+total)%total;
 if(index>=scienceQuestions.length){
  const item=scienceExtendedQuizBank[index-scienceQuestions.length],options=shuffled(item.o,seed+211);
  return {id:"quiz:"+item.id,question:item.q,answer:item.a,options,correctIndex:options.indexOf(item.a),topic:item.topic};
 }
 const item=scienceQuestions[index],pool=scienceQuestions.map(x=>x.answer).filter(x=>x!==item.answer);
 const options=shuffled([item.answer,...shuffled([...new Set(pool)],seed+73).slice(0,3)],seed+211);
 return {id:"quiz:"+item.id,question:item.question,answer:item.answer,options,correctIndex:options.indexOf(item.answer),topic:"Science"};
}
export function getWorldKnowledgeQuiz(date:string,slot:number):Puzzle & {options:string[];correctIndex:number;topic:string}{
 const seed=seedFor(date,slot),question=getDailyGKQuestion(new Date(date+"T00:00:00Z"),slot),options=getDailyGKOptions(question,seed);
 return {id:"world-quiz:"+question.id,question:question.question,answer:question.answer,options,correctIndex:options.indexOf(question.answer),topic:"World Knowledge"};
}

const logicRiddleBank:Array<{q:string;a:string;o:[string,string,string,string];e:string}>= [
 {q:"Three baskets are labelled APPLES, ORANGES and MIXED. Every label is wrong. You may take one fruit from one basket. Which labelled basket should you choose first to work out all three labels?",a:"MIXED",o:["APPLES","ORANGES","MIXED","Any basket works equally well"],e:"Because every label is wrong, the basket marked MIXED cannot contain a mixture. One fruit identifies its true contents, letting you deduce the other two."},
 {q:"Two doors lead out of a room: one is safe and one is dangerous. One guard always tells the truth and the other always lies, but you do not know which is which. What should you ask either guard to identify the safe door?",a:"Which door would the other guard call safe?",o:["Which door would the other guard call safe?","Which door would the other guard say is dangerous?","Would you and the other guard name the same safe door?","Which door would you choose if the other guard were answering?"],e:"Both guards point to the dangerous door when asked what the other would say, so choose the opposite door."},
 {q:"A key was taken by A, B or C. A says, “B took it.” B says, “I did not take it.” C says, “A is lying.” Exactly one statement is true. Who took the key?",a:"B",o:["A","B","C","The clues do not identify anyone"],e:"If B took it, A's statement is true while B's and C's are false, giving exactly one true statement."},

 {q:"A traveller must take a fox, a goose and a sack of grain across a river. The boat carries the traveller and only one passenger or item; the fox cannot be left alone with the goose, and the goose cannot be left alone with the grain. Which plan works?",a:"Take the goose over; return alone; take the fox over and bring the goose back; take the grain over; return alone; then take the goose over.",o:["Take the goose over; return alone; take the fox over and bring the goose back; take the grain over; return alone; then take the goose over.","Take the fox over; return alone; take the goose over; leave it with the grain; then fetch the sack.","Take the grain over; return with the boat; take the fox over; leave it with the goose; then fetch the grain.","Take the goose over; leave it there; move the fox and grain together; then return for the goose."],e:"The goose is the item that cannot be left with either of the other two, so it must be moved back whenever the fox or grain is transported."},
 {q:"Three switches are outside a closed room; one controls a bulb inside. You may enter the room only once. The bulb becomes warm when lit. How can you identify the right switch?",a:"Turn one switch on for a while, turn it off, turn a second on, then enter and check whether the bulb is lit, warm or cold.",o:["Turn all three switches on and enter to see which one is brightest.","Turn one switch on for a while, turn it off, turn a second on, then enter and check whether the bulb is lit, warm or cold.","Keep switching them rapidly while standing outside, then guess.","Leave every switch off and check only whether the bulb is warm."],e:"A lit bulb identifies the second switch; a warm but unlit bulb identifies the first; a cold, unlit bulb identifies the third."},
 {q:"A room has a puddle of water, broken glass and a dead goldfish. The door and windows are intact. What is the most likely explanation?",a:"The fish bowl or aquarium fell and broke",o:["The fish bowl or aquarium fell and broke","Rain entered through a shattered window","A person carried the fish out in a glass","The room's plumbing burst behind the wall"],e:"A broken glass container, water and a dead fish fit the aquarium explanation without requiring a damaged window or plumbing."},
 {q:"A man pushes his car to a hotel and immediately tells the owner he has lost his fortune. What is the most likely explanation?",a:"He is playing a board game",o:["He is playing a board game","His car has run out of fuel","He has lost his wallet on the road","The hotel has charged him for parking"],e:"The clues describe the familiar board-game situation in which a player moves a car token onto a hotel and goes bankrupt."},
 {q:"A customer asks a bartender for a glass of water. Instead, the bartender points a real-looking pistol at him. The customer says “Thank you” and leaves. What best explains the exchange?",a:"The customer had hiccups, and the fright stopped them",o:["The customer had hiccups, and the fright stopped them","The bartender mistook him for a police officer","The customer asked for the wrong drink","The bartender was warning him about a spill"],e:"A sudden fright can interrupt hiccups, explaining why the customer no longer needed the water."},
 {q:"Before anyone had climbed or mapped Mount Everest, which mountain was the highest on Earth?",a:"Mount Everest",o:["Mount Everest","K2","Kangchenjunga","Lhotse"],e:"Discovering or measuring a mountain does not change its physical height; Everest was still the highest."},
 {q:"Someone walks home through heavy rain without an umbrella or hat. Their clothes are soaked, but not a hair on their head is wet. Which explanation fits best?",a:"The person is bald",o:["The person is bald","They walked under a glass roof","The rain was only falling around their body","Their hair absorbed all the rain"],e:"If the person has no hair, none of their hair can get wet."},
 {q:"What can you hold in your left hand but cannot hold in your right hand?",a:"Your right elbow",o:["Your right elbow","Your left elbow","Your right wristwatch","A cup with a handle"],e:"Your left hand can reach and hold your right elbow, while your right hand cannot hold its own elbow in the same way."},
 {q:"What disappears as soon as you say its name?",a:"Silence",o:["Silence","A whisper","An echo","A secret"],e:"Speaking breaks the silence that existed before the word was spoken."},
 {q:"A person lights a candle, an oil lamp and a fireplace in a room. What must they use first if all are unlit and a match is available?",a:"The match",o:["The candle","The oil lamp","The match","The fireplace"],e:"The match is the ignition source needed before any of the other items can be lit."},
 {q:"What belongs to you, but other people use it more often than you do?",a:"Your name",o:["Your name","Your house key","Your favourite book","Your signature"],e:"Other people often say or write your name when referring to you."},
 {q:"A person says, “I am lying right now.” What is the best description of this statement?",a:"It creates a self-referential paradox with no consistent truth value",o:["It is certainly true","It is certainly false","It creates a self-referential paradox with no consistent truth value","It is true only when whispered"],e:"If the statement is true, it says it is false; if it is false, it appears true. The self-reference prevents a consistent true-or-false assignment."},
 {q:"A card has a letter on one side and a colour on the other. The rule is: “If a card has a vowel, its other side must be red.” You see A, K, RED and BLUE. Which cards must you turn to test the rule?",a:"A and BLUE",o:["A and RED","K and BLUE","A and BLUE","A, K and RED"],e:"A must have red on its reverse. BLUE must not hide a vowel. K and RED cannot disprove the rule."},
 {q:"A person with no brothers or sisters looks at a portrait and says, “That person's father is my father's son.” Who is in the portrait?",a:"Their child",o:["Their parent","Their child","Their cousin","Their spouse"],e:"With no siblings, “my father's son” refers to the speaker. The person in the portrait is the speaker's child."},
 {q:"A prisoner is told: “If your next statement is true, you will be locked away; if it is false, you will be sent away.” What statement creates a contradiction for the judge?",a:"You will send me away.",o:["I am innocent.","You will lock me away.","You will send me away.","I will say nothing."],e:"If the judge sends the prisoner away, the statement is true and the rule demands locking them away; if the judge locks them away, the statement is false and the rule demands sending them away."},
 {q:"A museum's alarm was never triggered. The guard says the thief entered through the window, but the window's dust seal is unbroken and untouched. Which conclusion best fits the evidence?",a:"The thief likely used another entrance",o:["The window probably was not the entry route","The alarm was definitely faulty","The guard must have moved the object","The painting must have been removed earlier"],e:"An untouched window seal contradicts the claim that the thief used that window; the evidence points to another route, though it does not identify the thief."},
 {q:"A barber shaves every person in town who does not shave themselves, and shaves nobody who does shave themselves. Under this rule, who shaves the barber?",a:"No such barber can exist",o:["The barber must shave himself","Another barber must shave him","No such barber can exist","Every resident shaves him"],e:"If the barber shaves himself, the rule says he must not; if he does not, the rule says he must. The description is self-contradictory."},
 {q:"A sealed office has one door. The guard says nobody entered, and the sign-in sheet shows no visitors. A fresh cup of tea sits beside a warm chair. What is the most careful conclusion?",a:"The evidence raises a question but does not identify a visitor",o:["A visitor may have been present earlier","The guard may have prepared the tea","The evidence raises a question but does not identify a visitor","The chair may have been left warm after an earlier meeting"],e:"The tea and chair may be clues, but they do not establish who was present or how the items got there."},
 {q:"A room is locked from the inside. A person leaves through the door, and afterward the door is locked with no damage. Which detail would best explain how this could happen?",a:"The lock can latch automatically when the door closes",o:["The door has an automatic latch","The door has a second keyhole","The hinges allow the door to close firmly","The lock can be engaged when the door closes"],e:"An automatic latch explains how the person can leave and have the door lock behind them without damaging it."},
 {q:"A courier says a parcel was delivered to the correct house. The delivery photo shows a blue front door, but the recipient's house has a red front door. What should be checked first?",a:"Whether the photograph matches the delivery address",o:["Compare the door in the photo with the delivery address","Check the parcel's tracking number against the order","Confirm the delivery time with the recipient","Check whether the address label was printed clearly"],e:"The door mismatch is directly relevant to whether the parcel was left at the right property."},
 {q:"A witness says a painting was removed after the gallery closed. The front-door sensor shows no opening, but a staff passage was not checked. What is the best next step?",a:"Check the staff-passage record",o:["Review the front-door sensor again","Check the staff-passage record","Interview gallery staff about any authorised movement","Assume the inventory record is wrong"],e:"The unchecked passage is a possible route; its record is the next relevant piece of evidence."},
 {q:"A sign says all deliveries must be left at the rear entrance. A courier leaves a parcel at the front desk and claims to have followed the sign. What is the flaw in that explanation?",a:"The parcel was left at the entrance the sign did not specify",o:["The parcel was left at the entrance the sign did not specify","The courier may have mistaken the front desk for the rear entrance","The sign may have been out of date","The parcel may have been intended for another department"],e:"The instruction specifically names the rear entrance, so leaving it at the front desk does not follow the instruction."},
 {q:"A locked cabinet is supposed to contain confidential files. One file is on the desk, while the cabinet is locked and undamaged. What is the strongest conclusion?",a:"The file was not kept in the required cabinet",o:["The file was not kept in the required cabinet","The file may have been temporarily reviewed at the desk","The cabinet may have been unlocked earlier","The file's classification may need checking"],e:"The file's location conflicts with the storage rule; the facts do not reveal who moved it."},
 {q:"A person claims they never entered the garden. Their shoes are clean, but a motion camera shows a person in similar clothing entering. What is the most sensible next step?",a:"Verify the person's identity in the footage",o:["Assume clean shoes prove the claim","Verify the person's identity in the footage","Assume the camera recorded a bird","Conclude that no one entered"],e:"Similar clothing is not enough to identify a person, so the footage must be examined before drawing a conclusion."},
 {q:"A file is labelled FINAL, but its contents say “Draft — awaiting approval” on every page. Which description is best supported?",a:"Its label and contents conflict",o:["It is definitely approved","Its label and contents conflict","The file contains no text","The approval process is complete"],e:"The label suggests a final version while the pages explicitly describe a draft awaiting approval."},
 {q:"A cook says a dish contains no nuts. The recipe on the counter lists almond flour, but the cook says it may be an old recipe. What should be done before serving it to someone with a nut allergy?",a:"Verify the ingredients actually used",o:["Trust the cook without checking","Remove the visible garnish only","Verify the ingredients actually used","Add water to dilute the dish"],e:"The conflicting information must be resolved by confirming the actual ingredients, not by guessing."},
 {q:"A sealed package arrives with an intact seal, but its label lists a blue scarf and the package contains a red scarf of the same style. What is the best first explanation to investigate?",a:"A packing or labelling mistake",o:["The scarf changed colour inside the package","A packing or labelling mistake","The seal proves the label is correct","The delivery address changed the item"],e:"An intact seal makes a packing or labelling error a sensible first possibility to check."},
 {q:"A map marks a footbridge as open, but a notice fixed at the bridge says it is closed today for repairs. Which information should guide someone right now?",a:"The current notice at the bridge",o:["The map, because maps cannot be outdated","The current notice at the bridge","Whichever instruction is shorter","Neither; the bridge is certainly open"],e:"The notice addresses the bridge's current status today; a general map may not reflect temporary closures."},
 {q:"A file's signature is valid, but its date is before the event it describes. What is the clearest concern?",a:"The date may be wrong or the document may be an earlier draft",o:["A valid signature cannot appear on a document","The date may be wrong or the document may be an earlier draft","The event must have been cancelled","The signer cannot read"],e:"The date conflicts with the timeline, suggesting a date error or an earlier version, but not proving which."},
 {q:"A library's catalogue says a book is on Shelf C. Shelf C is empty, but the return trolley contains the same title and edition. What is the most reasonable next action?",a:"Check whether the returned book is awaiting reshelving",o:["Delete the title from the catalogue","Assume the book was stolen","Check whether the returned book is awaiting reshelving","Replace the book with another edition"],e:"The return trolley offers a plausible explanation for why the book is not on its listed shelf."},
 {q:"A witness says the corridor was completely dark when the painting disappeared. The emergency lights were confirmed working throughout the incident. What does this evidence show?",a:"The corridor was not completely dark",o:["The witness stole the painting","The corridor was not completely dark","The main lights were certainly on","The painting was never in the corridor"],e:"Working emergency lights contradict the claim that the corridor was completely dark, but do not identify the thief."},
 {q:"A package's tracking page says “delivered,” while the building's reception log shows no delivery and the recipient has not received it. What is the most useful next step?",a:"Check the delivery proof and location",o:["Assume the recipient is mistaken","Check the delivery proof and location","Delete the tracking record","Order a replacement without checking"],e:"The records conflict, so the carrier's proof and exact drop-off location can help resolve the discrepancy."},
 {q:"A theatre ticket says BALCONY, while an usher directs the guest to the orchestra level. What is the best way to settle the disagreement?",a:"Check the ticket against the venue seating plan",o:["Choose any empty seat","Follow whichever instruction is spoken louder","Check the ticket against the venue seating plan","Assume balcony and orchestra mean the same thing"],e:"The seating plan and ticket together establish the seat the ticket actually describes."},
 {q:"A school rule says borrowed instruments must be returned to the music room. An instrument is missing from the room, and no return is recorded. What can you conclude?",a:"The instrument has not been located in its expected place",o:["A named student stole it","The instrument has not been located in its expected place","The teacher must have lost it","The instrument was never borrowed"],e:"The evidence shows that the instrument is not where expected, but does not establish who moved it or why."},
 {q:"A person says the umbrella has not been used today. It is wet, and it has been raining outside. Which detail would best help test the claim?",a:"Whether the umbrella was already wet before today's rain",o:["The colour of its handle","Whether the umbrella was already wet before today's rain","The time printed on the receipt","The owner's favourite season"],e:"Establishing when the umbrella became wet is relevant to the claim; unrelated details are not."},
 {q:"A building's access log shows no entry after closing. A window is found open, but its dust-covered sill is undisturbed. What is the best conclusion?",a:"The evidence does not support entry through that window",o:["The open window alone proves entry","The evidence does not support entry through that window","The entry log rules out every possible route","The dust proves the window was never opened"],e:"An undisturbed dusty sill weakens the claim that someone climbed through the window, but other evidence may still be needed."},
 {q:"A shop receipt lists a blue coat, but the bag contains a red coat of the same model. What should be checked first?",a:"Whether the wrong item was packed or exchanged",o:["A packing error","A scanning error on the receipt","The wrong item was packed or exchanged","A later exchange may have occurred"],e:"The purchase record and bag contents conflict, so the packing record or a possible exchange is relevant."},
 {q:"A curator finds an exhibit label swapped with the label beside it. Both labels are intact and correctly describe the other exhibit. What is the most likely immediate problem?",a:"The labels were placed in the wrong positions",o:["The exhibits themselves were replaced","The labels were placed in the wrong positions","The descriptions may both be outdated","The labels were printed for a different display"],e:"Because each intact label describes the neighbouring exhibit, the simplest explanation is that their positions were swapped."},
 {q:"A person says they returned a borrowed book to the correct library branch. The receipt shows a different branch, while the book is not on the expected shelf. What should be checked?",a:"The branch recorded on the return receipt",o:["The branch recorded on the return receipt","Whether the book is awaiting reshelving","Whether the catalogue entry is current","Whether the return was logged correctly"],e:"The receipt directly addresses where the book was returned and can help locate it."}
];
export function getLogicRiddlePuzzle(date:string,slot:number):Puzzle & {options:string[];correctIndex:number;explanation:string}{
 const seed=seedFor(date,slot),index=((seed%logicRiddleBank.length)+logicRiddleBank.length)%logicRiddleBank.length,item=logicRiddleBank[index],options=shuffled(item.o,seed+71);
 return {id:"logic-riddle:"+index,question:item.q,answer:item.a,options,correctIndex:options.indexOf(item.a),explanation:item.e,topic:"Logic"};
}
const riddleBank:Array<{q:string;a:string;e:string;o:string[]}>= [
{q:"A prisoner is told: “If you speak a true sentence, you will be hanged; if you speak a false sentence, you will be shot.” What sentence can he say to make either punishment impossible under the rule?",a:"You will shoot me",e:"If shot, the sentence was true and he should be hanged; if hanged, it was false and he should be shot. The rule contradicts itself.",o:["You will shoot me","I will be hanged","I will be shot","You will release me"]},
{q:"A clock loses exactly 6 minutes every hour. It is set correctly at noon. When the faulty clock shows 3:00, what is the actual time?",a:"3:18 PM",e:"The clock runs at 54 minutes per real hour. It needs 3 hours 20 minutes of real time to show 3 hours elapsed.",o:["3:18 PM","3:20 PM","3:24 PM","3:30 PM"]},
{q:"You have 8 identical-looking balls; one is heavier. Using a balance scale only twice, how can you guarantee finding it?",a:"Weigh 3 against 3, then compare one from the heavier group or the remaining pair",e:"If the first weighing balances, the heavy ball is among the two left; otherwise it is in the heavier group of three. A second weighing resolves either case.",o:["Weigh 3 against 3, then compare one from the heavier group or the remaining pair","Weigh 4 against 4, then weigh 2 against 2","Weigh 2 against 2, then weigh the four remaining balls","Weigh 5 against 3, then compare the two heaviest"]},
{q:"A man leaves home, makes three left turns, and returns home. Two masked figures are waiting there. What is happening?",a:"He is a baseball player returning to home plate",e:"The route describes a baseball diamond; the masked figures are the catcher and umpire.",o:["He is a baseball player returning to home plate","He is lost in a one-way street system","He is circling a roundabout","He is returning from a three-sided maze"]},
{q:"A woman has two coins that total 30 cents. One of them is not a nickel. What are the coins?",a:"A quarter and a nickel",e:"One coin is not a nickel—the quarter. The other can be a nickel.",o:["A quarter and a nickel","Three dimes","Two quarters","A twenty-cent coin and a dime"]},
{q:"A room has no windows or doors. Inside are a table and a mirror. How do you get out?",a:"Stop imagining the room",e:"It is a wordplay riddle: the room exists only in the imagined scenario.",o:["Stop imagining the room","Break the mirror and use a shard","Move the table to reveal a trapdoor","Wait until the room becomes visible"]},
{q:"A number has two digits. Its digits add to 9. Reversing the digits makes the number 27 greater. What is the number?",a:"36",e:"63 − 36 = 27 and 3 + 6 = 9.",o:["36","45","27","54"]},
{q:"You see a boat filled with people. It has not sunk, but when you look again you cannot see a single person aboard. Why?",a:"Everyone aboard is married",e:"There is not a single person because everyone is part of a couple.",o:["Everyone aboard is married","The passengers went below deck","The boat reached a fog bank","The people are reflected in the water"]},
{q:"A farmer must cross a river with a fox, a chicken, and grain. The boat carries the farmer and one item. What is the minimum number of one-way crossings?",a:"Seven",e:"Take chicken across, return alone, take fox across, bring chicken back, take grain across, return alone, then take chicken across: seven crossings.",o:["Seven","Five","Six","Nine"]},
{q:"Three boxes are labelled APPLES, ORANGES, and MIXED. Every label is wrong. You may take one fruit from one box. Which box should you choose to identify all three?",a:"The box labelled MIXED",e:"Since every label is wrong, that box cannot be mixed. Its single fruit identifies it, and the other labels follow by elimination.",o:["The box labelled MIXED","The box labelled APPLES","The box labelled ORANGES","Any box, but take two fruits"]},
{q:"A 5-litre jug and a 3-litre jug have no markings. How can you measure exactly 4 litres?",a:"Fill 5, pour into 3, empty 3, transfer the remaining 2, then refill 5 and top up the 3",e:"After transferring 2 litres into the 3-litre jug, fill the 5-litre jug and pour 1 litre into the 3-litre jug; 4 litres remain.",o:["Fill 5, pour into 3, empty 3, transfer the remaining 2, then refill 5 and top up the 3","Fill 3 twice and pour into the 5-litre jug","Fill 5 and pour half into the 3-litre jug","Fill both jugs and subtract their volumes"]},
{q:"A father is four times as old as his son. In 20 years, he will be twice as old as his son. How old is the son now?",a:"10",e:"Let the son's age be x. Father is 4x; 4x+20=2(x+20), so x=10.",o:["10","12","15","20"]}
];
export function getRiddlePuzzle(date:string,slot:number):Puzzle & {explanation:string}{
 const seed=seedFor(date,slot),item=riddleBank[((seed%riddleBank.length)+riddleBank.length)%riddleBank.length];
 return {id:"riddle:"+item.a+":"+item.q,question:item.q,answer:item.a,explanation:item.e,options:shuffled(item.o,seed+41)};
}
export function getSpotPuzzle(date:string,slot:number):{id:string;size:number;target:number;targetIcon:number;baseIcon:number}{
 const seed=seedFor(date,slot),size=seed%3===0?36:25,target=(hash(seed+77)%(size));
 const similarPairs=[[8,9],[10,11],[12,13],[14,15],[16,17],[18,19],[20,21],[22,23]],pair=similarPairs[seed%similarPairs.length],baseIcon=pair[0],targetIcon=pair[1];
 return {id:"spot:"+size+":"+target+":"+targetIcon+":"+baseIcon,size,target,targetIcon,baseIcon};
}
export function getRecallSequence(date:string,slot:number):number[]{
 const seed=seedFor(date,slot),total=6720;let rank=((seed%total)+total)%total;
 const pool=[0,1,2,3,4,5,6,7],out:number[]=[];
 for(let i=0;i<5;i++){const remainingPicks=4-i,block=factorial(pool.length-1)/factorial(pool.length-1-remainingPicks);const choice=Math.floor(rank/block);rank%=block;out.push(pool.splice(choice,1)[0]);}
 return out;
}
