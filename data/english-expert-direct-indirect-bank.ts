type SpeechItem = { name:string; pronoun:"he"|"she"; base:string; past:string; pp:string; object:string };
const speechItems:SpeechItem[] = [
{name:"Aarav",pronoun:"he",base:"check",past:"checked",pp:"checked",object:"the figures"},
{name:"Mira",pronoun:"she",base:"prepare",past:"prepared",pp:"prepared",object:"the presentation"},
{name:"Kabir",pronoun:"he",base:"repair",past:"repaired",pp:"repaired",object:"the bicycle"},
{name:"Leah",pronoun:"she",base:"organise",past:"organised",pp:"organised",object:"the files"},
{name:"Rohan",pronoun:"he",base:"study",past:"studied",pp:"studied",object:"the lesson"},
{name:"Nina",pronoun:"she",base:"paint",past:"painted",pp:"painted",object:"the landscape"},
{name:"Dev",pronoun:"he",base:"deliver",past:"delivered",pp:"delivered",object:"the parcel"},
{name:"Anika",pronoun:"she",base:"water",past:"watered",pp:"watered",object:"the plants"},
{name:"Rahul",pronoun:"he",base:"design",past:"designed",pp:"designed",object:"the website"},
{name:"Tara",pronoun:"she",base:"write",past:"wrote",pp:"written",object:"the report"},
{name:"Imran",pronoun:"he",base:"choose",past:"chose",pp:"chosen",object:"the blue folder"},
{name:"Priya",pronoun:"she",base:"build",past:"built",pp:"built",object:"the model"},
{name:"Karan",pronoun:"he",base:"send",past:"sent",pp:"sent",object:"the invitation"},
{name:"Eva",pronoun:"she",base:"teach",past:"taught",pp:"taught",object:"the children"},
{name:"Omar",pronoun:"he",base:"bring",past:"brought",pp:"brought",object:"the equipment"},
{name:"Sara",pronoun:"she",base:"make",past:"made",pp:"made",object:"the cake"},
{name:"Vikram",pronoun:"he",base:"collect",past:"collected",pp:"collected",object:"the forms"},
{name:"Asha",pronoun:"she",base:"read",past:"read",pp:"read",object:"the instructions"},
{name:"Arjun",pronoun:"he",base:"solve",past:"solved",pp:"solved",object:"the problem"},
{name:"Meera",pronoun:"she",base:"keep",past:"kept",pp:"kept",object:"the records"},
{name:"Sameer",pronoun:"he",base:"speak",past:"spoke",pp:"spoken",object:"to the visitors"},
{name:"Isha",pronoun:"she",base:"take",past:"took",pp:"taken",object:"the photographs"},
{name:"Nikhil",pronoun:"he",base:"find",past:"found",pp:"found",object:"the missing key"},
{name:"Zara",pronoun:"she",base:"give",past:"gave",pp:"given",object:"the final answer"},
{name:"Manav",pronoun:"he",base:"drive",past:"drove",pp:"driven",object:"the delivery van"},
{name:"Pooja",pronoun:"she",base:"draw",past:"drew",pp:"drawn",object:"a detailed map"},
{name:"Adil",pronoun:"he",base:"eat",past:"ate",pp:"eaten",object:"the sandwich"},
{name:"Ritu",pronoun:"she",base:"sing",past:"sang",pp:"sung",object:"the opening song"},
{name:"Yusuf",pronoun:"he",base:"catch",past:"caught",pp:"caught",object:"the early train"},
{name:"Kavya",pronoun:"she",base:"leave",past:"left",pp:"left",object:"the office"}
];
type Q = { q:string; o:string[]; a:number; e:string };
function makeQ(q:string,correct:string,wrong:string[],explanation:string,seed:number):Q {
 const choices=[correct,...wrong];
 const shift=seed%4;
 const options=choices.map((_,i)=>choices[(i-shift+4)%4]);
 return {q,o:options,a:shift,e:explanation};
}
function buildBank():Q[] {
 const bank:Q[]=[];
 speechItems.forEach((x,i)=>{
  const s=x.pronoun, name=x.name, obj=x.object, base=x.base, past=x.past, pp=x.pp;
  bank.push(makeQ(`Choose the correctly reported form: ${name} said, “I ${base} ${obj} every Monday.”`,`${name} said that ${s} ${past} ${obj} every Monday.`,[`${name} said that ${s} ${base} ${obj} every Monday.`,`${name} said that I ${past} ${obj} every Monday.`,`${name} said that ${s} had ${pp} ${obj} every Monday.`],"The simple present usually changes to the simple past in reported speech; I changes to the speaker's third-person pronoun.",i));
  bank.push(makeQ(`Choose the correctly reported form: ${name} said, “I am ${base.endsWith("e")?base.slice(0,-1)+"ing":base==="write"?"writing":base==="drive"?"driving":base==="take"?"taking":base==="make"?"making":base==="give"?"giving":base==="speak"?"speaking":base==="sing"?"singing":base==="eat"?"eating":base==="read"?"reading":base==="build"?"building":base==="bring"?"bringing":base==="catch"?"catching":base==="keep"?"keeping":base==="teach"?"teaching":base==="choose"?"choosing":base==="leave"?"leaving":base==="find"?"finding":base==="draw"?"drawing":base==="study"?"studying":base==="try"?"trying":base+"ing"} ${obj} now.”`,`${name} said that ${s} was ${base.endsWith("e")?base.slice(0,-1)+"ing":base==="write"?"writing":base==="drive"?"driving":base==="take"?"taking":base==="make"?"making":base==="give"?"giving":base==="speak"?"speaking":base==="sing"?"singing":base==="eat"?"eating":base==="read"?"reading":base==="build"?"building":base==="bring"?"bringing":base==="catch"?"catching":base==="keep"?"keeping":base==="teach"?"teaching":base==="choose"?"choosing":base==="leave"?"leaving":base==="find"?"finding":base==="draw"?"drawing":base==="study"?"studying":base+"ing"} ${obj} then.`,[`${name} said that ${s} is ${base}ing ${obj} now.`,`${name} said that I was ${base}ing ${obj} then.`,`${name} said that ${s} had been ${base}ing ${obj} then.`],"The present continuous normally changes to the past continuous; now changes to then.",30+i));
  bank.push(makeQ(`Choose the correctly reported form: ${name} said, “I have ${pp} ${obj}.”`,`${name} said that ${s} had ${pp} ${obj}.`,[`${name} said that ${s} has ${pp} ${obj}.`,`${name} said that I had ${pp} ${obj}.`,`${name} said that ${s} was ${pp} ${obj}.`],"The present perfect usually changes to the past perfect; the pronoun changes to match the speaker.",60+i));
  bank.push(makeQ(`Choose the correctly reported form: ${name} said, “I ${past} ${obj} yesterday.”`,`${name} said that ${s} had ${pp} ${obj} the previous day.`,[`${name} said that ${s} ${past} ${obj} yesterday.`,`${name} said that I had ${pp} ${obj} the previous day.`,`${name} said that ${s} has ${pp} ${obj} the previous day.`],"The simple past normally changes to the past perfect; yesterday changes to the previous day.",90+i));
  bank.push(makeQ(`Choose the correctly reported form: ${name} said, “I was ${base==="write"?"writing":base==="drive"?"driving":base==="take"?"taking":base==="make"?"making":base==="give"?"giving":base==="speak"?"speaking":base==="sing"?"singing":base==="eat"?"eating":base==="read"?"reading":base==="build"?"building":base==="bring"?"bringing":base==="catch"?"catching":base==="keep"?"keeping":base==="teach"?"teaching":base==="choose"?"choosing":base==="leave"?"leaving":base==="find"?"finding":base==="draw"?"drawing":base==="study"?"studying":base+"ing"} ${obj}.”`,`${name} said that ${s} had been ${base==="write"?"writing":base==="drive"?"driving":base==="take"?"taking":base==="make"?"making":base==="give"?"giving":base==="speak"?"speaking":base==="sing"?"singing":base==="eat"?"eating":base==="read"?"reading":base==="build"?"building":base==="bring"?"bringing":base==="catch"?"catching":base==="keep"?"keeping":base==="teach"?"teaching":base==="choose"?"choosing":base==="leave"?"leaving":base==="find"?"finding":base==="draw"?"drawing":base==="study"?"studying":base+"ing"} ${obj}.`,[`${name} said that ${s} was ${base}ing ${obj}.`,`${name} said that ${s} has been ${base}ing ${obj}.`,`${name} said that I had been ${base}ing ${obj}.`],"The past continuous normally changes to the past perfect continuous in reported speech.",120+i));
  bank.push(makeQ(`Choose the correctly reported form: ${name} said, “I will ${base} ${obj} tomorrow.”`,`${name} said that ${s} would ${base} ${obj} the following day.`,[`${name} said that ${s} will ${base} ${obj} tomorrow.`,`${name} said that I would ${base} ${obj} the following day.`,`${name} said that ${s} would ${past} ${obj} the following day.`],"Will usually changes to would; tomorrow changes to the following day.",150+i));
  bank.push(makeQ(`Choose the correctly reported form: ${name} said, “I can ${base} ${obj}.”`,`${name} said that ${s} could ${base} ${obj}.`,[`${name} said that ${s} can ${base} ${obj}.`,`${name} said that I could ${base} ${obj}.`,`${name} said that ${s} could ${past} ${obj}.`],"Can usually changes to could in reported speech; the verb after could remains in its base form.",180+i));
  bank.push(makeQ(`Choose the correctly reported question: The interviewer asked ${name}, “Do you ${base} ${obj}?”`,`The interviewer asked ${name} whether ${s} ${base} ${obj}.`,[`The interviewer asked ${name} whether did ${s} ${base} ${obj}.`,`The interviewer asked ${name} whether ${s} ${past} ${obj}.`,`The interviewer asked ${name} whether do ${s} ${base} ${obj}.`],"A yes/no question is reported with if or whether and statement word order; do is removed.",210+i));
  bank.push(makeQ(`Choose the correctly reported question: The interviewer asked ${name}, “Where do you ${base} ${obj}?”`,`The interviewer asked ${name} where ${s} ${past} ${obj}.`,[`The interviewer asked ${name} where did ${s} ${base} ${obj}.`,`The interviewer asked ${name} where ${s} ${base} ${obj}.`,`The interviewer asked ${name} where do ${s} ${base} ${obj}.`],"A wh-question keeps its question word but changes to statement word order; do is removed and the tense normally backshifts.",240+i));
 });
 // Add a final set of 30 correctly formed commands and requests.
 speechItems.forEach((x,i)=>{
  const recipient=x.name, verb=x.base, obj=x.object;
  bank.push(makeQ(`Choose the correctly reported request: The supervisor said to ${recipient}, “Please ${verb} ${obj}.”`,`The supervisor asked ${recipient} to ${verb} ${obj}.`,[`The supervisor said ${recipient} that please ${verb} ${obj}.`,`The supervisor asked ${recipient} that ${recipient} should ${verb} ${obj}.`,`The supervisor told to ${recipient} to ${verb} ${obj}.`],"A polite request is commonly reported with asked + object + to-infinitive.",270+i));
 });
 return bank;
}
export const DIRECT_INDIRECT_QUESTION_BANK = buildBank();
if (DIRECT_INDIRECT_QUESTION_BANK.length !== 300) throw new Error("Direct and Indirect Speech bank must contain exactly 300 questions.");
