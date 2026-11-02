export type WordQuizQuestion = {
  id: string;
  question: string;
  answer: string;
  options: [string, string, string, string];
  explanation: string;
  clue: string;
  topic: string;
};

type Entry = { word: string; meaning: string; synonym: string; antonym: string; topic: string };

// Original Word Quiz vocabulary. This bank is self-contained and does not
// import questions or distractors from the site's general-knowledge bank.
const entries: Entry[] = [
["abundant","existing in large quantities","plentiful","scarce","Everyday vocabulary"],
["accurate","correct in every detail","precise","incorrect","Everyday vocabulary"],
["adapt","change to suit new conditions","adjust","resist","Everyday vocabulary"],
["admire","regard with respect or approval","respect","despise","Everyday vocabulary"],
["ancient","belonging to the distant past","old","modern","Time and history"],
["anxious","feeling worried or uneasy","uneasy","calm","Feelings and character"],
["artificial","made by people rather than occurring naturally","synthetic","natural","Science and ideas"],
["astonish","surprise greatly","amaze","bore","Feelings and character"],
["brief","lasting for a short time","short","lengthy","Everyday vocabulary"],
["cautious","careful to avoid danger or mistakes","careful","reckless","Feelings and character"],
["cease","bring or come to an end","stop","begin","Actions and movement"],
["cheerful","noticeably happy and optimistic","joyful","gloomy","Feelings and character"],
["combine","join two or more things together","unite","separate","Actions and movement"],
["compassion","sympathy for another's suffering","kindness","cruelty","Feelings and character"],
["conceal","keep something out of sight","hide","reveal","Actions and movement"],
["confident","feeling sure about one's abilities","assured","doubtful","Feelings and character"],
["consequence","a result of an action or event","outcome","cause","Reasoning and ideas"],
["constant","continuing without interruption","continuous","occasional","Time and history"],
["courage","ability to face danger without giving in to fear","bravery","cowardice","Feelings and character"],
["courteous","polite and respectful","civil","rude","Feelings and character"],
["create","bring something into existence","produce","destroy","Actions and movement"],
["curious","eager to know or learn something","inquisitive","uninterested","Feelings and character"],
["decline","become smaller, weaker, or fewer","decrease","increase","Change and quantity"],
["delicate","easily damaged or requiring careful handling","fragile","sturdy","Description"],
["diligent","showing steady and careful effort","hardworking","lazy","Feelings and character"],
["diminish","make or become less","reduce","expand","Change and quantity"],
["eager","strongly wanting to do or have something","keen","reluctant","Feelings and character"],
["elaborate","containing many carefully arranged details","detailed","simple","Description"],
["elegant","graceful and attractive in appearance or manner","refined","awkward","Description"],
["enormous","very large in size or amount","huge","tiny","Change and quantity"],
["essential","absolutely necessary","vital","optional","Reasoning and ideas"],
["evident","easy to see or understand","obvious","unclear","Reasoning and ideas"],
["expand","become or make larger","enlarge","shrink","Change and quantity"],
["famous","known by many people","renowned","unknown","People and society"],
["flexible","able to bend or adapt easily","adaptable","rigid","Description"],
["fortunate","having good luck","lucky","unlucky","Feelings and character"],
["frequent","happening often","regular","rare","Time and history"],
["generous","willing to give or share","giving","selfish","People and society"],
["genuine","real and not false","authentic","fake","Reasoning and ideas"],
["gradual","happening slowly over time","steady","sudden","Time and history"],
["hostile","unfriendly or opposed","aggressive","friendly","People and society"],
["humble","not thinking oneself better than others","modest","arrogant","Feelings and character"],
["imitate","copy the actions or appearance of","mimic","originate","Actions and movement"],
["immense","extremely large or great","vast","minute","Change and quantity"],
["impartial","treating all sides fairly","neutral","biased","People and society"],
["improve","make or become better","enhance","worsen","Actions and movement"],
["include","make something part of a whole","contain","exclude","Actions and movement"],
["inevitable","certain to happen","unavoidable","preventable","Reasoning and ideas"],
["innocent","not guilty of a wrongdoing","blameless","guilty","People and society"],
["inspire","fill someone with the urge to do something","motivate","discourage","Actions and movement"],
["intelligent","able to learn and understand well","clever","foolish","People and society"],
["joyful","feeling great happiness","delighted","miserable","Feelings and character"],
["justify","show or prove to be reasonable","defend","condemn","Reasoning and ideas"],
["keen","having a strong interest or enthusiasm","eager","indifferent","Feelings and character"],
["liberty","freedom from control or restriction","freedom","captivity","People and society"],
["loyal","remaining faithful to a person or cause","faithful","disloyal","People and society"],
["major","greater in size, importance, or degree","significant","minor","Change and quantity"],
["mandatory","required by a rule or law","compulsory","optional","Reasoning and ideas"],
["mature","fully developed in body or mind","grown","immature","Time and history"],
["modest","not boastful about one's abilities","humble","vain","Feelings and character"],
["mysterious","difficult to explain or understand","enigmatic","obvious","Reasoning and ideas"],
["neat","tidy and arranged carefully","orderly","messy","Description"],
["numerous","existing in large numbers","many","few","Change and quantity"],
["obstacle","something that blocks progress","barrier","aid","Reasoning and ideas"],
["optimistic","expecting good things to happen","hopeful","pessimistic","Feelings and character"],
["ordinary","usual and not special","common","exceptional","Description"],
["patient","able to wait without becoming annoyed","tolerant","impatient","Feelings and character"],
["permanent","lasting or intended to last","lasting","temporary","Time and history"],
["persuade","cause someone to agree or do something","convince","dissuade","Actions and movement"],
["plausible","seeming reasonable or likely to be true","credible","implausible","Reasoning and ideas"],
["precious","very valuable or greatly loved","treasured","worthless","Description"],
["predict","say what is likely to happen","forecast","recount","Reasoning and ideas"],
["preserve","keep something safe or in good condition","protect","damage","Actions and movement"],
["rapid","happening very quickly","swift","slow","Time and history"],
["rare","not found or happening often","uncommon","common","Change and quantity"],
["reluctant","unwilling or hesitant","hesitant","willing","Feelings and character"],
["reliable","able to be trusted or depended on","dependable","unreliable","People and society"],
["resist","try to prevent or oppose something","oppose","accept","Actions and movement"],
["restore","bring something back to its former condition","repair","ruin","Actions and movement"],
["rigid","stiff and not easily bent or changed","inflexible","flexible","Description"],
["scarce","available only in small quantities","limited","abundant","Change and quantity"],
["sincere","honest and genuine in feeling","earnest","insincere","People and society"],
["splendid","very impressive or excellent","magnificent","awful","Description"],
["stable","firm and unlikely to change or fall","steady","unstable","Description"],
["subtle","not obvious and therefore difficult to notice","delicate","obvious","Description"],
["temporary","lasting for only a limited time","brief","permanent","Time and history"],
["tranquil","quiet and peaceful","calm","disturbed","Description"],
["transparent","allowing light to pass through clearly","clear","opaque","Description"],
["unique","being the only one of its kind","one-of-a-kind","ordinary","Description"],
["vacant","empty or not occupied","unoccupied","occupied","Description"],
["vanish","disappear suddenly or completely","fade","appear","Actions and movement"],
["verify","check that something is true or accurate","confirm","disprove","Reasoning and ideas"],
["vivid","producing strong, clear images in the mind","bright","dull","Description"],
["weary","very tired, especially after effort","exhausted","refreshed","Feelings and character"],
["widespread","found or happening over a large area","common","limited","Change and quantity"],
["withhold","refuse to give or grant something","retain","provide","Actions and movement"],
["yield","give way or surrender","submit","resist","Actions and movement"],
["zeal","great energy or enthusiasm","passion","apathy","Feelings and character"],
["vulnerable","open to being harmed or easily affected","exposed","protected","Description"],
["abrupt","sudden and unexpected","sudden","gradual","Time and history"]
].map(([word,meaning,synonym,antonym,topic]) => ({word,meaning,synonym,antonym,topic}));

function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return h >>> 0;
}
function shuffled<T>(items: T[], seed: number): T[] {
  const out = [...items];
  let state = seed || 1;
  for (let i = out.length - 1; i > 0; i--) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const j = state % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
function choices(answer: string, pool: string[], seed: number): [string,string,string,string] {
  const distractors = shuffled([...new Set(pool.filter(x => x !== answer))], seed).slice(0, 3);
  const result = shuffled([answer, ...distractors], seed + 7919);
  return result as [string,string,string,string];
}
const bank: WordQuizQuestion[] = [];
for (const [index, entry] of entries.entries()) {
  const sameTopic = entries.filter(x => x.topic === entry.topic);
  const wordPool = sameTopic.map(x => x.word);
  const meaningPool = sameTopic.map(x => x.meaning);
  const synonymPool = sameTopic.map(x => x.synonym);
  const antonymPool = sameTopic.map(x => x.antonym);
  const base = index * 3 + 1;
  const meaningOptions = choices(entry.word, wordPool, hash(entry.word + ":meaning"));
  bank.push({
    id: "wordquiz-" + String(base).padStart(3, "0"),
    question: "Which word means: “" + entry.meaning + "”?",
    answer: entry.word,
    options: meaningOptions,
    explanation: entry.word + " means " + entry.meaning + ".",
    clue: "Choose the word that best matches the definition.",
    topic: entry.topic
  });
  const synonymOptions = choices(entry.synonym, synonymPool, hash(entry.word + ":synonym"));
  bank.push({
    id: "wordquiz-" + String(base + 1).padStart(3, "0"),
    question: "Which word is closest in meaning to “" + entry.word + "”?",
    answer: entry.synonym,
    options: synonymOptions,
    explanation: "A close synonym of " + entry.word + " is " + entry.synonym + ".",
    clue: "Look for a word with nearly the same meaning.",
    topic: entry.topic
  });
  const antonymOptions = choices(entry.antonym, antonymPool, hash(entry.word + ":antonym"));
  bank.push({
    id: "wordquiz-" + String(base + 2).padStart(3, "0"),
    question: "Which word is the opposite of “" + entry.word + "”?",
    answer: entry.antonym,
    options: antonymOptions,
    explanation: "The opposite of " + entry.word + " is " + entry.antonym + ".",
    clue: "Choose the antonym.",
    topic: entry.topic
  });
}
export const WORD_QUIZ_BANK: WordQuizQuestion[] = bank;
