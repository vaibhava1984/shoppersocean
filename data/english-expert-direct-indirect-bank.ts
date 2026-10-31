type SpeechItem = { name: string; pronoun: "he" | "she"; base: string; third: string; past: string; pp: string; ing: string; complement: string };

const speechItems: SpeechItem[] = [
{name:"Aarav",pronoun:"he",base:"check",third:"checks",past:"checked",pp:"checked",ing:"checking",complement:"the figures"},
{name:"Mira",pronoun:"she",base:"prepare",third:"prepares",past:"prepared",pp:"prepared",ing:"preparing",complement:"the presentation"},
{name:"Kabir",pronoun:"he",base:"repair",third:"repairs",past:"repaired",pp:"repaired",ing:"repairing",complement:"the bicycle"},
{name:"Leah",pronoun:"she",base:"organise",third:"organises",past:"organised",pp:"organised",ing:"organising",complement:"the files"},
{name:"Rohan",pronoun:"he",base:"study",third:"studies",past:"studied",pp:"studied",ing:"studying",complement:"the lesson"},
{name:"Nina",pronoun:"she",base:"paint",third:"paints",past:"painted",pp:"painted",ing:"painting",complement:"the landscape"},
{name:"Dev",pronoun:"he",base:"deliver",third:"delivers",past:"delivered",pp:"delivered",ing:"delivering",complement:"the parcel"},
{name:"Anika",pronoun:"she",base:"water",third:"waters",past:"watered",pp:"watered",ing:"watering",complement:"the plants"},
{name:"Rahul",pronoun:"he",base:"design",third:"designs",past:"designed",pp:"designed",ing:"designing",complement:"the website"},
{name:"Tara",pronoun:"she",base:"write",third:"writes",past:"wrote",pp:"written",ing:"writing",complement:"the report"},
{name:"Imran",pronoun:"he",base:"choose",third:"chooses",past:"chose",pp:"chosen",ing:"choosing",complement:"the blue folder"},
{name:"Priya",pronoun:"she",base:"build",third:"builds",past:"built",pp:"built",ing:"building",complement:"the model"},
{name:"Karan",pronoun:"he",base:"send",third:"sends",past:"sent",pp:"sent",ing:"sending",complement:"the invitation"},
{name:"Eva",pronoun:"she",base:"teach",third:"teaches",past:"taught",pp:"taught",ing:"teaching",complement:"the children"},
{name:"Omar",pronoun:"he",base:"bring",third:"brings",past:"brought",pp:"brought",ing:"bringing",complement:"the equipment"},
{name:"Sara",pronoun:"she",base:"make",third:"makes",past:"made",pp:"made",ing:"making",complement:"the cake"},
{name:"Vikram",pronoun:"he",base:"collect",third:"collects",past:"collected",pp:"collected",ing:"collecting",complement:"the forms"},
{name:"Asha",pronoun:"she",base:"read",third:"reads",past:"read",pp:"read",ing:"reading",complement:"the instructions"},
{name:"Arjun",pronoun:"he",base:"solve",third:"solves",past:"solved",pp:"solved",ing:"solving",complement:"the problem"},
{name:"Meera",pronoun:"she",base:"keep",third:"keeps",past:"kept",pp:"kept",ing:"keeping",complement:"the records"},
{name:"Sameer",pronoun:"he",base:"speak",third:"speaks",past:"spoke",pp:"spoken",ing:"speaking",complement:"to the visitors"},
{name:"Isha",pronoun:"she",base:"take",third:"takes",past:"took",pp:"taken",ing:"taking",complement:"the photographs"},
{name:"Nikhil",pronoun:"he",base:"find",third:"finds",past:"found",pp:"found",ing:"finding",complement:"the missing key"},
{name:"Zara",pronoun:"she",base:"give",third:"gives",past:"gave",pp:"given",ing:"giving",complement:"the final answer"},
{name:"Manav",pronoun:"he",base:"drive",third:"drives",past:"drove",pp:"driven",ing:"driving",complement:"the delivery van"},
{name:"Pooja",pronoun:"she",base:"draw",third:"draws",past:"drew",pp:"drawn",ing:"drawing",complement:"a detailed map"},
{name:"Adil",pronoun:"he",base:"eat",third:"eats",past:"ate",pp:"eaten",ing:"eating",complement:"the sandwich"},
{name:"Ritu",pronoun:"she",base:"sing",third:"sings",past:"sang",pp:"sung",ing:"singing",complement:"the opening song"},
{name:"Yusuf",pronoun:"he",base:"catch",third:"catches",past:"caught",pp:"caught",ing:"catching",complement:"the early train"},
{name:"Kavya",pronoun:"she",base:"leave",third:"leaves",past:"left",pp:"left",ing:"leaving",complement:"the office"}
];

type Question = { q: string; o: string[]; a: number; e: string };

function makeQuestion(q: string, correct: string, alternatives: [string,string,string], explanation: string, seed: number): Question {
  const choices = [correct, ...alternatives];
  const shift = seed % 4;
  const options = choices.map((_, index) => choices[(index - shift + 4) % 4]);
  return { q, o: options, a: shift, e: explanation };
}

function buildBank(): Question[] {
  const bank: Question[] = [];
  speechItems.forEach((x, i) => {
    const p = x.pronoun, n = x.name, b = x.base, t = x.third, past = x.past, pp = x.pp, ing = x.ing, c = x.complement;
    bank.push(makeQuestion(
      `Choose the correct reported form: ${n} said, “I ${b} ${c} every Monday.”`,
      `${n} said that ${p} ${past} ${c} every Monday.`,
      [`${n} said that ${p} ${t} ${c} every Monday.`, `${n} said that ${p} had ${pp} ${c} every Monday.`, `${n} said that I ${past} ${c} every Monday.`],
      "In reported speech, the simple present usually backshifts to the simple past; the first-person pronoun changes to match the speaker.", i));

    bank.push(makeQuestion(
      `Choose the correct reported form: ${n} said, “I am ${ing} ${c} now.”`,
      `${n} said that ${p} was ${ing} ${c} then.`,
      [`${n} said that ${p} is ${ing} ${c} now.`, `${n} said that ${p} had been ${ing} ${c} then.`, `${n} said that ${p} has been ${ing} ${c} since that morning.`],
      "The present continuous usually changes to the past continuous, and now changes to then.", 30+i));

    bank.push(makeQuestion(
      `Choose the correct reported form: ${n} said, “I have ${pp} ${c}.”`,
      `${n} said that ${p} had ${pp} ${c}.`,
      [`${n} said that ${p} has ${pp} ${c}.`, `${n} said that ${p} completed ${c}.`, `${n} said that ${p} was ${ing} ${c}.`],
      "The present perfect usually changes to the past perfect in reported speech.", 60+i));

    bank.push(makeQuestion(
      `Choose the correct reported form: ${n} said, “I ${past} ${c} yesterday.”`,
      `${n} said that ${p} had ${pp} ${c} the previous day.`,
      [`${n} said that ${p} ${past} ${c} the previous day.`, `${n} said that ${p} was ${ing} ${c} the previous day.`, `${n} said that ${p} had been ${ing} ${c} the previous day.`],
      "The simple past normally changes to the past perfect; yesterday changes to the previous day.", 90+i));

    bank.push(makeQuestion(
      `Choose the correct reported form: ${n} said, “I was ${ing} ${c}.”`,
      `${n} said that ${p} had been ${ing} ${c}.`,
      [`${n} said that ${p} was ${ing} ${c}.`, `${n} said that ${p} has been ${ing} ${c}.`, `${n} said that ${p} would be ${ing} ${c}.`],
      "The past continuous normally changes to the past perfect continuous in reported speech.", 120+i));

    bank.push(makeQuestion(
      `Choose the correct reported form: ${n} said, “I will ${b} ${c} tomorrow.”`,
      `${n} said that ${p} would ${b} ${c} the following day.`,
      [`${n} said that ${p} will ${b} ${c} tomorrow.`, `${n} said that ${p} was going to ${b} ${c} the following day.`, `${n} said that ${p} might ${b} ${c} the following day.`],
      "Will usually changes to would, and tomorrow changes to the following day.", 150+i));

    bank.push(makeQuestion(
      `Choose the correct reported form: ${n} said, “I can ${b} ${c}.”`,
      `${n} said that ${p} could ${b} ${c}.`,
      [`${n} said that ${p} can ${b} ${c}.`, `${n} said that ${p} was able to ${b} ${c}.`, `${n} said that ${p} might be able to ${b} ${c}.`],
      "Can usually changes to could in reported speech; the verb after could remains in its base form.", 180+i));

    bank.push(makeQuestion(
      `Choose the correct reported question: The interviewer asked ${n}, “Do you ${b} ${c}?”`,
      `The interviewer asked ${n} whether ${p} ${past} ${c}.`,
      [`The interviewer asked ${n} whether ${p} ${t} ${c}.`, `The interviewer asked ${n} whether ${p} had ${pp} ${c}.`, `The interviewer asked ${n} whether ${p} was ${ing} ${c}.`],
      "A yes/no question is reported with if or whether and statement word order; the auxiliary do is removed.", 210+i));

    bank.push(makeQuestion(
      `Choose the correct reported question: The interviewer asked ${n}, “Where do you ${b} ${c}?”`,
      `The interviewer asked ${n} where ${p} ${past} ${c}.`,
      [`The interviewer asked ${n} where ${p} ${t} ${c}.`, `The interviewer asked ${n} where ${p} had ${pp} ${c}.`, `The interviewer asked ${n} where ${p} was ${ing} ${c}.`],
      "A reported wh-question keeps its question word but uses statement word order; do is removed and the tense usually backshifts.", 240+i));

    bank.push(makeQuestion(
      `Choose the correct reported request: The supervisor said to ${n}, “Please ${b} ${c}.”`,
      `The supervisor asked ${n} to ${b} ${c}.`,
      [`The supervisor told ${n} to ${b} ${c}.`, `The supervisor advised ${n} to ${b} ${c}.`, `The supervisor reminded ${n} to ${b} ${c}.`],
      "A polite request is commonly reported with asked + object + to-infinitive.", 270+i));
  });
  return bank;
}

export const DIRECT_INDIRECT_QUESTION_BANK = buildBank();
if (DIRECT_INDIRECT_QUESTION_BANK.length !== 300) throw new Error("Direct and Indirect Speech bank must contain exactly 300 questions.");
if (DIRECT_INDIRECT_QUESTION_BANK.some(item => item.o.length !== 4 || new Set(item.o).size !== 4 || item.a < 0 || item.a > 3)) {
  throw new Error("Direct and Indirect Speech bank contains an invalid question or answer set.");
}
