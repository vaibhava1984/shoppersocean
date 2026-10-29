import { DAILY_GK_QUESTIONS, getDailyGKQuestion } from "@/lib/daily-knowledge";
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
export function getHiddenPuzzle(date:string,slot:number):Puzzle & {clue:string}{
 const seed=seedFor(date,slot),item=DAILY_GK_QUESTIONS[seed%DAILY_GK_QUESTIONS.length];
 const styles=["Knowledge clue:","Think carefully:","General knowledge challenge:","Read the clue:","Identify the answer:","Use what you know:","Here is your next challenge:","Reason it out:","Choose your knowledge carefully:","Solve this challenge:"];
 const category=item.id.split("-")[0],pool=DAILY_GK_QUESTIONS.filter(entry=>entry.id.split("-")[0]===category).map(entry=>entry.answer).filter(answer=>answer!==item.answer),options=[item.answer,...shuffled([...new Set(pool)],seed+91).slice(0,3)];
 return {id:"hidden:"+item.id,question:item.question,clue:styles[Math.floor(seed/DAILY_GK_QUESTIONS.length)%styles.length]+" "+item.question,answer:item.answer,options:shuffled(options,seed+19)};
}
export function getMissingPuzzle(date:string,slot:number):Puzzle & {clue:string;pattern:string}{
 const seed=seedFor(date,slot),cycleSeed=((seed%4000)+4000)%4000,item=DAILY_GK_QUESTIONS[cycleSeed%DAILY_GK_QUESTIONS.length],cycle=Math.floor(cycleSeed/DAILY_GK_QUESTIONS.length),letters=item.answer.toUpperCase().replace(/[^A-Z]/g,"").split("");
 const count=letters.length>7?2:1,positions=shuffled(letters.map((_,i)=>i),seed+cycle*97).slice(0,count);
 const styles=["Fill the missing letter(s):","Complete this word using the clue:","A word puzzle for you:","Use the clue to restore the word:","Find the missing character(s):","Complete the hidden answer:","Solve this letter challenge:","Restore the answer from the clue:","Which letters belong in the blanks?","Finish the word to solve the clue:"];
 const pattern=letters.map((v,i)=>positions.includes(i)?"_":v).join(""),clue=styles[cycle]+" "+item.question;
 const category=item.id.split("-")[0],pool=DAILY_GK_QUESTIONS.filter(entry=>entry.id.split("-")[0]===category).map(entry=>entry.answer).filter(answer=>answer!==item.answer),options=shuffled([item.answer,...shuffled([...new Set(pool)],seed+173).slice(0,3)],seed+29);
 return {id:"missing:"+item.id+":"+cycle,question:item.question,clue,answer:item.answer,pattern,options};
}
export function getSequencePuzzle(date:string,slot:number):Puzzle & {explanation:string}{
 const seed=seedFor(date,slot),a=2+(seed%1000),step=1+((seed*7)%23),curve=1+((seed*13)%17);
 const nums=[0,1,2,3,4].map(i=>a+i*step+i*i*curve),next=a+5*step+25*curve;
 return {id:"sequence:"+nums.join(",")+":"+next,question:nums.join(", ") + ", ?",answer:String(next),explanation:"The sequence adds a steady step and a growing square-based amount."};
}
const oddWordSets=[
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
export function getQuizPuzzle(date:string,slot:number):Puzzle & {options:string[];correctIndex:number;topic:string}{
 const seed=seedFor(date,slot),cycleSeed=((seed%4000)+4000)%4000,item=DAILY_GK_QUESTIONS[cycleSeed%DAILY_GK_QUESTIONS.length],cycle=Math.floor(cycleSeed/DAILY_GK_QUESTIONS.length),category=item.id.split("-")[0],pool=answerPools[category]??answers;
 const correct=pool.indexOf(item.answer),distractors:string[]=[];
 for(let offset=1;distractors.length<3&&offset<pool.length*2;offset++){const candidate=pool[((correct+cycle*7+offset)%pool.length+pool.length)%pool.length];if(candidate!==item.answer&&!distractors.includes(candidate))distractors.push(candidate);}
 const options=shuffled([item.answer,...distractors],seed+211+cycle*104729);
 const country=item.question.replace(/^What is the capital city of /,"").replace(/\?$/,"");
 const symbol=item.question.replace(/^Which chemical element has the symbol /,"").replace(/\?$/,"");
 const capitalForms=[item.question,"Name the capital city of "+country+".","Which city is the capital of "+country+"?","Identify the national capital of "+country+".","Which city serves as the capital of "+country+"?","Choose the capital of "+country+".","What city is the seat of government in "+country+"?","For "+country+", which city is the capital?","Select the correct capital city for "+country+".","Which city should complete this statement: the capital of "+country+" is ...?"];
 const elementForms=[item.question,"The symbol "+symbol+" belongs to which chemical element?","Identify the element represented by "+symbol+".","Which element is denoted by "+symbol+"?","Name the element whose chemical symbol is "+symbol+".","Select the element associated with the symbol "+symbol+".","Which chemical name matches the symbol "+symbol+"?","What element would you find listed as "+symbol+" on the periodic table?","Match the symbol "+symbol+" to its element.","Which element is abbreviated as "+symbol+"?"];
 const generalForms=[item.question,"General knowledge: "+item.question,"Think carefully: "+item.question,"Choose the correct answer to this: "+item.question,"Quick quiz: "+item.question,"Test your knowledge: "+item.question,"Knowledge check: "+item.question,"Select the best answer: "+item.question,"Challenge question: "+item.question,"Can you answer this? "+item.question];
 const question=(category==="capital"?capitalForms:category==="element"?elementForms:generalForms)[cycle];
 return {id:"quiz:"+item.id+":"+cycle+":"+options.join("|"),question,answer:item.answer,options,correctIndex:options.indexOf(item.answer),topic:category==="capital"?"World Capitals":category==="element"?"Chemical Elements":category==="science"?"Science":"World Geography"};
}
const riddleBank=[
 {q:"I have keys but no locks, a space but no room, and you can enter but never go inside. What am I?",a:"keyboard",e:"A keyboard has keys, a space bar, and an Enter key."},
 {q:"What gets wetter while it dries something else?",a:"towel",e:"A towel becomes wet as it dries you."},
 {q:"I have a face and hands but no arms or legs. What am I?",a:"clock",e:"A clock has a face and hands."},
 {q:"I can show you roads, rivers, and cities, but I contain no cars, water, or people. What am I?",a:"map",e:"A map represents places without containing them."},
 {q:"The more you take away from me, the bigger I become. What am I?",a:"hole",e:"Removing more material makes a hole bigger."},
 {q:"I speak without a mouth and answer without ears. I have no body, but I come alive when sound travels. What am I?",a:"echo",e:"An echo repeats sound."},
 {q:"What word becomes shorter when you add two letters to it?",a:"short",e:"Adding E and R makes SHORT into SHORTER."},
 {q:"I have a neck but no head, and I can hold something without hands. What am I?",a:"bottle",e:"A bottle has a neck and can hold liquid."},
 {q:"What has many teeth but cannot bite?",a:"comb",e:"A comb has teeth used to arrange hair."},
 {q:"Look at this picture clue: 🌧️ + 🌞. What colourful arc can appear in the sky?",a:"rainbow",e:"Sunlight and rain can produce a rainbow."}
];
export function getRiddlePuzzle(date:string,slot:number):Puzzle & {explanation:string}{
 const seed=seedFor(date,slot),item=riddleBank[((seed%riddleBank.length)+riddleBank.length)%riddleBank.length];
 return {id:"riddle:"+item.a+":"+item.q,question:item.q,answer:item.a,explanation:item.e};
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
