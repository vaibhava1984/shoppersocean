import { DAILY_GK_QUESTIONS, getDailyGKQuestion } from "@/lib/daily-knowledge";
export { getDailyGKQuestion };
export type Puzzle = { id:string; question:string; answer:string; clue?:string; pattern?:string; options?:string[]; correctIndex?:number; explanation?:string; topic?:string };
const DAY_MS=86400000;
function seedFor(date:string,slot:number){return Math.floor(Date.parse(date+"T00:00:00Z")/DAY_MS)*10+Math.max(0,Math.floor(slot));}
function hash(n:number){let x=n|0;x=Math.imul(x^(x>>>16),0x45d9f3b);x=Math.imul(x^(x>>>16),0x45d9f3b);return (x^(x>>>16))>>>0;}
function rng(seed:number){let x=hash(seed)||1;return()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}
function shuffled<T>(values:T[],seed:number){const out=[...values],random=rng(seed);for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
const answers=[...new Set(DAILY_GK_QUESTIONS.map(x=>x.answer))];
const longAnswers=answers.filter(a=>a.replace(/[^A-Za-z]/g,"").length>=7);
export function getWordPuzzle(date:string,slot:number):Puzzle{
 const seed=seedFor(date,slot),answer=longAnswers[hash(seed)%longAnswers.length],letters=answer.toUpperCase().replace(/[^A-Z]/g,"");
 let scrambled=shuffled(letters.split(""),seed).join("");
 if(scrambled===letters&&letters.length>1)scrambled=letters.slice(1)+letters[0];
 return {id:"word:"+scrambled,question:"Rearrange these letters to make a capital city.",answer,pattern:scrambled};
}
export function getHiddenPuzzle(date:string,slot:number):Puzzle{
 const seed=seedFor(date,slot),item=DAILY_GK_QUESTIONS[seed%DAILY_GK_QUESTIONS.length];
 const styles=["Geography clue:","Think of a world capital:","Name the city asked for here:","Use your world knowledge:","Solve this capital-city clue:","A country-capital challenge:","Your destination is a capital city:","Read carefully and identify the capital:","Find the city that answers this clue:","World geography challenge:"];
 return {id:"hidden:"+styles[Math.floor(seed/DAILY_GK_QUESTIONS.length)%styles.length]+item.question,question:item.question,clue:styles[seed%styles.length]+" "+item.question,answer:item.answer};
}
export function getMissingPuzzle(date:string,slot:number):Puzzle{
 const seed=seedFor(date,slot),item=DAILY_GK_QUESTIONS[hash(seed)%DAILY_GK_QUESTIONS.length],letters=item.answer.toUpperCase().replace(/[^A-Z]/g,"").split("");
 const count=letters.length>7?2:1,positions=shuffled(letters.map((_,i)=>i),seed).slice(0,count);
 const pattern=letters.map((v,i)=>positions.includes(i)?"_":v).join("");
 return {id:"missing:"+pattern+":"+item.question,question:item.question,clue:"Complete the missing letter(s). "+item.question,answer:item.answer,pattern};
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
 const seed=seedFor(date,slot),item=DAILY_GK_QUESTIONS[seed%DAILY_GK_QUESTIONS.length];
 const cycle=Math.floor(seed/DAILY_GK_QUESTIONS.length);
 const distractors=shuffled(answers.filter(a=>a.toLowerCase()!==item.answer.toLowerCase()),seed+101+cycle*7919).slice(0,3);
 const options=shuffled([item.answer,...distractors],seed+211+cycle*104729);
 return {id:"quiz:"+item.id+":"+options.join("|"),question:item.question,answer:item.answer,options,correctIndex:options.indexOf(item.answer),topic:"World Knowledge"};
}
export function getRiddlePuzzle(date:string,slot:number):Puzzle{
 const seed=seedFor(date,slot),target=1000+seed*7,double=target*2,add=target+17;
 const style=seed%3;
 if(style===0)return {id:"riddle:double:"+target,question:"I am a number. Double me and you get "+double+". What number am I?",answer:String(target),explanation:"Half of "+double+" is "+target+"."};
 if(style===1)return {id:"riddle:add:"+target,question:"A number plus 17 equals "+add+". What is the number?",answer:String(target),explanation:add+" − 17 = "+target+"."};
 return {id:"riddle:sequence:"+target,question:"A number sequence goes "+target+", "+(target+3)+", "+(target+6)+", "+(target+9)+", ?. What comes next?",answer:String(target+12),explanation:"Each step adds 3."};
}

export function getSpotPuzzle(date:string,slot:number):{id:string;size:number;target:number;targetIcon:number;baseIcon:number}{
 const seed=seedFor(date,slot),sizes=[16,25,36],size=sizes[hash(seed+701)%sizes.length];
 const target=hash(seed+1709)%size,targetIcon=hash(seed+2711)%8,baseIcon=(targetIcon+1+(hash(seed+3911)%7))%8;
 return {id:"spot:"+size+":"+target+":"+targetIcon+":"+baseIcon,size,target,targetIcon,baseIcon};
}
