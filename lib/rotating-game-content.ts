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
    "sentence": "The capital city of France is ____ .",
    "answer": "Paris",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Paris",
      "Beijing",
      "Dublin",
      "Accra"
    ]
  },
  {
    "id": "missing-002",
    "sentence": "The capital city of Japan is ____ .",
    "answer": "Tokyo",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Seoul",
      "Reykjavik",
      "Addis Ababa",
      "Tokyo"
    ]
  },
  {
    "id": "missing-003",
    "sentence": "The capital city of Canada is ____ .",
    "answer": "Ottawa",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Madrid",
      "Dodoma",
      "Ottawa",
      "Hanoi"
    ]
  },
  {
    "id": "missing-004",
    "sentence": "The capital city of Australia is ____ .",
    "answer": "Canberra",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Wellington",
      "Canberra",
      "Phnom Penh",
      "Rome"
    ]
  },
  {
    "id": "missing-005",
    "sentence": "The capital city of Brazil is ____ .",
    "answer": "Brasilia",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Brasilia",
      "Vientiane",
      "Berlin",
      "Paris"
    ]
  },
  {
    "id": "missing-006",
    "sentence": "The capital city of Egypt is ____ .",
    "answer": "Cairo",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Ulaanbaatar",
      "Havana",
      "Tokyo",
      "Cairo"
    ]
  },
  {
    "id": "missing-007",
    "sentence": "The capital city of Kenya is ____ .",
    "answer": "Nairobi",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Mexico City",
      "Ottawa",
      "Nairobi",
      "Moscow"
    ]
  },
  {
    "id": "missing-008",
    "sentence": "The capital city of Thailand is ____ .",
    "answer": "Bangkok",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Canberra",
      "Bangkok",
      "Kyiv",
      "Lima"
    ]
  },
  {
    "id": "missing-009",
    "sentence": "The capital city of Norway is ____ .",
    "answer": "Oslo",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Oslo",
      "Warsaw",
      "Santiago",
      "Brasilia"
    ]
  },
  {
    "id": "missing-010",
    "sentence": "The capital city of Sweden is ____ .",
    "answer": "Stockholm",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Vienna",
      "Buenos Aires",
      "Cairo",
      "Stockholm"
    ]
  },
  {
    "id": "missing-011",
    "sentence": "The capital city of Finland is ____ .",
    "answer": "Helsinki",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Bogota",
      "Nairobi",
      "Helsinki",
      "Bern"
    ]
  },
  {
    "id": "missing-012",
    "sentence": "The capital city of Denmark is ____ .",
    "answer": "Copenhagen",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Bangkok",
      "Copenhagen",
      "Brussels",
      "Rabat"
    ]
  },
  {
    "id": "missing-013",
    "sentence": "The capital city of Portugal is ____ .",
    "answer": "Lisbon",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Lisbon",
      "Amsterdam",
      "Abuja",
      "Oslo"
    ]
  },
  {
    "id": "missing-014",
    "sentence": "The capital city of Greece is ____ .",
    "answer": "Athens",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Dublin",
      "Accra",
      "Stockholm",
      "Athens"
    ]
  },
  {
    "id": "missing-015",
    "sentence": "The capital city of Turkey is ____ .",
    "answer": "Ankara",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Addis Ababa",
      "Helsinki",
      "Ankara",
      "Reykjavik"
    ]
  },
  {
    "id": "missing-016",
    "sentence": "The capital city of Nepal is ____ .",
    "answer": "Kathmandu",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Copenhagen",
      "Kathmandu",
      "Madrid",
      "Dodoma"
    ]
  },
  {
    "id": "missing-017",
    "sentence": "The capital city of Bhutan is ____ .",
    "answer": "Thimphu",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Thimphu",
      "Rome",
      "Wellington",
      "Lisbon"
    ]
  },
  {
    "id": "missing-018",
    "sentence": "The capital city of Bangladesh is ____ .",
    "answer": "Dhaka",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Berlin",
      "Paris",
      "Athens",
      "Dhaka"
    ]
  },
  {
    "id": "missing-019",
    "sentence": "The capital city of Pakistan is ____ .",
    "answer": "Islamabad",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Tokyo",
      "Ankara",
      "Islamabad",
      "Havana"
    ]
  },
  {
    "id": "missing-020",
    "sentence": "The capital city of Afghanistan is ____ .",
    "answer": "Kabul",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Kathmandu",
      "Kabul",
      "Mexico City",
      "Ottawa"
    ]
  },
  {
    "id": "missing-021",
    "sentence": "The capital city of China is ____ .",
    "answer": "Beijing",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Beijing",
      "Lima",
      "Canberra",
      "Thimphu"
    ]
  },
  {
    "id": "missing-022",
    "sentence": "The capital city of South Korea is ____ .",
    "answer": "Seoul",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Santiago",
      "Brasilia",
      "Dhaka",
      "Seoul"
    ]
  },
  {
    "id": "missing-023",
    "sentence": "The capital city of Vietnam is ____ .",
    "answer": "Hanoi",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Cairo",
      "Islamabad",
      "Hanoi",
      "Buenos Aires"
    ]
  },
  {
    "id": "missing-024",
    "sentence": "The capital city of Cambodia is ____ .",
    "answer": "Phnom Penh",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Kabul",
      "Phnom Penh",
      "Bogota",
      "Nairobi"
    ]
  },
  {
    "id": "missing-025",
    "sentence": "The capital city of Laos is ____ .",
    "answer": "Vientiane",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Vientiane",
      "Rabat",
      "Bangkok",
      "Beijing"
    ]
  },
  {
    "id": "missing-026",
    "sentence": "The capital city of Mongolia is ____ .",
    "answer": "Ulaanbaatar",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Abuja",
      "Oslo",
      "Seoul",
      "Ulaanbaatar"
    ]
  },
  {
    "id": "missing-027",
    "sentence": "The capital city of Russia is ____ .",
    "answer": "Moscow",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Stockholm",
      "Hanoi",
      "Moscow",
      "Accra"
    ]
  },
  {
    "id": "missing-028",
    "sentence": "The capital city of Ukraine is ____ .",
    "answer": "Kyiv",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Phnom Penh",
      "Kyiv",
      "Addis Ababa",
      "Helsinki"
    ]
  },
  {
    "id": "missing-029",
    "sentence": "The capital city of Poland is ____ .",
    "answer": "Warsaw",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Warsaw",
      "Dodoma",
      "Copenhagen",
      "Vientiane"
    ]
  },
  {
    "id": "missing-030",
    "sentence": "The capital city of Austria is ____ .",
    "answer": "Vienna",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Wellington",
      "Lisbon",
      "Ulaanbaatar",
      "Vienna"
    ]
  },
  {
    "id": "missing-031",
    "sentence": "The capital city of Switzerland is ____ .",
    "answer": "Bern",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Athens",
      "Moscow",
      "Bern",
      "Paris"
    ]
  },
  {
    "id": "missing-032",
    "sentence": "The capital city of Belgium is ____ .",
    "answer": "Brussels",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Kyiv",
      "Brussels",
      "Tokyo",
      "Ankara"
    ]
  },
  {
    "id": "missing-033",
    "sentence": "The capital city of Netherlands is ____ .",
    "answer": "Amsterdam",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Amsterdam",
      "Ottawa",
      "Kathmandu",
      "Warsaw"
    ]
  },
  {
    "id": "missing-034",
    "sentence": "The capital city of Ireland is ____ .",
    "answer": "Dublin",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Canberra",
      "Thimphu",
      "Vienna",
      "Dublin"
    ]
  },
  {
    "id": "missing-035",
    "sentence": "The capital city of Iceland is ____ .",
    "answer": "Reykjavik",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Dhaka",
      "Bern",
      "Reykjavik",
      "Brasilia"
    ]
  },
  {
    "id": "missing-036",
    "sentence": "The capital city of Spain is ____ .",
    "answer": "Madrid",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Brussels",
      "Madrid",
      "Cairo",
      "Islamabad"
    ]
  },
  {
    "id": "missing-037",
    "sentence": "The capital city of Italy is ____ .",
    "answer": "Rome",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Rome",
      "Nairobi",
      "Kabul",
      "Amsterdam"
    ]
  },
  {
    "id": "missing-038",
    "sentence": "The capital city of Germany is ____ .",
    "answer": "Berlin",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Bangkok",
      "Beijing",
      "Dublin",
      "Berlin"
    ]
  },
  {
    "id": "missing-039",
    "sentence": "The capital city of Cuba is ____ .",
    "answer": "Havana",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Seoul",
      "Reykjavik",
      "Havana",
      "Oslo"
    ]
  },
  {
    "id": "missing-040",
    "sentence": "The capital city of Mexico is ____ .",
    "answer": "Mexico City",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Madrid",
      "Mexico City",
      "Stockholm",
      "Hanoi"
    ]
  },
  {
    "id": "missing-041",
    "sentence": "The capital city of Peru is ____ .",
    "answer": "Lima",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Lima",
      "Helsinki",
      "Phnom Penh",
      "Rome"
    ]
  },
  {
    "id": "missing-042",
    "sentence": "The capital city of Chile is ____ .",
    "answer": "Santiago",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Copenhagen",
      "Vientiane",
      "Berlin",
      "Santiago"
    ]
  },
  {
    "id": "missing-043",
    "sentence": "The capital city of Argentina is ____ .",
    "answer": "Buenos Aires",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Ulaanbaatar",
      "Havana",
      "Buenos Aires",
      "Lisbon"
    ]
  },
  {
    "id": "missing-044",
    "sentence": "The capital city of Colombia is ____ .",
    "answer": "Bogota",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Mexico City",
      "Bogota",
      "Athens",
      "Moscow"
    ]
  },
  {
    "id": "missing-045",
    "sentence": "The capital city of Morocco is ____ .",
    "answer": "Rabat",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Rabat",
      "Ankara",
      "Kyiv",
      "Lima"
    ]
  },
  {
    "id": "missing-046",
    "sentence": "The capital city of Nigeria is ____ .",
    "answer": "Abuja",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Kathmandu",
      "Warsaw",
      "Santiago",
      "Abuja"
    ]
  },
  {
    "id": "missing-047",
    "sentence": "The capital city of Ghana is ____ .",
    "answer": "Accra",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Vienna",
      "Buenos Aires",
      "Accra",
      "Thimphu"
    ]
  },
  {
    "id": "missing-048",
    "sentence": "The capital city of Ethiopia is ____ .",
    "answer": "Addis Ababa",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Bogota",
      "Addis Ababa",
      "Dhaka",
      "Bern"
    ]
  },
  {
    "id": "missing-049",
    "sentence": "The capital city of Tanzania is ____ .",
    "answer": "Dodoma",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Dodoma",
      "Islamabad",
      "Brussels",
      "Rabat"
    ]
  },
  {
    "id": "missing-050",
    "sentence": "The capital city of New Zealand is ____ .",
    "answer": "Wellington",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Kabul",
      "Amsterdam",
      "Abuja",
      "Wellington"
    ]
  },
  {
    "id": "missing-051",
    "sentence": "The chemical element with the symbol H is ____ .",
    "answer": "Hydrogen",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Scandium",
      "Selenium",
      "Silver",
      "Hydrogen"
    ]
  },
  {
    "id": "missing-052",
    "sentence": "The chemical element with the symbol He is ____ .",
    "answer": "Helium",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Bromine",
      "Cadmium",
      "Helium",
      "Titanium"
    ]
  },
  {
    "id": "missing-053",
    "sentence": "The chemical element with the symbol Li is ____ .",
    "answer": "Lithium",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Indium",
      "Lithium",
      "Vanadium",
      "Krypton"
    ]
  },
  {
    "id": "missing-054",
    "sentence": "The chemical element with the symbol Be is ____ .",
    "answer": "Beryllium",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Beryllium",
      "Chromium",
      "Rubidium",
      "Tin"
    ]
  },
  {
    "id": "missing-055",
    "sentence": "The chemical element with the symbol B is ____ .",
    "answer": "Boron",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Manganese",
      "Strontium",
      "Hydrogen",
      "Boron"
    ]
  },
  {
    "id": "missing-056",
    "sentence": "The chemical element with the symbol C is ____ .",
    "answer": "Carbon",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Yttrium",
      "Helium",
      "Carbon",
      "Iron"
    ]
  },
  {
    "id": "missing-057",
    "sentence": "The chemical element with the symbol N is ____ .",
    "answer": "Nitrogen",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Lithium",
      "Nitrogen",
      "Cobalt",
      "Zirconium"
    ]
  },
  {
    "id": "missing-058",
    "sentence": "The chemical element with the symbol O is ____ .",
    "answer": "Oxygen",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Oxygen",
      "Nickel",
      "Niobium",
      "Beryllium"
    ]
  },
  {
    "id": "missing-059",
    "sentence": "The chemical element with the symbol F is ____ .",
    "answer": "Fluorine",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Copper",
      "Molybdenum",
      "Boron",
      "Fluorine"
    ]
  },
  {
    "id": "missing-060",
    "sentence": "The chemical element with the symbol Ne is ____ .",
    "answer": "Neon",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Technetium",
      "Carbon",
      "Neon",
      "Zinc"
    ]
  },
  {
    "id": "missing-061",
    "sentence": "The chemical element with the symbol Na is ____ .",
    "answer": "Sodium",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Nitrogen",
      "Sodium",
      "Gallium",
      "Ruthenium"
    ]
  },
  {
    "id": "missing-062",
    "sentence": "The chemical element with the symbol Mg is ____ .",
    "answer": "Magnesium",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Magnesium",
      "Germanium",
      "Rhodium",
      "Oxygen"
    ]
  },
  {
    "id": "missing-063",
    "sentence": "The chemical element with the symbol Al is ____ .",
    "answer": "Aluminium",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Arsenic",
      "Palladium",
      "Fluorine",
      "Aluminium"
    ]
  },
  {
    "id": "missing-064",
    "sentence": "The chemical element with the symbol Si is ____ .",
    "answer": "Silicon",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Silver",
      "Neon",
      "Silicon",
      "Selenium"
    ]
  },
  {
    "id": "missing-065",
    "sentence": "The chemical element with the symbol P is ____ .",
    "answer": "Phosphorus",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Sodium",
      "Phosphorus",
      "Bromine",
      "Cadmium"
    ]
  },
  {
    "id": "missing-066",
    "sentence": "The chemical element with the symbol S is ____ .",
    "answer": "Sulfur",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Sulfur",
      "Krypton",
      "Indium",
      "Magnesium"
    ]
  },
  {
    "id": "missing-067",
    "sentence": "The chemical element with the symbol Cl is ____ .",
    "answer": "Chlorine",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Rubidium",
      "Tin",
      "Aluminium",
      "Chlorine"
    ]
  },
  {
    "id": "missing-068",
    "sentence": "The chemical element with the symbol Ar is ____ .",
    "answer": "Argon",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Hydrogen",
      "Silicon",
      "Argon",
      "Strontium"
    ]
  },
  {
    "id": "missing-069",
    "sentence": "The chemical element with the symbol K is ____ .",
    "answer": "Potassium",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Phosphorus",
      "Potassium",
      "Yttrium",
      "Helium"
    ]
  },
  {
    "id": "missing-070",
    "sentence": "The chemical element with the symbol Ca is ____ .",
    "answer": "Calcium",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Calcium",
      "Zirconium",
      "Lithium",
      "Sulfur"
    ]
  },
  {
    "id": "missing-071",
    "sentence": "The chemical element with the symbol Sc is ____ .",
    "answer": "Scandium",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Niobium",
      "Beryllium",
      "Chlorine",
      "Scandium"
    ]
  },
  {
    "id": "missing-072",
    "sentence": "The chemical element with the symbol Ti is ____ .",
    "answer": "Titanium",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Boron",
      "Argon",
      "Titanium",
      "Molybdenum"
    ]
  },
  {
    "id": "missing-073",
    "sentence": "The chemical element with the symbol V is ____ .",
    "answer": "Vanadium",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Potassium",
      "Vanadium",
      "Technetium",
      "Carbon"
    ]
  },
  {
    "id": "missing-074",
    "sentence": "The chemical element with the symbol Cr is ____ .",
    "answer": "Chromium",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Chromium",
      "Ruthenium",
      "Nitrogen",
      "Calcium"
    ]
  },
  {
    "id": "missing-075",
    "sentence": "The chemical element with the symbol Mn is ____ .",
    "answer": "Manganese",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Rhodium",
      "Oxygen",
      "Scandium",
      "Manganese"
    ]
  },
  {
    "id": "missing-076",
    "sentence": "The chemical element with the symbol Fe is ____ .",
    "answer": "Iron",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Fluorine",
      "Titanium",
      "Iron",
      "Palladium"
    ]
  },
  {
    "id": "missing-077",
    "sentence": "The chemical element with the symbol Co is ____ .",
    "answer": "Cobalt",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Vanadium",
      "Cobalt",
      "Silver",
      "Neon"
    ]
  },
  {
    "id": "missing-078",
    "sentence": "The chemical element with the symbol Ni is ____ .",
    "answer": "Nickel",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Nickel",
      "Cadmium",
      "Sodium",
      "Chromium"
    ]
  },
  {
    "id": "missing-079",
    "sentence": "The chemical element with the symbol Cu is ____ .",
    "answer": "Copper",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Indium",
      "Magnesium",
      "Manganese",
      "Copper"
    ]
  },
  {
    "id": "missing-080",
    "sentence": "The chemical element with the symbol Zn is ____ .",
    "answer": "Zinc",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Aluminium",
      "Iron",
      "Zinc",
      "Tin"
    ]
  },
  {
    "id": "missing-081",
    "sentence": "The chemical element with the symbol Ga is ____ .",
    "answer": "Gallium",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Cobalt",
      "Gallium",
      "Hydrogen",
      "Silicon"
    ]
  },
  {
    "id": "missing-082",
    "sentence": "The chemical element with the symbol Ge is ____ .",
    "answer": "Germanium",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Germanium",
      "Helium",
      "Phosphorus",
      "Nickel"
    ]
  },
  {
    "id": "missing-083",
    "sentence": "The chemical element with the symbol As is ____ .",
    "answer": "Arsenic",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Lithium",
      "Sulfur",
      "Copper",
      "Arsenic"
    ]
  },
  {
    "id": "missing-084",
    "sentence": "The chemical element with the symbol Se is ____ .",
    "answer": "Selenium",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Chlorine",
      "Zinc",
      "Selenium",
      "Beryllium"
    ]
  },
  {
    "id": "missing-085",
    "sentence": "The chemical element with the symbol Br is ____ .",
    "answer": "Bromine",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Gallium",
      "Bromine",
      "Boron",
      "Argon"
    ]
  },
  {
    "id": "missing-086",
    "sentence": "The chemical element with the symbol Kr is ____ .",
    "answer": "Krypton",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Krypton",
      "Carbon",
      "Potassium",
      "Germanium"
    ]
  },
  {
    "id": "missing-087",
    "sentence": "The chemical element with the symbol Rb is ____ .",
    "answer": "Rubidium",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Nitrogen",
      "Calcium",
      "Arsenic",
      "Rubidium"
    ]
  },
  {
    "id": "missing-088",
    "sentence": "The chemical element with the symbol Sr is ____ .",
    "answer": "Strontium",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Scandium",
      "Selenium",
      "Strontium",
      "Oxygen"
    ]
  },
  {
    "id": "missing-089",
    "sentence": "The chemical element with the symbol Y is ____ .",
    "answer": "Yttrium",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Bromine",
      "Yttrium",
      "Fluorine",
      "Titanium"
    ]
  },
  {
    "id": "missing-090",
    "sentence": "The chemical element with the symbol Zr is ____ .",
    "answer": "Zirconium",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Zirconium",
      "Neon",
      "Vanadium",
      "Krypton"
    ]
  },
  {
    "id": "missing-091",
    "sentence": "The chemical element with the symbol Nb is ____ .",
    "answer": "Niobium",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Sodium",
      "Chromium",
      "Rubidium",
      "Niobium"
    ]
  },
  {
    "id": "missing-092",
    "sentence": "The chemical element with the symbol Mo is ____ .",
    "answer": "Molybdenum",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Manganese",
      "Strontium",
      "Molybdenum",
      "Magnesium"
    ]
  },
  {
    "id": "missing-093",
    "sentence": "The chemical element with the symbol Tc is ____ .",
    "answer": "Technetium",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Yttrium",
      "Technetium",
      "Aluminium",
      "Iron"
    ]
  },
  {
    "id": "missing-094",
    "sentence": "The chemical element with the symbol Ru is ____ .",
    "answer": "Ruthenium",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Ruthenium",
      "Silicon",
      "Cobalt",
      "Zirconium"
    ]
  },
  {
    "id": "missing-095",
    "sentence": "The chemical element with the symbol Rh is ____ .",
    "answer": "Rhodium",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Phosphorus",
      "Nickel",
      "Niobium",
      "Rhodium"
    ]
  },
  {
    "id": "missing-096",
    "sentence": "The chemical element with the symbol Pd is ____ .",
    "answer": "Palladium",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Copper",
      "Molybdenum",
      "Palladium",
      "Sulfur"
    ]
  },
  {
    "id": "missing-097",
    "sentence": "The chemical element with the symbol Ag is ____ .",
    "answer": "Silver",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Technetium",
      "Silver",
      "Chlorine",
      "Zinc"
    ]
  },
  {
    "id": "missing-098",
    "sentence": "The chemical element with the symbol Cd is ____ .",
    "answer": "Cadmium",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Cadmium",
      "Argon",
      "Gallium",
      "Ruthenium"
    ]
  },
  {
    "id": "missing-099",
    "sentence": "The chemical element with the symbol In is ____ .",
    "answer": "Indium",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Potassium",
      "Germanium",
      "Rhodium",
      "Indium"
    ]
  },
  {
    "id": "missing-100",
    "sentence": "The chemical element with the symbol Sn is ____ .",
    "answer": "Tin",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Arsenic",
      "Palladium",
      "Tin",
      "Calcium"
    ]
  },
  {
    "id": "missing-101",
    "sentence": "The author of “Hamlet” is ____ .",
    "answer": "Shakespeare",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "John Steinbeck",
      "Sun Tzu",
      "Shakespeare",
      "Munshi Premchand"
    ]
  },
  {
    "id": "missing-102",
    "sentence": "The author of “Pride and Prejudice” is ____ .",
    "answer": "Jane Austen",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Anne Frank",
      "Jane Austen",
      "Kalidasa",
      "Harper Lee"
    ]
  },
  {
    "id": "missing-103",
    "sentence": "The author of “Oliver Twist” is ____ .",
    "answer": "Charles Dickens",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Charles Dickens",
      "Homer",
      "Toni Morrison",
      "Alexandre Dumas"
    ]
  },
  {
    "id": "missing-104",
    "sentence": "The author of “Nineteen Eighty-Four” is ____ .",
    "answer": "George Orwell",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Virgil",
      "Agatha Christie",
      "Homer",
      "George Orwell"
    ]
  },
  {
    "id": "missing-105",
    "sentence": "The author of “Brave New World” is ____ .",
    "answer": "Aldous Huxley",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Arthur Conan Doyle",
      "Shakespeare",
      "Aldous Huxley",
      "Dante Alighieri"
    ]
  },
  {
    "id": "missing-106",
    "sentence": "The author of “The Hobbit” is ____ .",
    "answer": "J R R Tolkien",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Jane Austen",
      "J R R Tolkien",
      "Geoffrey Chaucer",
      "Bram Stoker"
    ]
  },
  {
    "id": "missing-107",
    "sentence": "The author of “Harry Potter and the Philosopher's Stone” is ____ .",
    "answer": "J K Rowling",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "J K Rowling",
      "John Milton",
      "Oscar Wilde",
      "Charles Dickens"
    ]
  },
  {
    "id": "missing-108",
    "sentence": "The author of “Tom Sawyer” is ____ .",
    "answer": "Mark Twain",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Daniel Defoe",
      "H G Wells",
      "George Orwell",
      "Mark Twain"
    ]
  },
  {
    "id": "missing-109",
    "sentence": "The author of “Moby-Dick” is ____ .",
    "answer": "Herman Melville",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Jules Verne",
      "Aldous Huxley",
      "Herman Melville",
      "Jonathan Swift"
    ]
  },
  {
    "id": "missing-110",
    "sentence": "The author of “Wuthering Heights” is ____ .",
    "answer": "Emily Bronte",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "J R R Tolkien",
      "Emily Bronte",
      "Frances Hodgson Burnett",
      "Antoine de Saint-Exupery"
    ]
  },
  {
    "id": "missing-111",
    "sentence": "The author of “Jane Eyre” is ____ .",
    "answer": "Charlotte Bronte",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Charlotte Bronte",
      "Louisa May Alcott",
      "Paulo Coelho",
      "J K Rowling"
    ]
  },
  {
    "id": "missing-112",
    "sentence": "The author of “Frankenstein” is ____ .",
    "answer": "Mary Shelley",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "F Scott Fitzgerald",
      "Khaled Hosseini",
      "Mark Twain",
      "Mary Shelley"
    ]
  },
  {
    "id": "missing-113",
    "sentence": "The author of “War and Peace” is ____ .",
    "answer": "Leo Tolstoy",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Isabel Allende",
      "Herman Melville",
      "Leo Tolstoy",
      "Ernest Hemingway"
    ]
  },
  {
    "id": "missing-114",
    "sentence": "The author of “Crime and Punishment” is ____ .",
    "answer": "Fyodor Dostoevsky",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Emily Bronte",
      "Fyodor Dostoevsky",
      "John Steinbeck",
      "Sun Tzu"
    ]
  },
  {
    "id": "missing-115",
    "sentence": "The author of “Les Miserables” is ____ .",
    "answer": "Victor Hugo",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Victor Hugo",
      "Harper Lee",
      "Anne Frank",
      "Charlotte Bronte"
    ]
  },
  {
    "id": "missing-116",
    "sentence": "The author of “Don Quixote” is ____ .",
    "answer": "Miguel de Cervantes",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Toni Morrison",
      "Alexandre Dumas",
      "Mary Shelley",
      "Miguel de Cervantes"
    ]
  },
  {
    "id": "missing-117",
    "sentence": "The author of “One Hundred Years of Solitude” is ____ .",
    "answer": "Gabriel Garcia Marquez",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Homer",
      "Leo Tolstoy",
      "Gabriel Garcia Marquez",
      "Agatha Christie"
    ]
  },
  {
    "id": "missing-118",
    "sentence": "The author of “Things Fall Apart” is ____ .",
    "answer": "Chinua Achebe",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Fyodor Dostoevsky",
      "Chinua Achebe",
      "Arthur Conan Doyle",
      "Shakespeare"
    ]
  },
  {
    "id": "missing-119",
    "sentence": "The author of “Gitanjali” is ____ .",
    "answer": "Rabindranath Tagore",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Rabindranath Tagore",
      "Bram Stoker",
      "Jane Austen",
      "Victor Hugo"
    ]
  },
  {
    "id": "missing-120",
    "sentence": "The author of “The Guide” is ____ .",
    "answer": "R K Narayan",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Oscar Wilde",
      "Charles Dickens",
      "Miguel de Cervantes",
      "R K Narayan"
    ]
  },
  {
    "id": "missing-121",
    "sentence": "The author of “Godaan” is ____ .",
    "answer": "Munshi Premchand",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "George Orwell",
      "Gabriel Garcia Marquez",
      "Munshi Premchand",
      "H G Wells"
    ]
  },
  {
    "id": "missing-122",
    "sentence": "The author of “Shakuntala” is ____ .",
    "answer": "Kalidasa",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Chinua Achebe",
      "Kalidasa",
      "Jules Verne",
      "Aldous Huxley"
    ]
  },
  {
    "id": "missing-123",
    "sentence": "The author of “The Odyssey” is ____ .",
    "answer": "Homer",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Homer",
      "Antoine de Saint-Exupery",
      "J R R Tolkien",
      "Rabindranath Tagore"
    ]
  },
  {
    "id": "missing-124",
    "sentence": "The author of “The Aeneid” is ____ .",
    "answer": "Virgil",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Paulo Coelho",
      "J K Rowling",
      "R K Narayan",
      "Virgil"
    ]
  },
  {
    "id": "missing-125",
    "sentence": "The author of “The Divine Comedy” is ____ .",
    "answer": "Dante Alighieri",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Mark Twain",
      "Munshi Premchand",
      "Dante Alighieri",
      "Khaled Hosseini"
    ]
  },
  {
    "id": "missing-126",
    "sentence": "The author of “The Canterbury Tales” is ____ .",
    "answer": "Geoffrey Chaucer",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Kalidasa",
      "Geoffrey Chaucer",
      "Isabel Allende",
      "Herman Melville"
    ]
  },
  {
    "id": "missing-127",
    "sentence": "The author of “Paradise Lost” is ____ .",
    "answer": "John Milton",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "John Milton",
      "Sun Tzu",
      "Emily Bronte",
      "Homer"
    ]
  },
  {
    "id": "missing-128",
    "sentence": "The author of “Robinson Crusoe” is ____ .",
    "answer": "Daniel Defoe",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Anne Frank",
      "Charlotte Bronte",
      "Virgil",
      "Daniel Defoe"
    ]
  },
  {
    "id": "missing-129",
    "sentence": "The author of “Gulliver's Travels” is ____ .",
    "answer": "Jonathan Swift",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Mary Shelley",
      "Dante Alighieri",
      "Jonathan Swift",
      "Alexandre Dumas"
    ]
  },
  {
    "id": "missing-130",
    "sentence": "The author of “The Secret Garden” is ____ .",
    "answer": "Frances Hodgson Burnett",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Geoffrey Chaucer",
      "Frances Hodgson Burnett",
      "Homer",
      "Leo Tolstoy"
    ]
  },
  {
    "id": "missing-131",
    "sentence": "The author of “Little Women” is ____ .",
    "answer": "Louisa May Alcott",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Louisa May Alcott",
      "Shakespeare",
      "Fyodor Dostoevsky",
      "John Milton"
    ]
  },
  {
    "id": "missing-132",
    "sentence": "The author of “The Great Gatsby” is ____ .",
    "answer": "F Scott Fitzgerald",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Jane Austen",
      "Victor Hugo",
      "Daniel Defoe",
      "F Scott Fitzgerald"
    ]
  },
  {
    "id": "missing-133",
    "sentence": "The author of “The Old Man and the Sea” is ____ .",
    "answer": "Ernest Hemingway",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Miguel de Cervantes",
      "Jonathan Swift",
      "Ernest Hemingway",
      "Charles Dickens"
    ]
  },
  {
    "id": "missing-134",
    "sentence": "The author of “The Grapes of Wrath” is ____ .",
    "answer": "John Steinbeck",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Frances Hodgson Burnett",
      "John Steinbeck",
      "George Orwell",
      "Gabriel Garcia Marquez"
    ]
  },
  {
    "id": "missing-135",
    "sentence": "The author of “To Kill a Mockingbird” is ____ .",
    "answer": "Harper Lee",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Harper Lee",
      "Aldous Huxley",
      "Chinua Achebe",
      "Louisa May Alcott"
    ]
  },
  {
    "id": "missing-136",
    "sentence": "The author of “Beloved” is ____ .",
    "answer": "Toni Morrison",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "J R R Tolkien",
      "Rabindranath Tagore",
      "F Scott Fitzgerald",
      "Toni Morrison"
    ]
  },
  {
    "id": "missing-137",
    "sentence": "The author of “Murder on the Orient Express” is ____ .",
    "answer": "Agatha Christie",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "R K Narayan",
      "Ernest Hemingway",
      "Agatha Christie",
      "J K Rowling"
    ]
  },
  {
    "id": "missing-138",
    "sentence": "The author of “The Hound of the Baskervilles” is ____ .",
    "answer": "Arthur Conan Doyle",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "John Steinbeck",
      "Arthur Conan Doyle",
      "Mark Twain",
      "Munshi Premchand"
    ]
  },
  {
    "id": "missing-139",
    "sentence": "The author of “Dracula” is ____ .",
    "answer": "Bram Stoker",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Bram Stoker",
      "Herman Melville",
      "Kalidasa",
      "Harper Lee"
    ]
  },
  {
    "id": "missing-140",
    "sentence": "The author of “The Picture of Dorian Gray” is ____ .",
    "answer": "Oscar Wilde",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Emily Bronte",
      "Homer",
      "Toni Morrison",
      "Oscar Wilde"
    ]
  },
  {
    "id": "missing-141",
    "sentence": "The author of “The Time Machine” is ____ .",
    "answer": "H G Wells",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Virgil",
      "Agatha Christie",
      "H G Wells",
      "Charlotte Bronte"
    ]
  },
  {
    "id": "missing-142",
    "sentence": "The author of “Twenty Thousand Leagues Under the Seas” is ____ .",
    "answer": "Jules Verne",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Arthur Conan Doyle",
      "Jules Verne",
      "Mary Shelley",
      "Dante Alighieri"
    ]
  },
  {
    "id": "missing-143",
    "sentence": "The author of “The Little Prince” is ____ .",
    "answer": "Antoine de Saint-Exupery",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Antoine de Saint-Exupery",
      "Leo Tolstoy",
      "Geoffrey Chaucer",
      "Bram Stoker"
    ]
  },
  {
    "id": "missing-144",
    "sentence": "The author of “The Alchemist” is ____ .",
    "answer": "Paulo Coelho",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Fyodor Dostoevsky",
      "John Milton",
      "Oscar Wilde",
      "Paulo Coelho"
    ]
  },
  {
    "id": "missing-145",
    "sentence": "The author of “The Kite Runner” is ____ .",
    "answer": "Khaled Hosseini",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Daniel Defoe",
      "H G Wells",
      "Khaled Hosseini",
      "Victor Hugo"
    ]
  },
  {
    "id": "missing-146",
    "sentence": "The author of “The House of the Spirits” is ____ .",
    "answer": "Isabel Allende",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Jules Verne",
      "Isabel Allende",
      "Miguel de Cervantes",
      "Jonathan Swift"
    ]
  },
  {
    "id": "missing-147",
    "sentence": "The author of “The Art of War” is ____ .",
    "answer": "Sun Tzu",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Sun Tzu",
      "Gabriel Garcia Marquez",
      "Frances Hodgson Burnett",
      "Antoine de Saint-Exupery"
    ]
  },
  {
    "id": "missing-148",
    "sentence": "The author of “The Diary of a Young Girl” is ____ .",
    "answer": "Anne Frank",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Chinua Achebe",
      "Louisa May Alcott",
      "Paulo Coelho",
      "Anne Frank"
    ]
  },
  {
    "id": "missing-149",
    "sentence": "The author of “The Three Musketeers” is ____ .",
    "answer": "Alexandre Dumas",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "F Scott Fitzgerald",
      "Khaled Hosseini",
      "Alexandre Dumas",
      "Rabindranath Tagore"
    ]
  },
  {
    "id": "missing-150",
    "sentence": "The author of “The Iliad” is ____ .",
    "answer": "Homer",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Isabel Allende",
      "Homer",
      "R K Narayan",
      "Ernest Hemingway"
    ]
  },
  {
    "id": "missing-151",
    "sentence": "Eiffel Tower, a famous landmark, is located in ____ .",
    "answer": "Paris",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Kyoto",
      "Paris",
      "San Francisco",
      "Zambia and Zimbabwe"
    ]
  },
  {
    "id": "missing-152",
    "sentence": "Colosseum, a famous landmark, is located in ____ .",
    "answer": "Rome",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Rome",
      "Toronto",
      "Arizona",
      "Beijing"
    ]
  },
  {
    "id": "missing-153",
    "sentence": "Taj Mahal, a famous landmark, is located in ____ .",
    "answer": "Agra",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Yucatan",
      "Canada and United States",
      "Egypt",
      "Agra"
    ]
  },
  {
    "id": "missing-154",
    "sentence": "Great Wall, a famous landmark, is located in ____ .",
    "answer": "China",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Australia",
      "Alexandria",
      "China",
      "Easter Island"
    ]
  },
  {
    "id": "missing-155",
    "sentence": "Petra, a famous landmark, is located in ____ .",
    "answer": "Jordan",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Paris",
      "Jordan",
      "Granada",
      "Tanzania"
    ]
  },
  {
    "id": "missing-156",
    "sentence": "Machu Picchu, a famous landmark, is located in ____ .",
    "answer": "Peru",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Peru",
      "Barcelona",
      "Indonesia",
      "Rome"
    ]
  },
  {
    "id": "missing-157",
    "sentence": "Christ the Redeemer, a famous landmark, is located in ____ .",
    "answer": "Rio de Janeiro",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Pisa",
      "Moscow",
      "Agra",
      "Rio de Janeiro"
    ]
  },
  {
    "id": "missing-158",
    "sentence": "Statue of Liberty, a famous landmark, is located in ____ .",
    "answer": "New York",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Istanbul",
      "China",
      "New York",
      "London"
    ]
  },
  {
    "id": "missing-159",
    "sentence": "Big Ben, a famous landmark, is located in ____ .",
    "answer": "London",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Jordan",
      "London",
      "Paris",
      "Brussels"
    ]
  },
  {
    "id": "missing-160",
    "sentence": "Acropolis, a famous landmark, is located in ____ .",
    "answer": "Athens",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Athens",
      "Beijing",
      "Romania",
      "Peru"
    ]
  },
  {
    "id": "missing-161",
    "sentence": "Angkor Wat, a famous landmark, is located in ____ .",
    "answer": "Cambodia",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Lhasa",
      "Edinburgh",
      "Rio de Janeiro",
      "Cambodia"
    ]
  },
  {
    "id": "missing-162",
    "sentence": "Pyramids of Giza, a famous landmark, is located in ____ .",
    "answer": "Egypt",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "San Francisco",
      "New York",
      "Egypt",
      "Japan"
    ]
  },
  {
    "id": "missing-163",
    "sentence": "Sphinx, a famous landmark, is located in ____ .",
    "answer": "Giza",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "London",
      "Giza",
      "Cape Town",
      "New York"
    ]
  },
  {
    "id": "missing-164",
    "sentence": "Burj Khalifa, a famous landmark, is located in ____ .",
    "answer": "Dubai",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Dubai",
      "Zambia and Zimbabwe",
      "Kyoto",
      "Athens"
    ]
  },
  {
    "id": "missing-165",
    "sentence": "Sydney Opera House, a famous landmark, is located in ____ .",
    "answer": "Sydney",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Arizona",
      "Beijing",
      "Cambodia",
      "Sydney"
    ]
  },
  {
    "id": "missing-166",
    "sentence": "Mount Rushmore, a famous landmark, is located in ____ .",
    "answer": "South Dakota",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Egypt",
      "Granada",
      "South Dakota",
      "Canada and United States"
    ]
  },
  {
    "id": "missing-167",
    "sentence": "Stonehenge, a famous landmark, is located in ____ .",
    "answer": "Wiltshire",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Giza",
      "Wiltshire",
      "Australia",
      "Alexandria"
    ]
  },
  {
    "id": "missing-168",
    "sentence": "Neuschwanstein Castle, a famous landmark, is located in ____ .",
    "answer": "Bavaria",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Bavaria",
      "Tanzania",
      "Paris",
      "Dubai"
    ]
  },
  {
    "id": "missing-169",
    "sentence": "Hagia Sophia, a famous landmark, is located in ____ .",
    "answer": "Istanbul",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Indonesia",
      "Rome",
      "Sydney",
      "Istanbul"
    ]
  },
  {
    "id": "missing-170",
    "sentence": "Brandenburg Gate, a famous landmark, is located in ____ .",
    "answer": "Berlin",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Agra",
      "South Dakota",
      "Berlin",
      "Moscow"
    ]
  },
  {
    "id": "missing-171",
    "sentence": "Golden Gate Bridge, a famous landmark, is located in ____ .",
    "answer": "San Francisco",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Wiltshire",
      "San Francisco",
      "Istanbul",
      "China"
    ]
  },
  {
    "id": "missing-172",
    "sentence": "CN Tower, a famous landmark, is located in ____ .",
    "answer": "Toronto",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Toronto",
      "Brussels",
      "Jordan",
      "Bavaria"
    ]
  },
  {
    "id": "missing-173",
    "sentence": "Chichen Itza, a famous landmark, is located in ____ .",
    "answer": "Yucatan",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Romania",
      "Peru",
      "Istanbul",
      "Yucatan"
    ]
  },
  {
    "id": "missing-174",
    "sentence": "Moai Statues, a famous landmark, is located in ____ .",
    "answer": "Easter Island",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Rio de Janeiro",
      "Berlin",
      "Easter Island",
      "Edinburgh"
    ]
  },
  {
    "id": "missing-175",
    "sentence": "Alhambra, a famous landmark, is located in ____ .",
    "answer": "Granada",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Zambia and Zimbabwe",
      "Granada",
      "San Francisco",
      "New York"
    ]
  },
  {
    "id": "missing-176",
    "sentence": "Sagrada Familia, a famous landmark, is located in ____ .",
    "answer": "Barcelona",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Barcelona",
      "New York",
      "London",
      "Toronto"
    ]
  },
  {
    "id": "missing-177",
    "sentence": "Leaning Tower of Pisa, a famous landmark, is located in ____ .",
    "answer": "Pisa",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Kyoto",
      "Athens",
      "Yucatan",
      "Pisa"
    ]
  },
  {
    "id": "missing-178",
    "sentence": "Tower Bridge, a famous landmark, is located in ____ .",
    "answer": "London",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Cambodia",
      "Easter Island",
      "London",
      "Beijing"
    ]
  },
  {
    "id": "missing-179",
    "sentence": "Louvre Museum, a famous landmark, is located in ____ .",
    "answer": "Paris",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Tanzania",
      "Paris",
      "Egypt",
      "Granada"
    ]
  },
  {
    "id": "missing-180",
    "sentence": "Forbidden City, a famous landmark, is located in ____ .",
    "answer": "Beijing",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Beijing",
      "Alexandria",
      "Giza",
      "Barcelona"
    ]
  },
  {
    "id": "missing-181",
    "sentence": "Potala Palace, a famous landmark, is located in ____ .",
    "answer": "Lhasa",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Paris",
      "Dubai",
      "Pisa",
      "Lhasa"
    ]
  },
  {
    "id": "missing-182",
    "sentence": "Mount Fuji, a famous landmark, is located in ____ .",
    "answer": "Japan",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Sydney",
      "London",
      "Japan",
      "Rome"
    ]
  },
  {
    "id": "missing-183",
    "sentence": "Table Mountain, a famous landmark, is located in ____ .",
    "answer": "Cape Town",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Paris",
      "Cape Town",
      "Agra",
      "South Dakota"
    ]
  },
  {
    "id": "missing-184",
    "sentence": "Victoria Falls, a famous landmark, is located in ____ .",
    "answer": "Zambia and Zimbabwe",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Zambia and Zimbabwe",
      "China",
      "Wiltshire",
      "Beijing"
    ]
  },
  {
    "id": "missing-185",
    "sentence": "Grand Canyon, a famous landmark, is located in ____ .",
    "answer": "Arizona",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Jordan",
      "Bavaria",
      "Lhasa",
      "Arizona"
    ]
  },
  {
    "id": "missing-186",
    "sentence": "Niagara Falls, a famous landmark, is located in ____ .",
    "answer": "Canada and United States",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Istanbul",
      "Japan",
      "Canada and United States",
      "Peru"
    ]
  },
  {
    "id": "missing-187",
    "sentence": "Uluru, a famous landmark, is located in ____ .",
    "answer": "Australia",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Cape Town",
      "Australia",
      "Rio de Janeiro",
      "Berlin"
    ]
  },
  {
    "id": "missing-188",
    "sentence": "Mount Kilimanjaro, a famous landmark, is located in ____ .",
    "answer": "Tanzania",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Tanzania",
      "New York",
      "San Francisco",
      "Zambia and Zimbabwe"
    ]
  },
  {
    "id": "missing-189",
    "sentence": "Borobudur, a famous landmark, is located in ____ .",
    "answer": "Indonesia",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "London",
      "Toronto",
      "Arizona",
      "Indonesia"
    ]
  },
  {
    "id": "missing-190",
    "sentence": "Kremlin, a famous landmark, is located in ____ .",
    "answer": "Moscow",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Yucatan",
      "Canada and United States",
      "Moscow",
      "Athens"
    ]
  },
  {
    "id": "missing-191",
    "sentence": "Blue Mosque, a famous landmark, is located in ____ .",
    "answer": "Istanbul",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Australia",
      "Istanbul",
      "Cambodia",
      "Easter Island"
    ]
  },
  {
    "id": "missing-192",
    "sentence": "Atomium, a famous landmark, is located in ____ .",
    "answer": "Brussels",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Brussels",
      "Egypt",
      "Granada",
      "Tanzania"
    ]
  },
  {
    "id": "missing-193",
    "sentence": "Bran Castle, a famous landmark, is located in ____ .",
    "answer": "Romania",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Giza",
      "Barcelona",
      "Indonesia",
      "Romania"
    ]
  },
  {
    "id": "missing-194",
    "sentence": "Edinburgh Castle, a famous landmark, is located in ____ .",
    "answer": "Edinburgh",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Pisa",
      "Moscow",
      "Edinburgh",
      "Dubai"
    ]
  },
  {
    "id": "missing-195",
    "sentence": "Alcatraz, a famous landmark, is located in ____ .",
    "answer": "San Francisco",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Istanbul",
      "San Francisco",
      "Sydney",
      "London"
    ]
  },
  {
    "id": "missing-196",
    "sentence": "Empire State Building, a famous landmark, is located in ____ .",
    "answer": "New York",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "New York",
      "South Dakota",
      "Paris",
      "Brussels"
    ]
  },
  {
    "id": "missing-197",
    "sentence": "Kiyomizu-dera, a famous landmark, is located in ____ .",
    "answer": "Kyoto",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Wiltshire",
      "Beijing",
      "Romania",
      "Kyoto"
    ]
  },
  {
    "id": "missing-198",
    "sentence": "Temple of Heaven, a famous landmark, is located in ____ .",
    "answer": "Beijing",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Lhasa",
      "Edinburgh",
      "Beijing",
      "Bavaria"
    ]
  },
  {
    "id": "missing-199",
    "sentence": "Great Sphinx, a famous landmark, is located in ____ .",
    "answer": "Egypt",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "San Francisco",
      "Egypt",
      "Istanbul",
      "Japan"
    ]
  },
  {
    "id": "missing-200",
    "sentence": "Lighthouse of Alexandria, a famous landmark, is located in ____ .",
    "answer": "Alexandria",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Alexandria",
      "Berlin",
      "Cape Town",
      "New York"
    ]
  },
  {
    "id": "missing-201",
    "sentence": "The animal described as “fastest land animal” is ____ .",
    "answer": "Cheetah",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Cheetah",
      "Meerkat",
      "Honeybee",
      "Cassowary"
    ]
  },
  {
    "id": "missing-202",
    "sentence": "The animal described as “largest animal” is ____ .",
    "answer": "Blue whale",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Peacock",
      "Firefly",
      "Albatross",
      "Blue whale"
    ]
  },
  {
    "id": "missing-203",
    "sentence": "The animal described as “fastest bird in a dive” is ____ .",
    "answer": "Peregrine falcon",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Mantis shrimp",
      "Orangutan",
      "Peregrine falcon",
      "Beaver"
    ]
  },
  {
    "id": "missing-204",
    "sentence": "The animal described as “largest living bird” is ____ .",
    "answer": "Ostrich",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Bison",
      "Ostrich",
      "Camel",
      "Fennec fox"
    ]
  },
  {
    "id": "missing-205",
    "sentence": "The animal described as “tallest living land animal” is ____ .",
    "answer": "Giraffe",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Giraffe",
      "Yak",
      "Red panda",
      "Cheetah"
    ]
  },
  {
    "id": "missing-206",
    "sentence": "The animal described as “largest land mammal” is ____ .",
    "answer": "African elephant",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Lemur",
      "Capybara",
      "Blue whale",
      "African elephant"
    ]
  },
  {
    "id": "missing-207",
    "sentence": "The animal described as “largest living lizard” is ____ .",
    "answer": "Komodo dragon",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Manta ray",
      "Peregrine falcon",
      "Komodo dragon",
      "Panda"
    ]
  },
  {
    "id": "missing-208",
    "sentence": "The animal described as “one of the heaviest snakes” is ____ .",
    "answer": "Green anaconda",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Ostrich",
      "Green anaconda",
      "Wombat",
      "Seahorse"
    ]
  },
  {
    "id": "missing-209",
    "sentence": "The animal described as “bird that can hover” is ____ .",
    "answer": "Hummingbird",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Hummingbird",
      "Narwhal",
      "Flying fish",
      "Giraffe"
    ]
  },
  {
    "id": "missing-210",
    "sentence": "The animal described as “only mammal capable of sustained flight” is ____ .",
    "answer": "Bat",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Walrus",
      "Armadillo",
      "African elephant",
      "Bat"
    ]
  },
  {
    "id": "missing-211",
    "sentence": "The animal described as “egg-laying mammal” is ____ .",
    "answer": "Platypus",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Porcupine",
      "Komodo dragon",
      "Platypus",
      "Flamingo"
    ]
  },
  {
    "id": "missing-212",
    "sentence": "The animal described as “marsupial known for hopping” is ____ .",
    "answer": "Kangaroo",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Green anaconda",
      "Kangaroo",
      "Salamander",
      "Tapir"
    ]
  },
  {
    "id": "missing-213",
    "sentence": "The animal described as “marine mammal known for echolocation” is ____ .",
    "answer": "Dolphin",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Dolphin",
      "Axolotl",
      "Okapi",
      "Hummingbird"
    ]
  },
  {
    "id": "missing-214",
    "sentence": "The animal described as “mollusc with eight arms” is ____ .",
    "answer": "Octopus",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Honeybee",
      "Cassowary",
      "Bat",
      "Octopus"
    ]
  },
  {
    "id": "missing-215",
    "sentence": "The animal described as “lizard known for changing colour” is ____ .",
    "answer": "Chameleon",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Albatross",
      "Platypus",
      "Chameleon",
      "Firefly"
    ]
  },
  {
    "id": "missing-216",
    "sentence": "The animal described as “largest living land carnivore” is ____ .",
    "answer": "Polar bear",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Kangaroo",
      "Polar bear",
      "Mantis shrimp",
      "Orangutan"
    ]
  },
  {
    "id": "missing-217",
    "sentence": "The animal described as “largest penguin species” is ____ .",
    "answer": "Emperor penguin",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Emperor penguin",
      "Fennec fox",
      "Bison",
      "Dolphin"
    ]
  },
  {
    "id": "missing-218",
    "sentence": "The animal described as “bird with an exceptionally long migration” is ____ .",
    "answer": "Arctic tern",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Red panda",
      "Cheetah",
      "Octopus",
      "Arctic tern"
    ]
  },
  {
    "id": "missing-219",
    "sentence": "The animal described as “marsupial that mainly eats eucalyptus” is ____ .",
    "answer": "Koala",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Blue whale",
      "Chameleon",
      "Koala",
      "Capybara"
    ]
  },
  {
    "id": "missing-220",
    "sentence": "The animal described as “mammal known for very slow movement” is ____ .",
    "answer": "Sloth",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Polar bear",
      "Sloth",
      "Manta ray",
      "Peregrine falcon"
    ]
  },
  {
    "id": "missing-221",
    "sentence": "The animal described as “mongoose relative that stands sentinel” is ____ .",
    "answer": "Meerkat",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Meerkat",
      "Seahorse",
      "Ostrich",
      "Emperor penguin"
    ]
  },
  {
    "id": "missing-222",
    "sentence": "The animal described as “bird whose male displays a colourful train” is ____ .",
    "answer": "Peacock",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Flying fish",
      "Giraffe",
      "Arctic tern",
      "Peacock"
    ]
  },
  {
    "id": "missing-223",
    "sentence": "The animal described as “rodent that builds dams” is ____ .",
    "answer": "Beaver",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "African elephant",
      "Koala",
      "Beaver",
      "Armadillo"
    ]
  },
  {
    "id": "missing-224",
    "sentence": "The animal described as “mammal adapted to desert travel” is ____ .",
    "answer": "Camel",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Sloth",
      "Camel",
      "Porcupine",
      "Komodo dragon"
    ]
  },
  {
    "id": "missing-225",
    "sentence": "The animal described as “long-haired bovine of the Himalayas” is ____ .",
    "answer": "Yak",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Yak",
      "Tapir",
      "Green anaconda",
      "Meerkat"
    ]
  },
  {
    "id": "missing-226",
    "sentence": "The animal described as “primate native to Madagascar” is ____ .",
    "answer": "Lemur",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Okapi",
      "Hummingbird",
      "Peacock",
      "Lemur"
    ]
  },
  {
    "id": "missing-227",
    "sentence": "The animal described as “bear that mainly eats bamboo” is ____ .",
    "answer": "Panda",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Bat",
      "Beaver",
      "Panda",
      "Cassowary"
    ]
  },
  {
    "id": "missing-228",
    "sentence": "The animal described as “Australian marsupial with cube-shaped droppings” is ____ .",
    "answer": "Wombat",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Camel",
      "Wombat",
      "Albatross",
      "Platypus"
    ]
  },
  {
    "id": "missing-229",
    "sentence": "The animal described as “whale with a long spiral tusk” is ____ .",
    "answer": "Narwhal",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Narwhal",
      "Orangutan",
      "Kangaroo",
      "Yak"
    ]
  },
  {
    "id": "missing-230",
    "sentence": "The animal described as “marine mammal with prominent tusks” is ____ .",
    "answer": "Walrus",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Bison",
      "Dolphin",
      "Lemur",
      "Walrus"
    ]
  },
  {
    "id": "missing-231",
    "sentence": "The animal described as “bird known for standing on one leg” is ____ .",
    "answer": "Flamingo",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Octopus",
      "Panda",
      "Flamingo",
      "Cheetah"
    ]
  },
  {
    "id": "missing-232",
    "sentence": "The animal described as “amphibian that can regenerate limbs” is ____ .",
    "answer": "Salamander",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Wombat",
      "Salamander",
      "Blue whale",
      "Chameleon"
    ]
  },
  {
    "id": "missing-233",
    "sentence": "The animal described as “salamander that retains juvenile features” is ____ .",
    "answer": "Axolotl",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Axolotl",
      "Peregrine falcon",
      "Polar bear",
      "Narwhal"
    ]
  },
  {
    "id": "missing-234",
    "sentence": "The animal described as “insect that communicates food location by dancing” is ____ .",
    "answer": "Honeybee",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Ostrich",
      "Emperor penguin",
      "Walrus",
      "Honeybee"
    ]
  },
  {
    "id": "missing-235",
    "sentence": "The animal described as “beetle that produces light” is ____ .",
    "answer": "Firefly",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Arctic tern",
      "Flamingo",
      "Firefly",
      "Giraffe"
    ]
  },
  {
    "id": "missing-236",
    "sentence": "The animal described as “crustacean with powerful striking appendages” is ____ .",
    "answer": "Mantis shrimp",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Salamander",
      "Mantis shrimp",
      "African elephant",
      "Koala"
    ]
  },
  {
    "id": "missing-237",
    "sentence": "The animal described as “small fox with very large ears” is ____ .",
    "answer": "Fennec fox",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Fennec fox",
      "Komodo dragon",
      "Sloth",
      "Axolotl"
    ]
  },
  {
    "id": "missing-238",
    "sentence": "The animal described as “arboreal mammal native to the Himalayas” is ____ .",
    "answer": "Red panda",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Green anaconda",
      "Meerkat",
      "Honeybee",
      "Red panda"
    ]
  },
  {
    "id": "missing-239",
    "sentence": "The animal described as “world's largest living rodent” is ____ .",
    "answer": "Capybara",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Peacock",
      "Firefly",
      "Capybara",
      "Hummingbird"
    ]
  },
  {
    "id": "missing-240",
    "sentence": "The animal described as “large ray known for wing-like fins” is ____ .",
    "answer": "Manta ray",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Mantis shrimp",
      "Manta ray",
      "Bat",
      "Beaver"
    ]
  },
  {
    "id": "missing-241",
    "sentence": "The animal described as “fish in which males carry developing young” is ____ .",
    "answer": "Seahorse",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Seahorse",
      "Platypus",
      "Camel",
      "Fennec fox"
    ]
  },
  {
    "id": "missing-242",
    "sentence": "The animal described as “fish capable of gliding above water” is ____ .",
    "answer": "Flying fish",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Kangaroo",
      "Yak",
      "Red panda",
      "Flying fish"
    ]
  },
  {
    "id": "missing-243",
    "sentence": "The animal described as “mammal with protective bony plates” is ____ .",
    "answer": "Armadillo",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Lemur",
      "Capybara",
      "Armadillo",
      "Dolphin"
    ]
  },
  {
    "id": "missing-244",
    "sentence": "The animal described as “rodent covered in quills” is ____ .",
    "answer": "Porcupine",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Manta ray",
      "Porcupine",
      "Octopus",
      "Panda"
    ]
  },
  {
    "id": "missing-245",
    "sentence": "The animal described as “mammal with a short prehensile snout” is ____ .",
    "answer": "Tapir",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Tapir",
      "Chameleon",
      "Wombat",
      "Seahorse"
    ]
  },
  {
    "id": "missing-246",
    "sentence": "The animal described as “forest mammal related to giraffes” is ____ .",
    "answer": "Okapi",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Polar bear",
      "Narwhal",
      "Flying fish",
      "Okapi"
    ]
  },
  {
    "id": "missing-247",
    "sentence": "The animal described as “large flightless bird with a casque” is ____ .",
    "answer": "Cassowary",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Walrus",
      "Armadillo",
      "Cassowary",
      "Emperor penguin"
    ]
  },
  {
    "id": "missing-248",
    "sentence": "The animal described as “seabird known for long-distance gliding” is ____ .",
    "answer": "Albatross",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Porcupine",
      "Albatross",
      "Arctic tern",
      "Flamingo"
    ]
  },
  {
    "id": "missing-249",
    "sentence": "The animal described as “great ape native to Southeast Asian islands” is ____ .",
    "answer": "Orangutan",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Orangutan",
      "Koala",
      "Salamander",
      "Tapir"
    ]
  },
  {
    "id": "missing-250",
    "sentence": "The animal described as “large grazing mammal of North America” is ____ .",
    "answer": "Bison",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Sloth",
      "Axolotl",
      "Okapi",
      "Bison"
    ]
  },
  {
    "id": "missing-251",
    "sentence": "The scientist or inventor associated with discovery of penicillin is ____ .",
    "answer": "Alexander Fleming",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Johannes Gutenberg",
      "Carl Linnaeus",
      "Vera Rubin",
      "Alexander Fleming"
    ]
  },
  {
    "id": "missing-252",
    "sentence": "The scientist or inventor associated with pioneering research on radioactivity is ____ .",
    "answer": "Marie Curie",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Alfred Nobel",
      "Abdus Salam",
      "Marie Curie",
      "James Clerk Maxwell"
    ]
  },
  {
    "id": "missing-253",
    "sentence": "The scientist or inventor associated with law of universal gravitation is ____ .",
    "answer": "Isaac Newton",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Kip Thorne",
      "Isaac Newton",
      "Niels Bohr",
      "Robert Hooke"
    ]
  },
  {
    "id": "missing-254",
    "sentence": "The scientist or inventor associated with theory of general relativity is ____ .",
    "answer": "Albert Einstein",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Albert Einstein",
      "Srinivasa Ramanujan",
      "Blaise Pascal",
      "Max Planck"
    ]
  },
  {
    "id": "missing-255",
    "sentence": "The scientist or inventor associated with theory of evolution by natural selection is ____ .",
    "answer": "Charles Darwin",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "C V Raman",
      "Archimedes",
      "Alexander Fleming",
      "Charles Darwin"
    ]
  },
  {
    "id": "missing-256",
    "sentence": "The scientist or inventor associated with pasteurisation and germ theory is ____ .",
    "answer": "Louis Pasteur",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Evangelista Torricelli",
      "Marie Curie",
      "Louis Pasteur",
      "Satyendra Nath Bose"
    ]
  },
  {
    "id": "missing-257",
    "sentence": "The scientist or inventor associated with alternating-current power systems is ____ .",
    "answer": "Nikola Tesla",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Isaac Newton",
      "Nikola Tesla",
      "Subrahmanyan Chandrasekhar",
      "Anders Celsius"
    ]
  },
  {
    "id": "missing-258",
    "sentence": "The scientist or inventor associated with telescopic observations of Jupiter's moons is ____ .",
    "answer": "Galileo Galilei",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Galileo Galilei",
      "Hedy Lamarr",
      "Andre-Marie Ampere",
      "Albert Einstein"
    ]
  },
  {
    "id": "missing-259",
    "sentence": "The scientist or inventor associated with foundations of genetics is ____ .",
    "answer": "Gregor Mendel",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Grace Hopper",
      "Georg Ohm",
      "Charles Darwin",
      "Gregor Mendel"
    ]
  },
  {
    "id": "missing-260",
    "sentence": "The scientist or inventor associated with periodic table is ____ .",
    "answer": "Dmitri Mendeleev",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Heinrich Hertz",
      "Louis Pasteur",
      "Dmitri Mendeleev",
      "Tu Youyou"
    ]
  },
  {
    "id": "missing-261",
    "sentence": "The scientist or inventor associated with electromagnetic induction is ____ .",
    "answer": "Michael Faraday",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Nikola Tesla",
      "Michael Faraday",
      "Jonas Salk",
      "Enrico Fermi"
    ]
  },
  {
    "id": "missing-262",
    "sentence": "The scientist or inventor associated with major improvements to the steam engine is ____ .",
    "answer": "James Watt",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "James Watt",
      "Edward Jenner",
      "Lise Meitner",
      "Galileo Galilei"
    ]
  },
  {
    "id": "missing-263",
    "sentence": "The scientist or inventor associated with World Wide Web is ____ .",
    "answer": "Tim Berners-Lee",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Antonie van Leeuwenhoek",
      "Chien-Shiung Wu",
      "Gregor Mendel",
      "Tim Berners-Lee"
    ]
  },
  {
    "id": "missing-264",
    "sentence": "The scientist or inventor associated with NASA orbital calculations is ____ .",
    "answer": "Katherine Johnson",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Vera Rubin",
      "Dmitri Mendeleev",
      "Katherine Johnson",
      "Carl Linnaeus"
    ]
  },
  {
    "id": "missing-265",
    "sentence": "The scientist or inventor associated with foundations of theoretical computer science is ____ .",
    "answer": "Alan Turing",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Michael Faraday",
      "Alan Turing",
      "Alfred Nobel",
      "Abdus Salam"
    ]
  },
  {
    "id": "missing-266",
    "sentence": "The scientist or inventor associated with X-ray diffraction work on DNA is ____ .",
    "answer": "Rosalind Franklin",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Rosalind Franklin",
      "Robert Hooke",
      "Kip Thorne",
      "James Watt"
    ]
  },
  {
    "id": "missing-267",
    "sentence": "The scientist or inventor associated with evidence that galaxies exist beyond the Milky Way is ____ .",
    "answer": "Edwin Hubble",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Blaise Pascal",
      "Max Planck",
      "Tim Berners-Lee",
      "Edwin Hubble"
    ]
  },
  {
    "id": "missing-268",
    "sentence": "The scientist or inventor associated with long-term study of wild chimpanzees is ____ .",
    "answer": "Jane Goodall",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Alexander Fleming",
      "Katherine Johnson",
      "Jane Goodall",
      "Archimedes"
    ]
  },
  {
    "id": "missing-269",
    "sentence": "The scientist or inventor associated with Silent Spring is ____ .",
    "answer": "Rachel Carson",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Alan Turing",
      "Rachel Carson",
      "Evangelista Torricelli",
      "Marie Curie"
    ]
  },
  {
    "id": "missing-270",
    "sentence": "The scientist or inventor associated with first successful powered airplane flight is ____ .",
    "answer": "Wright brothers",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Wright brothers",
      "Anders Celsius",
      "Isaac Newton",
      "Rosalind Franklin"
    ]
  },
  {
    "id": "missing-271",
    "sentence": "The scientist or inventor associated with European movable-type printing press is ____ .",
    "answer": "Johannes Gutenberg",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Andre-Marie Ampere",
      "Albert Einstein",
      "Edwin Hubble",
      "Johannes Gutenberg"
    ]
  },
  {
    "id": "missing-272",
    "sentence": "The scientist or inventor associated with classical theory of electromagnetic radiation is ____ .",
    "answer": "James Clerk Maxwell",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Charles Darwin",
      "Jane Goodall",
      "James Clerk Maxwell",
      "Georg Ohm"
    ]
  },
  {
    "id": "missing-273",
    "sentence": "The scientist or inventor associated with model of the atom with quantised electron orbits is ____ .",
    "answer": "Niels Bohr",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Rachel Carson",
      "Niels Bohr",
      "Heinrich Hertz",
      "Louis Pasteur"
    ]
  },
  {
    "id": "missing-274",
    "sentence": "The scientist or inventor associated with contributions to number theory is ____ .",
    "answer": "Srinivasa Ramanujan",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Srinivasa Ramanujan",
      "Enrico Fermi",
      "Nikola Tesla",
      "Wright brothers"
    ]
  },
  {
    "id": "missing-275",
    "sentence": "The scientist or inventor associated with discovery of the Raman effect is ____ .",
    "answer": "C V Raman",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Lise Meitner",
      "Galileo Galilei",
      "Johannes Gutenberg",
      "C V Raman"
    ]
  },
  {
    "id": "missing-276",
    "sentence": "The scientist or inventor associated with work behind Bose-Einstein statistics is ____ .",
    "answer": "Satyendra Nath Bose",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Gregor Mendel",
      "James Clerk Maxwell",
      "Satyendra Nath Bose",
      "Chien-Shiung Wu"
    ]
  },
  {
    "id": "missing-277",
    "sentence": "The scientist or inventor associated with work on stellar structure is ____ .",
    "answer": "Subrahmanyan Chandrasekhar",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Niels Bohr",
      "Subrahmanyan Chandrasekhar",
      "Vera Rubin",
      "Dmitri Mendeleev"
    ]
  },
  {
    "id": "missing-278",
    "sentence": "The scientist or inventor associated with frequency-hopping spread-spectrum concept is ____ .",
    "answer": "Hedy Lamarr",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Hedy Lamarr",
      "Abdus Salam",
      "Michael Faraday",
      "Srinivasa Ramanujan"
    ]
  },
  {
    "id": "missing-279",
    "sentence": "The scientist or inventor associated with development of early compiler technology is ____ .",
    "answer": "Grace Hopper",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Kip Thorne",
      "James Watt",
      "C V Raman",
      "Grace Hopper"
    ]
  },
  {
    "id": "missing-280",
    "sentence": "The scientist or inventor associated with discovery of artemisinin is ____ .",
    "answer": "Tu Youyou",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Tim Berners-Lee",
      "Satyendra Nath Bose",
      "Tu Youyou",
      "Max Planck"
    ]
  },
  {
    "id": "missing-281",
    "sentence": "The scientist or inventor associated with development of an inactivated polio vaccine is ____ .",
    "answer": "Jonas Salk",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Subrahmanyan Chandrasekhar",
      "Jonas Salk",
      "Alexander Fleming",
      "Katherine Johnson"
    ]
  },
  {
    "id": "missing-282",
    "sentence": "The scientist or inventor associated with smallpox vaccination is ____ .",
    "answer": "Edward Jenner",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Edward Jenner",
      "Marie Curie",
      "Alan Turing",
      "Hedy Lamarr"
    ]
  },
  {
    "id": "missing-283",
    "sentence": "The scientist or inventor associated with microscopic observations of microorganisms is ____ .",
    "answer": "Antonie van Leeuwenhoek",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Isaac Newton",
      "Rosalind Franklin",
      "Grace Hopper",
      "Antonie van Leeuwenhoek"
    ]
  },
  {
    "id": "missing-284",
    "sentence": "The scientist or inventor associated with modern system of biological classification is ____ .",
    "answer": "Carl Linnaeus",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Edwin Hubble",
      "Tu Youyou",
      "Carl Linnaeus",
      "Albert Einstein"
    ]
  },
  {
    "id": "missing-285",
    "sentence": "The scientist or inventor associated with invention of dynamite is ____ .",
    "answer": "Alfred Nobel",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Jonas Salk",
      "Alfred Nobel",
      "Charles Darwin",
      "Jane Goodall"
    ]
  },
  {
    "id": "missing-286",
    "sentence": "The scientist or inventor associated with coining the term cell after microscopy is ____ .",
    "answer": "Robert Hooke",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Robert Hooke",
      "Louis Pasteur",
      "Rachel Carson",
      "Edward Jenner"
    ]
  },
  {
    "id": "missing-287",
    "sentence": "The scientist or inventor associated with Pascal's principle in fluid mechanics is ____ .",
    "answer": "Blaise Pascal",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Nikola Tesla",
      "Wright brothers",
      "Antonie van Leeuwenhoek",
      "Blaise Pascal"
    ]
  },
  {
    "id": "missing-288",
    "sentence": "The scientist or inventor associated with principle of buoyancy is ____ .",
    "answer": "Archimedes",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Johannes Gutenberg",
      "Carl Linnaeus",
      "Archimedes",
      "Galileo Galilei"
    ]
  },
  {
    "id": "missing-289",
    "sentence": "The scientist or inventor associated with invention of the mercury barometer is ____ .",
    "answer": "Evangelista Torricelli",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Alfred Nobel",
      "Evangelista Torricelli",
      "Gregor Mendel",
      "James Clerk Maxwell"
    ]
  },
  {
    "id": "missing-290",
    "sentence": "The scientist or inventor associated with temperature scale is ____ .",
    "answer": "Anders Celsius",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Anders Celsius",
      "Dmitri Mendeleev",
      "Niels Bohr",
      "Robert Hooke"
    ]
  },
  {
    "id": "missing-291",
    "sentence": "The scientist or inventor associated with foundations of electrodynamics is ____ .",
    "answer": "Andre-Marie Ampere",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Michael Faraday",
      "Srinivasa Ramanujan",
      "Blaise Pascal",
      "Andre-Marie Ampere"
    ]
  },
  {
    "id": "missing-292",
    "sentence": "The scientist or inventor associated with Ohm's law is ____ .",
    "answer": "Georg Ohm",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "C V Raman",
      "Archimedes",
      "Georg Ohm",
      "James Watt"
    ]
  },
  {
    "id": "missing-293",
    "sentence": "The scientist or inventor associated with experimental confirmation of electromagnetic waves is ____ .",
    "answer": "Heinrich Hertz",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Evangelista Torricelli",
      "Heinrich Hertz",
      "Tim Berners-Lee",
      "Satyendra Nath Bose"
    ]
  },
  {
    "id": "missing-294",
    "sentence": "The scientist or inventor associated with first controlled nuclear chain reaction is ____ .",
    "answer": "Enrico Fermi",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Enrico Fermi",
      "Katherine Johnson",
      "Subrahmanyan Chandrasekhar",
      "Anders Celsius"
    ]
  },
  {
    "id": "missing-295",
    "sentence": "The scientist or inventor associated with theoretical explanation of nuclear fission is ____ .",
    "answer": "Lise Meitner",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Alan Turing",
      "Hedy Lamarr",
      "Andre-Marie Ampere",
      "Lise Meitner"
    ]
  },
  {
    "id": "missing-296",
    "sentence": "The scientist or inventor associated with experimental work on parity violation is ____ .",
    "answer": "Chien-Shiung Wu",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Grace Hopper",
      "Georg Ohm",
      "Chien-Shiung Wu",
      "Rosalind Franklin"
    ]
  },
  {
    "id": "missing-297",
    "sentence": "The scientist or inventor associated with evidence for dark matter from galaxy rotation is ____ .",
    "answer": "Vera Rubin",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Heinrich Hertz",
      "Vera Rubin",
      "Edwin Hubble",
      "Tu Youyou"
    ]
  },
  {
    "id": "missing-298",
    "sentence": "The scientist or inventor associated with electroweak unification is ____ .",
    "answer": "Abdus Salam",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Abdus Salam",
      "Jane Goodall",
      "Jonas Salk",
      "Enrico Fermi"
    ]
  },
  {
    "id": "missing-299",
    "sentence": "The scientist or inventor associated with contributions to gravitational-wave physics is ____ .",
    "answer": "Kip Thorne",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Rachel Carson",
      "Edward Jenner",
      "Lise Meitner",
      "Kip Thorne"
    ]
  },
  {
    "id": "missing-300",
    "sentence": "The scientist or inventor associated with foundations of quantum theory is ____ .",
    "answer": "Max Planck",
    "clue": "Use general knowledge to complete the fact.",
    "options": [
      "Antonie van Leeuwenhoek",
      "Chien-Shiung Wu",
      "Max Planck",
      "Wright brothers"
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
