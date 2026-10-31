export type WordQuizQuestion={id:string;question:string;answer:string;options:[string,string,string,string];explanation:string;clue:string;topic:string};

// 300 curated vocabulary MCQs: synonym, antonym, definition and contextual usage.
const questions:WordQuizQuestion[] = [
  {
    "id": "wordquiz-001",
    "question": "Which word is closest in meaning to \"abundant\"?",
    "answer": "plentiful",
    "options": [
      "plentiful",
      "hardworking",
      "thrifty",
      "strict"
    ],
    "explanation": "\"abundant\" means plentiful.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-002",
    "question": "Which word is opposite in meaning to \"abundant\"?",
    "answer": "scarce",
    "options": [
      "inarticulate",
      "protected",
      "fake",
      "scarce"
    ],
    "explanation": "\"scarce\" is the opposite of \"abundant\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-003",
    "question": "What does \"abundant\" mean?",
    "answer": "available in large quantities",
    "options": [
      "available in large quantities",
      "accurate and exact in every detail",
      "expecting good things to happen",
      "correct and free from errors"
    ],
    "explanation": "\"abundant\" means available in large quantities.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-004",
    "question": "Choose the sentence that uses \"abundant\" correctly.",
    "answer": "The region has abundant rainfall throughout the year.",
    "options": [
      "Residents remained wary of the unfamiliar offer.",
      "We need a pragmatic solution to the transport problem.",
      "The region has abundant rainfall throughout the year.",
      "Young plants are vulnerable to frost."
    ],
    "explanation": "The sentence uses \"abundant\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-005",
    "question": "Which word is closest in meaning to \"accurate\"?",
    "answer": "precise",
    "options": [
      "unfriendly",
      "shrewd",
      "authentic",
      "precise"
    ],
    "explanation": "\"accurate\" means precise.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-006",
    "question": "Which word is opposite in meaning to \"accurate\"?",
    "answer": "inaccurate",
    "options": [
      "hostile",
      "impractical",
      "inaccurate",
      "fragile"
    ],
    "explanation": "\"inaccurate\" is the opposite of \"accurate\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-007",
    "question": "What does \"accurate\" mean?",
    "answer": "correct and free from errors",
    "options": [
      "clear, consistent and easy to understand",
      "correct and free from errors",
      "well-meaning and charitable",
      "easily broken or damaged"
    ],
    "explanation": "\"accurate\" means correct and free from errors.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-008",
    "question": "Choose the sentence that uses \"accurate\" correctly.",
    "answer": "The report gives an accurate account of the incident.",
    "options": [
      "Some delays are inevitable during road repairs.",
      "She gave an articulate explanation of the proposal.",
      "The report gives an accurate account of the incident.",
      "An adaptable employee can handle changing priorities."
    ],
    "explanation": "The sentence uses \"accurate\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-009",
    "question": "Which word is closest in meaning to \"adaptable\"?",
    "answer": "flexible",
    "options": [
      "flexible",
      "unwilling",
      "flawless",
      "plentiful"
    ],
    "explanation": "\"adaptable\" means flexible.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-010",
    "question": "Which word is opposite in meaning to \"adaptable\"?",
    "answer": "rigid",
    "options": [
      "deliberate",
      "fragile",
      "rigid",
      "fake"
    ],
    "explanation": "\"rigid\" is the opposite of \"adaptable\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-011",
    "question": "What does \"adaptable\" mean?",
    "answer": "able to adjust to new conditions",
    "options": [
      "able to adjust to new conditions",
      "giving information clearly in few words",
      "clear, consistent and easy to understand",
      "pleasant and friendly in manner"
    ],
    "explanation": "\"adaptable\" means able to adjust to new conditions.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-012",
    "question": "Choose the sentence that uses \"adaptable\" correctly.",
    "answer": "An adaptable employee can handle changing priorities.",
    "options": [
      "Residents remained wary of the unfamiliar offer.",
      "They chose a conventional design for the office.",
      "Their spontaneous visit delighted the family.",
      "An adaptable employee can handle changing priorities."
    ],
    "explanation": "The sentence uses \"adaptable\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-013",
    "question": "Which word is closest in meaning to \"adverse\"?",
    "answer": "unfavourable",
    "options": [
      "original",
      "unfavourable",
      "friendly",
      "unnecessary"
    ],
    "explanation": "\"adverse\" means unfavourable.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-014",
    "question": "Which word is opposite in meaning to \"adverse\"?",
    "answer": "favourable",
    "options": [
      "wasteful",
      "negligent",
      "favourable",
      "reckless"
    ],
    "explanation": "\"favourable\" is the opposite of \"adverse\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-015",
    "question": "What does \"adverse\" mean?",
    "answer": "preventing success or causing difficulty",
    "options": [
      "requiring great effort or endurance",
      "easy to see or attract attention",
      "certain to happen and impossible to avoid",
      "preventing success or causing difficulty"
    ],
    "explanation": "\"adverse\" means preventing success or causing difficulty.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-016",
    "question": "Choose the sentence that uses \"adverse\" correctly.",
    "answer": "The match was cancelled because of adverse weather.",
    "options": [
      "The match was cancelled because of adverse weather.",
      "The witness provided a credible explanation.",
      "The region has abundant rainfall throughout the year.",
      "The workers stood on a precarious platform."
    ],
    "explanation": "The sentence uses \"adverse\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-017",
    "question": "Which word is closest in meaning to \"amiable\"?",
    "answer": "friendly",
    "options": [
      "friendly",
      "crucial",
      "genuine",
      "unclear"
    ],
    "explanation": "\"amiable\" means friendly.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-018",
    "question": "Which word is opposite in meaning to \"amiable\"?",
    "answer": "hostile",
    "options": [
      "scarce",
      "definite",
      "wordy",
      "hostile"
    ],
    "explanation": "\"hostile\" is the opposite of \"amiable\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-019",
    "question": "What does \"amiable\" mean?",
    "answer": "pleasant and friendly in manner",
    "options": [
      "pleasant and friendly in manner",
      "no longer needed or useful",
      "easy to understand or open and honest",
      "showing careful judgement and good sense"
    ],
    "explanation": "\"amiable\" means pleasant and friendly in manner.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-020",
    "question": "Choose the sentence that uses \"amiable\" correctly.",
    "answer": "Our amiable neighbour greets everyone warmly.",
    "options": [
      "A judge must remain impartial during a trial.",
      "Our amiable neighbour greets everyone warmly.",
      "The climbers faced an arduous journey.",
      "The ambiguous instruction confused the new staff."
    ],
    "explanation": "The sentence uses \"amiable\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-021",
    "question": "Which word is closest in meaning to \"ambiguous\"?",
    "answer": "unclear",
    "options": [
      "demanding",
      "thrifty",
      "outdated",
      "unclear"
    ],
    "explanation": "\"ambiguous\" means unclear.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-022",
    "question": "Which word is opposite in meaning to \"ambiguous\"?",
    "answer": "definite",
    "options": [
      "implausible",
      "reckless",
      "definite",
      "robust"
    ],
    "explanation": "\"definite\" is the opposite of \"ambiguous\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-023",
    "question": "What does \"ambiguous\" mean?",
    "answer": "having more than one possible meaning",
    "options": [
      "extremely careful about small details",
      "having more than one possible meaning",
      "correct and free from errors",
      "easy to see or attract attention"
    ],
    "explanation": "\"ambiguous\" means having more than one possible meaning.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-024",
    "question": "Choose the sentence that uses \"ambiguous\" correctly.",
    "answer": "The ambiguous instruction confused the new staff.",
    "options": [
      "The ambiguous instruction confused the new staff.",
      "His eloquent speech moved the audience.",
      "The match was cancelled because of adverse weather.",
      "The editor made a meticulous check of every page."
    ],
    "explanation": "The sentence uses \"ambiguous\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-025",
    "question": "Which word is closest in meaning to \"arduous\"?",
    "answer": "demanding",
    "options": [
      "demanding",
      "unwilling",
      "plentiful",
      "crucial"
    ],
    "explanation": "\"arduous\" means demanding.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-026",
    "question": "Which word is opposite in meaning to \"arduous\"?",
    "answer": "effortless",
    "options": [
      "scarce",
      "effortless",
      "hostile",
      "rigid"
    ],
    "explanation": "\"effortless\" is the opposite of \"arduous\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-027",
    "question": "What does \"arduous\" mean?",
    "answer": "requiring great effort or endurance",
    "options": [
      "requiring great effort or endurance",
      "expecting good things to happen",
      "clear, consistent and easy to understand",
      "truly what it claims to be"
    ],
    "explanation": "\"arduous\" means requiring great effort or endurance.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-028",
    "question": "Choose the sentence that uses \"arduous\" correctly.",
    "answer": "The climbers faced an arduous journey.",
    "options": [
      "They chose a conventional design for the office.",
      "We need a pragmatic solution to the transport problem.",
      "She gave an articulate explanation of the proposal.",
      "The climbers faced an arduous journey."
    ],
    "explanation": "The sentence uses \"arduous\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-029",
    "question": "Which word is closest in meaning to \"articulate\"?",
    "answer": "eloquent",
    "options": [
      "thrifty",
      "eloquent",
      "precise",
      "detailed"
    ],
    "explanation": "\"articulate\" means eloquent.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-030",
    "question": "Which word is opposite in meaning to \"articulate\"?",
    "answer": "inarticulate",
    "options": [
      "inarticulate",
      "approximate",
      "fake",
      "inaccurate"
    ],
    "explanation": "\"inarticulate\" is the opposite of \"articulate\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-031",
    "question": "What does \"articulate\" mean?",
    "answer": "able to express ideas clearly",
    "options": [
      "happening naturally without prior planning",
      "skilled at dealing with people without causing offence",
      "having more than one possible meaning",
      "able to express ideas clearly"
    ],
    "explanation": "\"articulate\" means able to express ideas clearly.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-032",
    "question": "Choose the sentence that uses \"articulate\" correctly.",
    "answer": "She gave an articulate explanation of the proposal.",
    "options": [
      "She gave an articulate explanation of the proposal.",
      "Her argument was coherent from beginning to end.",
      "Handle the fragile glass with care.",
      "A cautious driver slows down near a school."
    ],
    "explanation": "The sentence uses \"articulate\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-033",
    "question": "Which word is closest in meaning to \"astute\"?",
    "answer": "shrewd",
    "options": [
      "shrewd",
      "provisional",
      "plentiful",
      "sturdy"
    ],
    "explanation": "\"astute\" means shrewd.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-034",
    "question": "Which word is opposite in meaning to \"astute\"?",
    "answer": "naive",
    "options": [
      "scarce",
      "deliberate",
      "eager",
      "naive"
    ],
    "explanation": "\"naive\" is the opposite of \"astute\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-035",
    "question": "What does \"astute\" mean?",
    "answer": "quick to understand situations and make sound judgements",
    "options": [
      "concerned only with the surface or appearance",
      "available in large quantities",
      "quick to understand situations and make sound judgements",
      "able to adjust to new conditions"
    ],
    "explanation": "\"astute\" means quick to understand situations and make sound judgements.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-036",
    "question": "Choose the sentence that uses \"astute\" correctly.",
    "answer": "An astute investor studies risks before buying.",
    "options": [
      "The museum displayed an authentic historical document.",
      "An astute investor studies risks before buying.",
      "The region has abundant rainfall throughout the year.",
      "It is prudent to keep an emergency fund."
    ],
    "explanation": "The sentence uses \"astute\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-037",
    "question": "Which word is closest in meaning to \"authentic\"?",
    "answer": "genuine",
    "options": [
      "noticeable",
      "precise",
      "eloquent",
      "genuine"
    ],
    "explanation": "\"authentic\" means genuine.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-038",
    "question": "Which word is opposite in meaning to \"authentic\"?",
    "answer": "fake",
    "options": [
      "fake",
      "insensitive",
      "eager",
      "inaccurate"
    ],
    "explanation": "\"fake\" is the opposite of \"authentic\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-039",
    "question": "What does \"authentic\" mean?",
    "answer": "real and not copied or false",
    "options": [
      "not boastful or excessively proud",
      "able to perform many different functions",
      "real and not copied or false",
      "truthful and direct"
    ],
    "explanation": "\"authentic\" means real and not copied or false.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-040",
    "question": "Choose the sentence that uses \"authentic\" correctly.",
    "answer": "The museum displayed an authentic historical document.",
    "options": [
      "The museum displayed an authentic historical document.",
      "A diligent student reviews lessons regularly.",
      "Investors remained optimistic about the recovery.",
      "The factory replaced its obsolete machinery."
    ],
    "explanation": "The sentence uses \"authentic\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-041",
    "question": "Which word is closest in meaning to \"benevolent\"?",
    "answer": "kind",
    "options": [
      "frank",
      "provisional",
      "kind",
      "shrewd"
    ],
    "explanation": "\"benevolent\" means kind.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-042",
    "question": "Which word is opposite in meaning to \"benevolent\"?",
    "answer": "cruel",
    "options": [
      "naive",
      "cruel",
      "rigid",
      "wordy"
    ],
    "explanation": "\"cruel\" is the opposite of \"benevolent\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-043",
    "question": "What does \"benevolent\" mean?",
    "answer": "well-meaning and charitable",
    "options": [
      "greater than what is reasonable or necessary",
      "requiring great effort or endurance",
      "well-meaning and charitable",
      "pleasant and friendly in manner"
    ],
    "explanation": "\"benevolent\" means well-meaning and charitable.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-044",
    "question": "Choose the sentence that uses \"benevolent\" correctly.",
    "answer": "A benevolent donor funded the village library.",
    "options": [
      "A cautious driver slows down near a school.",
      "The region has abundant rainfall throughout the year.",
      "Please provide the precise measurement.",
      "A benevolent donor funded the village library."
    ],
    "explanation": "The sentence uses \"benevolent\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-045",
    "question": "Which word is closest in meaning to \"candid\"?",
    "answer": "frank",
    "options": [
      "unfavourable",
      "unfriendly",
      "frank",
      "shrewd"
    ],
    "explanation": "\"candid\" means frank.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-046",
    "question": "Which word is opposite in meaning to \"candid\"?",
    "answer": "evasive",
    "options": [
      "evasive",
      "favourable",
      "inarticulate",
      "unknown"
    ],
    "explanation": "\"evasive\" is the opposite of \"candid\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-047",
    "question": "What does \"candid\" mean?",
    "answer": "truthful and direct",
    "options": [
      "complete and careful",
      "not obvious and therefore difficult to notice",
      "available in large quantities",
      "truthful and direct"
    ],
    "explanation": "\"candid\" means truthful and direct.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-048",
    "question": "Choose the sentence that uses \"candid\" correctly.",
    "answer": "He offered a candid assessment of the plan.",
    "options": [
      "He offered a candid assessment of the plan.",
      "The tenacious reporter continued investigating.",
      "The ambiguous instruction confused the new staff.",
      "The report gives an accurate account of the incident."
    ],
    "explanation": "The sentence uses \"candid\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-049",
    "question": "Which word is closest in meaning to \"cautious\"?",
    "answer": "careful",
    "options": [
      "complex",
      "hardworking",
      "careful",
      "traditional"
    ],
    "explanation": "\"cautious\" means careful.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-050",
    "question": "Which word is opposite in meaning to \"cautious\"?",
    "answer": "reckless",
    "options": [
      "effortless",
      "thorough",
      "approximate",
      "reckless"
    ],
    "explanation": "\"reckless\" is the opposite of \"cautious\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-051",
    "question": "What does \"cautious\" mean?",
    "answer": "taking care to avoid danger or mistakes",
    "options": [
      "taking care to avoid danger or mistakes",
      "containing many carefully arranged details",
      "happening naturally without prior planning",
      "showing careful judgement and good sense"
    ],
    "explanation": "\"cautious\" means taking care to avoid danger or mistakes.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-052",
    "question": "Choose the sentence that uses \"cautious\" correctly.",
    "answer": "A cautious driver slows down near a school.",
    "options": [
      "The region has abundant rainfall throughout the year.",
      "A cautious driver slows down near a school.",
      "An adaptable employee can handle changing priorities.",
      "An astute investor studies risks before buying."
    ],
    "explanation": "The sentence uses \"cautious\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-053",
    "question": "Which word is closest in meaning to \"coherent\"?",
    "answer": "logical",
    "options": [
      "expressive",
      "unfavourable",
      "lawful",
      "logical"
    ],
    "explanation": "\"coherent\" means logical.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-054",
    "question": "Which word is opposite in meaning to \"coherent\"?",
    "answer": "confused",
    "options": [
      "confused",
      "favourable",
      "biased",
      "fake"
    ],
    "explanation": "\"confused\" is the opposite of \"coherent\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-055",
    "question": "What does \"coherent\" mean?",
    "answer": "clear, consistent and easy to understand",
    "options": [
      "accurate and exact in every detail",
      "clear, consistent and easy to understand",
      "extremely thorough, careful or strict",
      "allowed by law or reasonable and genuine"
    ],
    "explanation": "\"coherent\" means clear, consistent and easy to understand.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-056",
    "question": "Choose the sentence that uses \"coherent\" correctly.",
    "answer": "Her argument was coherent from beginning to end.",
    "options": [
      "The customer raised a legitimate concern.",
      "The report gives an accurate account of the incident.",
      "Her argument was coherent from beginning to end.",
      "The match was cancelled because of adverse weather."
    ],
    "explanation": "The sentence uses \"coherent\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-057",
    "question": "Which word is closest in meaning to \"compassionate\"?",
    "answer": "sympathetic",
    "options": [
      "demanding",
      "shrewd",
      "sympathetic",
      "wise"
    ],
    "explanation": "\"compassionate\" means sympathetic.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-058",
    "question": "Which word is opposite in meaning to \"compassionate\"?",
    "answer": "uncaring",
    "options": [
      "inarticulate",
      "uncaring",
      "idealistic",
      "cruel"
    ],
    "explanation": "\"uncaring\" is the opposite of \"compassionate\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-059",
    "question": "What does \"compassionate\" mean?",
    "answer": "showing concern for another person's suffering",
    "options": [
      "showing concern for another person's suffering",
      "well-meaning and charitable",
      "requiring great effort or endurance",
      "not easily convinced and inclined to question claims"
    ],
    "explanation": "\"compassionate\" means showing concern for another person's suffering.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-060",
    "question": "Choose the sentence that uses \"compassionate\" correctly.",
    "answer": "The compassionate nurse stayed with the frightened child.",
    "options": [
      "The region has abundant rainfall throughout the year.",
      "The teacher was lenient about the late submission.",
      "The editor made a meticulous check of every page.",
      "The compassionate nurse stayed with the frightened child."
    ],
    "explanation": "The sentence uses \"compassionate\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-061",
    "question": "Which word is closest in meaning to \"concise\"?",
    "answer": "brief",
    "options": [
      "precise",
      "unplanned",
      "brief",
      "tactful"
    ],
    "explanation": "\"concise\" means brief.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-062",
    "question": "Which word is opposite in meaning to \"concise\"?",
    "answer": "wordy",
    "options": [
      "wordy",
      "definite",
      "inaccurate",
      "trusting"
    ],
    "explanation": "\"wordy\" is the opposite of \"concise\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-063",
    "question": "What does \"concise\" mean?",
    "answer": "giving information clearly in few words",
    "options": [
      "having many connected and complicated details",
      "very great or showing deep understanding",
      "respected and famous in a particular field",
      "giving information clearly in few words"
    ],
    "explanation": "\"concise\" means giving information clearly in few words.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-064",
    "question": "Choose the sentence that uses \"concise\" correctly.",
    "answer": "Please write a concise summary of the meeting.",
    "options": [
      "The chef maintained impeccable hygiene.",
      "The discovery had a profound effect on medicine.",
      "Please write a concise summary of the meeting.",
      "A cautious driver slows down near a school."
    ],
    "explanation": "The sentence uses \"concise\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-065",
    "question": "Which word is closest in meaning to \"conspicuous\"?",
    "answer": "noticeable",
    "options": [
      "noticeable",
      "sympathetic",
      "sturdy",
      "friendly"
    ],
    "explanation": "\"conspicuous\" means noticeable.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-066",
    "question": "Which word is opposite in meaning to \"conspicuous\"?",
    "answer": "inconspicuous",
    "options": [
      "effortless",
      "definite",
      "inarticulate",
      "inconspicuous"
    ],
    "explanation": "\"inconspicuous\" is the opposite of \"conspicuous\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-067",
    "question": "What does \"conspicuous\" mean?",
    "answer": "easy to see or attract attention",
    "options": [
      "easy to see or attract attention",
      "following accepted customs or usual methods",
      "treating all sides fairly",
      "showing concern for another person's suffering"
    ],
    "explanation": "\"conspicuous\" means easy to see or attract attention.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-068",
    "question": "Choose the sentence that uses \"conspicuous\" correctly.",
    "answer": "The bright sign was conspicuous from the road.",
    "options": [
      "The region has abundant rainfall throughout the year.",
      "The report gives an accurate account of the incident.",
      "The bright sign was conspicuous from the road.",
      "An astute investor studies risks before buying."
    ],
    "explanation": "The sentence uses \"conspicuous\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-069",
    "question": "Which word is closest in meaning to \"conventional\"?",
    "answer": "traditional",
    "options": [
      "extreme",
      "unfavourable",
      "thrifty",
      "traditional"
    ],
    "explanation": "\"conventional\" means traditional.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-070",
    "question": "Which word is opposite in meaning to \"conventional\"?",
    "answer": "unorthodox",
    "options": [
      "far-fetched",
      "definite",
      "unorthodox",
      "basic"
    ],
    "explanation": "\"unorthodox\" is the opposite of \"conventional\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-071",
    "question": "What does \"conventional\" mean?",
    "answer": "following accepted customs or usual methods",
    "options": [
      "concerned only with the surface or appearance",
      "following accepted customs or usual methods",
      "containing many carefully arranged details",
      "preventing success or causing difficulty"
    ],
    "explanation": "\"conventional\" means following accepted customs or usual methods.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-072",
    "question": "Choose the sentence that uses \"conventional\" correctly.",
    "answer": "They chose a conventional design for the office.",
    "options": [
      "The factory replaced its obsolete machinery.",
      "The bright sign was conspicuous from the road.",
      "They chose a conventional design for the office.",
      "There was an implicit agreement to share the costs."
    ],
    "explanation": "The sentence uses \"conventional\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-073",
    "question": "Which word is closest in meaning to \"credible\"?",
    "answer": "believable",
    "options": [
      "believable",
      "shrewd",
      "exposed",
      "expressive"
    ],
    "explanation": "\"credible\" means believable.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-074",
    "question": "Which word is opposite in meaning to \"credible\"?",
    "answer": "implausible",
    "options": [
      "scarce",
      "approximate",
      "implausible",
      "pessimistic"
    ],
    "explanation": "\"implausible\" is the opposite of \"credible\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-075",
    "question": "What does \"credible\" mean?",
    "answer": "able to be trusted or believed",
    "options": [
      "able to be trusted or believed",
      "not willing or eager to do something",
      "taking care to avoid danger or mistakes",
      "able to adjust to new conditions"
    ],
    "explanation": "\"credible\" means able to be trusted or believed.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-076",
    "question": "Choose the sentence that uses \"credible\" correctly.",
    "answer": "The witness provided a credible explanation.",
    "options": [
      "The region has abundant rainfall throughout the year.",
      "The teacher was lenient about the late submission.",
      "The scientist was skeptical of the unsupported claim.",
      "The witness provided a credible explanation."
    ],
    "explanation": "The sentence uses \"credible\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-077",
    "question": "Which word is closest in meaning to \"diligent\"?",
    "answer": "hardworking",
    "options": [
      "sturdy",
      "hardworking",
      "practical",
      "unfavourable"
    ],
    "explanation": "\"diligent\" means hardworking.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-078",
    "question": "Which word is opposite in meaning to \"diligent\"?",
    "answer": "negligent",
    "options": [
      "robust",
      "fake",
      "negligent",
      "reckless"
    ],
    "explanation": "\"negligent\" is the opposite of \"diligent\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-079",
    "question": "What does \"diligent\" mean?",
    "answer": "showing careful and persistent effort",
    "options": [
      "extremely important or necessary",
      "having more than one possible meaning",
      "correct and free from errors",
      "showing careful and persistent effort"
    ],
    "explanation": "\"diligent\" means showing careful and persistent effort.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-080",
    "question": "Choose the sentence that uses \"diligent\" correctly.",
    "answer": "A diligent student reviews lessons regularly.",
    "options": [
      "A diligent student reviews lessons regularly.",
      "An astute investor studies risks before buying.",
      "The company is known for its innovative products.",
      "The team developed a feasible plan within the budget."
    ],
    "explanation": "The sentence uses \"diligent\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-081",
    "question": "Which word is closest in meaning to \"diplomatic\"?",
    "answer": "tactful",
    "options": [
      "tactful",
      "unplanned",
      "shrewd",
      "sturdy"
    ],
    "explanation": "\"diplomatic\" means tactful.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-082",
    "question": "Which word is opposite in meaning to \"diplomatic\"?",
    "answer": "insensitive",
    "options": [
      "reckless",
      "uncaring",
      "favourable",
      "insensitive"
    ],
    "explanation": "\"insensitive\" is the opposite of \"diplomatic\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-083",
    "question": "What does \"diplomatic\" mean?",
    "answer": "skilled at dealing with people without causing offence",
    "options": [
      "skilled at dealing with people without causing offence",
      "careful because danger or problems are possible",
      "able to be trusted or believed",
      "available in large quantities"
    ],
    "explanation": "\"diplomatic\" means skilled at dealing with people without causing offence.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-084",
    "question": "Choose the sentence that uses \"diplomatic\" correctly.",
    "answer": "Her diplomatic reply prevented an argument.",
    "options": [
      "A cautious driver slows down near a school.",
      "Her diplomatic reply prevented an argument.",
      "The necklace has an intricate pattern.",
      "We need a pragmatic solution to the transport problem."
    ],
    "explanation": "The sentence uses \"diplomatic\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-085",
    "question": "Which word is closest in meaning to \"durable\"?",
    "answer": "sturdy",
    "options": [
      "thrifty",
      "frank",
      "believable",
      "sturdy"
    ],
    "explanation": "\"durable\" means sturdy.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-086",
    "question": "Which word is opposite in meaning to \"durable\"?",
    "answer": "fragile",
    "options": [
      "definite",
      "wordy",
      "fragile",
      "preventable"
    ],
    "explanation": "\"fragile\" is the opposite of \"durable\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-087",
    "question": "What does \"durable\" mean?",
    "answer": "able to last a long time without damage",
    "options": [
      "not obvious and therefore difficult to notice",
      "able to last a long time without damage",
      "quick to understand situations and make sound judgements",
      "complete and careful"
    ],
    "explanation": "\"durable\" means able to last a long time without damage.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-088",
    "question": "Choose the sentence that uses \"durable\" correctly.",
    "answer": "These durable shoes are suitable for hiking.",
    "options": [
      "These durable shoes are suitable for hiking.",
      "The report gives an accurate account of the incident.",
      "The device uses sophisticated technology.",
      "The customer raised a legitimate concern."
    ],
    "explanation": "The sentence uses \"durable\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-089",
    "question": "Which word is closest in meaning to \"elaborate\"?",
    "answer": "detailed",
    "options": [
      "detailed",
      "friendly",
      "sympathetic",
      "plentiful"
    ],
    "explanation": "\"elaborate\" means detailed.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-090",
    "question": "Which word is opposite in meaning to \"elaborate\"?",
    "answer": "simple",
    "options": [
      "reckless",
      "simple",
      "opaque",
      "essential"
    ],
    "explanation": "\"simple\" is the opposite of \"elaborate\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-091",
    "question": "What does \"elaborate\" mean?",
    "answer": "containing many carefully arranged details",
    "options": [
      "containing many carefully arranged details",
      "giving information clearly in few words",
      "fluent and persuasive in speaking or writing",
      "available in large quantities"
    ],
    "explanation": "\"elaborate\" means containing many carefully arranged details.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-092",
    "question": "Choose the sentence that uses \"elaborate\" correctly.",
    "answer": "The architect presented an elaborate design.",
    "options": [
      "Her diplomatic reply prevented an argument.",
      "The teacher was lenient about the late submission.",
      "The match was cancelled because of adverse weather.",
      "The architect presented an elaborate design."
    ],
    "explanation": "The sentence uses \"elaborate\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-093",
    "question": "Which word is closest in meaning to \"eloquent\"?",
    "answer": "expressive",
    "options": [
      "wise",
      "expressive",
      "delicate",
      "traditional"
    ],
    "explanation": "\"eloquent\" means expressive.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-094",
    "question": "Which word is opposite in meaning to \"eloquent\"?",
    "answer": "inarticulate",
    "options": [
      "inarticulate",
      "inaccurate",
      "wordy",
      "careless"
    ],
    "explanation": "\"inarticulate\" is the opposite of \"eloquent\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-095",
    "question": "What does \"eloquent\" mean?",
    "answer": "fluent and persuasive in speaking or writing",
    "options": [
      "extremely thorough, careful or strict",
      "able to recover quickly after difficulty",
      "correct and free from errors",
      "fluent and persuasive in speaking or writing"
    ],
    "explanation": "\"eloquent\" means fluent and persuasive in speaking or writing.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-096",
    "question": "Choose the sentence that uses \"eloquent\" correctly.",
    "answer": "His eloquent speech moved the audience.",
    "options": [
      "His eloquent speech moved the audience.",
      "The inspection was superficial and missed major faults.",
      "They chose a conventional design for the office.",
      "The research followed a rigorous testing process."
    ],
    "explanation": "The sentence uses \"eloquent\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-097",
    "question": "Which word is closest in meaning to \"eminent\"?",
    "answer": "distinguished",
    "options": [
      "distinguished",
      "flexible",
      "plentiful",
      "friendly"
    ],
    "explanation": "\"eminent\" means distinguished.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-098",
    "question": "Which word is opposite in meaning to \"eminent\"?",
    "answer": "unknown",
    "options": [
      "reckless",
      "counterfeit",
      "pessimistic",
      "unknown"
    ],
    "explanation": "\"unknown\" is the opposite of \"eminent\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-099",
    "question": "What does \"eminent\" mean?",
    "answer": "respected and famous in a particular field",
    "options": [
      "easily harmed, attacked or affected",
      "focused on practical results rather than theory",
      "respected and famous in a particular field",
      "careful because danger or problems are possible"
    ],
    "explanation": "\"eminent\" means respected and famous in a particular field.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-100",
    "question": "Choose the sentence that uses \"eminent\" correctly.",
    "answer": "An eminent scientist delivered the lecture.",
    "options": [
      "The research followed a rigorous testing process.",
      "An eminent scientist delivered the lecture.",
      "The region has abundant rainfall throughout the year.",
      "The organisation promised a transparent selection process."
    ],
    "explanation": "The sentence uses \"eminent\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-101",
    "question": "Which word is closest in meaning to \"ephemeral\"?",
    "answer": "short-lived",
    "options": [
      "shrewd",
      "precise",
      "exact",
      "short-lived"
    ],
    "explanation": "\"ephemeral\" means short-lived.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-102",
    "question": "Which word is opposite in meaning to \"ephemeral\"?",
    "answer": "lasting",
    "options": [
      "lasting",
      "definite",
      "negligent",
      "deliberate"
    ],
    "explanation": "\"lasting\" is the opposite of \"ephemeral\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-103",
    "question": "What does \"ephemeral\" mean?",
    "answer": "lasting for only a brief time",
    "options": [
      "requiring great effort or endurance",
      "correct and free from errors",
      "lasting for only a brief time",
      "certain to happen and impossible to avoid"
    ],
    "explanation": "\"ephemeral\" means lasting for only a brief time.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-104",
    "question": "Choose the sentence that uses \"ephemeral\" correctly.",
    "answer": "The beauty of the evening flowers was ephemeral.",
    "options": [
      "The beauty of the evening flowers was ephemeral.",
      "The ambiguous instruction confused the new staff.",
      "He offered a candid assessment of the plan.",
      "The match was cancelled because of adverse weather."
    ],
    "explanation": "The sentence uses \"ephemeral\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-105",
    "question": "Which word is closest in meaning to \"essential\"?",
    "answer": "necessary",
    "options": [
      "necessary",
      "unwilling",
      "unplanned",
      "plentiful"
    ],
    "explanation": "\"essential\" means necessary.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-106",
    "question": "Which word is opposite in meaning to \"essential\"?",
    "answer": "optional",
    "options": [
      "rigid",
      "optional",
      "scarce",
      "thorough"
    ],
    "explanation": "\"optional\" is the opposite of \"essential\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-107",
    "question": "What does \"essential\" mean?",
    "answer": "absolutely needed or extremely important",
    "options": [
      "happening naturally without prior planning",
      "careful because danger or problems are possible",
      "absolutely needed or extremely important",
      "easy to see or attract attention"
    ],
    "explanation": "\"essential\" means absolutely needed or extremely important.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-108",
    "question": "Choose the sentence that uses \"essential\" correctly.",
    "answer": "Clean drinking water is essential for health.",
    "options": [
      "The witness provided a credible explanation.",
      "The region has abundant rainfall throughout the year.",
      "The compassionate nurse stayed with the frightened child.",
      "Clean drinking water is essential for health."
    ],
    "explanation": "The sentence uses \"essential\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-109",
    "question": "Which word is closest in meaning to \"excessive\"?",
    "answer": "exorbitant",
    "options": [
      "precise",
      "hardworking",
      "exorbitant",
      "unwilling"
    ],
    "explanation": "\"excessive\" means exorbitant.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-110",
    "question": "Which word is opposite in meaning to \"excessive\"?",
    "answer": "moderate",
    "options": [
      "moderate",
      "arrogant",
      "cruel",
      "limited"
    ],
    "explanation": "\"moderate\" is the opposite of \"excessive\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-111",
    "question": "What does \"excessive\" mean?",
    "answer": "greater than what is reasonable or necessary",
    "options": [
      "dangerously uncertain or likely to fail",
      "available in large quantities",
      "following accepted customs or usual methods",
      "greater than what is reasonable or necessary"
    ],
    "explanation": "\"excessive\" means greater than what is reasonable or necessary.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-112",
    "question": "Choose the sentence that uses \"excessive\" correctly.",
    "answer": "The hotel charged an excessive fee for parking.",
    "options": [
      "The hotel charged an excessive fee for parking.",
      "Despite winning the award, she remained modest.",
      "The museum displayed an authentic historical document.",
      "Handle the fragile glass with care."
    ],
    "explanation": "The sentence uses \"excessive\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-113",
    "question": "Which word is closest in meaning to \"feasible\"?",
    "answer": "practical",
    "options": [
      "sympathetic",
      "shrewd",
      "practical",
      "flexible"
    ],
    "explanation": "\"feasible\" means practical.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-114",
    "question": "Which word is opposite in meaning to \"feasible\"?",
    "answer": "impractical",
    "options": [
      "optional",
      "hostile",
      "effortless",
      "impractical"
    ],
    "explanation": "\"impractical\" is the opposite of \"feasible\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-115",
    "question": "What does \"feasible\" mean?",
    "answer": "possible and realistic to achieve",
    "options": [
      "pleasant and friendly in manner",
      "having more than one possible meaning",
      "possible and realistic to achieve",
      "treating all sides fairly"
    ],
    "explanation": "\"feasible\" means possible and realistic to achieve.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-116",
    "question": "Choose the sentence that uses \"feasible\" correctly.",
    "answer": "The team developed a feasible plan within the budget.",
    "options": [
      "An eminent scientist delivered the lecture.",
      "The team developed a feasible plan within the budget.",
      "The region has abundant rainfall throughout the year.",
      "The climbers faced an arduous journey."
    ],
    "explanation": "The sentence uses \"feasible\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-117",
    "question": "Which word is closest in meaning to \"fragile\"?",
    "answer": "delicate",
    "options": [
      "detailed",
      "unfavourable",
      "expressive",
      "delicate"
    ],
    "explanation": "\"fragile\" means delicate.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-118",
    "question": "Which word is opposite in meaning to \"fragile\"?",
    "answer": "robust",
    "options": [
      "robust",
      "obvious",
      "scarce",
      "superficial"
    ],
    "explanation": "\"robust\" is the opposite of \"fragile\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-119",
    "question": "What does \"fragile\" mean?",
    "answer": "easily broken or damaged",
    "options": [
      "containing many carefully arranged details",
      "easily broken or damaged",
      "extremely careful about small details",
      "preventing success or causing difficulty"
    ],
    "explanation": "\"fragile\" means easily broken or damaged.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-120",
    "question": "Choose the sentence that uses \"fragile\" correctly.",
    "answer": "Handle the fragile glass with care.",
    "options": [
      "Handle the fragile glass with care.",
      "The match was cancelled because of adverse weather.",
      "An adaptable employee can handle changing priorities.",
      "The climbers faced an arduous journey."
    ],
    "explanation": "The sentence uses \"fragile\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-121",
    "question": "Which word is closest in meaning to \"frugal\"?",
    "answer": "thrifty",
    "options": [
      "demanding",
      "shallow",
      "thrifty",
      "exact"
    ],
    "explanation": "\"frugal\" means thrifty.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-122",
    "question": "Which word is opposite in meaning to \"frugal\"?",
    "answer": "wasteful",
    "options": [
      "fragile",
      "wasteful",
      "reckless",
      "deliberate"
    ],
    "explanation": "\"wasteful\" is the opposite of \"frugal\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-123",
    "question": "What does \"frugal\" mean?",
    "answer": "careful about spending money or using resources",
    "options": [
      "careful about spending money or using resources",
      "easy to see or attract attention",
      "requiring great effort or endurance",
      "focused on practical results rather than theory"
    ],
    "explanation": "\"frugal\" means careful about spending money or using resources.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-124",
    "question": "Choose the sentence that uses \"frugal\" correctly.",
    "answer": "Their frugal habits helped them save for a house.",
    "options": [
      "The team developed a feasible plan within the budget.",
      "The organisation promised a transparent selection process.",
      "A cautious driver slows down near a school.",
      "Their frugal habits helped them save for a house."
    ],
    "explanation": "The sentence uses \"frugal\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-125",
    "question": "Which word is closest in meaning to \"genuine\"?",
    "answer": "authentic",
    "options": [
      "genuine",
      "neutral",
      "authentic",
      "unfavourable"
    ],
    "explanation": "\"genuine\" means authentic.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-126",
    "question": "Which word is opposite in meaning to \"genuine\"?",
    "answer": "counterfeit",
    "options": [
      "counterfeit",
      "illicit",
      "approximate",
      "lenient"
    ],
    "explanation": "\"counterfeit\" is the opposite of \"genuine\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-127",
    "question": "What does \"genuine\" mean?",
    "answer": "truly what it claims to be",
    "options": [
      "truthful and direct",
      "taking care to avoid danger or mistakes",
      "possible and realistic to achieve",
      "truly what it claims to be"
    ],
    "explanation": "\"genuine\" means truly what it claims to be.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-128",
    "question": "Choose the sentence that uses \"genuine\" correctly.",
    "answer": "The shop guarantees that every product is genuine.",
    "options": [
      "The teacher was lenient about the late submission.",
      "The report gives an accurate account of the incident.",
      "The shop guarantees that every product is genuine.",
      "Please write a concise summary of the meeting."
    ],
    "explanation": "The sentence uses \"genuine\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-129",
    "question": "Which word is closest in meaning to \"hostile\"?",
    "answer": "unfriendly",
    "options": [
      "unfriendly",
      "practical",
      "kind",
      "detailed"
    ],
    "explanation": "\"hostile\" means unfriendly.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-130",
    "question": "Which word is opposite in meaning to \"hostile\"?",
    "answer": "welcoming",
    "options": [
      "effortless",
      "convinced",
      "cruel",
      "welcoming"
    ],
    "explanation": "\"welcoming\" is the opposite of \"hostile\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-131",
    "question": "What does \"hostile\" mean?",
    "answer": "unfriendly or opposed",
    "options": [
      "unfriendly or opposed",
      "quick to understand situations and make sound judgements",
      "showing careful judgement and good sense",
      "available in large quantities"
    ],
    "explanation": "\"hostile\" means unfriendly or opposed.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-132",
    "question": "Choose the sentence that uses \"hostile\" correctly.",
    "answer": "The proposal received a hostile response.",
    "options": [
      "It is prudent to keep an emergency fund.",
      "An adaptable employee can handle changing priorities.",
      "The proposal received a hostile response.",
      "Her insightful comments improved the discussion."
    ],
    "explanation": "The sentence uses \"hostile\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-133",
    "question": "Which word is closest in meaning to \"impartial\"?",
    "answer": "neutral",
    "options": [
      "precise",
      "cautious",
      "unclear",
      "neutral"
    ],
    "explanation": "\"impartial\" means neutral.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-134",
    "question": "Which word is opposite in meaning to \"impartial\"?",
    "answer": "biased",
    "options": [
      "biased",
      "inarticulate",
      "superficial",
      "simple"
    ],
    "explanation": "\"biased\" is the opposite of \"impartial\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-135",
    "question": "What does \"impartial\" mean?",
    "answer": "treating all sides fairly",
    "options": [
      "expecting good things to happen",
      "treating all sides fairly",
      "no longer used because something newer exists",
      "able to be trusted or believed"
    ],
    "explanation": "\"impartial\" means treating all sides fairly.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-136",
    "question": "Choose the sentence that uses \"impartial\" correctly.",
    "answer": "A judge must remain impartial during a trial.",
    "options": [
      "These durable shoes are suitable for hiking.",
      "He offered a candid assessment of the plan.",
      "A judge must remain impartial during a trial.",
      "Accurate information is vital during an emergency."
    ],
    "explanation": "The sentence uses \"impartial\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-137",
    "question": "Which word is closest in meaning to \"impeccable\"?",
    "answer": "flawless",
    "options": [
      "flawless",
      "provisional",
      "demanding",
      "detailed"
    ],
    "explanation": "\"impeccable\" means flawless.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-138",
    "question": "Which word is opposite in meaning to \"impeccable\"?",
    "answer": "faulty",
    "options": [
      "uncaring",
      "inconspicuous",
      "faulty",
      "welcoming"
    ],
    "explanation": "\"faulty\" is the opposite of \"impeccable\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-139",
    "question": "What does \"impeccable\" mean?",
    "answer": "without mistakes or faults",
    "options": [
      "without mistakes or faults",
      "accurate and exact in every detail",
      "truthful and direct",
      "available in large quantities"
    ],
    "explanation": "\"impeccable\" means without mistakes or faults.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-140",
    "question": "Choose the sentence that uses \"impeccable\" correctly.",
    "answer": "The chef maintained impeccable hygiene.",
    "options": [
      "The witness provided a credible explanation.",
      "The committee made a tentative decision.",
      "An astute investor studies risks before buying.",
      "The chef maintained impeccable hygiene."
    ],
    "explanation": "The sentence uses \"impeccable\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-141",
    "question": "Which word is closest in meaning to \"implicit\"?",
    "answer": "unspoken",
    "options": [
      "refined",
      "unspoken",
      "provisional",
      "credible"
    ],
    "explanation": "\"implicit\" means unspoken.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-142",
    "question": "Which word is opposite in meaning to \"implicit\"?",
    "answer": "explicit",
    "options": [
      "favourable",
      "thorough",
      "explicit",
      "fragile"
    ],
    "explanation": "\"explicit\" is the opposite of \"implicit\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-143",
    "question": "What does \"implicit\" mean?",
    "answer": "suggested without being directly stated",
    "options": [
      "determined and unwilling to give up",
      "having more than one possible meaning",
      "correct and free from errors",
      "suggested without being directly stated"
    ],
    "explanation": "\"implicit\" means suggested without being directly stated.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-144",
    "question": "Choose the sentence that uses \"implicit\" correctly.",
    "answer": "There was an implicit agreement to share the costs.",
    "options": [
      "The inspection was superficial and missed major faults.",
      "The engineer devised an ingenious solution.",
      "There was an implicit agreement to share the costs.",
      "A diligent student reviews lessons regularly."
    ],
    "explanation": "The sentence uses \"implicit\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-145",
    "question": "Which word is closest in meaning to \"inevitable\"?",
    "answer": "unavoidable",
    "options": [
      "unavoidable",
      "plentiful",
      "hopeful",
      "exact"
    ],
    "explanation": "\"inevitable\" means unavoidable.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-146",
    "question": "Which word is opposite in meaning to \"inevitable\"?",
    "answer": "preventable",
    "options": [
      "reckless",
      "eager",
      "rigid",
      "preventable"
    ],
    "explanation": "\"preventable\" is the opposite of \"inevitable\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-147",
    "question": "What does \"inevitable\" mean?",
    "answer": "certain to happen and impossible to avoid",
    "options": [
      "certain to happen and impossible to avoid",
      "quick to understand situations and make sound judgements",
      "available in large quantities",
      "able to adjust to new conditions"
    ],
    "explanation": "\"inevitable\" means certain to happen and impossible to avoid.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-148",
    "question": "Choose the sentence that uses \"inevitable\" correctly.",
    "answer": "Some delays are inevitable during road repairs.",
    "options": [
      "An adaptable employee can handle changing priorities.",
      "Some delays are inevitable during road repairs.",
      "The region has abundant rainfall throughout the year.",
      "There was a subtle change in her tone."
    ],
    "explanation": "The sentence uses \"inevitable\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-149",
    "question": "Which word is closest in meaning to \"ingenious\"?",
    "answer": "inventive",
    "options": [
      "genuine",
      "careful",
      "practical",
      "inventive"
    ],
    "explanation": "\"ingenious\" means inventive.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-150",
    "question": "Which word is opposite in meaning to \"ingenious\"?",
    "answer": "unimaginative",
    "options": [
      "unimportant",
      "definite",
      "unimaginative",
      "inaccurate"
    ],
    "explanation": "\"unimaginative\" is the opposite of \"ingenious\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-151",
    "question": "What does \"ingenious\" mean?",
    "answer": "clever, original and inventive",
    "options": [
      "preventing success or causing difficulty",
      "clever, original and inventive",
      "correct and free from errors",
      "allowed by law or reasonable and genuine"
    ],
    "explanation": "\"ingenious\" means clever, original and inventive.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-152",
    "question": "Choose the sentence that uses \"ingenious\" correctly.",
    "answer": "The engineer devised an ingenious solution.",
    "options": [
      "The engineer devised an ingenious solution.",
      "The report gives an accurate account of the incident.",
      "The organisation promised a transparent selection process.",
      "These durable shoes are suitable for hiking."
    ],
    "explanation": "The sentence uses \"ingenious\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-153",
    "question": "Which word is closest in meaning to \"innovative\"?",
    "answer": "original",
    "options": [
      "original",
      "sympathetic",
      "unfavourable",
      "careful"
    ],
    "explanation": "\"innovative\" means original.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-154",
    "question": "Which word is opposite in meaning to \"innovative\"?",
    "answer": "conventional",
    "options": [
      "scarce",
      "implausible",
      "conventional",
      "trusting"
    ],
    "explanation": "\"conventional\" is the opposite of \"innovative\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-155",
    "question": "What does \"innovative\" mean?",
    "answer": "introducing new ideas or methods",
    "options": [
      "introducing new ideas or methods",
      "not as strict or severe as expected",
      "available in large quantities",
      "extremely careful about small details"
    ],
    "explanation": "\"innovative\" means introducing new ideas or methods.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-156",
    "question": "Choose the sentence that uses \"innovative\" correctly.",
    "answer": "The company is known for its innovative products.",
    "options": [
      "The architect presented an elaborate design.",
      "The region has abundant rainfall throughout the year.",
      "The beauty of the evening flowers was ephemeral.",
      "The company is known for its innovative products."
    ],
    "explanation": "The sentence uses \"innovative\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-157",
    "question": "Which word is closest in meaning to \"insightful\"?",
    "answer": "perceptive",
    "options": [
      "brief",
      "perceptive",
      "unspoken",
      "unclear"
    ],
    "explanation": "\"insightful\" means perceptive.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-158",
    "question": "Which word is opposite in meaning to \"insightful\"?",
    "answer": "shallow",
    "options": [
      "shallow",
      "naive",
      "superficial",
      "obvious"
    ],
    "explanation": "\"shallow\" is the opposite of \"insightful\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-159",
    "question": "What does \"insightful\" mean?",
    "answer": "showing a deep and accurate understanding",
    "options": [
      "treating all sides fairly",
      "very great or showing deep understanding",
      "taking care to avoid danger or mistakes",
      "showing a deep and accurate understanding"
    ],
    "explanation": "\"insightful\" means showing a deep and accurate understanding.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-160",
    "question": "Choose the sentence that uses \"insightful\" correctly.",
    "answer": "Her insightful comments improved the discussion.",
    "options": [
      "Her insightful comments improved the discussion.",
      "Her argument was coherent from beginning to end.",
      "She gave an articulate explanation of the proposal.",
      "The device uses sophisticated technology."
    ],
    "explanation": "The sentence uses \"insightful\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-161",
    "question": "Which word is closest in meaning to \"intense\"?",
    "answer": "extreme",
    "options": [
      "extreme",
      "unnecessary",
      "wise",
      "clear"
    ],
    "explanation": "\"intense\" means extreme.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-162",
    "question": "Which word is opposite in meaning to \"intense\"?",
    "answer": "mild",
    "options": [
      "simple",
      "scarce",
      "wordy",
      "mild"
    ],
    "explanation": "\"mild\" is the opposite of \"intense\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-163",
    "question": "What does \"intense\" mean?",
    "answer": "very strong or concentrated",
    "options": [
      "quick to understand situations and make sound judgements",
      "correct and free from errors",
      "very strong or concentrated",
      "available in large quantities"
    ],
    "explanation": "\"intense\" means very strong or concentrated.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-164",
    "question": "Choose the sentence that uses \"intense\" correctly.",
    "answer": "The region experienced intense heat in May.",
    "options": [
      "Clean drinking water is essential for health.",
      "The region experienced intense heat in May.",
      "The necklace has an intricate pattern.",
      "The committee made a tentative decision."
    ],
    "explanation": "The sentence uses \"intense\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-165",
    "question": "Which word is closest in meaning to \"intricate\"?",
    "answer": "complex",
    "options": [
      "brief",
      "thorough",
      "precise",
      "complex"
    ],
    "explanation": "\"intricate\" means complex.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-166",
    "question": "Which word is opposite in meaning to \"intricate\"?",
    "answer": "simple",
    "options": [
      "simple",
      "fragile",
      "lenient",
      "inaccurate"
    ],
    "explanation": "\"simple\" is the opposite of \"intricate\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-167",
    "question": "What does \"intricate\" mean?",
    "answer": "having many connected and complicated details",
    "options": [
      "easy to see or attract attention",
      "without mistakes or faults",
      "having many connected and complicated details",
      "no longer used because something newer exists"
    ],
    "explanation": "\"intricate\" means having many connected and complicated details.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-168",
    "question": "Choose the sentence that uses \"intricate\" correctly.",
    "answer": "The necklace has an intricate pattern.",
    "options": [
      "The necklace has an intricate pattern.",
      "The engineer devised an ingenious solution.",
      "Her diplomatic reply prevented an argument.",
      "They chose a conventional design for the office."
    ],
    "explanation": "The sentence uses \"intricate\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-169",
    "question": "Which word is closest in meaning to \"legitimate\"?",
    "answer": "lawful",
    "options": [
      "lawful",
      "hopeful",
      "thrifty",
      "careful"
    ],
    "explanation": "\"legitimate\" means lawful.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-170",
    "question": "Which word is opposite in meaning to \"legitimate\"?",
    "answer": "illicit",
    "options": [
      "trusting",
      "illicit",
      "idealistic",
      "protected"
    ],
    "explanation": "\"illicit\" is the opposite of \"legitimate\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-171",
    "question": "What does \"legitimate\" mean?",
    "answer": "allowed by law or reasonable and genuine",
    "options": [
      "not as strict or severe as expected",
      "available in large quantities",
      "allowed by law or reasonable and genuine",
      "not easily convinced and inclined to question claims"
    ],
    "explanation": "\"legitimate\" means allowed by law or reasonable and genuine.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-172",
    "question": "Choose the sentence that uses \"legitimate\" correctly.",
    "answer": "The customer raised a legitimate concern.",
    "options": [
      "An adaptable employee can handle changing priorities.",
      "Their spontaneous visit delighted the family.",
      "The region has abundant rainfall throughout the year.",
      "The customer raised a legitimate concern."
    ],
    "explanation": "The sentence uses \"legitimate\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-173",
    "question": "Which word is closest in meaning to \"lenient\"?",
    "answer": "merciful",
    "options": [
      "unclear",
      "merciful",
      "unplanned",
      "hardworking"
    ],
    "explanation": "\"lenient\" means merciful.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-174",
    "question": "Which word is opposite in meaning to \"lenient\"?",
    "answer": "strict",
    "options": [
      "strict",
      "effortless",
      "explicit",
      "inaccurate"
    ],
    "explanation": "\"strict\" is the opposite of \"lenient\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-175",
    "question": "What does \"lenient\" mean?",
    "answer": "not as strict or severe as expected",
    "options": [
      "greater than what is reasonable or necessary",
      "clever, original and inventive",
      "quick to understand situations and make sound judgements",
      "not as strict or severe as expected"
    ],
    "explanation": "\"lenient\" means not as strict or severe as expected.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-176",
    "question": "Choose the sentence that uses \"lenient\" correctly.",
    "answer": "The teacher was lenient about the late submission.",
    "options": [
      "The teacher was lenient about the late submission.",
      "Her argument was coherent from beginning to end.",
      "The report gives an accurate account of the incident.",
      "Our amiable neighbour greets everyone warmly."
    ],
    "explanation": "The sentence uses \"lenient\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-177",
    "question": "Which word is closest in meaning to \"meticulous\"?",
    "answer": "thorough",
    "options": [
      "shallow",
      "flexible",
      "thorough",
      "plentiful"
    ],
    "explanation": "\"meticulous\" means thorough.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-178",
    "question": "Which word is opposite in meaning to \"meticulous\"?",
    "answer": "careless",
    "options": [
      "trusting",
      "inconspicuous",
      "deliberate",
      "careless"
    ],
    "explanation": "\"careless\" is the opposite of \"meticulous\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-179",
    "question": "What does \"meticulous\" mean?",
    "answer": "extremely careful about small details",
    "options": [
      "focused on practical results rather than theory",
      "very strong or concentrated",
      "extremely careful about small details",
      "taking care to avoid danger or mistakes"
    ],
    "explanation": "\"meticulous\" means extremely careful about small details.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-180",
    "question": "Choose the sentence that uses \"meticulous\" correctly.",
    "answer": "The editor made a meticulous check of every page.",
    "options": [
      "The committee made a tentative decision.",
      "The editor made a meticulous check of every page.",
      "The region has abundant rainfall throughout the year.",
      "Their frugal habits helped them save for a house."
    ],
    "explanation": "The sentence uses \"meticulous\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-181",
    "question": "Which word is closest in meaning to \"modest\"?",
    "answer": "humble",
    "options": [
      "thorough",
      "kind",
      "adaptable",
      "humble"
    ],
    "explanation": "\"modest\" means humble.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-182",
    "question": "Which word is opposite in meaning to \"modest\"?",
    "answer": "arrogant",
    "options": [
      "arrogant",
      "scarce",
      "unorthodox",
      "secure"
    ],
    "explanation": "\"arrogant\" is the opposite of \"modest\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-183",
    "question": "What does \"modest\" mean?",
    "answer": "not boastful or excessively proud",
    "options": [
      "correct and free from errors",
      "having many connected and complicated details",
      "not boastful or excessively proud",
      "advanced, complex or showing good judgement"
    ],
    "explanation": "\"modest\" means not boastful or excessively proud.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-184",
    "question": "Choose the sentence that uses \"modest\" correctly.",
    "answer": "Despite winning the award, she remained modest.",
    "options": [
      "Despite winning the award, she remained modest.",
      "The organisation promised a transparent selection process.",
      "The report gives an accurate account of the incident.",
      "He offered a candid assessment of the plan."
    ],
    "explanation": "The sentence uses \"modest\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-185",
    "question": "Which word is closest in meaning to \"obsolete\"?",
    "answer": "outdated",
    "options": [
      "necessary",
      "friendly",
      "outdated",
      "demanding"
    ],
    "explanation": "\"obsolete\" means outdated.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-186",
    "question": "Which word is opposite in meaning to \"obsolete\"?",
    "answer": "modern",
    "options": [
      "definite",
      "modern",
      "welcoming",
      "hostile"
    ],
    "explanation": "\"modern\" is the opposite of \"obsolete\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-187",
    "question": "What does \"obsolete\" mean?",
    "answer": "no longer used because something newer exists",
    "options": [
      "no longer used because something newer exists",
      "skilled at dealing with people without causing offence",
      "preventing success or causing difficulty",
      "allowed by law or reasonable and genuine"
    ],
    "explanation": "\"obsolete\" means no longer used because something newer exists.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-188",
    "question": "Choose the sentence that uses \"obsolete\" correctly.",
    "answer": "The factory replaced its obsolete machinery.",
    "options": [
      "The tenacious reporter continued investigating.",
      "The climbers faced an arduous journey.",
      "The region has abundant rainfall throughout the year.",
      "The factory replaced its obsolete machinery."
    ],
    "explanation": "The sentence uses \"obsolete\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-189",
    "question": "Which word is closest in meaning to \"optimistic\"?",
    "answer": "hopeful",
    "options": [
      "comprehensive",
      "plentiful",
      "hopeful",
      "delicate"
    ],
    "explanation": "\"optimistic\" means hopeful.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-190",
    "question": "Which word is opposite in meaning to \"optimistic\"?",
    "answer": "pessimistic",
    "options": [
      "pessimistic",
      "favourable",
      "simple",
      "strict"
    ],
    "explanation": "\"pessimistic\" is the opposite of \"optimistic\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-191",
    "question": "What does \"optimistic\" mean?",
    "answer": "expecting good things to happen",
    "options": [
      "extremely thorough, careful or strict",
      "concerned only with the surface or appearance",
      "following accepted customs or usual methods",
      "expecting good things to happen"
    ],
    "explanation": "\"optimistic\" means expecting good things to happen.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-192",
    "question": "Choose the sentence that uses \"optimistic\" correctly.",
    "answer": "Investors remained optimistic about the recovery.",
    "options": [
      "We need a pragmatic solution to the transport problem.",
      "The team developed a feasible plan within the budget.",
      "Investors remained optimistic about the recovery.",
      "The region experienced intense heat in May."
    ],
    "explanation": "The sentence uses \"optimistic\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-193",
    "question": "Which word is closest in meaning to \"plausible\"?",
    "answer": "credible",
    "options": [
      "unplanned",
      "wise",
      "credible",
      "sturdy"
    ],
    "explanation": "\"plausible\" means credible.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-194",
    "question": "Which word is opposite in meaning to \"plausible\"?",
    "answer": "far-fetched",
    "options": [
      "effortless",
      "idealistic",
      "inconspicuous",
      "far-fetched"
    ],
    "explanation": "\"far-fetched\" is the opposite of \"plausible\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-195",
    "question": "What does \"plausible\" mean?",
    "answer": "seeming reasonable or likely to be true",
    "options": [
      "seeming reasonable or likely to be true",
      "available in large quantities",
      "easy to understand or open and honest",
      "extremely thorough, careful or strict"
    ],
    "explanation": "\"plausible\" means seeming reasonable or likely to be true.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-196",
    "question": "Choose the sentence that uses \"plausible\" correctly.",
    "answer": "He offered a plausible reason for the delay.",
    "options": [
      "A benevolent donor funded the village library.",
      "An adaptable employee can handle changing priorities.",
      "He offered a plausible reason for the delay.",
      "Her argument was coherent from beginning to end."
    ],
    "explanation": "The sentence uses \"plausible\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-197",
    "question": "Which word is closest in meaning to \"pragmatic\"?",
    "answer": "practical",
    "options": [
      "exact",
      "strict",
      "complex",
      "practical"
    ],
    "explanation": "\"pragmatic\" means practical.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-198",
    "question": "Which word is opposite in meaning to \"pragmatic\"?",
    "answer": "idealistic",
    "options": [
      "idealistic",
      "impractical",
      "reckless",
      "evasive"
    ],
    "explanation": "\"idealistic\" is the opposite of \"pragmatic\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-199",
    "question": "What does \"pragmatic\" mean?",
    "answer": "focused on practical results rather than theory",
    "options": [
      "truthful and direct",
      "focused on practical results rather than theory",
      "preventing success or causing difficulty",
      "having more than one possible meaning"
    ],
    "explanation": "\"pragmatic\" means focused on practical results rather than theory.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-200",
    "question": "Choose the sentence that uses \"pragmatic\" correctly.",
    "answer": "We need a pragmatic solution to the transport problem.",
    "options": [
      "The match was cancelled because of adverse weather.",
      "The teacher was lenient about the late submission.",
      "We need a pragmatic solution to the transport problem.",
      "Please provide the precise measurement."
    ],
    "explanation": "The sentence uses \"pragmatic\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-201",
    "question": "Which word is closest in meaning to \"precarious\"?",
    "answer": "unstable",
    "options": [
      "unstable",
      "doubtful",
      "demanding",
      "kind"
    ],
    "explanation": "\"precarious\" means unstable.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-202",
    "question": "Which word is opposite in meaning to \"precarious\"?",
    "answer": "secure",
    "options": [
      "scarce",
      "naive",
      "secure",
      "reckless"
    ],
    "explanation": "\"secure\" is the opposite of \"precarious\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-203",
    "question": "What does \"precarious\" mean?",
    "answer": "dangerously uncertain or likely to fail",
    "options": [
      "dangerously uncertain or likely to fail",
      "showing concern for another person's suffering",
      "able to be trusted or believed",
      "available in large quantities"
    ],
    "explanation": "\"precarious\" means dangerously uncertain or likely to fail.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-204",
    "question": "Choose the sentence that uses \"precarious\" correctly.",
    "answer": "The workers stood on a precarious platform.",
    "options": [
      "An adaptable employee can handle changing priorities.",
      "Some delays are inevitable during road repairs.",
      "The region has abundant rainfall throughout the year.",
      "The workers stood on a precarious platform."
    ],
    "explanation": "The sentence uses \"precarious\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-205",
    "question": "Which word is closest in meaning to \"precise\"?",
    "answer": "exact",
    "options": [
      "extreme",
      "exact",
      "deep",
      "expressive"
    ],
    "explanation": "\"precise\" means exact.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-206",
    "question": "Which word is opposite in meaning to \"precise\"?",
    "answer": "approximate",
    "options": [
      "implausible",
      "modern",
      "approximate",
      "arrogant"
    ],
    "explanation": "\"approximate\" is the opposite of \"precise\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-207",
    "question": "What does \"precise\" mean?",
    "answer": "accurate and exact in every detail",
    "options": [
      "extremely careful about small details",
      "real and not copied or false",
      "possible and realistic to achieve",
      "accurate and exact in every detail"
    ],
    "explanation": "\"precise\" means accurate and exact in every detail.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-208",
    "question": "Choose the sentence that uses \"precise\" correctly.",
    "answer": "Please provide the precise measurement.",
    "options": [
      "We need a pragmatic solution to the transport problem.",
      "There was a subtle change in her tone.",
      "Please provide the precise measurement.",
      "The hotel charged an excessive fee for parking."
    ],
    "explanation": "The sentence uses \"precise\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-209",
    "question": "Which word is closest in meaning to \"profound\"?",
    "answer": "deep",
    "options": [
      "deep",
      "sympathetic",
      "unfriendly",
      "noticeable"
    ],
    "explanation": "\"profound\" means deep.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-210",
    "question": "Which word is opposite in meaning to \"profound\"?",
    "answer": "superficial",
    "options": [
      "secure",
      "evasive",
      "scarce",
      "superficial"
    ],
    "explanation": "\"superficial\" is the opposite of \"profound\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-211",
    "question": "What does \"profound\" mean?",
    "answer": "very great or showing deep understanding",
    "options": [
      "very great or showing deep understanding",
      "requiring great effort or endurance",
      "respected and famous in a particular field",
      "available in large quantities"
    ],
    "explanation": "\"profound\" means very great or showing deep understanding.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-212",
    "question": "Choose the sentence that uses \"profound\" correctly.",
    "answer": "The discovery had a profound effect on medicine.",
    "options": [
      "Our amiable neighbour greets everyone warmly.",
      "He offered a plausible reason for the delay.",
      "The discovery had a profound effect on medicine.",
      "The research followed a rigorous testing process."
    ],
    "explanation": "The sentence uses \"profound\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-213",
    "question": "Which word is closest in meaning to \"prudent\"?",
    "answer": "wise",
    "options": [
      "shallow",
      "sturdy",
      "unfavourable",
      "wise"
    ],
    "explanation": "\"prudent\" means wise.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-214",
    "question": "Which word is opposite in meaning to \"prudent\"?",
    "answer": "reckless",
    "options": [
      "yielding",
      "definite",
      "reckless",
      "inaccurate"
    ],
    "explanation": "\"reckless\" is the opposite of \"prudent\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-215",
    "question": "What does \"prudent\" mean?",
    "answer": "showing careful judgement and good sense",
    "options": [
      "requiring great effort or endurance",
      "showing careful judgement and good sense",
      "able to adjust to new conditions",
      "preventing success or causing difficulty"
    ],
    "explanation": "\"prudent\" means showing careful judgement and good sense.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-216",
    "question": "Choose the sentence that uses \"prudent\" correctly.",
    "answer": "It is prudent to keep an emergency fund.",
    "options": [
      "It is prudent to keep an emergency fund.",
      "She gave an articulate explanation of the proposal.",
      "He offered a candid assessment of the plan.",
      "He offered a plausible reason for the delay."
    ],
    "explanation": "The sentence uses \"prudent\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-217",
    "question": "Which word is closest in meaning to \"redundant\"?",
    "answer": "unnecessary",
    "options": [
      "unnecessary",
      "flexible",
      "unwilling",
      "careful"
    ],
    "explanation": "\"redundant\" means unnecessary.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-218",
    "question": "Which word is opposite in meaning to \"redundant\"?",
    "answer": "essential",
    "options": [
      "rigid",
      "scarce",
      "essential",
      "naive"
    ],
    "explanation": "\"essential\" is the opposite of \"redundant\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-219",
    "question": "What does \"redundant\" mean?",
    "answer": "no longer needed or useful",
    "options": [
      "no longer needed or useful",
      "easy to understand or open and honest",
      "possible and realistic to achieve",
      "taking care to avoid danger or mistakes"
    ],
    "explanation": "\"redundant\" means no longer needed or useful.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-220",
    "question": "Choose the sentence that uses \"redundant\" correctly.",
    "answer": "The update removed several redundant steps.",
    "options": [
      "The factory replaced its obsolete machinery.",
      "An astute investor studies risks before buying.",
      "The chef maintained impeccable hygiene.",
      "The update removed several redundant steps."
    ],
    "explanation": "The sentence uses \"redundant\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-221",
    "question": "Which word is closest in meaning to \"reluctant\"?",
    "answer": "unwilling",
    "options": [
      "unclear",
      "unwilling",
      "precise",
      "crucial"
    ],
    "explanation": "\"reluctant\" means unwilling.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-222",
    "question": "Which word is opposite in meaning to \"reluctant\"?",
    "answer": "eager",
    "options": [
      "simple",
      "inaccurate",
      "eager",
      "favourable"
    ],
    "explanation": "\"eager\" is the opposite of \"reluctant\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-223",
    "question": "What does \"reluctant\" mean?",
    "answer": "not willing or eager to do something",
    "options": [
      "allowed by law or reasonable and genuine",
      "correct and free from errors",
      "giving information clearly in few words",
      "not willing or eager to do something"
    ],
    "explanation": "\"reluctant\" means not willing or eager to do something.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-224",
    "question": "Choose the sentence that uses \"reluctant\" correctly.",
    "answer": "He was reluctant to leave the familiar town.",
    "options": [
      "He was reluctant to leave the familiar town.",
      "The report gives an accurate account of the incident.",
      "Our amiable neighbour greets everyone warmly.",
      "Their frugal habits helped them save for a house."
    ],
    "explanation": "The sentence uses \"reluctant\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-225",
    "question": "Which word is closest in meaning to \"resilient\"?",
    "answer": "tough",
    "options": [
      "tough",
      "cautious",
      "plentiful",
      "believable"
    ],
    "explanation": "\"resilient\" means tough.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-226",
    "question": "Which word is opposite in meaning to \"resilient\"?",
    "answer": "fragile",
    "options": [
      "scarce",
      "strict",
      "illicit",
      "fragile"
    ],
    "explanation": "\"fragile\" is the opposite of \"resilient\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-227",
    "question": "What does \"resilient\" mean?",
    "answer": "able to recover quickly after difficulty",
    "options": [
      "able to recover quickly after difficulty",
      "introducing new ideas or methods",
      "able to adjust to new conditions",
      "very great or showing deep understanding"
    ],
    "explanation": "\"resilient\" means able to recover quickly after difficulty.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-228",
    "question": "Choose the sentence that uses \"resilient\" correctly.",
    "answer": "The resilient community rebuilt after the flood.",
    "options": [
      "The region has abundant rainfall throughout the year.",
      "The resilient community rebuilt after the flood.",
      "Fresh water becomes scarce during a drought.",
      "He offered a plausible reason for the delay."
    ],
    "explanation": "The sentence uses \"resilient\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-229",
    "question": "Which word is closest in meaning to \"rigorous\"?",
    "answer": "strict",
    "options": [
      "comprehensive",
      "delicate",
      "shrewd",
      "strict"
    ],
    "explanation": "\"rigorous\" means strict.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-230",
    "question": "Which word is opposite in meaning to \"rigorous\"?",
    "answer": "lenient",
    "options": [
      "lenient",
      "approximate",
      "biased",
      "reckless"
    ],
    "explanation": "\"lenient\" is the opposite of \"rigorous\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-231",
    "question": "What does \"rigorous\" mean?",
    "answer": "extremely thorough, careful or strict",
    "options": [
      "truthful and direct",
      "extremely important or necessary",
      "extremely thorough, careful or strict",
      "able to last a long time without damage"
    ],
    "explanation": "\"rigorous\" means extremely thorough, careful or strict.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-232",
    "question": "Choose the sentence that uses \"rigorous\" correctly.",
    "answer": "The research followed a rigorous testing process.",
    "options": [
      "The research followed a rigorous testing process.",
      "A versatile tool is useful in many situations.",
      "He offered a plausible reason for the delay.",
      "The report gives an accurate account of the incident."
    ],
    "explanation": "The sentence uses \"rigorous\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-233",
    "question": "Which word is closest in meaning to \"scarce\"?",
    "answer": "limited",
    "options": [
      "limited",
      "brief",
      "plentiful",
      "detailed"
    ],
    "explanation": "\"scarce\" means limited.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-234",
    "question": "Which word is opposite in meaning to \"scarce\"?",
    "answer": "abundant",
    "options": [
      "scarce",
      "abundant",
      "inaccurate",
      "naive"
    ],
    "explanation": "\"abundant\" is the opposite of \"scarce\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-235",
    "question": "What does \"scarce\" mean?",
    "answer": "available in very small quantities",
    "options": [
      "not yet certain or final",
      "able to be trusted or believed",
      "available in very small quantities",
      "quick to understand situations and make sound judgements"
    ],
    "explanation": "\"scarce\" means available in very small quantities.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-236",
    "question": "Choose the sentence that uses \"scarce\" correctly.",
    "answer": "Fresh water becomes scarce during a drought.",
    "options": [
      "Their spontaneous visit delighted the family.",
      "An eminent scientist delivered the lecture.",
      "An astute investor studies risks before buying.",
      "Fresh water becomes scarce during a drought."
    ],
    "explanation": "The sentence uses \"scarce\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-237",
    "question": "Which word is closest in meaning to \"skeptical\"?",
    "answer": "doubtful",
    "options": [
      "unwilling",
      "doubtful",
      "precise",
      "tough"
    ],
    "explanation": "\"skeptical\" means doubtful.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-238",
    "question": "Which word is opposite in meaning to \"skeptical\"?",
    "answer": "convinced",
    "options": [
      "convinced",
      "inconspicuous",
      "arrogant",
      "faulty"
    ],
    "explanation": "\"convinced\" is the opposite of \"skeptical\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-239",
    "question": "What does \"skeptical\" mean?",
    "answer": "not easily convinced and inclined to question claims",
    "options": [
      "showing careful and persistent effort",
      "concerned only with the surface or appearance",
      "certain to happen and impossible to avoid",
      "not easily convinced and inclined to question claims"
    ],
    "explanation": "\"skeptical\" means not easily convinced and inclined to question claims.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-240",
    "question": "Choose the sentence that uses \"skeptical\" correctly.",
    "answer": "The scientist was skeptical of the unsupported claim.",
    "options": [
      "The scientist was skeptical of the unsupported claim.",
      "The discovery had a profound effect on medicine.",
      "The inspection was superficial and missed major faults.",
      "The hotel charged an excessive fee for parking."
    ],
    "explanation": "The sentence uses \"skeptical\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-241",
    "question": "Which word is closest in meaning to \"sophisticated\"?",
    "answer": "refined",
    "options": [
      "exposed",
      "cautious",
      "refined",
      "credible"
    ],
    "explanation": "\"sophisticated\" means refined.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-242",
    "question": "Which word is opposite in meaning to \"sophisticated\"?",
    "answer": "basic",
    "options": [
      "scarce",
      "abundant",
      "illicit",
      "basic"
    ],
    "explanation": "\"basic\" is the opposite of \"sophisticated\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-243",
    "question": "What does \"sophisticated\" mean?",
    "answer": "advanced, complex or showing good judgement",
    "options": [
      "not obvious and therefore difficult to notice",
      "available in large quantities",
      "advanced, complex or showing good judgement",
      "able to adjust to new conditions"
    ],
    "explanation": "\"sophisticated\" means advanced, complex or showing good judgement.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-244",
    "question": "Choose the sentence that uses \"sophisticated\" correctly.",
    "answer": "The device uses sophisticated technology.",
    "options": [
      "The update removed several redundant steps.",
      "The device uses sophisticated technology.",
      "The committee made a tentative decision.",
      "A benevolent donor funded the village library."
    ],
    "explanation": "The sentence uses \"sophisticated\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-245",
    "question": "Which word is closest in meaning to \"spontaneous\"?",
    "answer": "unplanned",
    "options": [
      "demanding",
      "unspoken",
      "precise",
      "unplanned"
    ],
    "explanation": "\"spontaneous\" means unplanned.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-246",
    "question": "Which word is opposite in meaning to \"spontaneous\"?",
    "answer": "deliberate",
    "options": [
      "deliberate",
      "unimaginative",
      "naive",
      "moderate"
    ],
    "explanation": "\"deliberate\" is the opposite of \"spontaneous\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-247",
    "question": "What does \"spontaneous\" mean?",
    "answer": "happening naturally without prior planning",
    "options": [
      "correct and free from errors",
      "able to last a long time without damage",
      "happening naturally without prior planning",
      "easy to understand or open and honest"
    ],
    "explanation": "\"spontaneous\" means happening naturally without prior planning.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-248",
    "question": "Choose the sentence that uses \"spontaneous\" correctly.",
    "answer": "Their spontaneous visit delighted the family.",
    "options": [
      "Their spontaneous visit delighted the family.",
      "Fresh water becomes scarce during a drought.",
      "The report gives an accurate account of the incident.",
      "We need a pragmatic solution to the transport problem."
    ],
    "explanation": "The sentence uses \"spontaneous\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-249",
    "question": "Which word is closest in meaning to \"subtle\"?",
    "answer": "delicate",
    "options": [
      "refined",
      "noticeable",
      "delicate",
      "cautious"
    ],
    "explanation": "\"subtle\" means delicate.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-250",
    "question": "Which word is opposite in meaning to \"subtle\"?",
    "answer": "obvious",
    "options": [
      "mild",
      "obvious",
      "reckless",
      "far-fetched"
    ],
    "explanation": "\"obvious\" is the opposite of \"subtle\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-251",
    "question": "What does \"subtle\" mean?",
    "answer": "not obvious and therefore difficult to notice",
    "options": [
      "lasting for only a brief time",
      "containing many carefully arranged details",
      "not obvious and therefore difficult to notice",
      "available in large quantities"
    ],
    "explanation": "\"subtle\" means not obvious and therefore difficult to notice.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-252",
    "question": "Choose the sentence that uses \"subtle\" correctly.",
    "answer": "There was a subtle change in her tone.",
    "options": [
      "The hotel charged an excessive fee for parking.",
      "An astute investor studies risks before buying.",
      "Our amiable neighbour greets everyone warmly.",
      "There was a subtle change in her tone."
    ],
    "explanation": "The sentence uses \"subtle\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-253",
    "question": "Which word is closest in meaning to \"superficial\"?",
    "answer": "shallow",
    "options": [
      "practical",
      "traditional",
      "shallow",
      "plentiful"
    ],
    "explanation": "\"superficial\" means shallow.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-254",
    "question": "Which word is opposite in meaning to \"superficial\"?",
    "answer": "thorough",
    "options": [
      "thorough",
      "convinced",
      "inaccurate",
      "simple"
    ],
    "explanation": "\"thorough\" is the opposite of \"superficial\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-255",
    "question": "What does \"superficial\" mean?",
    "answer": "concerned only with the surface or appearance",
    "options": [
      "not easily convinced and inclined to question claims",
      "clear, consistent and easy to understand",
      "able to express ideas clearly",
      "concerned only with the surface or appearance"
    ],
    "explanation": "\"superficial\" means concerned only with the surface or appearance.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-256",
    "question": "Choose the sentence that uses \"superficial\" correctly.",
    "answer": "The inspection was superficial and missed major faults.",
    "options": [
      "The inspection was superficial and missed major faults.",
      "He offered a plausible reason for the delay.",
      "The ambiguous instruction confused the new staff.",
      "The report gives an accurate account of the incident."
    ],
    "explanation": "The sentence uses \"superficial\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-257",
    "question": "Which word is closest in meaning to \"tenacious\"?",
    "answer": "persistent",
    "options": [
      "friendly",
      "unfriendly",
      "persistent",
      "unclear"
    ],
    "explanation": "\"tenacious\" means persistent.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-258",
    "question": "Which word is opposite in meaning to \"tenacious\"?",
    "answer": "yielding",
    "options": [
      "favourable",
      "illicit",
      "insensitive",
      "yielding"
    ],
    "explanation": "\"yielding\" is the opposite of \"tenacious\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-259",
    "question": "What does \"tenacious\" mean?",
    "answer": "determined and unwilling to give up",
    "options": [
      "determined and unwilling to give up",
      "very strong or concentrated",
      "not yet certain or final",
      "absolutely needed or extremely important"
    ],
    "explanation": "\"tenacious\" means determined and unwilling to give up.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-260",
    "question": "Choose the sentence that uses \"tenacious\" correctly.",
    "answer": "The tenacious reporter continued investigating.",
    "options": [
      "The climbers faced an arduous journey.",
      "Clean drinking water is essential for health.",
      "The tenacious reporter continued investigating.",
      "Some delays are inevitable during road repairs."
    ],
    "explanation": "The sentence uses \"tenacious\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-261",
    "question": "Which word is closest in meaning to \"tentative\"?",
    "answer": "provisional",
    "options": [
      "detailed",
      "unfavourable",
      "merciful",
      "provisional"
    ],
    "explanation": "\"tentative\" means provisional.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-262",
    "question": "Which word is opposite in meaning to \"tentative\"?",
    "answer": "definite",
    "options": [
      "definite",
      "unorthodox",
      "obvious",
      "fragile"
    ],
    "explanation": "\"definite\" is the opposite of \"tentative\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-263",
    "question": "What does \"tentative\" mean?",
    "answer": "not yet certain or final",
    "options": [
      "skilled at dealing with people without causing offence",
      "not yet certain or final",
      "following accepted customs or usual methods",
      "clever, original and inventive"
    ],
    "explanation": "\"tentative\" means not yet certain or final.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-264",
    "question": "Choose the sentence that uses \"tentative\" correctly.",
    "answer": "The committee made a tentative decision.",
    "options": [
      "The ambiguous instruction confused the new staff.",
      "The research followed a rigorous testing process.",
      "The committee made a tentative decision.",
      "The shop guarantees that every product is genuine."
    ],
    "explanation": "The sentence uses \"tentative\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-265",
    "question": "Which word is closest in meaning to \"thorough\"?",
    "answer": "comprehensive",
    "options": [
      "comprehensive",
      "credible",
      "demanding",
      "noticeable"
    ],
    "explanation": "\"thorough\" means comprehensive.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-266",
    "question": "Which word is opposite in meaning to \"thorough\"?",
    "answer": "superficial",
    "options": [
      "scarce",
      "superficial",
      "fragile",
      "opaque"
    ],
    "explanation": "\"superficial\" is the opposite of \"thorough\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-267",
    "question": "What does \"thorough\" mean?",
    "answer": "complete and careful",
    "options": [
      "complete and careful",
      "available in large quantities",
      "able to adjust to new conditions",
      "advanced, complex or showing good judgement"
    ],
    "explanation": "\"thorough\" means complete and careful.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-268",
    "question": "Choose the sentence that uses \"thorough\" correctly.",
    "answer": "A thorough inspection revealed the defect.",
    "options": [
      "An astute investor studies risks before buying.",
      "The witness provided a credible explanation.",
      "The chef maintained impeccable hygiene.",
      "A thorough inspection revealed the defect."
    ],
    "explanation": "The sentence uses \"thorough\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-269",
    "question": "Which word is closest in meaning to \"transparent\"?",
    "answer": "clear",
    "options": [
      "frank",
      "clear",
      "careful",
      "practical"
    ],
    "explanation": "\"transparent\" means clear.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-270",
    "question": "Which word is opposite in meaning to \"transparent\"?",
    "answer": "opaque",
    "options": [
      "definite",
      "evasive",
      "opaque",
      "favourable"
    ],
    "explanation": "\"opaque\" is the opposite of \"transparent\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-271",
    "question": "What does \"transparent\" mean?",
    "answer": "easy to understand or open and honest",
    "options": [
      "pleasant and friendly in manner",
      "correct and free from errors",
      "clear, consistent and easy to understand",
      "easy to understand or open and honest"
    ],
    "explanation": "\"transparent\" means easy to understand or open and honest.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-272",
    "question": "Choose the sentence that uses \"transparent\" correctly.",
    "answer": "The organisation promised a transparent selection process.",
    "options": [
      "We need a pragmatic solution to the transport problem.",
      "There was an implicit agreement to share the costs.",
      "The organisation promised a transparent selection process.",
      "The engineer devised an ingenious solution."
    ],
    "explanation": "The sentence uses \"transparent\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-273",
    "question": "Which word is closest in meaning to \"versatile\"?",
    "answer": "adaptable",
    "options": [
      "adaptable",
      "plentiful",
      "deep",
      "shrewd"
    ],
    "explanation": "\"versatile\" means adaptable.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-274",
    "question": "Which word is opposite in meaning to \"versatile\"?",
    "answer": "limited",
    "options": [
      "uncaring",
      "implausible",
      "scarce",
      "limited"
    ],
    "explanation": "\"limited\" is the opposite of \"versatile\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-275",
    "question": "What does \"versatile\" mean?",
    "answer": "able to perform many different functions",
    "options": [
      "able to perform many different functions",
      "careful about spending money or using resources",
      "determined and unwilling to give up",
      "available in large quantities"
    ],
    "explanation": "\"versatile\" means able to perform many different functions.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-276",
    "question": "Choose the sentence that uses \"versatile\" correctly.",
    "answer": "A versatile tool is useful in many situations.",
    "options": [
      "Our amiable neighbour greets everyone warmly.",
      "The climbers faced an arduous journey.",
      "A versatile tool is useful in many situations.",
      "There was a subtle change in her tone."
    ],
    "explanation": "The sentence uses \"versatile\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-277",
    "question": "Which word is closest in meaning to \"vital\"?",
    "answer": "crucial",
    "options": [
      "outdated",
      "humble",
      "believable",
      "crucial"
    ],
    "explanation": "\"vital\" means crucial.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-278",
    "question": "Which word is opposite in meaning to \"vital\"?",
    "answer": "unimportant",
    "options": [
      "careless",
      "fake",
      "unimportant",
      "impractical"
    ],
    "explanation": "\"unimportant\" is the opposite of \"vital\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-279",
    "question": "What does \"vital\" mean?",
    "answer": "extremely important or necessary",
    "options": [
      "truthful and direct",
      "extremely important or necessary",
      "correct and free from errors",
      "complete and careful"
    ],
    "explanation": "\"vital\" means extremely important or necessary.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-280",
    "question": "Choose the sentence that uses \"vital\" correctly.",
    "answer": "Accurate information is vital during an emergency.",
    "options": [
      "Accurate information is vital during an emergency.",
      "The witness provided a credible explanation.",
      "Their spontaneous visit delighted the family.",
      "The necklace has an intricate pattern."
    ],
    "explanation": "The sentence uses \"vital\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-281",
    "question": "Which word is closest in meaning to \"vulnerable\"?",
    "answer": "exposed",
    "options": [
      "exposed",
      "plentiful",
      "frank",
      "unstable"
    ],
    "explanation": "\"vulnerable\" means exposed.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-282",
    "question": "Which word is opposite in meaning to \"vulnerable\"?",
    "answer": "protected",
    "options": [
      "scarce",
      "unknown",
      "protected",
      "effortless"
    ],
    "explanation": "\"protected\" is the opposite of \"vulnerable\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-283",
    "question": "What does \"vulnerable\" mean?",
    "answer": "easily harmed, attacked or affected",
    "options": [
      "easily harmed, attacked or affected",
      "concerned only with the surface or appearance",
      "available in large quantities",
      "requiring great effort or endurance"
    ],
    "explanation": "\"vulnerable\" means easily harmed, attacked or affected.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-284",
    "question": "Choose the sentence that uses \"vulnerable\" correctly.",
    "answer": "Young plants are vulnerable to frost.",
    "options": [
      "The company is known for its innovative products.",
      "The hotel charged an excessive fee for parking.",
      "An astute investor studies risks before buying.",
      "Young plants are vulnerable to frost."
    ],
    "explanation": "The sentence uses \"vulnerable\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  },
  {
    "id": "wordquiz-285",
    "question": "Which word is closest in meaning to \"wary\"?",
    "answer": "cautious",
    "options": [
      "precise",
      "cautious",
      "unclear",
      "shallow"
    ],
    "explanation": "\"wary\" means cautious.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Synonyms"
  },
  {
    "id": "wordquiz-286",
    "question": "Which word is opposite in meaning to \"wary\"?",
    "answer": "trusting",
    "options": [
      "favourable",
      "rigid",
      "trusting",
      "effortless"
    ],
    "explanation": "\"trusting\" is the opposite of \"wary\".",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Antonyms"
  },
  {
    "id": "wordquiz-287",
    "question": "What does \"wary\" mean?",
    "answer": "careful because danger or problems are possible",
    "options": [
      "seeming reasonable or likely to be true",
      "possible and realistic to achieve",
      "very strong or concentrated",
      "careful because danger or problems are possible"
    ],
    "explanation": "\"wary\" means careful because danger or problems are possible.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Word meanings"
  },
  {
    "id": "wordquiz-288",
    "question": "Choose the sentence that uses \"wary\" correctly.",
    "answer": "Residents remained wary of the unfamiliar offer.",
    "options": [
      "Residents remained wary of the unfamiliar offer.",
      "Her diplomatic reply prevented an argument.",
      "A benevolent donor funded the village library.",
      "He offered a plausible reason for the delay."
    ],
    "explanation": "The sentence uses \"wary\" in its correct meaning and context.",
    "clue": "Consider the meaning and context of the word before choosing.",
    "topic": "Usage in context"
  }
] as WordQuizQuestion[];

export const WORD_QUIZ_BANK:WordQuizQuestion[]=questions;
