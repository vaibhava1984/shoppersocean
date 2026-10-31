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
    "id": "missing-001",
    "sentence": "Item 1: The word with the opposite meaning to “careless” is ____ .",
    "answer": "meticulous",
    "clue": "Choose the antonym of “careless”.",
    "options": [
      "meticulous",
      "significant",
      "arrive",
      "honesty"
    ]
  },
  {
    "id": "missing-002",
    "sentence": "Item 2: The word with the opposite meaning to “meticulous” is ____ .",
    "answer": "careless",
    "clue": "Choose the antonym of “meticulous”.",
    "options": [
      "complex",
      "melt",
      "tough",
      "careless"
    ]
  },
  {
    "id": "missing-003",
    "sentence": "Item 3: The word with the opposite meaning to “eager” is ____ .",
    "answer": "reluctant",
    "clue": "Choose the antonym of “eager”.",
    "options": [
      "ending",
      "eloquent",
      "reluctant",
      "demolish"
    ]
  },
  {
    "id": "missing-004",
    "sentence": "Item 4: The word with the opposite meaning to “reluctant” is ____ .",
    "answer": "eager",
    "clue": "Choose the antonym of “reluctant”.",
    "options": [
      "meticulous",
      "eager",
      "departure",
      "calm"
    ]
  },
  {
    "id": "missing-005",
    "sentence": "Item 5: The word with the opposite meaning to “gullible” is ____ .",
    "answer": "skeptical",
    "clue": "Choose the antonym of “gullible”.",
    "options": [
      "skeptical",
      "empty",
      "indecisive",
      "pessimistic"
    ]
  },
  {
    "id": "missing-006",
    "sentence": "Item 6: The word with the opposite meaning to “skeptical” is ____ .",
    "answer": "gullible",
    "clue": "Choose the antonym of “skeptical”.",
    "options": [
      "major",
      "unequivocal",
      "ascend",
      "gullible"
    ]
  },
  {
    "id": "missing-007",
    "sentence": "Item 7: The word with the opposite meaning to “fragile” is ____ .",
    "answer": "resilient",
    "clue": "Choose the antonym of “fragile”.",
    "options": [
      "courteous",
      "preserve",
      "resilient",
      "optional"
    ]
  },
  {
    "id": "missing-008",
    "sentence": "Item 8: The word with the opposite meaning to “resilient” is ____ .",
    "answer": "fragile",
    "clue": "Choose the antonym of “resilient”.",
    "options": [
      "deceit",
      "fragile",
      "profound",
      "depart"
    ]
  },
  {
    "id": "missing-009",
    "sentence": "Item 9: The word with the opposite meaning to “implausible” is ____ .",
    "answer": "plausible",
    "clue": "Choose the antonym of “implausible”.",
    "options": [
      "plausible",
      "simple",
      "freeze",
      "mature"
    ]
  },
  {
    "id": "missing-010",
    "sentence": "Item 10: The word with the opposite meaning to “plausible” is ____ .",
    "answer": "implausible",
    "clue": "Choose the antonym of “plausible”.",
    "options": [
      "protect",
      "entrance",
      "inarticulate",
      "implausible"
    ]
  },
  {
    "id": "missing-011",
    "sentence": "Item 11: The word with the opposite meaning to “verbose” is ____ .",
    "answer": "concise",
    "clue": "Choose the antonym of “verbose”.",
    "options": [
      "agitated",
      "careless",
      "concise",
      "maximum"
    ]
  },
  {
    "id": "missing-012",
    "sentence": "Item 12: The word with the opposite meaning to “concise” is ____ .",
    "answer": "verbose",
    "clue": "Choose the antonym of “concise”.",
    "options": [
      "transparent",
      "verbose",
      "full",
      "economical"
    ]
  },
  {
    "id": "missing-013",
    "sentence": "Item 13: The word with the opposite meaning to “biased” is ____ .",
    "answer": "impartial",
    "clue": "Choose the antonym of “biased”.",
    "options": [
      "impartial",
      "interior",
      "obsolete",
      "descend"
    ]
  },
  {
    "id": "missing-014",
    "sentence": "Item 14: The word with the opposite meaning to “impartial” is ____ .",
    "answer": "biased",
    "clue": "Choose the antonym of “impartial”.",
    "options": [
      "mundane",
      "rude",
      "neglect",
      "biased"
    ]
  },
  {
    "id": "missing-015",
    "sentence": "Item 15: The word with the opposite meaning to “unequivocal” is ____ .",
    "answer": "ambiguous",
    "clue": "Choose the antonym of “unequivocal”.",
    "options": [
      "increase",
      "freedom",
      "ambiguous",
      "superficial"
    ]
  },
  {
    "id": "missing-016",
    "sentence": "Item 16: The word with the opposite meaning to “ambiguous” is ____ .",
    "answer": "unequivocal",
    "clue": "Choose the antonym of “ambiguous”.",
    "options": [
      "immature",
      "unequivocal",
      "cautious",
      "float"
    ]
  },
  {
    "id": "missing-017",
    "sentence": "Item 17: The word with the opposite meaning to “modern” is ____ .",
    "answer": "obsolete",
    "clue": "Choose the antonym of “modern”.",
    "options": [
      "obsolete",
      "endanger",
      "exit",
      "benevolent"
    ]
  },
  {
    "id": "missing-018",
    "sentence": "Item 18: The word with the opposite meaning to “obsolete” is ____ .",
    "answer": "modern",
    "clue": "Choose the antonym of “obsolete”.",
    "options": [
      "minimum",
      "cheerful",
      "reluctant",
      "modern"
    ]
  },
  {
    "id": "missing-019",
    "sentence": "Item 19: The word with the opposite meaning to “abundant” is ____ .",
    "answer": "scarce",
    "clue": "Choose the antonym of “abundant”.",
    "options": [
      "wasteful",
      "opaque",
      "scarce",
      "narrow"
    ]
  },
  {
    "id": "missing-020",
    "sentence": "Item 20: The word with the opposite meaning to “scarce” is ____ .",
    "answer": "abundant",
    "clue": "Choose the antonym of “scarce”.",
    "options": [
      "conceal",
      "abundant",
      "exterior",
      "modern"
    ]
  },
  {
    "id": "missing-021",
    "sentence": "Item 21: The word with the opposite meaning to “incoherent” is ____ .",
    "answer": "coherent",
    "clue": "Choose the antonym of “incoherent”.",
    "options": [
      "coherent",
      "extraordinary",
      "ancient",
      "praise"
    ]
  },
  {
    "id": "missing-022",
    "sentence": "Item 22: The word with the opposite meaning to “coherent” is ____ .",
    "answer": "incoherent",
    "clue": "Choose the antonym of “coherent”.",
    "options": [
      "feasible",
      "decrease",
      "captivity",
      "incoherent"
    ]
  },
  {
    "id": "missing-023",
    "sentence": "Item 23: The word with the opposite meaning to “idle” is ____ .",
    "answer": "diligent",
    "clue": "Choose the antonym of “idle”.",
    "options": [
      "sink",
      "fertile",
      "diligent",
      "rash"
    ]
  },
  {
    "id": "missing-024",
    "sentence": "Item 24: The word with the opposite meaning to “diligent” is ____ .",
    "answer": "idle",
    "clue": "Choose the antonym of “diligent”.",
    "options": [
      "malevolent",
      "idle",
      "unite",
      "fiction"
    ]
  },
  {
    "id": "missing-025",
    "sentence": "Item 25: The word with the opposite meaning to “manageable” is ____ .",
    "answer": "formidable",
    "clue": "Choose the antonym of “manageable”.",
    "options": [
      "formidable",
      "optimism",
      "miserable",
      "eager"
    ]
  },
  {
    "id": "missing-026",
    "sentence": "Item 26: The word with the opposite meaning to “formidable” is ____ .",
    "answer": "manageable",
    "clue": "Choose the antonym of “formidable”.",
    "options": [
      "broad",
      "explicit",
      "temporary",
      "manageable"
    ]
  },
  {
    "id": "missing-027",
    "sentence": "Item 27: The word with the opposite meaning to “reckless” is ____ .",
    "answer": "prudent",
    "clue": "Choose the antonym of “reckless”.",
    "options": [
      "scarce",
      "reveal",
      "prudent",
      "superior"
    ]
  },
  {
    "id": "missing-028",
    "sentence": "Item 28: The word with the opposite meaning to “prudent” is ____ .",
    "answer": "reckless",
    "clue": "Choose the antonym of “prudent”.",
    "options": [
      "criticize",
      "reckless",
      "novice",
      "recent"
    ]
  },
  {
    "id": "missing-029",
    "sentence": "Item 29: The word with the opposite meaning to “significant” is ____ .",
    "answer": "trivial",
    "clue": "Choose the antonym of “significant”.",
    "options": [
      "trivial",
      "impractical",
      "encourage",
      "harmony"
    ]
  },
  {
    "id": "missing-030",
    "sentence": "Item 30: The word with the opposite meaning to “trivial” is ____ .",
    "answer": "significant",
    "clue": "Choose the antonym of “trivial”.",
    "options": [
      "modest",
      "gather",
      "barren",
      "significant"
    ]
  },
  {
    "id": "missing-031",
    "sentence": "Item 31: The word with the opposite meaning to “superficial” is ____ .",
    "answer": "profound",
    "clue": "Choose the antonym of “superficial”.",
    "options": [
      "fact",
      "amiable",
      "profound",
      "divide"
    ]
  },
  {
    "id": "missing-032",
    "sentence": "Item 32: The word with the opposite meaning to “profound” is ____ .",
    "answer": "superficial",
    "clue": "Choose the antonym of “profound”.",
    "options": [
      "skeptical",
      "superficial",
      "despair",
      "pleasant"
    ]
  },
  {
    "id": "missing-033",
    "sentence": "Item 33: The word with the opposite meaning to “impractical” is ____ .",
    "answer": "feasible",
    "clue": "Choose the antonym of “impractical”.",
    "options": [
      "feasible",
      "shallow",
      "implicit",
      "permanent"
    ]
  },
  {
    "id": "missing-034",
    "sentence": "Item 34: The word with the opposite meaning to “feasible” is ____ .",
    "answer": "impractical",
    "clue": "Choose the antonym of “feasible”.",
    "options": [
      "inferior",
      "abundant",
      "accelerate",
      "impractical"
    ]
  },
  {
    "id": "missing-035",
    "sentence": "Item 35: The word with the opposite meaning to “respected” is ____ .",
    "answer": "notorious",
    "clue": "Choose the antonym of “respected”.",
    "options": [
      "genuine",
      "reward",
      "notorious",
      "expert"
    ]
  },
  {
    "id": "missing-036",
    "sentence": "Item 36: The word with the opposite meaning to “notorious” is ____ .",
    "answer": "respected",
    "clue": "Choose the antonym of “notorious”.",
    "options": [
      "discord",
      "respected",
      "notorious",
      "discourage"
    ]
  },
  {
    "id": "missing-037",
    "sentence": "Item 37: The word with the opposite meaning to “inflexible” is ____ .",
    "answer": "versatile",
    "clue": "Choose the antonym of “inflexible”.",
    "options": [
      "versatile",
      "boastful",
      "scatter",
      "innocent"
    ]
  },
  {
    "id": "missing-038",
    "sentence": "Item 38: The word with the opposite meaning to “versatile” is ____ .",
    "answer": "inflexible",
    "clue": "Choose the antonym of “versatile”.",
    "options": [
      "attract",
      "virtue",
      "abrasive",
      "inflexible"
    ]
  },
  {
    "id": "missing-039",
    "sentence": "Item 39: The word with the opposite meaning to “stingy” is ____ .",
    "answer": "generous",
    "clue": "Choose the antonym of “stingy”.",
    "options": [
      "unpleasant",
      "gullible",
      "generous",
      "chaos"
    ]
  },
  {
    "id": "missing-040",
    "sentence": "Item 40: The word with the opposite meaning to “generous” is ____ .",
    "answer": "stingy",
    "clue": "Choose the antonym of “generous”.",
    "options": [
      "frequent",
      "stingy",
      "deep",
      "favorable"
    ]
  },
  {
    "id": "missing-041",
    "sentence": "Item 41: The word with the opposite meaning to “arrogant” is ____ .",
    "answer": "humble",
    "clue": "Choose the antonym of “arrogant”.",
    "options": [
      "humble",
      "positive",
      "coherent",
      "decelerate"
    ]
  },
  {
    "id": "missing-042",
    "sentence": "Item 42: The word with the opposite meaning to “humble” is ____ .",
    "answer": "arrogant",
    "clue": "Choose the antonym of “humble”.",
    "options": [
      "perilous",
      "counterfeit",
      "punish",
      "arrogant"
    ]
  },
  {
    "id": "missing-043",
    "sentence": "Item 43: The word with the opposite meaning to “pessimistic” is ____ .",
    "answer": "optimistic",
    "clue": "Choose the antonym of “pessimistic”.",
    "options": [
      "permit",
      "poverty",
      "optimistic",
      "respected"
    ]
  },
  {
    "id": "missing-044",
    "sentence": "Item 44: The word with the opposite meaning to “optimistic” is ____ .",
    "answer": "pessimistic",
    "clue": "Choose the antonym of “optimistic”.",
    "options": [
      "guilty",
      "pessimistic",
      "artificial",
      "tighten"
    ]
  },
  {
    "id": "missing-045",
    "sentence": "Item 45: The word with the opposite meaning to “opaque” is ____ .",
    "answer": "transparent",
    "clue": "Choose the antonym of “opaque”.",
    "options": [
      "transparent",
      "repel",
      "vice",
      "arduous"
    ]
  },
  {
    "id": "missing-046",
    "sentence": "Item 46: The word with the opposite meaning to “transparent” is ____ .",
    "answer": "opaque",
    "clue": "Choose the antonym of “transparent”.",
    "options": [
      "order",
      "selfless",
      "resilient",
      "opaque"
    ]
  },
  {
    "id": "missing-047",
    "sentence": "Item 47: The word with the opposite meaning to “permanent” is ____ .",
    "answer": "temporary",
    "clue": "Choose the antonym of “permanent”.",
    "options": [
      "adverse",
      "occasional",
      "temporary",
      "loose"
    ]
  },
  {
    "id": "missing-048",
    "sentence": "Item 48: The word with the opposite meaning to “temporary” is ____ .",
    "answer": "permanent",
    "clue": "Choose the antonym of “temporary”.",
    "options": [
      "strengthen",
      "permanent",
      "negative",
      "incoherent"
    ]
  },
  {
    "id": "missing-049",
    "sentence": "Item 49: The word with the opposite meaning to “occasional” is ____ .",
    "answer": "frequent",
    "clue": "Choose the antonym of “occasional”.",
    "options": [
      "frequent",
      "safe",
      "loyal",
      "repair"
    ]
  },
  {
    "id": "missing-050",
    "sentence": "Item 50: The word with the opposite meaning to “frequent” is ____ .",
    "answer": "occasional",
    "clue": "Choose the antonym of “frequent”.",
    "options": [
      "versatile",
      "forbid",
      "wealth",
      "occasional"
    ]
  },
  {
    "id": "missing-051",
    "sentence": "Item 51: The word with the opposite meaning to “friendly” is ____ .",
    "answer": "hostile",
    "clue": "Choose the antonym of “friendly”.",
    "options": [
      "loosen",
      "legal",
      "hostile",
      "natural"
    ]
  },
  {
    "id": "missing-052",
    "sentence": "Item 52: The word with the opposite meaning to “hostile” is ____ .",
    "answer": "friendly",
    "clue": "Choose the antonym of “hostile”.",
    "options": [
      "effortless",
      "friendly",
      "borrow",
      "dawn"
    ]
  },
  {
    "id": "missing-053",
    "sentence": "Item 53: The word with the opposite meaning to “dull” is ____ .",
    "answer": "vivid",
    "clue": "Choose the antonym of “dull”.",
    "options": [
      "vivid",
      "generosity",
      "selfish",
      "fragile"
    ]
  },
  {
    "id": "missing-054",
    "sentence": "Item 54: The word with the opposite meaning to “vivid” is ____ .",
    "answer": "dull",
    "clue": "Choose the antonym of “vivid”.",
    "options": [
      "tight",
      "feigned",
      "hostile",
      "dull"
    ]
  },
  {
    "id": "missing-055",
    "sentence": "Item 55: The word with the opposite meaning to “flexible” is ____ .",
    "answer": "rigid",
    "clue": "Choose the antonym of “flexible”.",
    "options": [
      "diligent",
      "weaken",
      "rigid",
      "private"
    ]
  },
  {
    "id": "missing-056",
    "sentence": "Item 56: The word with the opposite meaning to “rigid” is ____ .",
    "answer": "flexible",
    "clue": "Choose the antonym of “rigid”.",
    "options": [
      "damage",
      "flexible",
      "plentiful",
      "treacherous"
    ]
  },
  {
    "id": "missing-057",
    "sentence": "Item 57: The word with the opposite meaning to “bold” is ____ .",
    "answer": "timid",
    "clue": "Choose the antonym of “bold”.",
    "options": [
      "timid",
      "inflexible",
      "remember",
      "strength"
    ]
  },
  {
    "id": "missing-058",
    "sentence": "Item 58: The word with the opposite meaning to “timid” is ____ .",
    "answer": "bold",
    "clue": "Choose the antonym of “timid”.",
    "options": [
      "expand",
      "connect",
      "illegal",
      "bold"
    ]
  },
  {
    "id": "missing-059",
    "sentence": "Item 59: The word with the opposite meaning to “rude” is ____ .",
    "answer": "courteous",
    "clue": "Choose the antonym of “rude”.",
    "options": [
      "dusk",
      "brisk",
      "courteous",
      "lend"
    ]
  },
  {
    "id": "missing-060",
    "sentence": "Item 60: The word with the opposite meaning to “courteous” is ____ .",
    "answer": "rude",
    "clue": "Choose the antonym of “courteous”.",
    "options": [
      "plausible",
      "rude",
      "greed",
      "active"
    ]
  },
  {
    "id": "missing-061",
    "sentence": "Item 61: The word with the opposite meaning to “recent” is ____ .",
    "answer": "ancient",
    "clue": "Choose the antonym of “recent”.",
    "options": [
      "ancient",
      "smooth",
      "imminent",
      "friendly"
    ]
  },
  {
    "id": "missing-062",
    "sentence": "Item 62: The word with the opposite meaning to “ancient” is ____ .",
    "answer": "recent",
    "clue": "Choose the antonym of “ancient”.",
    "options": [
      "public",
      "idle",
      "approve",
      "recent"
    ]
  },
  {
    "id": "missing-063",
    "sentence": "Item 63: The word with the opposite meaning to “counterfeit” is ____ .",
    "answer": "genuine",
    "clue": "Choose the antonym of “counterfeit”.",
    "options": [
      "patient",
      "support",
      "genuine",
      "meagre"
    ]
  },
  {
    "id": "missing-064",
    "sentence": "Item 64: The word with the opposite meaning to “genuine” is ____ .",
    "answer": "counterfeit",
    "clue": "Choose the antonym of “genuine”.",
    "options": [
      "weakness",
      "counterfeit",
      "generous",
      "forget"
    ]
  },
  {
    "id": "missing-065",
    "sentence": "Item 65: The word with the opposite meaning to “treacherous” is ____ .",
    "answer": "loyal",
    "clue": "Choose the antonym of “treacherous”.",
    "options": [
      "loyal",
      "contract",
      "disconnect",
      "regular"
    ]
  },
  {
    "id": "missing-066",
    "sentence": "Item 66: The word with the opposite meaning to “loyal” is ____ .",
    "answer": "treacherous",
    "clue": "Choose the antonym of “loyal”.",
    "options": [
      "omit",
      "noisy",
      "sluggish",
      "treacherous"
    ]
  },
  {
    "id": "missing-067",
    "sentence": "Item 67: The word with the opposite meaning to “impatient” is ____ .",
    "answer": "patient",
    "clue": "Choose the antonym of “impatient”.",
    "options": [
      "passive",
      "implausible",
      "patient",
      "courage"
    ]
  },
  {
    "id": "missing-068",
    "sentence": "Item 68: The word with the opposite meaning to “patient” is ____ .",
    "answer": "impatient",
    "clue": "Choose the antonym of “patient”.",
    "options": [
      "vivid",
      "impatient",
      "rough",
      "remote"
    ]
  },
  {
    "id": "missing-069",
    "sentence": "Item 69: The word with the opposite meaning to “inaccurate” is ____ .",
    "answer": "accurate",
    "clue": "Choose the antonym of “inaccurate”.",
    "options": [
      "accurate",
      "rigorous",
      "formidable",
      "disapprove"
    ]
  },
  {
    "id": "missing-070",
    "sentence": "Item 70: The word with the opposite meaning to “accurate” is ____ .",
    "answer": "inaccurate",
    "clue": "Choose the antonym of “accurate”.",
    "options": [
      "rational",
      "impatient",
      "oppose",
      "inaccurate"
    ]
  },
  {
    "id": "missing-071",
    "sentence": "Item 71: The word with the opposite meaning to “specific” is ____ .",
    "answer": "vague",
    "clue": "Choose the antonym of “specific”.",
    "options": [
      "succeed",
      "success",
      "vague",
      "stingy"
    ]
  },
  {
    "id": "missing-072",
    "sentence": "Item 72: The word with the opposite meaning to “vague” is ____ .",
    "answer": "specific",
    "clue": "Choose the antonym of “vague”.",
    "options": [
      "irregular",
      "specific",
      "accept",
      "arrange"
    ]
  },
  {
    "id": "missing-073",
    "sentence": "Item 73: The word with the opposite meaning to “simple” is ____ .",
    "answer": "complex",
    "clue": "Choose the antonym of “simple”.",
    "options": [
      "complex",
      "expose",
      "silent",
      "candid"
    ]
  },
  {
    "id": "missing-074",
    "sentence": "Item 74: The word with the opposite meaning to “complex” is ____ .",
    "answer": "simple",
    "clue": "Choose the antonym of “complex”.",
    "options": [
      "cowardice",
      "vacant",
      "concise",
      "simple"
    ]
  },
  {
    "id": "missing-075",
    "sentence": "Item 75: The word with the opposite meaning to “rash” is ____ .",
    "answer": "cautious",
    "clue": "Choose the antonym of “rash”.",
    "options": [
      "innovative",
      "dull",
      "cautious",
      "bitter"
    ]
  },
  {
    "id": "missing-076",
    "sentence": "Item 76: The word with the opposite meaning to “cautious” is ____ .",
    "answer": "rash",
    "clue": "Choose the antonym of “cautious”.",
    "options": [
      "combine",
      "rash",
      "lenient",
      "manageable"
    ]
  },
  {
    "id": "missing-077",
    "sentence": "Item 77: The word with the opposite meaning to “boastful” is ____ .",
    "answer": "modest",
    "clue": "Choose the antonym of “boastful”.",
    "options": [
      "modest",
      "irrational",
      "accurate",
      "whisper"
    ]
  },
  {
    "id": "missing-078",
    "sentence": "Item 78: The word with the opposite meaning to “modest” is ____ .",
    "answer": "boastful",
    "clue": "Choose the antonym of “modest”.",
    "options": [
      "humble",
      "fail",
      "failure",
      "boastful"
    ]
  },
  {
    "id": "missing-079",
    "sentence": "Item 79: The word with the opposite meaning to “natural” is ____ .",
    "answer": "artificial",
    "clue": "Choose the antonym of “natural”.",
    "options": [
      "disorder",
      "possible",
      "artificial",
      "reject"
    ]
  },
  {
    "id": "missing-080",
    "sentence": "Item 80: The word with the opposite meaning to “artificial” is ____ .",
    "answer": "natural",
    "clue": "Choose the antonym of “artificial”.",
    "options": [
      "evasive",
      "natural",
      "shield",
      "visible"
    ]
  },
  {
    "id": "missing-081",
    "sentence": "Item 81: The word with the opposite meaning to “contract” is ____ .",
    "answer": "expand",
    "clue": "Choose the antonym of “contract”.",
    "options": [
      "expand",
      "wisdom",
      "occupied",
      "verbose"
    ]
  },
  {
    "id": "missing-082",
    "sentence": "Item 82: The word with the opposite meaning to “expand” is ____ .",
    "answer": "contract",
    "clue": "Choose the antonym of “expand”.",
    "options": [
      "sweet",
      "conventional",
      "rigid",
      "contract"
    ]
  },
  {
    "id": "missing-083",
    "sentence": "Item 83: The word with the opposite meaning to “reject” is ____ .",
    "answer": "accept",
    "clue": "Choose the antonym of “reject”.",
    "options": [
      "prudent",
      "separate",
      "accept",
      "authentic"
    ]
  },
  {
    "id": "missing-084",
    "sentence": "Item 84: The word with the opposite meaning to “accept” is ____ .",
    "answer": "reject",
    "clue": "Choose the antonym of “accept”.",
    "options": [
      "shout",
      "reject",
      "relentless",
      "inaccurate"
    ]
  },
  {
    "id": "missing-085",
    "sentence": "Item 85: The word with the opposite meaning to “exclude” is ____ .",
    "answer": "include",
    "clue": "Choose the antonym of “exclude”.",
    "options": [
      "include",
      "arrogant",
      "advance",
      "friend"
    ]
  },
  {
    "id": "missing-086",
    "sentence": "Item 86: The word with the opposite meaning to “include” is ____ .",
    "answer": "exclude",
    "clue": "Choose the antonym of “include”.",
    "options": [
      "include",
      "victory",
      "impossible",
      "exclude"
    ]
  },
  {
    "id": "missing-087",
    "sentence": "Item 87: The word with the opposite meaning to “descend” is ____ .",
    "answer": "ascend",
    "clue": "Choose the antonym of “descend”.",
    "options": [
      "hidden",
      "composed",
      "ascend",
      "complicate"
    ]
  },
  {
    "id": "missing-088",
    "sentence": "Item 88: The word with the opposite meaning to “ascend” is ____ .",
    "answer": "descend",
    "clue": "Choose the antonym of “ascend”.",
    "options": [
      "impartial",
      "descend",
      "foolishness",
      "domestic"
    ]
  },
  {
    "id": "missing-089",
    "sentence": "Item 89: The word with the opposite meaning to “reveal” is ____ .",
    "answer": "conceal",
    "clue": "Choose the antonym of “reveal”.",
    "options": [
      "conceal",
      "tender",
      "lucid",
      "flexible"
    ]
  },
  {
    "id": "missing-090",
    "sentence": "Item 90: The word with the opposite meaning to “conceal” is ____ .",
    "answer": "reveal",
    "clue": "Choose the antonym of “conceal”.",
    "options": [
      "spurious",
      "reckless",
      "create",
      "reveal"
    ]
  },
  {
    "id": "missing-091",
    "sentence": "Item 91: The word with the opposite meaning to “decelerate” is ____ .",
    "answer": "accelerate",
    "clue": "Choose the antonym of “decelerate”.",
    "options": [
      "vague",
      "vanish",
      "accelerate",
      "merciful"
    ]
  },
  {
    "id": "missing-092",
    "sentence": "Item 92: The word with the opposite meaning to “accelerate” is ____ .",
    "answer": "decelerate",
    "clue": "Choose the antonym of “accelerate”.",
    "options": [
      "enemy",
      "decelerate",
      "optimistic",
      "retreat"
    ]
  },
  {
    "id": "missing-093",
    "sentence": "Item 93: The word with the opposite meaning to “weaken” is ____ .",
    "answer": "strengthen",
    "clue": "Choose the antonym of “weaken”.",
    "options": [
      "strengthen",
      "exclude",
      "defeat",
      "logical"
    ]
  },
  {
    "id": "missing-094",
    "sentence": "Item 94: The word with the opposite meaning to “strengthen” is ____ .",
    "answer": "weaken",
    "clue": "Choose the antonym of “strengthen”.",
    "options": [
      "simplify",
      "asleep",
      "flustered",
      "weaken"
    ]
  },
  {
    "id": "missing-095",
    "sentence": "Item 95: The word with the opposite meaning to “disapprove” is ____ .",
    "answer": "approve",
    "clue": "Choose the antonym of “disapprove”.",
    "options": [
      "foreign",
      "biased",
      "approve",
      "honesty"
    ]
  },
  {
    "id": "missing-096",
    "sentence": "Item 96: The word with the opposite meaning to “approve” is ____ .",
    "answer": "disapprove",
    "clue": "Choose the antonym of “approve”.",
    "options": [
      "timid",
      "disapprove",
      "tough",
      "confusing"
    ]
  },
  {
    "id": "missing-097",
    "sentence": "Item 97: The word with the opposite meaning to “separate” is ____ .",
    "answer": "combine",
    "clue": "Choose the antonym of “separate”.",
    "options": [
      "combine",
      "eloquent",
      "trivial",
      "destroy"
    ]
  },
  {
    "id": "missing-098",
    "sentence": "Item 98: The word with the opposite meaning to “combine” is ____ .",
    "answer": "separate",
    "clue": "Choose the antonym of “combine”.",
    "options": [
      "meticulous",
      "specific",
      "appear",
      "separate"
    ]
  },
  {
    "id": "missing-099",
    "sentence": "Item 99: The word with the opposite meaning to “destroy” is ____ .",
    "answer": "create",
    "clue": "Choose the antonym of “destroy”.",
    "options": [
      "construct",
      "beginning",
      "create",
      "pessimistic"
    ]
  },
  {
    "id": "missing-100",
    "sentence": "Item 100: The word with the opposite meaning to “create” is ____ .",
    "answer": "destroy",
    "clue": "Choose the antonym of “create”.",
    "options": [
      "illogical",
      "destroy",
      "ascend",
      "arrival"
    ]
  },
  {
    "id": "missing-101",
    "sentence": "Item 101: The word with the opposite meaning to “depart” is ____ .",
    "answer": "arrive",
    "clue": "Choose the antonym of “depart”.",
    "options": [
      "arrive",
      "preserve",
      "awake",
      "decisive"
    ]
  },
  {
    "id": "missing-102",
    "sentence": "Item 102: The word with the opposite meaning to “arrive” is ____ .",
    "answer": "depart",
    "clue": "Choose the antonym of “arrive”.",
    "options": [
      "deceit",
      "minor",
      "ambiguous",
      "depart"
    ]
  },
  {
    "id": "missing-103",
    "sentence": "Item 103: The word with the opposite meaning to “decrease” is ____ .",
    "answer": "increase",
    "clue": "Choose the antonym of “decrease”.",
    "options": [
      "mandatory",
      "bold",
      "increase",
      "mature"
    ]
  },
  {
    "id": "missing-104",
    "sentence": "Item 104: The word with the opposite meaning to “increase” is ____ .",
    "answer": "decrease",
    "clue": "Choose the antonym of “increase”.",
    "options": [
      "arrive",
      "decrease",
      "inarticulate",
      "significant"
    ]
  },
  {
    "id": "missing-105",
    "sentence": "Item 105: The word with the opposite meaning to “discourage” is ____ .",
    "answer": "encourage",
    "clue": "Choose the antonym of “discourage”.",
    "options": [
      "encourage",
      "careless",
      "complex",
      "melt"
    ]
  },
  {
    "id": "missing-106",
    "sentence": "Item 106: The word with the opposite meaning to “encourage” is ____ .",
    "answer": "discourage",
    "clue": "Choose the antonym of “encourage”.",
    "options": [
      "transparent",
      "demolish",
      "ending",
      "discourage"
    ]
  },
  {
    "id": "missing-107",
    "sentence": "Item 107: The word with the opposite meaning to “forbid” is ____ .",
    "answer": "permit",
    "clue": "Choose the antonym of “forbid”.",
    "options": [
      "departure",
      "calm",
      "permit",
      "descend"
    ]
  },
  {
    "id": "missing-108",
    "sentence": "Item 108: The word with the opposite meaning to “permit” is ____ .",
    "answer": "forbid",
    "clue": "Choose the antonym of “permit”.",
    "options": [
      "indecisive",
      "forbid",
      "neglect",
      "empty"
    ]
  },
  {
    "id": "missing-109",
    "sentence": "Item 109: The word with the opposite meaning to “forget” is ____ .",
    "answer": "remember",
    "clue": "Choose the antonym of “forget”.",
    "options": [
      "remember",
      "freedom",
      "major",
      "unequivocal"
    ]
  },
  {
    "id": "missing-110",
    "sentence": "Item 110: The word with the opposite meaning to “remember” is ____ .",
    "answer": "forget",
    "clue": "Choose the antonym of “remember”.",
    "options": [
      "immature",
      "optional",
      "courteous",
      "forget"
    ]
  },
  {
    "id": "missing-111",
    "sentence": "Item 111: The word with the opposite meaning to “fail” is ____ .",
    "answer": "succeed",
    "clue": "Choose the antonym of “fail”.",
    "options": [
      "profound",
      "depart",
      "succeed",
      "benevolent"
    ]
  },
  {
    "id": "missing-112",
    "sentence": "Item 112: The word with the opposite meaning to “succeed” is ____ .",
    "answer": "fail",
    "clue": "Choose the antonym of “succeed”.",
    "options": [
      "freeze",
      "fail",
      "reluctant",
      "simple"
    ]
  },
  {
    "id": "missing-113",
    "sentence": "Item 113: The word with the opposite meaning to “retreat” is ____ .",
    "answer": "advance",
    "clue": "Choose the antonym of “retreat”.",
    "options": [
      "advance",
      "opaque",
      "protect",
      "entrance"
    ]
  },
  {
    "id": "missing-114",
    "sentence": "Item 114: The word with the opposite meaning to “advance” is ____ .",
    "answer": "retreat",
    "clue": "Choose the antonym of “advance”.",
    "options": [
      "conceal",
      "maximum",
      "agitated",
      "retreat"
    ]
  },
  {
    "id": "missing-115",
    "sentence": "Item 115: The word with the opposite meaning to “demolish” is ____ .",
    "answer": "construct",
    "clue": "Choose the antonym of “demolish”.",
    "options": [
      "full",
      "economical",
      "construct",
      "praise"
    ]
  },
  {
    "id": "missing-116",
    "sentence": "Item 116: The word with the opposite meaning to “construct” is ____ .",
    "answer": "demolish",
    "clue": "Choose the antonym of “construct”.",
    "options": [
      "obsolete",
      "demolish",
      "captivity",
      "interior"
    ]
  },
  {
    "id": "missing-117",
    "sentence": "Item 117: The word with the opposite meaning to “endanger” is ____ .",
    "answer": "protect",
    "clue": "Choose the antonym of “endanger”.",
    "options": [
      "protect",
      "fertile",
      "mundane",
      "rude"
    ]
  },
  {
    "id": "missing-118",
    "sentence": "Item 118: The word with the opposite meaning to “protect” is ____ .",
    "answer": "endanger",
    "clue": "Choose the antonym of “protect”.",
    "options": [
      "malevolent",
      "superficial",
      "increase",
      "endanger"
    ]
  },
  {
    "id": "missing-119",
    "sentence": "Item 119: The word with the opposite meaning to “divide” is ____ .",
    "answer": "unite",
    "clue": "Choose the antonym of “divide”.",
    "options": [
      "cautious",
      "float",
      "unite",
      "eager"
    ]
  },
  {
    "id": "missing-120",
    "sentence": "Item 120: The word with the opposite meaning to “unite” is ____ .",
    "answer": "divide",
    "clue": "Choose the antonym of “unite”.",
    "options": [
      "exit",
      "divide",
      "temporary",
      "endanger"
    ]
  },
  {
    "id": "missing-121",
    "sentence": "Item 121: The word with the opposite meaning to “repel” is ____ .",
    "answer": "attract",
    "clue": "Choose the antonym of “repel”.",
    "options": [
      "attract",
      "reveal",
      "minimum",
      "cheerful"
    ]
  },
  {
    "id": "missing-122",
    "sentence": "Item 122: The word with the opposite meaning to “attract” is ____ .",
    "answer": "repel",
    "clue": "Choose the antonym of “attract”.",
    "options": [
      "criticize",
      "narrow",
      "wasteful",
      "repel"
    ]
  },
  {
    "id": "missing-123",
    "sentence": "Item 123: The word with the opposite meaning to “lend” is ____ .",
    "answer": "borrow",
    "clue": "Choose the antonym of “lend”.",
    "options": [
      "exterior",
      "modern",
      "borrow",
      "harmony"
    ]
  },
  {
    "id": "missing-124",
    "sentence": "Item 124: The word with the opposite meaning to “borrow” is ____ .",
    "answer": "lend",
    "clue": "Choose the antonym of “borrow”.",
    "options": [
      "ancient",
      "lend",
      "barren",
      "extraordinary"
    ]
  },
  {
    "id": "missing-125",
    "sentence": "Item 125: The word with the opposite meaning to “include” is ____ .",
    "answer": "omit",
    "clue": "Choose the antonym of “include”.",
    "options": [
      "omit",
      "amiable",
      "feasible",
      "decrease"
    ]
  },
  {
    "id": "missing-126",
    "sentence": "Item 126: The word with the opposite meaning to “shield” is ____ .",
    "answer": "expose",
    "clue": "Choose the antonym of “shield”.",
    "options": [
      "skeptical",
      "rash",
      "sink",
      "expose"
    ]
  },
  {
    "id": "missing-127",
    "sentence": "Item 127: The word with the opposite meaning to “expose” is ____ .",
    "answer": "shield",
    "clue": "Choose the antonym of “expose”.",
    "options": [
      "unite",
      "fiction",
      "shield",
      "permanent"
    ]
  },
  {
    "id": "missing-128",
    "sentence": "Item 128: The word with the opposite meaning to “simplify” is ____ .",
    "answer": "complicate",
    "clue": "Choose the antonym of “simplify”.",
    "options": [
      "miserable",
      "complicate",
      "accelerate",
      "optimism"
    ]
  },
  {
    "id": "missing-129",
    "sentence": "Item 129: The word with the opposite meaning to “complicate” is ____ .",
    "answer": "simplify",
    "clue": "Choose the antonym of “complicate”.",
    "options": [
      "simplify",
      "reward",
      "broad",
      "explicit"
    ]
  },
  {
    "id": "missing-130",
    "sentence": "Item 130: The word with the opposite meaning to “neglect” is ____ .",
    "answer": "preserve",
    "clue": "Choose the antonym of “neglect”.",
    "options": [
      "discord",
      "superior",
      "scarce",
      "preserve"
    ]
  },
  {
    "id": "missing-131",
    "sentence": "Item 131: The word with the opposite meaning to “preserve” is ____ .",
    "answer": "neglect",
    "clue": "Choose the antonym of “preserve”.",
    "options": [
      "novice",
      "recent",
      "neglect",
      "innocent"
    ]
  },
  {
    "id": "missing-132",
    "sentence": "Item 132: The word with the opposite meaning to “criticize” is ____ .",
    "answer": "praise",
    "clue": "Choose the antonym of “criticize”.",
    "options": [
      "encourage",
      "praise",
      "abrasive",
      "impractical"
    ]
  },
  {
    "id": "missing-133",
    "sentence": "Item 133: The word with the opposite meaning to “praise” is ____ .",
    "answer": "criticize",
    "clue": "Choose the antonym of “praise”.",
    "options": [
      "criticize",
      "gullible",
      "modest",
      "gather"
    ]
  },
  {
    "id": "missing-134",
    "sentence": "Item 134: The word with the opposite meaning to “punish” is ____ .",
    "answer": "reward",
    "clue": "Choose the antonym of “punish”.",
    "options": [
      "frequent",
      "divide",
      "fact",
      "reward"
    ]
  },
  {
    "id": "missing-135",
    "sentence": "Item 135: The word with the opposite meaning to “reward” is ____ .",
    "answer": "punish",
    "clue": "Choose the antonym of “reward”.",
    "options": [
      "despair",
      "pleasant",
      "punish",
      "decelerate"
    ]
  },
  {
    "id": "missing-136",
    "sentence": "Item 136: The word with the opposite meaning to “damage” is ____ .",
    "answer": "repair",
    "clue": "Choose the antonym of “damage”.",
    "options": [
      "implicit",
      "repair",
      "punish",
      "shallow"
    ]
  },
  {
    "id": "missing-137",
    "sentence": "Item 137: The word with the opposite meaning to “repair” is ____ .",
    "answer": "damage",
    "clue": "Choose the antonym of “repair”.",
    "options": [
      "damage",
      "poverty",
      "inferior",
      "abundant"
    ]
  },
  {
    "id": "missing-138",
    "sentence": "Item 138: The word with the opposite meaning to “oppose” is ____ .",
    "answer": "support",
    "clue": "Choose the antonym of “oppose”.",
    "options": [
      "guilty",
      "expert",
      "genuine",
      "support"
    ]
  },
  {
    "id": "missing-139",
    "sentence": "Item 139: The word with the opposite meaning to “support” is ____ .",
    "answer": "oppose",
    "clue": "Choose the antonym of “support”.",
    "options": [
      "notorious",
      "discourage",
      "oppose",
      "arduous"
    ]
  },
  {
    "id": "missing-140",
    "sentence": "Item 140: The word with the opposite meaning to “shout” is ____ .",
    "answer": "whisper",
    "clue": "Choose the antonym of “shout”.",
    "options": [
      "scatter",
      "whisper",
      "resilient",
      "boastful"
    ]
  },
  {
    "id": "missing-141",
    "sentence": "Item 141: The word with the opposite meaning to “whisper” is ____ .",
    "answer": "shout",
    "clue": "Choose the antonym of “whisper”.",
    "options": [
      "shout",
      "occasional",
      "attract",
      "virtue"
    ]
  },
  {
    "id": "missing-142",
    "sentence": "Item 142: The word with the opposite meaning to “appear” is ____ .",
    "answer": "vanish",
    "clue": "Choose the antonym of “appear”.",
    "options": [
      "strengthen",
      "chaos",
      "unpleasant",
      "vanish"
    ]
  },
  {
    "id": "missing-143",
    "sentence": "Item 143: The word with the opposite meaning to “vanish” is ____ .",
    "answer": "appear",
    "clue": "Choose the antonym of “vanish”.",
    "options": [
      "deep",
      "favorable",
      "appear",
      "repair"
    ]
  },
  {
    "id": "missing-144",
    "sentence": "Item 144: The word with the opposite meaning to “freeze” is ____ .",
    "answer": "melt",
    "clue": "Choose the antonym of “freeze”.",
    "options": [
      "coherent",
      "melt",
      "wealth",
      "positive"
    ]
  },
  {
    "id": "missing-145",
    "sentence": "Item 145: The word with the opposite meaning to “melt” is ____ .",
    "answer": "freeze",
    "clue": "Choose the antonym of “melt”.",
    "options": [
      "freeze",
      "legal",
      "perilous",
      "counterfeit"
    ]
  },
  {
    "id": "missing-146",
    "sentence": "Item 146: The word with the opposite meaning to “sink” is ____ .",
    "answer": "float",
    "clue": "Choose the antonym of “sink”.",
    "options": [
      "effortless",
      "respected",
      "permit",
      "float"
    ]
  },
  {
    "id": "missing-147",
    "sentence": "Item 147: The word with the opposite meaning to “float” is ____ .",
    "answer": "sink",
    "clue": "Choose the antonym of “float”.",
    "options": [
      "artificial",
      "tighten",
      "sink",
      "fragile"
    ]
  },
  {
    "id": "missing-148",
    "sentence": "Item 148: The word with the opposite meaning to “scatter” is ____ .",
    "answer": "gather",
    "clue": "Choose the antonym of “scatter”.",
    "options": [
      "vice",
      "gather",
      "hostile",
      "repel"
    ]
  },
  {
    "id": "missing-149",
    "sentence": "Item 149: The word with the opposite meaning to “gather” is ____ .",
    "answer": "scatter",
    "clue": "Choose the antonym of “gather”.",
    "options": [
      "scatter",
      "weaken",
      "order",
      "selfless"
    ]
  },
  {
    "id": "missing-150",
    "sentence": "Item 150: The word with the opposite meaning to “loosen” is ____ .",
    "answer": "tighten",
    "clue": "Choose the antonym of “loosen”.",
    "options": [
      "damage",
      "loose",
      "adverse",
      "tighten"
    ]
  },
  {
    "id": "missing-151",
    "sentence": "Item 151: The word with the opposite meaning to “tighten” is ____ .",
    "answer": "loosen",
    "clue": "Choose the antonym of “tighten”.",
    "options": [
      "negative",
      "incoherent",
      "loosen",
      "strength"
    ]
  },
  {
    "id": "missing-152",
    "sentence": "Item 152: The word with the opposite meaning to “disconnect” is ____ .",
    "answer": "connect",
    "clue": "Choose the antonym of “disconnect”.",
    "options": [
      "loyal",
      "connect",
      "illegal",
      "safe"
    ]
  },
  {
    "id": "missing-153",
    "sentence": "Item 153: The word with the opposite meaning to “connect” is ____ .",
    "answer": "disconnect",
    "clue": "Choose the antonym of “connect”.",
    "options": [
      "disconnect",
      "brisk",
      "versatile",
      "forbid"
    ]
  },
  {
    "id": "missing-154",
    "sentence": "Item 154: The word with the opposite meaning to “disorder” is ____ .",
    "answer": "arrange",
    "clue": "Choose the antonym of “disorder”.",
    "options": [
      "plausible",
      "natural",
      "loosen",
      "arrange"
    ]
  },
  {
    "id": "missing-155",
    "sentence": "Item 155: The word with the opposite meaning to “arrange” is ____ .",
    "answer": "disorder",
    "clue": "Choose the antonym of “arrange”.",
    "options": [
      "borrow",
      "dawn",
      "disorder",
      "friendly"
    ]
  },
  {
    "id": "missing-156",
    "sentence": "Item 156: The word with the opposite meaning to “defeat” is ____ .",
    "answer": "victory",
    "clue": "Choose the antonym of “defeat”.",
    "options": [
      "selfish",
      "victory",
      "approve",
      "generosity"
    ]
  },
  {
    "id": "missing-157",
    "sentence": "Item 157: The word with the opposite meaning to “victory” is ____ .",
    "answer": "defeat",
    "clue": "Choose the antonym of “victory”.",
    "options": [
      "defeat",
      "support",
      "tight",
      "feigned"
    ]
  },
  {
    "id": "missing-158",
    "sentence": "Item 158: The word with the opposite meaning to “departure” is ____ .",
    "answer": "arrival",
    "clue": "Choose the antonym of “departure”.",
    "options": [
      "weakness",
      "private",
      "diligent",
      "arrival"
    ]
  },
  {
    "id": "missing-159",
    "sentence": "Item 159: The word with the opposite meaning to “arrival” is ____ .",
    "answer": "departure",
    "clue": "Choose the antonym of “arrival”.",
    "options": [
      "plentiful",
      "treacherous",
      "departure",
      "regular"
    ]
  },
  {
    "id": "missing-160",
    "sentence": "Item 160: The word with the opposite meaning to “minimum” is ____ .",
    "answer": "maximum",
    "clue": "Choose the antonym of “minimum”.",
    "options": [
      "remember",
      "maximum",
      "sluggish",
      "inflexible"
    ]
  },
  {
    "id": "missing-161",
    "sentence": "Item 161: The word with the opposite meaning to “maximum” is ____ .",
    "answer": "minimum",
    "clue": "Choose the antonym of “maximum”.",
    "options": [
      "minimum",
      "implausible",
      "expand",
      "connect"
    ]
  },
  {
    "id": "missing-162",
    "sentence": "Item 162: The word with the opposite meaning to “despair” is ____ .",
    "answer": "optimism",
    "clue": "Choose the antonym of “despair”.",
    "options": [
      "vivid",
      "lend",
      "dusk",
      "optimism"
    ]
  },
  {
    "id": "missing-163",
    "sentence": "Item 163: The word with the opposite meaning to “optimism” is ____ .",
    "answer": "despair",
    "clue": "Choose the antonym of “optimism”.",
    "options": [
      "greed",
      "active",
      "despair",
      "disapprove"
    ]
  },
  {
    "id": "missing-164",
    "sentence": "Item 164: The word with the opposite meaning to “order” is ____ .",
    "answer": "chaos",
    "clue": "Choose the antonym of “order”.",
    "options": [
      "imminent",
      "chaos",
      "oppose",
      "smooth"
    ]
  },
  {
    "id": "missing-165",
    "sentence": "Item 165: The word with the opposite meaning to “chaos” is ____ .",
    "answer": "order",
    "clue": "Choose the antonym of “chaos”.",
    "options": [
      "order",
      "success",
      "public",
      "idle"
    ]
  },
  {
    "id": "missing-166",
    "sentence": "Item 166: The word with the opposite meaning to “greed” is ____ .",
    "answer": "generosity",
    "clue": "Choose the antonym of “greed”.",
    "options": [
      "irregular",
      "meagre",
      "patient",
      "generosity"
    ]
  },
  {
    "id": "missing-167",
    "sentence": "Item 167: The word with the opposite meaning to “generosity” is ____ .",
    "answer": "greed",
    "clue": "Choose the antonym of “generosity”.",
    "options": [
      "generous",
      "forget",
      "greed",
      "candid"
    ]
  },
  {
    "id": "missing-168",
    "sentence": "Item 168: The word with the opposite meaning to “cowardice” is ____ .",
    "answer": "courage",
    "clue": "Choose the antonym of “cowardice”.",
    "options": [
      "disconnect",
      "courage",
      "concise",
      "contract"
    ]
  },
  {
    "id": "missing-169",
    "sentence": "Item 169: The word with the opposite meaning to “courage” is ____ .",
    "answer": "cowardice",
    "clue": "Choose the antonym of “courage”.",
    "options": [
      "cowardice",
      "dull",
      "omit",
      "noisy"
    ]
  },
  {
    "id": "missing-170",
    "sentence": "Item 170: The word with the opposite meaning to “foolishness” is ____ .",
    "answer": "wisdom",
    "clue": "Choose the antonym of “foolishness”.",
    "options": [
      "combine",
      "courage",
      "passive",
      "wisdom"
    ]
  },
  {
    "id": "missing-171",
    "sentence": "Item 171: The word with the opposite meaning to “wisdom” is ____ .",
    "answer": "foolishness",
    "clue": "Choose the antonym of “wisdom”.",
    "options": [
      "rough",
      "remote",
      "foolishness",
      "whisper"
    ]
  },
  {
    "id": "missing-172",
    "sentence": "Item 172: The word with the opposite meaning to “deceit” is ____ .",
    "answer": "honesty",
    "clue": "Choose the antonym of “deceit”.",
    "options": [
      "formidable",
      "honesty",
      "failure",
      "rigorous"
    ]
  },
  {
    "id": "missing-173",
    "sentence": "Item 173: The word with the opposite meaning to “honesty” is ____ .",
    "answer": "deceit",
    "clue": "Choose the antonym of “honesty”.",
    "options": [
      "deceit",
      "possible",
      "rational",
      "impatient"
    ]
  },
  {
    "id": "missing-174",
    "sentence": "Item 174: The word with the opposite meaning to “captivity” is ____ .",
    "answer": "freedom",
    "clue": "Choose the antonym of “captivity”.",
    "options": [
      "evasive",
      "stingy",
      "succeed",
      "freedom"
    ]
  },
  {
    "id": "missing-175",
    "sentence": "Item 175: The word with the opposite meaning to “freedom” is ____ .",
    "answer": "captivity",
    "clue": "Choose the antonym of “freedom”.",
    "options": [
      "accept",
      "arrange",
      "captivity",
      "verbose"
    ]
  },
  {
    "id": "missing-176",
    "sentence": "Item 176: The word with the opposite meaning to “discord” is ____ .",
    "answer": "harmony",
    "clue": "Choose the antonym of “discord”.",
    "options": [
      "silent",
      "harmony",
      "rigid",
      "expose"
    ]
  },
  {
    "id": "missing-177",
    "sentence": "Item 177: The word with the opposite meaning to “harmony” is ____ .",
    "answer": "discord",
    "clue": "Choose the antonym of “harmony”.",
    "options": [
      "discord",
      "separate",
      "cowardice",
      "vacant"
    ]
  },
  {
    "id": "missing-178",
    "sentence": "Item 178: The word with the opposite meaning to “wealth” is ____ .",
    "answer": "poverty",
    "clue": "Choose the antonym of “wealth”.",
    "options": [
      "shout",
      "bitter",
      "innovative",
      "poverty"
    ]
  },
  {
    "id": "missing-179",
    "sentence": "Item 179: The word with the opposite meaning to “poverty” is ____ .",
    "answer": "wealth",
    "clue": "Choose the antonym of “poverty”.",
    "options": [
      "lenient",
      "manageable",
      "wealth",
      "friend"
    ]
  },
  {
    "id": "missing-180",
    "sentence": "Item 180: The word with the opposite meaning to “weakness” is ____ .",
    "answer": "strength",
    "clue": "Choose the antonym of “weakness”.",
    "options": [
      "accurate",
      "strength",
      "impossible",
      "irrational"
    ]
  },
  {
    "id": "missing-181",
    "sentence": "Item 181: The word with the opposite meaning to “strength” is ____ .",
    "answer": "weakness",
    "clue": "Choose the antonym of “strength”.",
    "options": [
      "weakness",
      "composed",
      "humble",
      "fail"
    ]
  },
  {
    "id": "missing-182",
    "sentence": "Item 182: The word with the opposite meaning to “failure” is ____ .",
    "answer": "success",
    "clue": "Choose the antonym of “failure”.",
    "options": [
      "impartial",
      "reject",
      "disorder",
      "success"
    ]
  },
  {
    "id": "missing-183",
    "sentence": "Item 183: The word with the opposite meaning to “success” is ____ .",
    "answer": "failure",
    "clue": "Choose the antonym of “success”.",
    "options": [
      "shield",
      "visible",
      "failure",
      "flexible"
    ]
  },
  {
    "id": "missing-184",
    "sentence": "Item 184: The word with the opposite meaning to “enemy” is ____ .",
    "answer": "friend",
    "clue": "Choose the antonym of “enemy”.",
    "options": [
      "occupied",
      "friend",
      "create",
      "wisdom"
    ]
  },
  {
    "id": "missing-185",
    "sentence": "Item 185: The word with the opposite meaning to “friend” is ____ .",
    "answer": "enemy",
    "clue": "Choose the antonym of “friend”.",
    "options": [
      "enemy",
      "vanish",
      "sweet",
      "conventional"
    ]
  },
  {
    "id": "missing-186",
    "sentence": "Item 186: The word with the opposite meaning to “ending” is ____ .",
    "answer": "beginning",
    "clue": "Choose the antonym of “ending”.",
    "options": [
      "enemy",
      "authentic",
      "prudent",
      "beginning"
    ]
  },
  {
    "id": "missing-187",
    "sentence": "Item 187: The word with the opposite meaning to “beginning” is ____ .",
    "answer": "ending",
    "clue": "Choose the antonym of “beginning”.",
    "options": [
      "relentless",
      "inaccurate",
      "ending",
      "logical"
    ]
  },
  {
    "id": "missing-188",
    "sentence": "Item 188: The word with the opposite meaning to “exit” is ____ .",
    "answer": "entrance",
    "clue": "Choose the antonym of “exit”.",
    "options": [
      "advance",
      "entrance",
      "flustered",
      "arrogant"
    ]
  },
  {
    "id": "missing-189",
    "sentence": "Item 189: The word with the opposite meaning to “entrance” is ____ .",
    "answer": "exit",
    "clue": "Choose the antonym of “entrance”.",
    "options": [
      "exit",
      "biased",
      "include",
      "victory"
    ]
  },
  {
    "id": "missing-190",
    "sentence": "Item 190: The word with the opposite meaning to “fact” is ____ .",
    "answer": "fiction",
    "clue": "Choose the antonym of “fact”.",
    "options": [
      "timid",
      "complicate",
      "hidden",
      "fiction"
    ]
  },
  {
    "id": "missing-191",
    "sentence": "Item 191: The word with the opposite meaning to “fiction” is ____ .",
    "answer": "fact",
    "clue": "Choose the antonym of “fiction”.",
    "options": [
      "foolishness",
      "domestic",
      "fact",
      "destroy"
    ]
  },
  {
    "id": "missing-192",
    "sentence": "Item 192: The word with the opposite meaning to “vice” is ____ .",
    "answer": "virtue",
    "clue": "Choose the antonym of “vice”.",
    "options": [
      "lucid",
      "virtue",
      "appear",
      "tender"
    ]
  },
  {
    "id": "missing-193",
    "sentence": "Item 193: The word with the opposite meaning to “virtue” is ____ .",
    "answer": "vice",
    "clue": "Choose the antonym of “virtue”.",
    "options": [
      "vice",
      "beginning",
      "spurious",
      "reckless"
    ]
  },
  {
    "id": "missing-194",
    "sentence": "Item 194: The word with the opposite meaning to “dusk” is ____ .",
    "answer": "dawn",
    "clue": "Choose the antonym of “dusk”.",
    "options": [
      "illogical",
      "merciful",
      "vague",
      "dawn"
    ]
  },
  {
    "id": "missing-195",
    "sentence": "Item 195: The word with the opposite meaning to “dawn” is ____ .",
    "answer": "dusk",
    "clue": "Choose the antonym of “dawn”.",
    "options": [
      "optimistic",
      "retreat",
      "dusk",
      "decisive"
    ]
  },
  {
    "id": "missing-196",
    "sentence": "Item 196: The word with the opposite meaning to “silent” is ____ .",
    "answer": "noisy",
    "clue": "Choose the antonym of “silent”.",
    "options": [
      "defeat",
      "noisy",
      "ambiguous",
      "exclude"
    ]
  },
  {
    "id": "missing-197",
    "sentence": "Item 197: The word with the opposite meaning to “noisy” is ____ .",
    "answer": "silent",
    "clue": "Choose the antonym of “noisy”.",
    "options": [
      "silent",
      "bold",
      "simplify",
      "asleep"
    ]
  },
  {
    "id": "missing-198",
    "sentence": "Item 198: The word with the opposite meaning to “hidden” is ____ .",
    "answer": "visible",
    "clue": "Choose the antonym of “hidden”.",
    "options": [
      "arrive",
      "honesty",
      "foreign",
      "visible"
    ]
  },
  {
    "id": "missing-199",
    "sentence": "Item 199: The word with the opposite meaning to “visible” is ____ .",
    "answer": "hidden",
    "clue": "Choose the antonym of “visible”.",
    "options": [
      "tough",
      "confusing",
      "hidden",
      "melt"
    ]
  },
  {
    "id": "missing-200",
    "sentence": "Item 200: The word with the opposite meaning to “awake” is ____ .",
    "answer": "asleep",
    "clue": "Choose the antonym of “awake”.",
    "options": [
      "trivial",
      "asleep",
      "ending",
      "eloquent"
    ]
  },
  {
    "id": "missing-201",
    "sentence": "Item 201: The word with the opposite meaning to “asleep” is ____ .",
    "answer": "awake",
    "clue": "Choose the antonym of “asleep”.",
    "options": [
      "awake",
      "calm",
      "meticulous",
      "specific"
    ]
  },
  {
    "id": "missing-202",
    "sentence": "Item 202: The word with the opposite meaning to “full” is ____ .",
    "answer": "empty",
    "clue": "Choose the antonym of “full”.",
    "options": [
      "indecisive",
      "pessimistic",
      "construct",
      "empty"
    ]
  },
  {
    "id": "missing-203",
    "sentence": "Item 203: The word with the opposite meaning to “empty” is ____ .",
    "answer": "full",
    "clue": "Choose the antonym of “empty”.",
    "options": [
      "ascend",
      "arrival",
      "full",
      "unequivocal"
    ]
  },
  {
    "id": "missing-204",
    "sentence": "Item 204: The word with the opposite meaning to “broad” is ____ .",
    "answer": "narrow",
    "clue": "Choose the antonym of “broad”.",
    "options": [
      "awake",
      "narrow",
      "courteous",
      "preserve"
    ]
  },
  {
    "id": "missing-205",
    "sentence": "Item 205: The word with the opposite meaning to “narrow” is ____ .",
    "answer": "broad",
    "clue": "Choose the antonym of “narrow”.",
    "options": [
      "broad",
      "depart",
      "deceit",
      "minor"
    ]
  },
  {
    "id": "missing-206",
    "sentence": "Item 206: The word with the opposite meaning to “deep” is ____ .",
    "answer": "shallow",
    "clue": "Choose the antonym of “deep”.",
    "options": [
      "freeze",
      "mature",
      "mandatory",
      "shallow"
    ]
  },
  {
    "id": "missing-207",
    "sentence": "Item 207: The word with the opposite meaning to “shallow” is ____ .",
    "answer": "deep",
    "clue": "Choose the antonym of “shallow”.",
    "options": [
      "inarticulate",
      "significant",
      "deep",
      "entrance"
    ]
  },
  {
    "id": "missing-208",
    "sentence": "Item 208: The word with the opposite meaning to “tight” is ____ .",
    "answer": "loose",
    "clue": "Choose the antonym of “tight”.",
    "options": [
      "complex",
      "loose",
      "agitated",
      "careless"
    ]
  },
  {
    "id": "missing-209",
    "sentence": "Item 209: The word with the opposite meaning to “loose” is ____ .",
    "answer": "tight",
    "clue": "Choose the antonym of “loose”.",
    "options": [
      "tight",
      "economical",
      "transparent",
      "demolish"
    ]
  },
  {
    "id": "missing-210",
    "sentence": "Item 210: The word with the opposite meaning to “rough” is ____ .",
    "answer": "smooth",
    "clue": "Choose the antonym of “rough”.",
    "options": [
      "obsolete",
      "descend",
      "departure",
      "smooth"
    ]
  },
  {
    "id": "missing-211",
    "sentence": "Item 211: The word with the opposite meaning to “smooth” is ____ .",
    "answer": "rough",
    "clue": "Choose the antonym of “smooth”.",
    "options": [
      "neglect",
      "empty",
      "rough",
      "rude"
    ]
  },
  {
    "id": "missing-212",
    "sentence": "Item 212: The word with the opposite meaning to “sweet” is ____ .",
    "answer": "bitter",
    "clue": "Choose the antonym of “sweet”.",
    "options": [
      "major",
      "bitter",
      "increase",
      "freedom"
    ]
  },
  {
    "id": "missing-213",
    "sentence": "Item 213: The word with the opposite meaning to “bitter” is ____ .",
    "answer": "sweet",
    "clue": "Choose the antonym of “bitter”.",
    "options": [
      "sweet",
      "float",
      "immature",
      "optional"
    ]
  },
  {
    "id": "missing-214",
    "sentence": "Item 214: The word with the opposite meaning to “tough” is ____ .",
    "answer": "tender",
    "clue": "Choose the antonym of “tough”.",
    "options": [
      "exit",
      "benevolent",
      "profound",
      "tender"
    ]
  },
  {
    "id": "missing-215",
    "sentence": "Item 215: The word with the opposite meaning to “tender” is ____ .",
    "answer": "tough",
    "clue": "Choose the antonym of “tender”.",
    "options": [
      "reluctant",
      "simple",
      "tough",
      "cheerful"
    ]
  },
  {
    "id": "missing-216",
    "sentence": "Item 216: The word with the opposite meaning to “immature” is ____ .",
    "answer": "mature",
    "clue": "Choose the antonym of “immature”.",
    "options": [
      "protect",
      "mature",
      "wasteful",
      "opaque"
    ]
  },
  {
    "id": "missing-217",
    "sentence": "Item 217: The word with the opposite meaning to “mature” is ____ .",
    "answer": "immature",
    "clue": "Choose the antonym of “mature”.",
    "options": [
      "immature",
      "modern",
      "conceal",
      "maximum"
    ]
  },
  {
    "id": "missing-218",
    "sentence": "Item 218: The word with the opposite meaning to “barren” is ____ .",
    "answer": "fertile",
    "clue": "Choose the antonym of “barren”.",
    "options": [
      "ancient",
      "praise",
      "full",
      "fertile"
    ]
  },
  {
    "id": "missing-219",
    "sentence": "Item 219: The word with the opposite meaning to “fertile” is ____ .",
    "answer": "barren",
    "clue": "Choose the antonym of “fertile”.",
    "options": [
      "captivity",
      "interior",
      "barren",
      "decrease"
    ]
  },
  {
    "id": "missing-220",
    "sentence": "Item 220: The word with the opposite meaning to “guilty” is ____ .",
    "answer": "innocent",
    "clue": "Choose the antonym of “guilty”.",
    "options": [
      "mundane",
      "innocent",
      "sink",
      "fertile"
    ]
  },
  {
    "id": "missing-221",
    "sentence": "Item 221: The word with the opposite meaning to “innocent” is ____ .",
    "answer": "guilty",
    "clue": "Choose the antonym of “innocent”.",
    "options": [
      "guilty",
      "fiction",
      "malevolent",
      "superficial"
    ]
  },
  {
    "id": "missing-222",
    "sentence": "Item 222: The word with the opposite meaning to “illegal” is ____ .",
    "answer": "legal",
    "clue": "Choose the antonym of “illegal”.",
    "options": [
      "miserable",
      "eager",
      "cautious",
      "legal"
    ]
  },
  {
    "id": "missing-223",
    "sentence": "Item 223: The word with the opposite meaning to “legal” is ____ .",
    "answer": "illegal",
    "clue": "Choose the antonym of “legal”.",
    "options": [
      "temporary",
      "endanger",
      "illegal",
      "explicit"
    ]
  },
  {
    "id": "missing-224",
    "sentence": "Item 224: The word with the opposite meaning to “irregular” is ____ .",
    "answer": "regular",
    "clue": "Choose the antonym of “irregular”.",
    "options": [
      "minimum",
      "regular",
      "scarce",
      "reveal"
    ]
  },
  {
    "id": "missing-225",
    "sentence": "Item 225: The word with the opposite meaning to “regular” is ____ .",
    "answer": "irregular",
    "clue": "Choose the antonym of “regular”.",
    "options": [
      "irregular",
      "recent",
      "criticize",
      "narrow"
    ]
  },
  {
    "id": "missing-226",
    "sentence": "Item 226: The word with the opposite meaning to “impossible” is ____ .",
    "answer": "possible",
    "clue": "Choose the antonym of “impossible”.",
    "options": [
      "encourage",
      "harmony",
      "exterior",
      "possible"
    ]
  },
  {
    "id": "missing-227",
    "sentence": "Item 227: The word with the opposite meaning to “possible” is ____ .",
    "answer": "impossible",
    "clue": "Choose the antonym of “possible”.",
    "options": [
      "barren",
      "extraordinary",
      "impossible",
      "gather"
    ]
  },
  {
    "id": "missing-228",
    "sentence": "Item 228: The word with the opposite meaning to “illogical” is ____ .",
    "answer": "logical",
    "clue": "Choose the antonym of “illogical”.",
    "options": [
      "feasible",
      "logical",
      "fact",
      "amiable"
    ]
  },
  {
    "id": "missing-229",
    "sentence": "Item 229: The word with the opposite meaning to “logical” is ____ .",
    "answer": "illogical",
    "clue": "Choose the antonym of “logical”.",
    "options": [
      "illogical",
      "pleasant",
      "skeptical",
      "rash"
    ]
  },
  {
    "id": "missing-230",
    "sentence": "Item 230: The word with the opposite meaning to “agitated” is ____ .",
    "answer": "calm",
    "clue": "Choose the antonym of “agitated”.",
    "options": [
      "implicit",
      "permanent",
      "unite",
      "calm"
    ]
  },
  {
    "id": "missing-231",
    "sentence": "Item 231: The word with the opposite meaning to “calm” is ____ .",
    "answer": "agitated",
    "clue": "Choose the antonym of “calm”.",
    "options": [
      "accelerate",
      "optimism",
      "agitated",
      "abundant"
    ]
  },
  {
    "id": "missing-232",
    "sentence": "Item 232: The word with the opposite meaning to “miserable” is ____ .",
    "answer": "cheerful",
    "clue": "Choose the antonym of “miserable”.",
    "options": [
      "broad",
      "cheerful",
      "genuine",
      "reward"
    ]
  },
  {
    "id": "missing-233",
    "sentence": "Item 233: The word with the opposite meaning to “cheerful” is ____ .",
    "answer": "miserable",
    "clue": "Choose the antonym of “cheerful”.",
    "options": [
      "miserable",
      "discourage",
      "discord",
      "superior"
    ]
  },
  {
    "id": "missing-234",
    "sentence": "Item 234: The word with the opposite meaning to “unpleasant” is ____ .",
    "answer": "pleasant",
    "clue": "Choose the antonym of “unpleasant”.",
    "options": [
      "scatter",
      "innocent",
      "novice",
      "pleasant"
    ]
  },
  {
    "id": "missing-235",
    "sentence": "Item 235: The word with the opposite meaning to “pleasant” is ____ .",
    "answer": "unpleasant",
    "clue": "Choose the antonym of “pleasant”.",
    "options": [
      "abrasive",
      "impractical",
      "unpleasant",
      "virtue"
    ]
  },
  {
    "id": "missing-236",
    "sentence": "Item 236: The word with the opposite meaning to “selfish” is ____ .",
    "answer": "selfless",
    "clue": "Choose the antonym of “selfish”.",
    "options": [
      "modest",
      "selfless",
      "unpleasant",
      "gullible"
    ]
  },
  {
    "id": "missing-237",
    "sentence": "Item 237: The word with the opposite meaning to “selfless” is ____ .",
    "answer": "selfish",
    "clue": "Choose the antonym of “selfless”.",
    "options": [
      "selfish",
      "favorable",
      "frequent",
      "divide"
    ]
  },
  {
    "id": "missing-238",
    "sentence": "Item 238: The word with the opposite meaning to “passive” is ____ .",
    "answer": "active",
    "clue": "Choose the antonym of “passive”.",
    "options": [
      "coherent",
      "decelerate",
      "despair",
      "active"
    ]
  },
  {
    "id": "missing-239",
    "sentence": "Item 239: The word with the opposite meaning to “active” is ____ .",
    "answer": "passive",
    "clue": "Choose the antonym of “active”.",
    "options": [
      "punish",
      "shallow",
      "passive",
      "counterfeit"
    ]
  },
  {
    "id": "missing-240",
    "sentence": "Item 240: The word with the opposite meaning to “occupied” is ____ .",
    "answer": "vacant",
    "clue": "Choose the antonym of “occupied”.",
    "options": [
      "inferior",
      "vacant",
      "permit",
      "poverty"
    ]
  },
  {
    "id": "missing-241",
    "sentence": "Item 241: The word with the opposite meaning to “vacant” is ____ .",
    "answer": "occupied",
    "clue": "Choose the antonym of “vacant”.",
    "options": [
      "occupied",
      "tighten",
      "guilty",
      "expert"
    ]
  },
  {
    "id": "missing-242",
    "sentence": "Item 242: The word with the opposite meaning to “foreign” is ____ .",
    "answer": "domestic",
    "clue": "Choose the antonym of “foreign”.",
    "options": [
      "vice",
      "arduous",
      "notorious",
      "domestic"
    ]
  },
  {
    "id": "missing-243",
    "sentence": "Item 243: The word with the opposite meaning to “domestic” is ____ .",
    "answer": "foreign",
    "clue": "Choose the antonym of “domestic”.",
    "options": [
      "resilient",
      "boastful",
      "foreign",
      "selfless"
    ]
  },
  {
    "id": "missing-244",
    "sentence": "Item 244: The word with the opposite meaning to “major” is ____ .",
    "answer": "minor",
    "clue": "Choose the antonym of “major”.",
    "options": [
      "attract",
      "minor",
      "adverse",
      "occasional"
    ]
  },
  {
    "id": "missing-245",
    "sentence": "Item 245: The word with the opposite meaning to “minor” is ____ .",
    "answer": "major",
    "clue": "Choose the antonym of “minor”.",
    "options": [
      "major",
      "incoherent",
      "strengthen",
      "chaos"
    ]
  },
  {
    "id": "missing-246",
    "sentence": "Item 246: The word with the opposite meaning to “exterior” is ____ .",
    "answer": "interior",
    "clue": "Choose the antonym of “exterior”.",
    "options": [
      "loyal",
      "repair",
      "deep",
      "interior"
    ]
  },
  {
    "id": "missing-247",
    "sentence": "Item 247: The word with the opposite meaning to “interior” is ____ .",
    "answer": "exterior",
    "clue": "Choose the antonym of “interior”.",
    "options": [
      "wealth",
      "positive",
      "exterior",
      "forbid"
    ]
  },
  {
    "id": "missing-248",
    "sentence": "Item 248: The word with the opposite meaning to “inferior” is ____ .",
    "answer": "superior",
    "clue": "Choose the antonym of “inferior”.",
    "options": [
      "perilous",
      "superior",
      "loosen",
      "legal"
    ]
  },
  {
    "id": "missing-249",
    "sentence": "Item 249: The word with the opposite meaning to “superior” is ____ .",
    "answer": "inferior",
    "clue": "Choose the antonym of “superior”.",
    "options": [
      "inferior",
      "dawn",
      "effortless",
      "respected"
    ]
  },
  {
    "id": "missing-250",
    "sentence": "Item 250: The word with the opposite meaning to “negative” is ____ .",
    "answer": "positive",
    "clue": "Choose the antonym of “negative”.",
    "options": [
      "selfish",
      "fragile",
      "artificial",
      "positive"
    ]
  },
  {
    "id": "missing-251",
    "sentence": "Item 251: The word with the opposite meaning to “positive” is ____ .",
    "answer": "negative",
    "clue": "Choose the antonym of “positive”.",
    "options": [
      "hostile",
      "repel",
      "negative",
      "feigned"
    ]
  },
  {
    "id": "missing-252",
    "sentence": "Item 252: The word with the opposite meaning to “public” is ____ .",
    "answer": "private",
    "clue": "Choose the antonym of “public”.",
    "options": [
      "order",
      "private",
      "diligent",
      "weaken"
    ]
  },
  {
    "id": "missing-253",
    "sentence": "Item 253: The word with the opposite meaning to “private” is ____ .",
    "answer": "public",
    "clue": "Choose the antonym of “private”.",
    "options": [
      "public",
      "treacherous",
      "damage",
      "loose"
    ]
  },
  {
    "id": "missing-254",
    "sentence": "Item 254: The word with the opposite meaning to “lenient” is ____ .",
    "answer": "rigorous",
    "clue": "Choose the antonym of “lenient”.",
    "options": [
      "remember",
      "strength",
      "negative",
      "rigorous"
    ]
  },
  {
    "id": "missing-255",
    "sentence": "Item 255: The word with the opposite meaning to “rigorous” is ____ .",
    "answer": "lenient",
    "clue": "Choose the antonym of “rigorous”.",
    "options": [
      "illegal",
      "safe",
      "lenient",
      "connect"
    ]
  },
  {
    "id": "missing-256",
    "sentence": "Item 256: The word with the opposite meaning to “spurious” is ____ .",
    "answer": "authentic",
    "clue": "Choose the antonym of “spurious”.",
    "options": [
      "versatile",
      "authentic",
      "dusk",
      "brisk"
    ]
  },
  {
    "id": "missing-257",
    "sentence": "Item 257: The word with the opposite meaning to “authentic” is ____ .",
    "answer": "spurious",
    "clue": "Choose the antonym of “authentic”.",
    "options": [
      "spurious",
      "active",
      "plausible",
      "natural"
    ]
  },
  {
    "id": "missing-258",
    "sentence": "Item 258: The word with the opposite meaning to “inarticulate” is ____ .",
    "answer": "eloquent",
    "clue": "Choose the antonym of “inarticulate”.",
    "options": [
      "imminent",
      "friendly",
      "borrow",
      "eloquent"
    ]
  },
  {
    "id": "missing-259",
    "sentence": "Item 259: The word with the opposite meaning to “eloquent” is ____ .",
    "answer": "inarticulate",
    "clue": "Choose the antonym of “eloquent”.",
    "options": [
      "approve",
      "generosity",
      "inarticulate",
      "idle"
    ]
  },
  {
    "id": "missing-260",
    "sentence": "Item 260: The word with the opposite meaning to “malevolent” is ____ .",
    "answer": "benevolent",
    "clue": "Choose the antonym of “malevolent”.",
    "options": [
      "tight",
      "benevolent",
      "patient",
      "support"
    ]
  },
  {
    "id": "missing-261",
    "sentence": "Item 261: The word with the opposite meaning to “benevolent” is ____ .",
    "answer": "malevolent",
    "clue": "Choose the antonym of “benevolent”.",
    "options": [
      "malevolent",
      "forget",
      "weakness",
      "private"
    ]
  },
  {
    "id": "missing-262",
    "sentence": "Item 262: The word with the opposite meaning to “abrasive” is ____ .",
    "answer": "amiable",
    "clue": "Choose the antonym of “abrasive”.",
    "options": [
      "disconnect",
      "regular",
      "plentiful",
      "amiable"
    ]
  },
  {
    "id": "missing-263",
    "sentence": "Item 263: The word with the opposite meaning to “amiable” is ____ .",
    "answer": "abrasive",
    "clue": "Choose the antonym of “amiable”.",
    "options": [
      "sluggish",
      "inflexible",
      "abrasive",
      "noisy"
    ]
  },
  {
    "id": "missing-264",
    "sentence": "Item 264: The word with the opposite meaning to “effortless” is ____ .",
    "answer": "arduous",
    "clue": "Choose the antonym of “effortless”.",
    "options": [
      "expand",
      "arduous",
      "passive",
      "implausible"
    ]
  },
  {
    "id": "missing-265",
    "sentence": "Item 265: The word with the opposite meaning to “arduous” is ____ .",
    "answer": "effortless",
    "clue": "Choose the antonym of “arduous”.",
    "options": [
      "effortless",
      "remote",
      "vivid",
      "lend"
    ]
  },
  {
    "id": "missing-266",
    "sentence": "Item 266: The word with the opposite meaning to “sluggish” is ____ .",
    "answer": "brisk",
    "clue": "Choose the antonym of “sluggish”.",
    "options": [
      "formidable",
      "disapprove",
      "greed",
      "brisk"
    ]
  },
  {
    "id": "missing-267",
    "sentence": "Item 267: The word with the opposite meaning to “brisk” is ____ .",
    "answer": "sluggish",
    "clue": "Choose the antonym of “brisk”.",
    "options": [
      "oppose",
      "smooth",
      "sluggish",
      "impatient"
    ]
  },
  {
    "id": "missing-268",
    "sentence": "Item 268: The word with the opposite meaning to “evasive” is ____ .",
    "answer": "candid",
    "clue": "Choose the antonym of “evasive”.",
    "options": [
      "public",
      "candid",
      "succeed",
      "success"
    ]
  },
  {
    "id": "missing-269",
    "sentence": "Item 269: The word with the opposite meaning to “candid” is ____ .",
    "answer": "evasive",
    "clue": "Choose the antonym of “candid”.",
    "options": [
      "evasive",
      "arrange",
      "irregular",
      "meagre"
    ]
  },
  {
    "id": "missing-270",
    "sentence": "Item 270: The word with the opposite meaning to “flustered” is ____ .",
    "answer": "composed",
    "clue": "Choose the antonym of “flustered”.",
    "options": [
      "silent",
      "candid",
      "generous",
      "composed"
    ]
  },
  {
    "id": "missing-271",
    "sentence": "Item 271: The word with the opposite meaning to “composed” is ____ .",
    "answer": "flustered",
    "clue": "Choose the antonym of “composed”.",
    "options": [
      "concise",
      "contract",
      "flustered",
      "vacant"
    ]
  },
  {
    "id": "missing-272",
    "sentence": "Item 272: The word with the opposite meaning to “indecisive” is ____ .",
    "answer": "decisive",
    "clue": "Choose the antonym of “indecisive”.",
    "options": [
      "omit",
      "decisive",
      "innovative",
      "dull"
    ]
  },
  {
    "id": "missing-273",
    "sentence": "Item 273: The word with the opposite meaning to “decisive” is ____ .",
    "answer": "indecisive",
    "clue": "Choose the antonym of “decisive”.",
    "options": [
      "indecisive",
      "manageable",
      "combine",
      "courage"
    ]
  },
  {
    "id": "missing-274",
    "sentence": "Item 274: The word with the opposite meaning to “wasteful” is ____ .",
    "answer": "economical",
    "clue": "Choose the antonym of “wasteful”.",
    "options": [
      "accurate",
      "whisper",
      "rough",
      "economical"
    ]
  },
  {
    "id": "missing-275",
    "sentence": "Item 275: The word with the opposite meaning to “economical” is ____ .",
    "answer": "wasteful",
    "clue": "Choose the antonym of “economical”.",
    "options": [
      "failure",
      "rigorous",
      "wasteful",
      "fail"
    ]
  },
  {
    "id": "missing-276",
    "sentence": "Item 276: The word with the opposite meaning to “implicit” is ____ .",
    "answer": "explicit",
    "clue": "Choose the antonym of “implicit”.",
    "options": [
      "rational",
      "explicit",
      "disorder",
      "possible"
    ]
  },
  {
    "id": "missing-277",
    "sentence": "Item 277: The word with the opposite meaning to “explicit” is ____ .",
    "answer": "implicit",
    "clue": "Choose the antonym of “explicit”.",
    "options": [
      "implicit",
      "visible",
      "evasive",
      "stingy"
    ]
  },
  {
    "id": "missing-278",
    "sentence": "Item 278: The word with the opposite meaning to “adverse” is ____ .",
    "answer": "favorable",
    "clue": "Choose the antonym of “adverse”.",
    "options": [
      "occupied",
      "verbose",
      "accept",
      "favorable"
    ]
  },
  {
    "id": "missing-279",
    "sentence": "Item 279: The word with the opposite meaning to “favorable” is ____ .",
    "answer": "adverse",
    "clue": "Choose the antonym of “favorable”.",
    "options": [
      "rigid",
      "expose",
      "adverse",
      "conventional"
    ]
  },
  {
    "id": "missing-280",
    "sentence": "Item 280: The word with the opposite meaning to “genuine” is ____ .",
    "answer": "feigned",
    "clue": "Choose the antonym of “genuine”.",
    "options": [
      "cowardice",
      "feigned",
      "prudent",
      "separate"
    ]
  },
  {
    "id": "missing-281",
    "sentence": "Item 281: The word with the opposite meaning to “remote” is ____ .",
    "answer": "imminent",
    "clue": "Choose the antonym of “remote”.",
    "options": [
      "imminent",
      "inaccurate",
      "shout",
      "bitter"
    ]
  },
  {
    "id": "missing-282",
    "sentence": "Item 282: The word with the opposite meaning to “imminent” is ____ .",
    "answer": "remote",
    "clue": "Choose the antonym of “imminent”.",
    "options": [
      "advance",
      "friend",
      "lenient",
      "remote"
    ]
  },
  {
    "id": "missing-283",
    "sentence": "Item 283: The word with the opposite meaning to “conventional” is ____ .",
    "answer": "innovative",
    "clue": "Choose the antonym of “conventional”.",
    "options": [
      "impossible",
      "irrational",
      "innovative",
      "victory"
    ]
  },
  {
    "id": "missing-284",
    "sentence": "Item 284: The word with the opposite meaning to “innovative” is ____ .",
    "answer": "conventional",
    "clue": "Choose the antonym of “innovative”.",
    "options": [
      "humble",
      "conventional",
      "hidden",
      "composed"
    ]
  },
  {
    "id": "missing-285",
    "sentence": "Item 285: The word with the opposite meaning to “confusing” is ____ .",
    "answer": "lucid",
    "clue": "Choose the antonym of “confusing”.",
    "options": [
      "lucid",
      "domestic",
      "impartial",
      "reject"
    ]
  },
  {
    "id": "missing-286",
    "sentence": "Item 286: The word with the opposite meaning to “lucid” is ____ .",
    "answer": "confusing",
    "clue": "Choose the antonym of “lucid”.",
    "options": [
      "lucid",
      "flexible",
      "shield",
      "confusing"
    ]
  },
  {
    "id": "missing-287",
    "sentence": "Item 287: The word with the opposite meaning to “optional” is ____ .",
    "answer": "mandatory",
    "clue": "Choose the antonym of “optional”.",
    "options": [
      "create",
      "wisdom",
      "mandatory",
      "reckless"
    ]
  },
  {
    "id": "missing-288",
    "sentence": "Item 288: The word with the opposite meaning to “mandatory” is ____ .",
    "answer": "optional",
    "clue": "Choose the antonym of “mandatory”.",
    "options": [
      "sweet",
      "optional",
      "vague",
      "vanish"
    ]
  },
  {
    "id": "missing-289",
    "sentence": "Item 289: The word with the opposite meaning to “extraordinary” is ____ .",
    "answer": "mundane",
    "clue": "Choose the antonym of “extraordinary”.",
    "options": [
      "mundane",
      "retreat",
      "enemy",
      "authentic"
    ]
  },
  {
    "id": "missing-290",
    "sentence": "Item 290: The word with the opposite meaning to “mundane” is ____ .",
    "answer": "extraordinary",
    "clue": "Choose the antonym of “mundane”.",
    "options": [
      "defeat",
      "logical",
      "relentless",
      "extraordinary"
    ]
  },
  {
    "id": "missing-291",
    "sentence": "Item 291: The word with the opposite meaning to “expert” is ____ .",
    "answer": "novice",
    "clue": "Choose the antonym of “expert”.",
    "options": [
      "flustered",
      "arrogant",
      "novice",
      "asleep"
    ]
  },
  {
    "id": "missing-292",
    "sentence": "Item 292: The word with the opposite meaning to “novice” is ____ .",
    "answer": "expert",
    "clue": "Choose the antonym of “novice”.",
    "options": [
      "include",
      "expert",
      "foreign",
      "biased"
    ]
  },
  {
    "id": "missing-293",
    "sentence": "Item 293: The word with the opposite meaning to “safe” is ____ .",
    "answer": "perilous",
    "clue": "Choose the antonym of “safe”.",
    "options": [
      "perilous",
      "confusing",
      "timid",
      "complicate"
    ]
  },
  {
    "id": "missing-294",
    "sentence": "Item 294: The word with the opposite meaning to “perilous” is ____ .",
    "answer": "safe",
    "clue": "Choose the antonym of “perilous”.",
    "options": [
      "trivial",
      "destroy",
      "foolishness",
      "safe"
    ]
  },
  {
    "id": "missing-295",
    "sentence": "Item 295: The word with the opposite meaning to “meagre” is ____ .",
    "answer": "plentiful",
    "clue": "Choose the antonym of “meagre”.",
    "options": [
      "appear",
      "tender",
      "plentiful",
      "specific"
    ]
  },
  {
    "id": "missing-296",
    "sentence": "Item 296: The word with the opposite meaning to “plentiful” is ____ .",
    "answer": "meagre",
    "clue": "Choose the antonym of “plentiful”.",
    "options": [
      "spurious",
      "meagre",
      "construct",
      "beginning"
    ]
  },
  {
    "id": "missing-297",
    "sentence": "Item 297: The word with the opposite meaning to “irrational” is ____ .",
    "answer": "rational",
    "clue": "Choose the antonym of “irrational”.",
    "options": [
      "rational",
      "arrival",
      "illogical",
      "merciful"
    ]
  },
  {
    "id": "missing-298",
    "sentence": "Item 298: The word with the opposite meaning to “rational” is ____ .",
    "answer": "irrational",
    "clue": "Choose the antonym of “rational”.",
    "options": [
      "awake",
      "decisive",
      "optimistic",
      "irrational"
    ]
  },
  {
    "id": "missing-299",
    "sentence": "Item 299: The word with the opposite meaning to “merciful” is ____ .",
    "answer": "relentless",
    "clue": "Choose the antonym of “merciful”.",
    "options": [
      "ambiguous",
      "exclude",
      "relentless",
      "minor"
    ]
  },
  {
    "id": "missing-300",
    "sentence": "Item 300: The word with the opposite meaning to “relentless” is ____ .",
    "answer": "merciful",
    "clue": "Choose the antonym of “relentless”.",
    "options": [
      "simplify",
      "merciful",
      "mandatory",
      "bold"
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
