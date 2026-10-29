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
const MISSING_WORD_CHALLENGES:Array<{sentence:string;answer:string;clue:string;options:string[]}>= [
 {sentence:"A stitch in time saves ____.",answer:"nine",clue:"A proverb about solving problems early.",options:["nine","fine","line","mine"]},
 {sentence:"Don't count your chickens before they ____.",answer:"hatch",clue:"Do not assume success before it happens.",options:["hatch","match","catch","patch"]},
 {sentence:"Every cloud has a silver ____.",answer:"lining",clue:"Look for the hopeful side of a difficult situation.",options:["lining","timing","mining","dining"]},
 {sentence:"Actions speak louder than ____.",answer:"words",clue:"What people do can matter more than what they say.",options:["words","world","works","worse"]},
 {sentence:"The early bird catches the ____.",answer:"worm",clue:"A proverb about being early and prepared.",options:["worm","warm","word","worn"]},
 {sentence:"When in Rome, do as the ____ do.",answer:"Romans",clue:"Adapt to the customs of the place you visit.",options:["Romans","rulers","roamers","robins"]},
 {sentence:"Practice makes ____.",answer:"perfect",clue:"Repeated effort improves a skill.",options:["perfect","present","patient","precious"]},
 {sentence:"Better late than ____.",answer:"never",clue:"Doing something late is better than not doing it.",options:["never","newer","nearer","clever"]},
 {sentence:"A picture is worth a thousand ____.",answer:"words",clue:"An image can communicate a great deal.",options:["words","worlds","works","wonders"]},
 {sentence:"Where there's a will, there's a ____.",answer:"way",clue:"Determination helps people find a solution.",options:["way","day","ray","say"]},
 {sentence:"Too many cooks spoil the ____.",answer:"broth",clue:"Too many people directing one task can harm it.",options:["broth","bread","broad","growth"]},
 {sentence:"The pen is mightier than the ____.",answer:"sword",clue:"Ideas and writing can be more powerful than force.",options:["sword","word","world","storm"]},
 {sentence:"Look before you ____.",answer:"leap",clue:"Think carefully before taking action.",options:["leap","heap","keep","deep"]},
 {sentence:"Honesty is the best ____.",answer:"policy",clue:"Truthfulness is generally the wisest approach.",options:["policy","poetry","police","polish"]},
 {sentence:"Two heads are better than ____.",answer:"one",clue:"Working together can improve problem-solving.",options:["one","once","only","own"]}
];
export function getMissingPuzzle(date:string,slot:number):Puzzle & {clue:string;pattern:string}{
 const seed=seedFor(date,slot),index=((seed%MISSING_WORD_CHALLENGES.length)+MISSING_WORD_CHALLENGES.length)%MISSING_WORD_CHALLENGES.length,item=MISSING_WORD_CHALLENGES[index];
 return {id:"missing:"+index+":"+item.answer,question:item.sentence.replace("____","_____"),clue:item.clue,answer:item.answer,pattern:"_____",options:shuffled(item.options,seed+29)};
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
const logicRiddleBank:Array<{q:string;a:string;o:[string,string,string,string];e:string}>= [
 {q:"A family has two parents and four daughters. Each daughter has one brother. How many children are there?",a:"5",o:["4","5","6","8"],e:"The four daughters share the same one brother."},
 {q:"A farmer has 17 sheep. All but 9 run away. How many sheep remain?",a:"9",o:["8","9","17","26"],e:"All but nine means nine remain."},
 {q:"You pass the runner who is in second place. What place are you in now?",a:"Second",o:["First","Second","Third","Fourth"],e:"You take the second runner's position."},
 {q:"Two fathers and two sons go fishing. They catch three fish, and each person gets one. How many people are there?",a:"3",o:["2","3","4","6"],e:"They are a grandfather, his son, and his grandson."},
 {q:"A pond's lily pads double in area every day. The pond is fully covered on day 48. On which day was it half covered?",a:"Day 47",o:["Day 46","Day 47","Day 48","Day 24"],e:"If the area doubles daily, it was half covered one day before full coverage."},
 {q:"How many months in a year have at least 28 days?",a:"12",o:["1","2","11","12"],e:"Every month has at least 28 days."},
 {q:"You overtake the person in third place in a race. What place are you in?",a:"Third",o:["Second","Third","Fourth","First"],e:"You take the position of the person you passed."},
 {q:"A clock takes 5 seconds to strike 6. At the same pace, how long does it take to strike 12?",a:"11 seconds",o:["10 seconds","11 seconds","12 seconds","6 seconds"],e:"Six strikes have five intervals; twelve strikes have eleven intervals."},
 {q:"There are 10 candles burning. You blow out 2 and leave the others burning until they finish. How many candles remain?",a:"2",o:["0","2","8","10"],e:"The two blown-out candles remain; the others burn away."},
 {q:"A bat and a ball cost $1.10 together. The bat costs $1 more than the ball. How much is the ball?",a:"$0.05",o:["$0.05","$0.10","$0.15","$1.00"],e:"The ball is five cents and the bat is $1.05."},
 {q:"A drawer contains 5 black socks and 5 blue socks. In darkness, how many socks must you take to guarantee a matching-colour pair?",a:"3",o:["2","3","5","6"],e:"With only two colours, three socks guarantee at least two of one colour."},
 {q:"A number is doubled, then 6 is added, giving 20. What was the original number?",a:"7",o:["6","7","8","13"],e:"Undo the addition: 20 − 6 = 14; halve it to get 7."},
 {q:"A code uses the rule A=1, B=2, C=3, and so on. What is the total value of CAB?",a:"6",o:["5","6","7","8"],e:"C=3, A=1, B=2; total 6."},
 {q:"A book's pages are numbered from 1 to 20. How many times does the digit 1 appear?",a:"12",o:["10","11","12","13"],e:"It appears in 1, 10–19 (eleven appearances there including 1 in 10), and 11 has two ones: total 12."},
 {q:"If yesterday was two days before Friday, what day is tomorrow?",a:"Friday",o:["Thursday","Friday","Saturday","Sunday"],e:"Yesterday was Wednesday, so today is Thursday and tomorrow is Friday."},
 {q:"A train travels 60 kilometres in one hour. At the same speed, how far does it travel in 15 minutes?",a:"15 km",o:["10 km","12 km","15 km","20 km"],e:"Fifteen minutes is one quarter of an hour; one quarter of 60 is 15."},
 {q:"A basket holds 6 apples. You take away 2 apples. How many apples do you have?",a:"2",o:["2","4","6","8"],e:"You have the two apples you took."},
 {q:"Three machines make three toys in three minutes. At the same rate, how long do 100 machines take to make 100 toys?",a:"3 minutes",o:["1 minute","3 minutes","33 minutes","100 minutes"],e:"Each machine makes one toy in three minutes."},
 {q:"A number leaves remainder 1 when divided by 2, 3, and 4. Which is the smallest option that works?",a:"13",o:["7","9","13","17"],e:"13 leaves remainder 1 when divided by 2, 3, and 4."},
 {q:"A father is four times as old as his son. In 20 years, he will be twice as old as his son. How old is the son now?",a:"10",o:["5","10","15","20"],e:"If the son is 10, the father is 40; in 20 years they will be 30 and 60."}
];
export function getLogicRiddlePuzzle(date:string,slot:number):Puzzle & {options:string[];correctIndex:number;explanation:string}{
 const seed=seedFor(date,slot),index=((seed%logicRiddleBank.length)+logicRiddleBank.length)%logicRiddleBank.length,item=logicRiddleBank[index],cycle=Math.floor(seed/logicRiddleBank.length);
 const forms=[item.q,item.q.replace(/^A /,"Consider a ").replace(/^How many /,"Work out how many "),item.q.replace(/^A /,"Think carefully: a ").replace(/^You /,"Imagine you ").replace(/^How many /,"Reason this out: how many ")];
 const question=cycle%3===0?item.q:forms[cycle%forms.length];
 const options=shuffled(item.o,seed+71);
 return {id:"logic-riddle:"+index+":"+cycle+":"+question,question,answer:item.a,options,correctIndex:options.indexOf(item.a),explanation:item.e,topic:"Logic"};
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
