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
 {q:"Three baskets are labelled APPLES, ORANGES and MIXED. Every label is wrong. You may take one fruit from one basket. Which labelled basket should you choose first to work out all three labels?",a:"MIXED",o:["APPLES","ORANGES","MIXED","Any basket works equally well"],e:"Because every label is wrong, the basket marked MIXED cannot contain a mixture. One fruit identifies its true contents, letting you deduce the other two."},
 {q:"Two doors lead out of a room: one is safe and one is dangerous. One guard always tells the truth and the other always lies, but you do not know which is which. What should you ask either guard to identify the safe door?",a:"Which door would the other guard call safe?",o:["Which door do you personally prefer?","Which door would the other guard call safe?","Is the left door safe?","Will the other guard agree with you?"],e:"Both guards point to the dangerous door when asked what the other would say, so choose the opposite door."},
 {q:"A key was taken by A, B or C. A says, “B took it.” B says, “I did not take it.” C says, “A is lying.” Exactly one statement is true. Who took the key?",a:"B",o:["A","B","C","The clues do not identify anyone"],e:"If B took it, A's statement is true while B's and C's are false, giving exactly one true statement."},
 {q:"A card has a letter on one side and a colour on the other. The rule is: “If a card has a vowel, its other side must be red.” You see A, K, RED and BLUE. Which cards must you turn to test the rule?",a:"A and BLUE",o:["A and RED","K and BLUE","A and BLUE","A, K and RED"],e:"A must have red on its reverse. BLUE must not hide a vowel. K and RED cannot disprove the rule."},
 {q:"A person with no brothers or sisters looks at a portrait and says, “That person's father is my father's son.” Who is in the portrait?",a:"Their child",o:["Their parent","Their child","Their cousin","Their spouse"],e:"With no siblings, “my father's son” refers to the speaker. The person in the portrait is the speaker's child."},
 {q:"A prisoner is told: “If your next statement is true, you will be locked away; if it is false, you will be sent away.” What statement creates a contradiction for the judge?",a:"You will send me away.",o:["I am innocent.","You will lock me away.","You will send me away.","I will say nothing."],e:"If the judge sends the prisoner away, the statement is true and the rule demands locking them away; if the judge locks them away, the statement is false and the rule demands sending them away."},
 {q:"A museum's alarm was never triggered. The guard says the thief entered through the window, but the window's dust seal is unbroken and untouched. Which conclusion best fits the evidence?",a:"The thief likely used another entrance",o:["The alarm must be broken","The thief likely used another entrance","The guard definitely stole the object","The object was never in the museum"],e:"An untouched window seal contradicts the claim that the thief used that window; the evidence points to another route, though it does not identify the thief."},
 {q:"A librarian finds a book on a desk. The borrowing system shows it was never checked out, and the reading room has been locked since closing. What is the most reasonable first conclusion?",a:"The book may never have left the library",o:["A visitor must have broken in","The system proves the book is fake","The book may never have left the library","The librarian must have taken it home"],e:"The records and locked room support the simple explanation that the book remained inside; they do not prove a break-in or identify a culprit."},
 {q:"A detective knows that whoever entered a clean room left muddy footprints. The room has no muddy footprints, and its only door was guarded the entire time. What follows most safely?",a:"There is no evidence that anyone entered by the stated route",o:["The suspect flew into the room","The suspect must be the guard","There is no evidence that anyone entered by the stated route","The room has no floor"],e:"The stated entry would leave footprints, but none were found. That weakens the claim of entry by that route without proving an impossible alternative."},
 {q:"A sign says, “All deliveries are accepted at the rear entrance.” A courier leaves a parcel at the front desk and says the sign told them to. What is the clearest problem with the courier's explanation?",a:"They used the opposite entrance to the one specified",o:["The sign says deliveries are forbidden","They used the opposite entrance to the one specified","The parcel cannot be delivered in daylight","The rear entrance must be locked"],e:"The instruction specifies the rear entrance, so leaving the parcel at the front desk does not follow it."},
 {q:"A building has a rule that visitors must sign in before entering. A person is already inside but there is no sign-in record. Which conclusion is justified?",a:"The record is missing or the rule was not followed",o:["The person is definitely an employee","The person must have entered through a window","The record is missing or the rule was not followed","The rule is impossible to enforce"],e:"The missing record conflicts with the rule, but it does not reveal whether the record was lost or the person ignored the rule."},
 {q:"A chef says the soup contains no dairy. The recipe card lists cream, but the chef says the card is old. What is the best next step before serving it to someone avoiding dairy?",a:"Verify the ingredients actually used",o:["Trust the chef because they cooked it","Assume all cream disappears when heated","Verify the ingredients actually used","Serve it only after adding water"],e:"The recipe and the chef's claim conflict, so checking the ingredients actually used is the only reliable way to resolve it."},
 {q:"Three envelopes are marked URGENT, ROUTINE and CONFIDENTIAL. Each contains a letter, and each label describes the wrong letter. You open the envelope marked ROUTINE and find a confidential letter. Which label belongs on that envelope?",a:"CONFIDENTIAL",o:["URGENT","ROUTINE","CONFIDENTIAL","The contents cannot determine the label"],e:"The contents establish that this envelope is confidential, and its old label is known to be wrong."},
 {q:"A witness says the hallway lights were off during the theft. The automatic backup lights turn on whenever the main lights fail, and they were working that night. Which detail most directly challenges the witness's claim that the hallway was completely dark?",a:"The backup lights were working",o:["The theft occurred at night","The hallway has two doors","The backup lights were working","The witness arrived early"],e:"Working backup lights mean the hallway would not have been completely dark even if the main lights were off."},
 {q:"A note says, “Meet me where the trains stop, not where they begin.” Which place best fits the clue?",a:"A railway station where trains arrive",o:["A train factory","A railway station where trains arrive","A road crossing with no platform","A bus depot"],e:"The clue points to a place where trains stop to arrive or depart, rather than where they are built or begin their journeys."},
 {q:"A room is locked from the inside. A person is found outside holding the only key, and the lock shows no damage. Which detail would best help determine whether the person could have locked the room and left?",a:"Whether the lock can secure itself when the door closes",o:["The person's favourite colour","Whether the lock can secure itself when the door closes","The number of windows in the building's lobby","Whether the room has painted walls"],e:"A self-locking mechanism could explain how a person exits and the door locks without damage; the other details do not address the puzzle."},
 {q:"A gardener claims that a plant was watered this morning. The soil is dry on top, but the pot has a full water reservoir and the plant's roots draw water from it. What is the soundest conclusion?",a:"The dry surface alone does not prove it was not watered",o:["The plant has no roots","The dry surface alone does not prove it was not watered","The reservoir must be empty","The gardener's claim is certainly false"],e:"Because the plant can draw water from the reservoir, a dry surface alone is insufficient evidence about whether it was watered."},
 {q:"An office rule says confidential files must be kept in a locked cabinet. A confidential file is found on a desk, but the cabinet is locked and undamaged. What can you conclude?",a:"The storage rule was not followed for that file",o:["The cabinet was broken open","The storage rule was not followed for that file","The file is not confidential after all","The office has no cabinets"],e:"The file was left outside the required locked cabinet. The evidence does not establish how or why it happened."},
 {q:"A person claims they were alone in a room all evening. A freshly poured second cup of tea is on the table, but no one saw who made it. What is the most careful conclusion?",a:"The tea raises a question but does not prove who was present",o:["A visitor definitely came","The person is certainly lying","The tea raises a question but does not prove who was present","The tea must have poured itself"],e:"The second cup is a clue worth investigating, but it could have been prepared earlier or for another reason; it does not prove a visitor was there."},
 {q:"Four folders are labelled REPORT, INVOICE, LETTER and PHOTO. Every label is on the wrong folder. You open the folder marked PHOTO and find an invoice. What is now certain?",a:"That folder's correct label is INVOICE",o:["The REPORT folder contains the photo","That folder's correct label is INVOICE","The LETTER folder contains the report","All the folders contain letters"],e:"The contents directly establish that the folder marked PHOTO is actually the INVOICE folder."},
 {q:"A security camera records everyone who enters a warehouse through its only public entrance. The entry log lists no visitors, and the camera was confirmed working. Which claim is least supported?",a:"A visitor entered through the public entrance unnoticed",o:["No visitor was logged by the camera","The camera was working","A visitor entered through the public entrance unnoticed","The log can be checked against the footage"],e:"A working camera records everyone using that entrance, so an unnoticed entry there conflicts with the stated conditions."},
 {q:"A map marks a footbridge as open, but a notice at the bridge says it is closed today. Which information should guide someone crossing right now?",a:"The current closure notice",o:["The map, because maps are always correct","The current closure notice","Whichever instruction is shorter","Neither; the bridge must be open"],e:"A dated, on-site notice is more relevant to the bridge's current status than a general map."},
 {q:"A shop's sign says “Closed on public holidays.” The shop is open during a public holiday, and no exception is posted. What is the safest conclusion?",a:"The shop's actual opening may not follow the sign",o:["The day cannot be a public holiday","The shop's actual opening may not follow the sign","The sign proves the shop is closed","The shop must be a different business"],e:"The observed opening conflicts with the sign, so one of them may be out of date or inaccurate; the facts do not settle which."},
 {q:"Two identical-looking keys are found beside a locked cabinet. One opens the cabinet and the other opens a desk drawer. What is the best way to identify the cabinet key without guessing?",a:"Test each key in the cabinet carefully",o:["Choose the heavier-looking key","Use the key with more scratches","Test each key in the cabinet carefully","Assume both keys open the cabinet"],e:"A careful test of each key against the lock directly identifies which one opens the cabinet."},
 {q:"A witness insists a painting was removed after the gallery closed. The gallery's door sensor shows no opening after closing, but a staff-only passage has a separate sensor that was not checked. What is the best next investigation?",a:"Check the staff-passage record",o:["Accuse the witness immediately","Check the staff-passage record","Ignore all sensor records","Repaint the gallery"],e:"The unchecked passage is a plausible route that could explain the gap in the evidence, so its record should be examined."},
 {q:"A sealed package arrives with its seal intact, but the contents listed on the outside do not match what is inside. What is the most reasonable first possibility to investigate?",a:"A packing or labelling mistake",o:["Someone opened and resealed it despite the intact seal","A packing or labelling mistake","The package changed contents by itself","The delivery address caused the contents to change"],e:"An intact seal makes a packing or labelling error a sensible first possibility, though more evidence may be needed."},
 {q:"A school says every borrowed instrument must be returned to the music room. One instrument is missing, and the return shelf is empty. What is the strongest conclusion supported by these facts?",a:"The instrument has not been located in the expected place",o:["A particular student stole it","The instrument has not been located in the expected place","The music teacher lost it","The instrument was never borrowed"],e:"The facts show only that it is not on the expected shelf; they do not identify who moved it or why."},
 {q:"A person claims a parcel was delivered to the correct house. The delivery photo shows a blue door, but the recipient's house has a red door. What should be checked first?",a:"Whether the photo shows the correct address",o:["Whether the parcel is the correct colour","Whether the photo shows the correct address","Whether the recipient owns a blue car","Whether the parcel was wrapped neatly"],e:"The visible door mismatch is directly relevant to whether the parcel was delivered to the right property."},
 {q:"A theatre ticket says “Balcony, Row B,” but the usher directs the guest to the orchestra level. What should resolve the disagreement?",a:"Check the ticket against the seating plan",o:["Follow the usher without checking","Check the ticket against the seating plan","Choose any empty seat","Assume Balcony means orchestra level"],e:"The ticket and the venue's seating plan provide the relevant evidence to identify the intended seat."},
 {q:"A detective finds a wet umbrella in a dry room. The owner says it has not been used today, but rain is falling outside. Which clue would best test that claim?",a:"Whether the umbrella was wet before today's rain began",o:["The owner's favourite weather","Whether the umbrella was wet before today's rain began","The colour of the umbrella handle","Whether the room has a clock"],e:"The timing of when it became wet can support or challenge the owner's statement; its colour and unrelated room details cannot."},
 {q:"A document has a valid signature but a date that falls before the named event took place. What is the clearest concern?",a:"The document may have been dated incorrectly or prepared earlier",o:["A signature can never be valid","The document may have been dated incorrectly or prepared earlier","The event must have been cancelled","The signer cannot read dates"],e:"The date conflicts with the event timeline, suggesting a possible dating error or an earlier draft, but not proving who caused it."},
 {q:"A key fits a locked door, but the door will not open because a heavy cabinet is pushed against it on the other side. What is the immediate obstacle?",a:"The cabinet blocking the door",o:["The key is the wrong shape","The cabinet blocking the door","The lock has no keyhole","The door is not attached to its frame"],e:"The key fitting the lock suggests the lock is not the immediate problem; the cabinet physically blocks the door."},
 {q:"A store receipt lists a blue coat, while the bag contains a red coat of the same size and brand. What should be checked first?",a:"Whether the item was packed or exchanged incorrectly",o:["Whether the coat fits the buyer","Whether the item was packed or exchanged incorrectly","Whether the receipt paper is blue","Whether the store sells coats"],e:"The receipt and contents disagree, so the packing record or a possible exchange is the relevant next check."}
];
export function getLogicRiddlePuzzle(date:string,slot:number):Puzzle & {options:string[];correctIndex:number;explanation:string}{
 const seed=seedFor(date,slot),index=((seed%logicRiddleBank.length)+logicRiddleBank.length)%logicRiddleBank.length,item=logicRiddleBank[index],cycle=Math.floor(seed/logicRiddleBank.length);
 const phrasing=cycle%2===0?item.q:"Reason carefully: "+item.q;
 const options=shuffled(item.o,seed+71);
 return {id:"logic-riddle:"+index+":"+cycle+":"+phrasing,question:phrasing,answer:item.a,options,correctIndex:options.indexOf(item.a),explanation:item.e,topic:"Logic"};
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
