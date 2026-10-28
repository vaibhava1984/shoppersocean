import { DAILY_GK_QUESTIONS, getDailyGKQuestion } from "@/lib/daily-knowledge";
export { getDailyGKQuestion };
export type Puzzle = { id:string; question:string; answer:string; clue?:string; pattern?:string; options?:string[]; correctIndex?:number; explanation?:string; topic?:string };
const DAY_MS=86400000;
function seedFor(date:string,slot:number){return Math.floor(Date.parse(date+"T00:00:00Z")/DAY_MS)*10+(Math.max(0,Math.floor(slot))%10);}
function hash(n:number){let x=n|0;x=Math.imul(x^(x>>>16),0x45d9f3b);x=Math.imul(x^(x>>>16),0x45d9f3b);return (x^(x>>>16))>>>0;}
function rng(seed:number){let x=hash(seed)||1;return()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}
function shuffled<T>(values:T[],seed:number){const out=[...values],random=rng(seed);for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
const answers=[...new Set(DAILY_GK_QUESTIONS.map(x=>x.answer))];
const capitalAnswers=[...new Set(DAILY_GK_QUESTIONS.filter(x=>x.id.startsWith("capital-")).map(x=>x.answer))];
const longAnswers=capitalAnswers.filter(a=>!/[\\s]/.test(a)&&a.replace(/[^A-Za-z]/g,"").length>=7);
function factorial(n:number){let value=1;for(let i=2;i<=n;i++)value*=i;return value;}
function multisetPermutations(chars:string[]){let total=factorial(chars.length);const counts:Record<string,number>={};for(const ch of chars)counts[ch]=(counts[ch]??0)+1;for(const count of Object.values(counts))total/=factorial(count);return Math.floor(total);}
function rankPermutation(sortedChars:string[],target:string){const pool=[...sortedChars].sort();let rank=0;for(let i=0;i<target.length;i++){const current=target[i];for(const ch of [...new Set(pool)].sort()){if(ch>=current)break;const at=pool.indexOf(ch);pool.splice(at,1);rank+=multisetPermutations(pool);pool.splice(at,0,ch);}const at=pool.indexOf(current);if(at<0)return 0;pool.splice(at,1);}return rank;}
function unrankPermutation(chars:string[],rank:number){const pool=[...chars].sort(),out:string[]=[];for(let i=0;i<chars.length;i++){for(const ch of [...new Set(pool)].sort()){const at=pool.indexOf(ch);pool.splice(at,1);const count=multisetPermutations(pool);if(rank<count){out.push(ch);break;}rank-=count;pool.splice(at,0,ch);}}return out.join("");}
export function getWordPuzzle(date:string,slot:number):Puzzle{
 const seed=seedFor(date,slot),cycleSeed=((seed%4000)+4000)%4000,answer=longAnswers[cycleSeed%longAnswers.length],letters=answer.toUpperCase().replace(/[^A-Z]/g,"").split("").sort(),original=answer.toUpperCase().replace(/[^A-Z]/g,"");
 const rank=rankPermutation(letters,original),permutations=multisetPermutations(letters),rawRank=Math.floor(cycleSeed/longAnswers.length);
 const safeRank=rawRank>=rank?rawRank+1:rawRank;
 const scrambled=unrankPermutation(letters,safeRank%permutations);
 return {id:"word:"+answer+":"+scrambled,question:"Rearrange these letters to make a capital city.",answer,pattern:scrambled};
}
export function getHiddenPuzzle(date:string,slot:number):Puzzle{
 const seed=seedFor(date,slot),item=DAILY_GK_QUESTIONS[seed%DAILY_GK_QUESTIONS.length];
 const styles=["Geography clue:","Think of a world capital:","Name the city asked for here:","Use your world knowledge:","Solve this capital-city clue:","A country-capital challenge:","Your destination is a capital city:","Read carefully and identify the capital:","Find the city that answers this clue:","World geography challenge:"];
 return {id:"hidden:"+styles[Math.floor(seed/DAILY_GK_QUESTIONS.length)%styles.length]+item.question,question:item.question,clue:styles[seed%styles.length]+" "+item.question,answer:item.answer};
}
export function getMissingPuzzle(date:string,slot:number):Puzzle{
 const seed=seedFor(date,slot),cycleSeed=((seed%4000)+4000)%4000,item=DAILY_GK_QUESTIONS[cycleSeed%DAILY_GK_QUESTIONS.length],cycle=Math.floor(cycleSeed/DAILY_GK_QUESTIONS.length),letters=item.answer.toUpperCase().replace(/[^A-Z]/g,"").split("");
 const count=letters.length>7?2:1,positions=shuffled(letters.map((_,i)=>i),seed+cycle*97).slice(0,count);
 const styles=["Fill the missing letter(s):","Complete this word using the clue:","A word puzzle for you:","Use the clue to restore the word:","Find the missing character(s):","Complete the hidden answer:","Solve this letter challenge:","Restore the answer from the clue:","Which letters belong in the blanks?","Finish the word to solve the clue:"];
 const pattern=letters.map((v,i)=>positions.includes(i)?"_":v).join(""),clue=styles[cycle]+" "+item.question;
 return {id:"missing:"+pattern+":"+clue,question:item.question,clue,answer:item.answer,pattern};
}
export function getSequencePuzzle(date:string,slot:number):Puzzle{
 const seed=seedFor(date,slot),a=2+(seed%1000),step=1+((seed*7)%23),curve=1+((seed*13)%17);
 const nums=[0,1,2,3,4].map(i=>a+i*step+i*i*curve),next=a+5*step+25*curve;
 return {id:"sequence:"+nums.join(",")+":"+next,question:nums.join(", ") + ", ?",answer:String(next),explanation:"The sequence adds a steady step and a growing square-based amount."};
}
export function getOddPuzzle(date:string,slot:number):Puzzle{
 const seed=seedFor(date,slot),base=11+(seed%97),start=1000+seed*3,outsider=base*start+1;
 const vals=[base*start,base*(start+1),outsider,base*(start+2)];
 const options=shuffled(vals.map(String),seed+17);
 return {id:"odd:"+base+":"+options.join(","),question:"Three numbers are multiples of "+base+". Which one is the odd one out?",options,answer:String(outsider),explanation:"The other three numbers are multiples of "+base+"."};
}
export function getQuizPuzzle(date:string,slot:number):Puzzle{
 const seed=seedFor(date,slot),cycleSeed=((seed%4000)+4000)%4000,item=DAILY_GK_QUESTIONS[cycleSeed%DAILY_GK_QUESTIONS.length],cycle=Math.floor(cycleSeed/DAILY_GK_QUESTIONS.length);
 const correct=answers.indexOf(item.answer),distractors:string[]=[];
 for(let offset=1;distractors.length<3&&offset<answers.length*2;offset++){const candidate=answers[((correct+cycle*7+offset)%answers.length+answers.length)%answers.length];if(candidate!==item.answer&&!distractors.includes(candidate))distractors.push(candidate);}
 const options=shuffled([item.answer,...distractors],seed+211+cycle*104729);
 return {id:"quiz:"+item.id+":"+options.join("|"),question:item.question,answer:item.answer,options,correctIndex:options.indexOf(item.answer),topic:"General Knowledge"};
}
export function getRiddlePuzzle(date:string,slot:number):Puzzle{
 const seed=seedFor(date,slot),target=1000+seed*7,double=target*2,add=target+17;
 const style=seed%3;
 if(style===0)return {id:"riddle:double:"+target,question:"I am a number. Double me and you get "+double+". What number am I?",answer:String(target),explanation:"Half of "+double+" is "+target+"."};
 if(style===1)return {id:"riddle:add:"+target,question:"A number plus 17 equals "+add+". What is the number?",answer:String(target),explanation:add+" − 17 = "+target+"."};
 return {id:"riddle:sequence:"+target,question:"A number sequence goes "+target+", "+(target+3)+", "+(target+6)+", "+(target+9)+", ?. What comes next?",answer:String(target+12),explanation:"Each step adds 3."};
}

export function getSpotPuzzle(date:string,slot:number):{id:string;size:number;target:number;targetIcon:number;baseIcon:number}{
 const seed=seedFor(date,slot),cycleSeed=((seed%4312)+4312)%4312;
 let size:number,offset:number;
 if(cycleSeed<896){size=16;offset=cycleSeed;}else if(cycleSeed<2296){size=25;offset=cycleSeed-896;}else{size=36;offset=cycleSeed-2296;}
 const target=Math.floor(offset/56),targetIcon=Math.floor((offset%56)/7),baseIcon=(targetIcon+1+(offset%7))%8;
 return {id:"spot:"+size+":"+target+":"+targetIcon+":"+baseIcon,size,target,targetIcon,baseIcon};
}
