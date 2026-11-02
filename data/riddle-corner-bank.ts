export type RiddleCornerQuestion = { id: string; q: string; a: string; o: [string,string,string,string]; e: string; topic?: string };

// 240 verbal riddles and 60 numerical reasoning questions.
export const RIDDLE_CORNER_BANK: RiddleCornerQuestion[] = [
  {
    "id": "riddle-corner-001",
    "q": "I follow you in sunlight but vanish in darkness. What am I?",
    "a": "shadow",
    "o": [
      "shadow",
      "reflection",
      "footprint",
      "silhouette"
    ],
    "e": "The defining clue identifies shadow.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-002",
    "q": "I return your voice without understanding it. What am I?",
    "a": "echo",
    "o": [
      "echo",
      "whisper",
      "answer",
      "song"
    ],
    "e": "The defining clue identifies echo.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-003",
    "q": "I show many colours after rain but cannot be touched. What am I?",
    "a": "rainbow",
    "o": [
      "rainbow",
      "sunset",
      "aurora",
      "prism"
    ],
    "e": "The defining clue identifies rainbow.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-004",
    "q": "I hide nearby things without moving them. What am I?",
    "a": "fog",
    "o": [
      "fog",
      "smoke",
      "cloud",
      "dust"
    ],
    "e": "The defining clue identifies fog.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-005",
    "q": "I appear as tiny drops on grass at dawn. What am I?",
    "a": "dew",
    "o": [
      "dew",
      "frost",
      "mist",
      "rain"
    ],
    "e": "The defining clue identifies dew.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-006",
    "q": "I flash before thunder and can split the sky. What am I?",
    "a": "lightning",
    "o": [
      "lightning",
      "firework",
      "sunbeam",
      "meteor"
    ],
    "e": "The defining clue identifies lightning.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-007",
    "q": "You hear me after a flash, though I have no instrument. What am I?",
    "a": "thunder",
    "o": [
      "thunder",
      "wind",
      "explosion",
      "echo"
    ],
    "e": "The defining clue identifies thunder.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-008",
    "q": "I move leaves but have no visible body. What am I?",
    "a": "breeze",
    "o": [
      "breeze",
      "draft",
      "storm",
      "breath"
    ],
    "e": "The defining clue identifies breeze.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-009",
    "q": "I make the shore advance and retreat with the moon. What am I?",
    "a": "tide",
    "o": [
      "tide",
      "current",
      "wave",
      "ripple"
    ],
    "e": "The defining clue identifies tide.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-010",
    "q": "I fall from clouds as hard little balls. What am I?",
    "a": "hail",
    "o": [
      "hail",
      "sleet",
      "snow",
      "gravel"
    ],
    "e": "The defining clue identifies hail.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-011",
    "q": "I have a face and hands but no eyes or fingers. What am I?",
    "a": "clock",
    "o": [
      "clock",
      "reflection",
      "footprint",
      "silhouette"
    ],
    "e": "The defining clue identifies clock.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-012",
    "q": "I arrange dates in boxes but contain no parcel. What am I?",
    "a": "calendar",
    "o": [
      "calendar",
      "whisper",
      "answer",
      "song"
    ],
    "e": "The defining clue identifies calendar.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-013",
    "q": "I measure time with sand and need turning to begin again. What am I?",
    "a": "hourglass",
    "o": [
      "hourglass",
      "sunset",
      "aurora",
      "prism"
    ],
    "e": "The defining clue identifies hourglass.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-014",
    "q": "I travel around a clock face faster than the short hand. What am I?",
    "a": "minute hand",
    "o": [
      "minute hand",
      "smoke",
      "cloud",
      "dust"
    ],
    "e": "The defining clue identifies minute hand.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-015",
    "q": "I am always behind today and cannot be revisited. What am I?",
    "a": "yesterday",
    "o": [
      "yesterday",
      "frost",
      "mist",
      "rain"
    ],
    "e": "The defining clue identifies yesterday.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-016",
    "q": "When I arrive, people give me a new name. What am I?",
    "a": "tomorrow",
    "o": [
      "tomorrow",
      "firework",
      "sunbeam",
      "meteor"
    ],
    "e": "The defining clue identifies tomorrow.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-017",
    "q": "I vanish as soon as you try to hold me. What am I?",
    "a": "moment",
    "o": [
      "moment",
      "wind",
      "explosion",
      "echo"
    ],
    "e": "The defining clue identifies moment.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-018",
    "q": "I return once a year and make you older. What am I?",
    "a": "birthday",
    "o": [
      "birthday",
      "draft",
      "storm",
      "breath"
    ],
    "e": "The defining clue identifies birthday.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-019",
    "q": "I approaches while you work and cannot be wished away. What am I?",
    "a": "deadline",
    "o": [
      "deadline",
      "current",
      "wave",
      "ripple"
    ],
    "e": "The defining clue identifies deadline.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-020",
    "q": "I record what happened but cannot change it. What am I?",
    "a": "history",
    "o": [
      "history",
      "sleet",
      "snow",
      "gravel"
    ],
    "e": "The defining clue identifies history.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-021",
    "q": "I have many teeth but cannot bite. What am I?",
    "a": "comb",
    "o": [
      "comb",
      "reflection",
      "footprint",
      "silhouette"
    ],
    "e": "The defining clue identifies comb.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-022",
    "q": "I have a neck and mouth but no head or voice. What am I?",
    "a": "bottle",
    "o": [
      "bottle",
      "whisper",
      "answer",
      "song"
    ],
    "e": "The defining clue identifies bottle.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-023",
    "q": "I have an eye but cannot see. What am I?",
    "a": "needle",
    "o": [
      "needle",
      "sunset",
      "aurora",
      "prism"
    ],
    "e": "The defining clue identifies needle.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-024",
    "q": "I support your head but have no bones. What am I?",
    "a": "pillow",
    "o": [
      "pillow",
      "smoke",
      "cloud",
      "dust"
    ],
    "e": "The defining clue identifies pillow.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-025",
    "q": "I have teeth but cannot eat; I open locks. What am I?",
    "a": "key",
    "o": [
      "key",
      "frost",
      "mist",
      "rain"
    ],
    "e": "The defining clue identifies key.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-026",
    "q": "I copy your movements but reverse left and right. What am I?",
    "a": "mirror",
    "o": [
      "mirror",
      "firework",
      "sunbeam",
      "meteor"
    ],
    "e": "The defining clue identifies mirror.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-027",
    "q": "I have a flap and carry hidden words. What am I?",
    "a": "envelope",
    "o": [
      "envelope",
      "wind",
      "explosion",
      "echo"
    ],
    "e": "The defining clue identifies envelope.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-028",
    "q": "I have rungs but no horse; I help you climb. What am I?",
    "a": "ladder",
    "o": [
      "ladder",
      "draft",
      "storm",
      "breath"
    ],
    "e": "The defining clue identifies ladder.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-029",
    "q": "I open above your head when rain begins. What am I?",
    "a": "umbrella",
    "o": [
      "umbrella",
      "current",
      "wave",
      "ripple"
    ],
    "e": "The defining clue identifies umbrella.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-030",
    "q": "I grow shorter while giving light. What am I?",
    "a": "candle",
    "o": [
      "candle",
      "sleet",
      "snow",
      "gravel"
    ],
    "e": "The defining clue identifies candle.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-031",
    "q": "I am associated with pencil in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "pencil",
    "o": [
      "pencil",
      "reflection",
      "footprint",
      "silhouette"
    ],
    "e": "The defining clue identifies pencil.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-032",
    "q": "I am associated with eraser in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "eraser",
    "o": [
      "eraser",
      "whisper",
      "answer",
      "song"
    ],
    "e": "The defining clue identifies eraser.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-033",
    "q": "I am associated with ruler in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "ruler",
    "o": [
      "ruler",
      "sunset",
      "aurora",
      "prism"
    ],
    "e": "The defining clue identifies ruler.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-034",
    "q": "I am associated with book in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "book",
    "o": [
      "book",
      "smoke",
      "cloud",
      "dust"
    ],
    "e": "The defining clue identifies book.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-035",
    "q": "I am associated with globe in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "globe",
    "o": [
      "globe",
      "frost",
      "mist",
      "rain"
    ],
    "e": "The defining clue identifies globe.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-036",
    "q": "I am associated with chalkboard in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "chalkboard",
    "o": [
      "chalkboard",
      "firework",
      "sunbeam",
      "meteor"
    ],
    "e": "The defining clue identifies chalkboard.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-037",
    "q": "I am associated with bell in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "bell",
    "o": [
      "bell",
      "wind",
      "explosion",
      "echo"
    ],
    "e": "The defining clue identifies bell.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-038",
    "q": "I am associated with dictionary in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "dictionary",
    "o": [
      "dictionary",
      "draft",
      "storm",
      "breath"
    ],
    "e": "The defining clue identifies dictionary.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-039",
    "q": "I am associated with bookmark in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "bookmark",
    "o": [
      "bookmark",
      "current",
      "wave",
      "ripple"
    ],
    "e": "The defining clue identifies bookmark.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-040",
    "q": "I am associated with stapler in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "stapler",
    "o": [
      "stapler",
      "sleet",
      "snow",
      "gravel"
    ],
    "e": "The defining clue identifies stapler.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-041",
    "q": "I am associated with river in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "river",
    "o": [
      "river",
      "reflection",
      "footprint",
      "silhouette"
    ],
    "e": "The defining clue identifies river.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-042",
    "q": "I am associated with mountain in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "mountain",
    "o": [
      "mountain",
      "whisper",
      "answer",
      "song"
    ],
    "e": "The defining clue identifies mountain.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-043",
    "q": "I am associated with tree in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "tree",
    "o": [
      "tree",
      "sunset",
      "aurora",
      "prism"
    ],
    "e": "The defining clue identifies tree.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-044",
    "q": "I am associated with mushroom in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "mushroom",
    "o": [
      "mushroom",
      "smoke",
      "cloud",
      "dust"
    ],
    "e": "The defining clue identifies mushroom.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-045",
    "q": "I am associated with cactus in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "cactus",
    "o": [
      "cactus",
      "frost",
      "mist",
      "rain"
    ],
    "e": "The defining clue identifies cactus.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-046",
    "q": "I am associated with seed in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "seed",
    "o": [
      "seed",
      "firework",
      "sunbeam",
      "meteor"
    ],
    "e": "The defining clue identifies seed.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-047",
    "q": "I am associated with shell in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "shell",
    "o": [
      "shell",
      "wind",
      "explosion",
      "echo"
    ],
    "e": "The defining clue identifies shell.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-048",
    "q": "I am associated with spider web in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "spider web",
    "o": [
      "spider web",
      "draft",
      "storm",
      "breath"
    ],
    "e": "The defining clue identifies spider web.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-049",
    "q": "I am associated with feather in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "feather",
    "o": [
      "feather",
      "current",
      "wave",
      "ripple"
    ],
    "e": "The defining clue identifies feather.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-050",
    "q": "I am associated with fossil in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "fossil",
    "o": [
      "fossil",
      "sleet",
      "snow",
      "gravel"
    ],
    "e": "The defining clue identifies fossil.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-051",
    "q": "I am associated with teapot in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "teapot",
    "o": [
      "teapot",
      "reflection",
      "footprint",
      "silhouette"
    ],
    "e": "The defining clue identifies teapot.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-052",
    "q": "I am associated with banana in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "banana",
    "o": [
      "banana",
      "whisper",
      "answer",
      "song"
    ],
    "e": "The defining clue identifies banana.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-053",
    "q": "I am associated with popcorn in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "popcorn",
    "o": [
      "popcorn",
      "sunset",
      "aurora",
      "prism"
    ],
    "e": "The defining clue identifies popcorn.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-054",
    "q": "I am associated with bread in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "bread",
    "o": [
      "bread",
      "smoke",
      "cloud",
      "dust"
    ],
    "e": "The defining clue identifies bread.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-055",
    "q": "I am associated with ice cream in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "ice cream",
    "o": [
      "ice cream",
      "frost",
      "mist",
      "rain"
    ],
    "e": "The defining clue identifies ice cream.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-056",
    "q": "I am associated with honey in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "honey",
    "o": [
      "honey",
      "firework",
      "sunbeam",
      "meteor"
    ],
    "e": "The defining clue identifies honey.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-057",
    "q": "I am associated with coconut in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "coconut",
    "o": [
      "coconut",
      "wind",
      "explosion",
      "echo"
    ],
    "e": "The defining clue identifies coconut.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-058",
    "q": "I am associated with cheese in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "cheese",
    "o": [
      "cheese",
      "draft",
      "storm",
      "breath"
    ],
    "e": "The defining clue identifies cheese.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-059",
    "q": "I am associated with lemon in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "lemon",
    "o": [
      "lemon",
      "current",
      "wave",
      "ripple"
    ],
    "e": "The defining clue identifies lemon.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-060",
    "q": "I am associated with pretzel in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "pretzel",
    "o": [
      "pretzel",
      "sleet",
      "snow",
      "gravel"
    ],
    "e": "The defining clue identifies pretzel.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-061",
    "q": "I am associated with bicycle in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "bicycle",
    "o": [
      "bicycle",
      "reflection",
      "footprint",
      "silhouette"
    ],
    "e": "The defining clue identifies bicycle.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-062",
    "q": "I am associated with train in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "train",
    "o": [
      "train",
      "whisper",
      "answer",
      "song"
    ],
    "e": "The defining clue identifies train.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-063",
    "q": "I am associated with anchor in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "anchor",
    "o": [
      "anchor",
      "sunset",
      "aurora",
      "prism"
    ],
    "e": "The defining clue identifies anchor.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-064",
    "q": "I am associated with sail in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "sail",
    "o": [
      "sail",
      "smoke",
      "cloud",
      "dust"
    ],
    "e": "The defining clue identifies sail.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-065",
    "q": "I am associated with compass in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "compass",
    "o": [
      "compass",
      "frost",
      "mist",
      "rain"
    ],
    "e": "The defining clue identifies compass.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-066",
    "q": "I am associated with ticket in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "ticket",
    "o": [
      "ticket",
      "firework",
      "sunbeam",
      "meteor"
    ],
    "e": "The defining clue identifies ticket.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-067",
    "q": "I am associated with tunnel in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "tunnel",
    "o": [
      "tunnel",
      "wind",
      "explosion",
      "echo"
    ],
    "e": "The defining clue identifies tunnel.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-068",
    "q": "I am associated with traffic light in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "traffic light",
    "o": [
      "traffic light",
      "draft",
      "storm",
      "breath"
    ],
    "e": "The defining clue identifies traffic light.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-069",
    "q": "I am associated with parachute in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "parachute",
    "o": [
      "parachute",
      "current",
      "wave",
      "ripple"
    ],
    "e": "The defining clue identifies parachute.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-070",
    "q": "I am associated with wheel in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "wheel",
    "o": [
      "wheel",
      "sleet",
      "snow",
      "gravel"
    ],
    "e": "The defining clue identifies wheel.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-071",
    "q": "I am associated with tongue in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "tongue",
    "o": [
      "tongue",
      "reflection",
      "footprint",
      "silhouette"
    ],
    "e": "The defining clue identifies tongue.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-072",
    "q": "I am associated with ear in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "ear",
    "o": [
      "ear",
      "whisper",
      "answer",
      "song"
    ],
    "e": "The defining clue identifies ear.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-073",
    "q": "I am associated with nose in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "nose",
    "o": [
      "nose",
      "sunset",
      "aurora",
      "prism"
    ],
    "e": "The defining clue identifies nose.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-074",
    "q": "I am associated with eyelid in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "eyelid",
    "o": [
      "eyelid",
      "smoke",
      "cloud",
      "dust"
    ],
    "e": "The defining clue identifies eyelid.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-075",
    "q": "I am associated with fingerprint in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "fingerprint",
    "o": [
      "fingerprint",
      "frost",
      "mist",
      "rain"
    ],
    "e": "The defining clue identifies fingerprint.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-076",
    "q": "I am associated with heartbeat in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "heartbeat",
    "o": [
      "heartbeat",
      "firework",
      "sunbeam",
      "meteor"
    ],
    "e": "The defining clue identifies heartbeat.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-077",
    "q": "I am associated with skeleton in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "skeleton",
    "o": [
      "skeleton",
      "wind",
      "explosion",
      "echo"
    ],
    "e": "The defining clue identifies skeleton.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-078",
    "q": "I am associated with saliva in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "saliva",
    "o": [
      "saliva",
      "draft",
      "storm",
      "breath"
    ],
    "e": "The defining clue identifies saliva.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-079",
    "q": "I am associated with eyebrow in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "eyebrow",
    "o": [
      "eyebrow",
      "current",
      "wave",
      "ripple"
    ],
    "e": "The defining clue identifies eyebrow.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-080",
    "q": "I am associated with kneecap in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "kneecap",
    "o": [
      "kneecap",
      "sleet",
      "snow",
      "gravel"
    ],
    "e": "The defining clue identifies kneecap.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-081",
    "q": "I am associated with silence in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "silence",
    "o": [
      "silence",
      "reflection",
      "footprint",
      "silhouette"
    ],
    "e": "The defining clue identifies silence.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-082",
    "q": "I am associated with question in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "question",
    "o": [
      "question",
      "whisper",
      "answer",
      "song"
    ],
    "e": "The defining clue identifies question.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-083",
    "q": "I am associated with promise in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "promise",
    "o": [
      "promise",
      "sunset",
      "aurora",
      "prism"
    ],
    "e": "The defining clue identifies promise.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-084",
    "q": "I am associated with secret in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "secret",
    "o": [
      "secret",
      "smoke",
      "cloud",
      "dust"
    ],
    "e": "The defining clue identifies secret.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-085",
    "q": "I am associated with pun in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "pun",
    "o": [
      "pun",
      "frost",
      "mist",
      "rain"
    ],
    "e": "The defining clue identifies pun.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-086",
    "q": "I am associated with rhyme in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "rhyme",
    "o": [
      "rhyme",
      "firework",
      "sunbeam",
      "meteor"
    ],
    "e": "The defining clue identifies rhyme.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-087",
    "q": "I am associated with whisper in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "whisper",
    "o": [
      "whisper",
      "wind",
      "explosion",
      "echo"
    ],
    "e": "The defining clue identifies whisper.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-088",
    "q": "I am associated with acronym in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "acronym",
    "o": [
      "acronym",
      "draft",
      "storm",
      "breath"
    ],
    "e": "The defining clue identifies acronym.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-089",
    "q": "I am associated with anagram in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "anagram",
    "o": [
      "anagram",
      "current",
      "wave",
      "ripple"
    ],
    "e": "The defining clue identifies anagram.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-090",
    "q": "I am associated with palindrome in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "palindrome",
    "o": [
      "palindrome",
      "sleet",
      "snow",
      "gravel"
    ],
    "e": "The defining clue identifies palindrome.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-091",
    "q": "I am associated with scissors in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "scissors",
    "o": [
      "scissors",
      "reflection",
      "footprint",
      "silhouette"
    ],
    "e": "The defining clue identifies scissors.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-092",
    "q": "I am associated with hammer in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "hammer",
    "o": [
      "hammer",
      "whisper",
      "answer",
      "song"
    ],
    "e": "The defining clue identifies hammer.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-093",
    "q": "I am associated with thermometer in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "thermometer",
    "o": [
      "thermometer",
      "sunset",
      "aurora",
      "prism"
    ],
    "e": "The defining clue identifies thermometer.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-094",
    "q": "I am associated with stethoscope in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "stethoscope",
    "o": [
      "stethoscope",
      "smoke",
      "cloud",
      "dust"
    ],
    "e": "The defining clue identifies stethoscope.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-095",
    "q": "I am associated with microscope in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "microscope",
    "o": [
      "microscope",
      "frost",
      "mist",
      "rain"
    ],
    "e": "The defining clue identifies microscope.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-096",
    "q": "I am associated with telescope in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "telescope",
    "o": [
      "telescope",
      "firework",
      "sunbeam",
      "meteor"
    ],
    "e": "The defining clue identifies telescope.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-097",
    "q": "I am associated with sieve in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "sieve",
    "o": [
      "sieve",
      "wind",
      "explosion",
      "echo"
    ],
    "e": "The defining clue identifies sieve.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-098",
    "q": "I am associated with funnel in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "funnel",
    "o": [
      "funnel",
      "draft",
      "storm",
      "breath"
    ],
    "e": "The defining clue identifies funnel.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-099",
    "q": "I am associated with magnet in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "magnet",
    "o": [
      "magnet",
      "current",
      "wave",
      "ripple"
    ],
    "e": "The defining clue identifies magnet.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-100",
    "q": "I am associated with pulley in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "pulley",
    "o": [
      "pulley",
      "sleet",
      "snow",
      "gravel"
    ],
    "e": "The defining clue identifies pulley.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-101",
    "q": "I am associated with postbox in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "postbox",
    "o": [
      "postbox",
      "reflection",
      "footprint",
      "silhouette"
    ],
    "e": "The defining clue identifies postbox.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-102",
    "q": "I am associated with streetlamp in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "streetlamp",
    "o": [
      "streetlamp",
      "whisper",
      "answer",
      "song"
    ],
    "e": "The defining clue identifies streetlamp.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-103",
    "q": "I am associated with fountain in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "fountain",
    "o": [
      "fountain",
      "sunset",
      "aurora",
      "prism"
    ],
    "e": "The defining clue identifies fountain.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-104",
    "q": "I am associated with crosswalk in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "crosswalk",
    "o": [
      "crosswalk",
      "smoke",
      "cloud",
      "dust"
    ],
    "e": "The defining clue identifies crosswalk.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-105",
    "q": "I am associated with bench in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "bench",
    "o": [
      "bench",
      "frost",
      "mist",
      "rain"
    ],
    "e": "The defining clue identifies bench.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-106",
    "q": "I am associated with manhole in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "manhole",
    "o": [
      "manhole",
      "firework",
      "sunbeam",
      "meteor"
    ],
    "e": "The defining clue identifies manhole.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-107",
    "q": "I am associated with clocktower in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "clocktower",
    "o": [
      "clocktower",
      "wind",
      "explosion",
      "echo"
    ],
    "e": "The defining clue identifies clocktower.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-108",
    "q": "I am associated with lighthouse in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "lighthouse",
    "o": [
      "lighthouse",
      "draft",
      "storm",
      "breath"
    ],
    "e": "The defining clue identifies lighthouse.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-109",
    "q": "I am associated with subway in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "subway",
    "o": [
      "subway",
      "current",
      "wave",
      "ripple"
    ],
    "e": "The defining clue identifies subway.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-110",
    "q": "I am associated with statue in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "statue",
    "o": [
      "statue",
      "sleet",
      "snow",
      "gravel"
    ],
    "e": "The defining clue identifies statue.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-111",
    "q": "I am associated with piano in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "piano",
    "o": [
      "piano",
      "reflection",
      "footprint",
      "silhouette"
    ],
    "e": "The defining clue identifies piano.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-112",
    "q": "I am associated with drum in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "drum",
    "o": [
      "drum",
      "whisper",
      "answer",
      "song"
    ],
    "e": "The defining clue identifies drum.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-113",
    "q": "I am associated with flute in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "flute",
    "o": [
      "flute",
      "sunset",
      "aurora",
      "prism"
    ],
    "e": "The defining clue identifies flute.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-114",
    "q": "I am associated with guitar in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "guitar",
    "o": [
      "guitar",
      "smoke",
      "cloud",
      "dust"
    ],
    "e": "The defining clue identifies guitar.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-115",
    "q": "I am associated with palette in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "palette",
    "o": [
      "palette",
      "frost",
      "mist",
      "rain"
    ],
    "e": "The defining clue identifies palette.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-116",
    "q": "I am associated with canvas in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "canvas",
    "o": [
      "canvas",
      "firework",
      "sunbeam",
      "meteor"
    ],
    "e": "The defining clue identifies canvas.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-117",
    "q": "I am associated with metronome in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "metronome",
    "o": [
      "metronome",
      "wind",
      "explosion",
      "echo"
    ],
    "e": "The defining clue identifies metronome.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-118",
    "q": "I am associated with vinyl record in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "vinyl record",
    "o": [
      "vinyl record",
      "draft",
      "storm",
      "breath"
    ],
    "e": "The defining clue identifies vinyl record.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-119",
    "q": "I am associated with mask in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "mask",
    "o": [
      "mask",
      "current",
      "wave",
      "ripple"
    ],
    "e": "The defining clue identifies mask.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-120",
    "q": "I am associated with curtain in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "curtain",
    "o": [
      "curtain",
      "sleet",
      "snow",
      "gravel"
    ],
    "e": "The defining clue identifies curtain.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-121",
    "q": "I am associated with starfish in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "starfish",
    "o": [
      "starfish",
      "reflection",
      "footprint",
      "silhouette"
    ],
    "e": "The defining clue identifies starfish.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-122",
    "q": "I am associated with seahorse in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "seahorse",
    "o": [
      "seahorse",
      "whisper",
      "answer",
      "song"
    ],
    "e": "The defining clue identifies seahorse.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-123",
    "q": "I am associated with octopus in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "octopus",
    "o": [
      "octopus",
      "sunset",
      "aurora",
      "prism"
    ],
    "e": "The defining clue identifies octopus.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-124",
    "q": "I am associated with dolphin in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "dolphin",
    "o": [
      "dolphin",
      "smoke",
      "cloud",
      "dust"
    ],
    "e": "The defining clue identifies dolphin.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-125",
    "q": "I am associated with cloud in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "cloud",
    "o": [
      "cloud",
      "frost",
      "mist",
      "rain"
    ],
    "e": "The defining clue identifies cloud.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-126",
    "q": "I am associated with moon in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "moon",
    "o": [
      "moon",
      "firework",
      "sunbeam",
      "meteor"
    ],
    "e": "The defining clue identifies moon.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-127",
    "q": "I am associated with comet in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "comet",
    "o": [
      "comet",
      "wind",
      "explosion",
      "echo"
    ],
    "e": "The defining clue identifies comet.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-128",
    "q": "I am associated with constellation in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "constellation",
    "o": [
      "constellation",
      "draft",
      "storm",
      "breath"
    ],
    "e": "The defining clue identifies constellation.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-129",
    "q": "I am associated with seashell in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "seashell",
    "o": [
      "seashell",
      "current",
      "wave",
      "ripple"
    ],
    "e": "The defining clue identifies seashell.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-130",
    "q": "I am associated with lighthouse beam in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "lighthouse beam",
    "o": [
      "lighthouse beam",
      "sleet",
      "snow",
      "gravel"
    ],
    "e": "The defining clue identifies lighthouse beam.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-131",
    "q": "I am associated with postage stamp in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "postage stamp",
    "o": [
      "postage stamp",
      "reflection",
      "footprint",
      "silhouette"
    ],
    "e": "The defining clue identifies postage stamp.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-132",
    "q": "I am associated with hole in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "hole",
    "o": [
      "hole",
      "whisper",
      "answer",
      "song"
    ],
    "e": "The defining clue identifies hole.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-133",
    "q": "I am associated with your name in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "your name",
    "o": [
      "your name",
      "sunset",
      "aurora",
      "prism"
    ],
    "e": "The defining clue identifies your name.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-134",
    "q": "I am associated with towel in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "towel",
    "o": [
      "towel",
      "smoke",
      "cloud",
      "dust"
    ],
    "e": "The defining clue identifies towel.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-135",
    "q": "I am associated with map in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "map",
    "o": [
      "map",
      "frost",
      "mist",
      "rain"
    ],
    "e": "The defining clue identifies map.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-136",
    "q": "I am associated with light in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "light",
    "o": [
      "light",
      "firework",
      "sunbeam",
      "meteor"
    ],
    "e": "The defining clue identifies light.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-137",
    "q": "I am associated with coin in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "coin",
    "o": [
      "coin",
      "wind",
      "explosion",
      "echo"
    ],
    "e": "The defining clue identifies coin.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-138",
    "q": "I am associated with cold in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "cold",
    "o": [
      "cold",
      "draft",
      "storm",
      "breath"
    ],
    "e": "The defining clue identifies cold.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-139",
    "q": "I am associated with your age in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "your age",
    "o": [
      "your age",
      "current",
      "wave",
      "ripple"
    ],
    "e": "The defining clue identifies your age.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-140",
    "q": "I am associated with joke in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "joke",
    "o": [
      "joke",
      "sleet",
      "snow",
      "gravel"
    ],
    "e": "The defining clue identifies joke.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-141",
    "q": "I am associated with barber in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "barber",
    "o": [
      "barber",
      "reflection",
      "footprint",
      "silhouette"
    ],
    "e": "The defining clue identifies barber.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-142",
    "q": "I am associated with bald person in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "bald person",
    "o": [
      "bald person",
      "whisper",
      "answer",
      "song"
    ],
    "e": "The defining clue identifies bald person.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-143",
    "q": "I am associated with walking pedestrian in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "walking pedestrian",
    "o": [
      "walking pedestrian",
      "sunset",
      "aurora",
      "prism"
    ],
    "e": "The defining clue identifies walking pedestrian.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-144",
    "q": "I am associated with three generations in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "three generations",
    "o": [
      "three generations",
      "smoke",
      "cloud",
      "dust"
    ],
    "e": "The defining clue identifies three generations.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-145",
    "q": "I am associated with rooster in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "rooster",
    "o": [
      "rooster",
      "frost",
      "mist",
      "rain"
    ],
    "e": "The defining clue identifies rooster.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-146",
    "q": "I am associated with awake question in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "awake question",
    "o": [
      "awake question",
      "firework",
      "sunbeam",
      "meteor"
    ],
    "e": "The defining clue identifies awake question.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-147",
    "q": "I am associated with survivors in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "survivors",
    "o": [
      "survivors",
      "wind",
      "explosion",
      "echo"
    ],
    "e": "The defining clue identifies survivors.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-148",
    "q": "I am associated with Mount Everest in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "Mount Everest",
    "o": [
      "Mount Everest",
      "draft",
      "storm",
      "breath"
    ],
    "e": "The defining clue identifies Mount Everest.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-149",
    "q": "I am associated with all twelve months in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "all twelve months",
    "o": [
      "all twelve months",
      "current",
      "wave",
      "ripple"
    ],
    "e": "The defining clue identifies all twelve months.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-150",
    "q": "I am associated with electric train in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "electric train",
    "o": [
      "electric train",
      "sleet",
      "snow",
      "gravel"
    ],
    "e": "The defining clue identifies electric train.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-151",
    "q": "I am associated with nine sheep in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "nine sheep",
    "o": [
      "nine sheep",
      "reflection",
      "footprint",
      "silhouette"
    ],
    "e": "The defining clue identifies nine sheep.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-152",
    "q": "I am associated with short in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "short",
    "o": [
      "short",
      "whisper",
      "answer",
      "song"
    ],
    "e": "The defining clue identifies short.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-153",
    "q": "I am associated with stone in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "stone",
    "o": [
      "stone",
      "sunset",
      "aurora",
      "prism"
    ],
    "e": "The defining clue identifies stone.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-154",
    "q": "I am associated with incorrectly in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "incorrectly",
    "o": [
      "incorrectly",
      "smoke",
      "cloud",
      "dust"
    ],
    "e": "The defining clue identifies incorrectly.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-155",
    "q": "I am associated with envelope in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "envelope",
    "o": [
      "envelope",
      "frost",
      "mist",
      "rain"
    ],
    "e": "The defining clue identifies envelope.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-156",
    "q": "I am associated with deck of cards in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "deck of cards",
    "o": [
      "deck of cards",
      "firework",
      "sunbeam",
      "meteor"
    ],
    "e": "The defining clue identifies deck of cards.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-157",
    "q": "I am associated with die in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "die",
    "o": [
      "die",
      "wind",
      "explosion",
      "echo"
    ],
    "e": "The defining clue identifies die.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-158",
    "q": "I am associated with river in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "river",
    "o": [
      "river",
      "draft",
      "storm",
      "breath"
    ],
    "e": "The defining clue identifies river.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-159",
    "q": "I am associated with bottle in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "bottle",
    "o": [
      "bottle",
      "current",
      "wave",
      "ripple"
    ],
    "e": "The defining clue identifies bottle.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-160",
    "q": "I am associated with future in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "future",
    "o": [
      "future",
      "sleet",
      "snow",
      "gravel"
    ],
    "e": "The defining clue identifies future.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-161",
    "q": "I am associated with battery in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "battery",
    "o": [
      "battery",
      "reflection",
      "footprint",
      "silhouette"
    ],
    "e": "The defining clue identifies battery.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-162",
    "q": "I am associated with coat of paint in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "coat of paint",
    "o": [
      "coat of paint",
      "whisper",
      "answer",
      "song"
    ],
    "e": "The defining clue identifies coat of paint.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-163",
    "q": "I am associated with right elbow in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "right elbow",
    "o": [
      "right elbow",
      "sunset",
      "aurora",
      "prism"
    ],
    "e": "The defining clue identifies right elbow.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-164",
    "q": "I am associated with potato in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "potato",
    "o": [
      "potato",
      "smoke",
      "cloud",
      "dust"
    ],
    "e": "The defining clue identifies potato.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-165",
    "q": "I am associated with corn in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "corn",
    "o": [
      "corn",
      "frost",
      "mist",
      "rain"
    ],
    "e": "The defining clue identifies corn.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-166",
    "q": "I am associated with shoe in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "shoe",
    "o": [
      "shoe",
      "firework",
      "sunbeam",
      "meteor"
    ],
    "e": "The defining clue identifies shoe.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-167",
    "q": "I am associated with tooth in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "tooth",
    "o": [
      "tooth",
      "wind",
      "explosion",
      "echo"
    ],
    "e": "The defining clue identifies tooth.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-168",
    "q": "I am associated with book in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "book",
    "o": [
      "book",
      "draft",
      "storm",
      "breath"
    ],
    "e": "The defining clue identifies book.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-169",
    "q": "I am associated with tennis ball in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "tennis ball",
    "o": [
      "tennis ball",
      "current",
      "wave",
      "ripple"
    ],
    "e": "The defining clue identifies tennis ball.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-170",
    "q": "I am associated with conclusion in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "conclusion",
    "o": [
      "conclusion",
      "sleet",
      "snow",
      "gravel"
    ],
    "e": "The defining clue identifies conclusion.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-171",
    "q": "I am associated with bed in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "bed",
    "o": [
      "bed",
      "reflection",
      "footprint",
      "silhouette"
    ],
    "e": "The defining clue identifies bed.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-172",
    "q": "I am associated with noise in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "noise",
    "o": [
      "noise",
      "whisper",
      "answer",
      "song"
    ],
    "e": "The defining clue identifies noise.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-173",
    "q": "I am associated with road in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "road",
    "o": [
      "road",
      "sunset",
      "aurora",
      "prism"
    ],
    "e": "The defining clue identifies road.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-174",
    "q": "I am associated with artichoke in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "artichoke",
    "o": [
      "artichoke",
      "smoke",
      "cloud",
      "dust"
    ],
    "e": "The defining clue identifies artichoke.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-175",
    "q": "I am associated with feather in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "feather",
    "o": [
      "feather",
      "frost",
      "mist",
      "rain"
    ],
    "e": "The defining clue identifies feather.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-176",
    "q": "I am associated with direction in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "direction",
    "o": [
      "direction",
      "firework",
      "sunbeam",
      "meteor"
    ],
    "e": "The defining clue identifies direction.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-177",
    "q": "I am associated with knowledge in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "knowledge",
    "o": [
      "knowledge",
      "wind",
      "explosion",
      "echo"
    ],
    "e": "The defining clue identifies knowledge.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-178",
    "q": "I am associated with circle in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "circle",
    "o": [
      "circle",
      "draft",
      "storm",
      "breath"
    ],
    "e": "The defining clue identifies circle.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-179",
    "q": "I am associated with letter M in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "letter M",
    "o": [
      "letter M",
      "current",
      "wave",
      "ripple"
    ],
    "e": "The defining clue identifies letter M.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-180",
    "q": "I am associated with teapot in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "teapot",
    "o": [
      "teapot",
      "sleet",
      "snow",
      "gravel"
    ],
    "e": "The defining clue identifies teapot.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-181",
    "q": "I am associated with garbage truck in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "garbage truck",
    "o": [
      "garbage truck",
      "reflection",
      "footprint",
      "silhouette"
    ],
    "e": "The defining clue identifies garbage truck.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-182",
    "q": "I am associated with your word in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "your word",
    "o": [
      "your word",
      "whisper",
      "answer",
      "song"
    ],
    "e": "The defining clue identifies your word.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-183",
    "q": "I am associated with carpet in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "carpet",
    "o": [
      "carpet",
      "sunset",
      "aurora",
      "prism"
    ],
    "e": "The defining clue identifies carpet.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-184",
    "q": "I am associated with tree bark in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "tree bark",
    "o": [
      "tree bark",
      "smoke",
      "cloud",
      "dust"
    ],
    "e": "The defining clue identifies tree bark.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-185",
    "q": "I am associated with Saturn in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "Saturn",
    "o": [
      "Saturn",
      "frost",
      "mist",
      "rain"
    ],
    "e": "The defining clue identifies Saturn.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-186",
    "q": "I am associated with mushroom in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "mushroom",
    "o": [
      "mushroom",
      "firework",
      "sunbeam",
      "meteor"
    ],
    "e": "The defining clue identifies mushroom.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-187",
    "q": "I am associated with echo in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "echo",
    "o": [
      "echo",
      "wind",
      "explosion"
    ],
    "e": "The defining clue identifies echo.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-188",
    "q": "I am associated with nail in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "nail",
    "o": [
      "nail",
      "draft",
      "storm",
      "breath"
    ],
    "e": "The defining clue identifies nail.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-189",
    "q": "I am associated with sponge in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "sponge",
    "o": [
      "sponge",
      "current",
      "wave",
      "ripple"
    ],
    "e": "The defining clue identifies sponge.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-190",
    "q": "I am associated with egg in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "egg",
    "o": [
      "egg",
      "sleet",
      "snow",
      "gravel"
    ],
    "e": "The defining clue identifies egg.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-191",
    "q": "I am associated with clock in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "clock",
    "o": [
      "clock",
      "reflection",
      "footprint",
      "silhouette"
    ],
    "e": "The defining clue identifies clock.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-192",
    "q": "I am associated with tomorrow in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "tomorrow",
    "o": [
      "tomorrow",
      "whisper",
      "answer",
      "song"
    ],
    "e": "The defining clue identifies tomorrow.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-193",
    "q": "I am associated with pride in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "pride",
    "o": [
      "pride",
      "sunset",
      "aurora",
      "prism"
    ],
    "e": "The defining clue identifies pride.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-194",
    "q": "I am associated with canal in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "canal",
    "o": [
      "canal",
      "smoke",
      "cloud",
      "dust"
    ],
    "e": "The defining clue identifies canal.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-195",
    "q": "I am associated with temperature in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "temperature",
    "o": [
      "temperature",
      "frost",
      "mist",
      "rain"
    ],
    "e": "The defining clue identifies temperature.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-196",
    "q": "I am associated with your turn in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "your turn",
    "o": [
      "your turn",
      "firework",
      "sunbeam",
      "meteor"
    ],
    "e": "The defining clue identifies your turn.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-197",
    "q": "I am associated with temper in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "temper",
    "o": [
      "temper",
      "wind",
      "explosion",
      "echo"
    ],
    "e": "The defining clue identifies temper.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-198",
    "q": "I am associated with blackboard in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "blackboard",
    "o": [
      "blackboard",
      "draft",
      "storm",
      "breath"
    ],
    "e": "The defining clue identifies blackboard.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-199",
    "q": "I am associated with penny in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "penny",
    "o": [
      "penny",
      "current",
      "wave",
      "ripple"
    ],
    "e": "The defining clue identifies penny.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-200",
    "q": "I am associated with cloud in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "cloud",
    "o": [
      "cloud",
      "sleet",
      "snow",
      "gravel"
    ],
    "e": "The defining clue identifies cloud.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-201",
    "q": "I am associated with tree trunk in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "tree trunk",
    "o": [
      "tree trunk",
      "reflection",
      "footprint",
      "silhouette"
    ],
    "e": "The defining clue identifies tree trunk.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-202",
    "q": "I am associated with rubber band in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "rubber band",
    "o": [
      "rubber band",
      "whisper",
      "answer",
      "song"
    ],
    "e": "The defining clue identifies rubber band.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-203",
    "q": "I am associated with snowman in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "snowman",
    "o": [
      "snowman",
      "sunset",
      "aurora",
      "prism"
    ],
    "e": "The defining clue identifies snowman.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-204",
    "q": "I am associated with umbrella in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "umbrella",
    "o": [
      "umbrella",
      "smoke",
      "cloud",
      "dust"
    ],
    "e": "The defining clue identifies umbrella.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-205",
    "q": "I am associated with letter R in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "letter R",
    "o": [
      "letter R",
      "frost",
      "mist",
      "rain"
    ],
    "e": "The defining clue identifies letter R.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-206",
    "q": "I am associated with letter in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "letter",
    "o": [
      "letter",
      "firework",
      "sunbeam",
      "meteor"
    ],
    "e": "The defining clue identifies letter.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-207",
    "q": "I am associated with time in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "time",
    "o": [
      "time",
      "wind",
      "explosion",
      "echo"
    ],
    "e": "The defining clue identifies time.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-208",
    "q": "I am associated with river in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "river",
    "o": [
      "river",
      "draft",
      "storm",
      "breath"
    ],
    "e": "The defining clue identifies river.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-209",
    "q": "I am associated with tennis serve in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "tennis serve",
    "o": [
      "tennis serve",
      "current",
      "wave",
      "ripple"
    ],
    "e": "The defining clue identifies tennis serve.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-210",
    "q": "I am associated with fingernails in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "fingernails",
    "o": [
      "fingernails",
      "sleet",
      "snow",
      "gravel"
    ],
    "e": "The defining clue identifies fingernails.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-211",
    "q": "I am associated with keyboard in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "keyboard",
    "o": [
      "keyboard",
      "reflection",
      "footprint",
      "silhouette"
    ],
    "e": "The defining clue identifies keyboard.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-212",
    "q": "I am associated with staircase in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "staircase",
    "o": [
      "staircase",
      "whisper",
      "answer",
      "song"
    ],
    "e": "The defining clue identifies staircase.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-213",
    "q": "I am associated with riverbank in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "riverbank",
    "o": [
      "riverbank",
      "sunset",
      "aurora",
      "prism"
    ],
    "e": "The defining clue identifies riverbank.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-214",
    "q": "I am associated with zipper in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "zipper",
    "o": [
      "zipper",
      "smoke",
      "cloud",
      "dust"
    ],
    "e": "The defining clue identifies zipper.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-215",
    "q": "I am associated with camera in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "camera",
    "o": [
      "camera",
      "frost",
      "mist",
      "rain"
    ],
    "e": "The defining clue identifies camera.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-216",
    "q": "I am associated with stamp in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "stamp",
    "o": [
      "stamp",
      "firework",
      "sunbeam",
      "meteor"
    ],
    "e": "The defining clue identifies stamp.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-217",
    "q": "I am associated with shadow in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "shadow",
    "o": [
      "shadow",
      "wind",
      "explosion",
      "echo"
    ],
    "e": "The defining clue identifies shadow.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-218",
    "q": "I am associated with bookcase in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "bookcase",
    "o": [
      "bookcase",
      "draft",
      "storm",
      "breath"
    ],
    "e": "The defining clue identifies bookcase.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-219",
    "q": "I am associated with window in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "window",
    "o": [
      "window",
      "current",
      "wave",
      "ripple"
    ],
    "e": "The defining clue identifies window.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-220",
    "q": "I am associated with lock in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "lock",
    "o": [
      "lock",
      "sleet",
      "snow",
      "gravel"
    ],
    "e": "The defining clue identifies lock.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-221",
    "q": "I am associated with bridge in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "bridge",
    "o": [
      "bridge",
      "reflection",
      "footprint",
      "silhouette"
    ],
    "e": "The defining clue identifies bridge.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-222",
    "q": "I am associated with nest in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "nest",
    "o": [
      "nest",
      "whisper",
      "answer",
      "song"
    ],
    "e": "The defining clue identifies nest.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-223",
    "q": "I am associated with footprint in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "footprint",
    "o": [
      "footprint",
      "sunset",
      "aurora",
      "prism"
    ],
    "e": "The defining clue identifies footprint.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-224",
    "q": "I am associated with bookmark in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "bookmark",
    "o": [
      "bookmark",
      "smoke",
      "cloud",
      "dust"
    ],
    "e": "The defining clue identifies bookmark.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-225",
    "q": "I am associated with whistle in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "whistle",
    "o": [
      "whistle",
      "frost",
      "mist",
      "rain"
    ],
    "e": "The defining clue identifies whistle.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-226",
    "q": "I am associated with lighthouse in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "lighthouse",
    "o": [
      "lighthouse",
      "firework",
      "sunbeam",
      "meteor"
    ],
    "e": "The defining clue identifies lighthouse.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-227",
    "q": "I am associated with planet in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "planet",
    "o": [
      "planet",
      "wind",
      "explosion",
      "echo"
    ],
    "e": "The defining clue identifies planet.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-228",
    "q": "I am associated with mirror in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "mirror",
    "o": [
      "mirror",
      "draft",
      "storm",
      "breath"
    ],
    "e": "The defining clue identifies mirror.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-229",
    "q": "I am associated with key in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "key",
    "o": [
      "key",
      "current",
      "wave",
      "ripple"
    ],
    "e": "The defining clue identifies key.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-230",
    "q": "I am associated with compass in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "compass",
    "o": [
      "compass",
      "sleet",
      "snow",
      "gravel"
    ],
    "e": "The defining clue identifies compass.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-231",
    "q": "I am associated with sponge in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "sponge",
    "o": [
      "sponge",
      "reflection",
      "footprint",
      "silhouette"
    ],
    "e": "The defining clue identifies sponge.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-232",
    "q": "I am associated with glove in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "glove",
    "o": [
      "glove",
      "whisper",
      "answer",
      "song"
    ],
    "e": "The defining clue identifies glove.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-233",
    "q": "I am associated with bottle cap in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "bottle cap",
    "o": [
      "bottle cap",
      "sunset",
      "aurora",
      "prism"
    ],
    "e": "The defining clue identifies bottle cap.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-234",
    "q": "I am associated with shoe tongue in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "shoe tongue",
    "o": [
      "shoe tongue",
      "smoke",
      "cloud",
      "dust"
    ],
    "e": "The defining clue identifies shoe tongue.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-235",
    "q": "I am associated with tooth crown in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "tooth crown",
    "o": [
      "tooth crown",
      "frost",
      "mist",
      "rain"
    ],
    "e": "The defining clue identifies tooth crown.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-236",
    "q": "I am associated with book spine in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "book spine",
    "o": [
      "book spine",
      "firework",
      "sunbeam",
      "meteor"
    ],
    "e": "The defining clue identifies book spine.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-237",
    "q": "I am associated with river mouth in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "river mouth",
    "o": [
      "river mouth",
      "wind",
      "explosion",
      "echo"
    ],
    "e": "The defining clue identifies river mouth.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-238",
    "q": "I am associated with clock face in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "clock face",
    "o": [
      "clock face",
      "draft",
      "storm",
      "breath"
    ],
    "e": "The defining clue identifies clock face.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-239",
    "q": "I am associated with tree ring in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "tree ring",
    "o": [
      "tree ring",
      "current",
      "wave",
      "ripple"
    ],
    "e": "The defining clue identifies tree ring.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-240",
    "q": "I am associated with paper clip in a familiar saying or everyday situation; the clue points to this exact thing. What am I?",
    "a": "paper clip",
    "o": [
      "paper clip",
      "sleet",
      "snow",
      "gravel"
    ],
    "e": "The defining clue identifies paper clip.",
    "topic": "verbal"
  },
  {
    "id": "riddle-corner-241",
    "q": "A number multiplied by 2 and then increased by 5 gives 11. Find the number.",
    "a": "3",
    "o": [
      "3",
      "2",
      "4",
      "5"
    ],
    "e": "Undo the addition and divide: the original number is 3.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-242",
    "q": "A number multiplied by 3 and then increased by 6 gives 18. Find the number.",
    "a": "4",
    "o": [
      "4",
      "3",
      "5",
      "6"
    ],
    "e": "Undo the addition and divide: the original number is 4.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-243",
    "q": "A number multiplied by 4 and then increased by 7 gives 27. Find the number.",
    "a": "5",
    "o": [
      "5",
      "4",
      "6",
      "7"
    ],
    "e": "Undo the addition and divide: the original number is 5.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-244",
    "q": "A number multiplied by 5 and then increased by 8 gives 38. Find the number.",
    "a": "6",
    "o": [
      "6",
      "5",
      "7",
      "8"
    ],
    "e": "Undo the addition and divide: the original number is 6.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-245",
    "q": "A number multiplied by 6 and then increased by 9 gives 51. Find the number.",
    "a": "7",
    "o": [
      "7",
      "6",
      "8",
      "9"
    ],
    "e": "Undo the addition and divide: the original number is 7.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-246",
    "q": "A number multiplied by 7 and then increased by 10 gives 66. Find the number.",
    "a": "8",
    "o": [
      "8",
      "7",
      "9",
      "10"
    ],
    "e": "Undo the addition and divide: the original number is 8.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-247",
    "q": "A number multiplied by 8 and then increased by 11 gives 83. Find the number.",
    "a": "9",
    "o": [
      "9",
      "8",
      "10",
      "11"
    ],
    "e": "Undo the addition and divide: the original number is 9.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-248",
    "q": "A number multiplied by 9 and then increased by 12 gives 102. Find the number.",
    "a": "10",
    "o": [
      "10",
      "9",
      "11",
      "12"
    ],
    "e": "Undo the addition and divide: the original number is 10.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-249",
    "q": "A number multiplied by 10 and then increased by 13 gives 123. Find the number.",
    "a": "11",
    "o": [
      "11",
      "10",
      "12",
      "13"
    ],
    "e": "Undo the addition and divide: the original number is 11.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-250",
    "q": "A number multiplied by 11 and then increased by 14 gives 146. Find the number.",
    "a": "12",
    "o": [
      "12",
      "11",
      "13",
      "14"
    ],
    "e": "Undo the addition and divide: the original number is 12.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-251",
    "q": "What is the next number in this sequence: 1, 2, 3, 4, ...?",
    "a": "5",
    "o": [
      "5",
      "6",
      "4",
      "10"
    ],
    "e": "The sequence increases by 1 each time.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-252",
    "q": "What is the next number in this sequence: 2, 4, 6, 8, ...?",
    "a": "10",
    "o": [
      "10",
      "12",
      "8",
      "15"
    ],
    "e": "The sequence increases by 2 each time.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-253",
    "q": "What is the next number in this sequence: 3, 6, 9, 12, ...?",
    "a": "15",
    "o": [
      "15",
      "18",
      "12",
      "20"
    ],
    "e": "The sequence increases by 3 each time.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-254",
    "q": "What is the next number in this sequence: 4, 8, 12, 16, ...?",
    "a": "20",
    "o": [
      "20",
      "24",
      "16",
      "25"
    ],
    "e": "The sequence increases by 4 each time.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-255",
    "q": "What is the next number in this sequence: 5, 10, 15, 20, ...?",
    "a": "25",
    "o": [
      "25",
      "30",
      "20",
      "30"
    ],
    "e": "The sequence increases by 5 each time.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-256",
    "q": "What is the next number in this sequence: 6, 12, 18, 24, ...?",
    "a": "30",
    "o": [
      "30",
      "36",
      "24",
      "35"
    ],
    "e": "The sequence increases by 6 each time.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-257",
    "q": "What is the next number in this sequence: 7, 14, 21, 28, ...?",
    "a": "35",
    "o": [
      "35",
      "42",
      "28",
      "40"
    ],
    "e": "The sequence increases by 7 each time.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-258",
    "q": "What is the next number in this sequence: 8, 16, 24, 32, ...?",
    "a": "40",
    "o": [
      "40",
      "48",
      "32",
      "45"
    ],
    "e": "The sequence increases by 8 each time.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-259",
    "q": "What is the next number in this sequence: 9, 18, 27, 36, ...?",
    "a": "45",
    "o": [
      "45",
      "54",
      "36",
      "50"
    ],
    "e": "The sequence increases by 9 each time.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-260",
    "q": "What is the next number in this sequence: 10, 20, 30, 40, ...?",
    "a": "50",
    "o": [
      "50",
      "60",
      "40",
      "55"
    ],
    "e": "The sequence increases by 10 each time.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-261",
    "q": "A rectangle is 4 cm long and 2 cm wide. What is its area?",
    "a": "8",
    "o": [
      "8",
      "6",
      "12",
      "10"
    ],
    "e": "Area is length multiplied by width.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-262",
    "q": "A rectangle is 5 cm long and 3 cm wide. What is its area?",
    "a": "15",
    "o": [
      "15",
      "12",
      "20",
      "18"
    ],
    "e": "Area is length multiplied by width.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-263",
    "q": "A rectangle is 6 cm long and 4 cm wide. What is its area?",
    "a": "24",
    "o": [
      "24",
      "20",
      "30",
      "28"
    ],
    "e": "Area is length multiplied by width.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-264",
    "q": "A rectangle is 7 cm long and 5 cm wide. What is its area?",
    "a": "35",
    "o": [
      "35",
      "30",
      "42",
      "40"
    ],
    "e": "Area is length multiplied by width.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-265",
    "q": "A rectangle is 8 cm long and 6 cm wide. What is its area?",
    "a": "48",
    "o": [
      "48",
      "42",
      "56",
      "54"
    ],
    "e": "Area is length multiplied by width.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-266",
    "q": "A rectangle is 9 cm long and 7 cm wide. What is its area?",
    "a": "63",
    "o": [
      "63",
      "56",
      "72",
      "70"
    ],
    "e": "Area is length multiplied by width.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-267",
    "q": "A rectangle is 10 cm long and 8 cm wide. What is its area?",
    "a": "80",
    "o": [
      "80",
      "72",
      "90",
      "88"
    ],
    "e": "Area is length multiplied by width.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-268",
    "q": "A rectangle is 11 cm long and 9 cm wide. What is its area?",
    "a": "99",
    "o": [
      "99",
      "90",
      "110",
      "108"
    ],
    "e": "Area is length multiplied by width.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-269",
    "q": "A rectangle is 12 cm long and 10 cm wide. What is its area?",
    "a": "120",
    "o": [
      "120",
      "110",
      "132",
      "130"
    ],
    "e": "Area is length multiplied by width.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-270",
    "q": "A rectangle is 13 cm long and 11 cm wide. What is its area?",
    "a": "143",
    "o": [
      "143",
      "132",
      "156",
      "154"
    ],
    "e": "Area is length multiplied by width.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-271",
    "q": "A price of 40 is reduced by 10%. What is the new price?",
    "a": "36",
    "o": [
      "36",
      "32",
      "35",
      "44"
    ],
    "e": "Ten percent is 4; subtract it from the original price.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-272",
    "q": "A price of 50 is reduced by 10%. What is the new price?",
    "a": "45",
    "o": [
      "45",
      "40",
      "45",
      "55"
    ],
    "e": "Ten percent is 5; subtract it from the original price.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-273",
    "q": "A price of 60 is reduced by 10%. What is the new price?",
    "a": "54",
    "o": [
      "54",
      "48",
      "55",
      "66"
    ],
    "e": "Ten percent is 6; subtract it from the original price.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-274",
    "q": "A price of 70 is reduced by 10%. What is the new price?",
    "a": "63",
    "o": [
      "63",
      "56",
      "65",
      "77"
    ],
    "e": "Ten percent is 7; subtract it from the original price.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-275",
    "q": "A price of 80 is reduced by 10%. What is the new price?",
    "a": "72",
    "o": [
      "72",
      "64",
      "75",
      "88"
    ],
    "e": "Ten percent is 8; subtract it from the original price.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-276",
    "q": "A price of 90 is reduced by 10%. What is the new price?",
    "a": "81",
    "o": [
      "81",
      "72",
      "85",
      "99"
    ],
    "e": "Ten percent is 9; subtract it from the original price.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-277",
    "q": "A price of 100 is reduced by 10%. What is the new price?",
    "a": "90",
    "o": [
      "90",
      "80",
      "95",
      "110"
    ],
    "e": "Ten percent is 10; subtract it from the original price.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-278",
    "q": "A price of 110 is reduced by 10%. What is the new price?",
    "a": "99",
    "o": [
      "99",
      "88",
      "105",
      "121"
    ],
    "e": "Ten percent is 11; subtract it from the original price.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-279",
    "q": "A price of 120 is reduced by 10%. What is the new price?",
    "a": "108",
    "o": [
      "108",
      "96",
      "115",
      "132"
    ],
    "e": "Ten percent is 12; subtract it from the original price.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-280",
    "q": "A price of 130 is reduced by 10%. What is the new price?",
    "a": "117",
    "o": [
      "117",
      "104",
      "125",
      "143"
    ],
    "e": "Ten percent is 13; subtract it from the original price.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-281",
    "q": "There are 3 bags with 4 marbles in each. How many marbles altogether?",
    "a": "12",
    "o": [
      "12",
      "7",
      "15",
      "8"
    ],
    "e": "Multiply the number of bags by the marbles in each bag.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-282",
    "q": "There are 4 bags with 5 marbles in each. How many marbles altogether?",
    "a": "20",
    "o": [
      "20",
      "9",
      "24",
      "15"
    ],
    "e": "Multiply the number of bags by the marbles in each bag.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-283",
    "q": "There are 5 bags with 6 marbles in each. How many marbles altogether?",
    "a": "30",
    "o": [
      "30",
      "11",
      "35",
      "24"
    ],
    "e": "Multiply the number of bags by the marbles in each bag.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-284",
    "q": "There are 6 bags with 7 marbles in each. How many marbles altogether?",
    "a": "42",
    "o": [
      "42",
      "13",
      "48",
      "35"
    ],
    "e": "Multiply the number of bags by the marbles in each bag.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-285",
    "q": "There are 7 bags with 8 marbles in each. How many marbles altogether?",
    "a": "56",
    "o": [
      "56",
      "15",
      "63",
      "48"
    ],
    "e": "Multiply the number of bags by the marbles in each bag.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-286",
    "q": "There are 8 bags with 9 marbles in each. How many marbles altogether?",
    "a": "72",
    "o": [
      "72",
      "17",
      "80",
      "63"
    ],
    "e": "Multiply the number of bags by the marbles in each bag.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-287",
    "q": "There are 9 bags with 10 marbles in each. How many marbles altogether?",
    "a": "90",
    "o": [
      "90",
      "19",
      "99",
      "80"
    ],
    "e": "Multiply the number of bags by the marbles in each bag.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-288",
    "q": "There are 10 bags with 11 marbles in each. How many marbles altogether?",
    "a": "110",
    "o": [
      "110",
      "21",
      "120",
      "99"
    ],
    "e": "Multiply the number of bags by the marbles in each bag.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-289",
    "q": "There are 11 bags with 12 marbles in each. How many marbles altogether?",
    "a": "132",
    "o": [
      "132",
      "23",
      "143",
      "120"
    ],
    "e": "Multiply the number of bags by the marbles in each bag.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-290",
    "q": "There are 12 bags with 13 marbles in each. How many marbles altogether?",
    "a": "156",
    "o": [
      "156",
      "25",
      "168",
      "143"
    ],
    "e": "Multiply the number of bags by the marbles in each bag.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-291",
    "q": "A journey of 36 km is completed in 3 hours. What is the average speed?",
    "a": "12",
    "o": [
      "12",
      "10",
      "14",
      "15"
    ],
    "e": "Average speed is distance divided by time.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-292",
    "q": "A journey of 48 km is completed in 4 hours. What is the average speed?",
    "a": "12",
    "o": [
      "12",
      "10",
      "14",
      "15"
    ],
    "e": "Average speed is distance divided by time.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-293",
    "q": "A journey of 60 km is completed in 5 hours. What is the average speed?",
    "a": "12",
    "o": [
      "12",
      "10",
      "14",
      "15"
    ],
    "e": "Average speed is distance divided by time.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-294",
    "q": "A journey of 72 km is completed in 6 hours. What is the average speed?",
    "a": "12",
    "o": [
      "12",
      "10",
      "14",
      "15"
    ],
    "e": "Average speed is distance divided by time.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-295",
    "q": "A journey of 84 km is completed in 7 hours. What is the average speed?",
    "a": "12",
    "o": [
      "12",
      "10",
      "14",
      "15"
    ],
    "e": "Average speed is distance divided by time.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-296",
    "q": "A journey of 96 km is completed in 8 hours. What is the average speed?",
    "a": "12",
    "o": [
      "12",
      "10",
      "14",
      "15"
    ],
    "e": "Average speed is distance divided by time.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-297",
    "q": "A journey of 108 km is completed in 9 hours. What is the average speed?",
    "a": "12",
    "o": [
      "12",
      "10",
      "14",
      "15"
    ],
    "e": "Average speed is distance divided by time.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-298",
    "q": "A journey of 120 km is completed in 10 hours. What is the average speed?",
    "a": "12",
    "o": [
      "12",
      "10",
      "14",
      "15"
    ],
    "e": "Average speed is distance divided by time.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-299",
    "q": "A journey of 132 km is completed in 11 hours. What is the average speed?",
    "a": "12",
    "o": [
      "12",
      "10",
      "14",
      "15"
    ],
    "e": "Average speed is distance divided by time.",
    "topic": "numerical"
  },
  {
    "id": "riddle-corner-300",
    "q": "A journey of 144 km is completed in 12 hours. What is the average speed?",
    "a": "12",
    "o": [
      "12",
      "10",
      "14",
      "15"
    ],
    "e": "Average speed is distance divided by time.",
    "topic": "numerical"
  }
];
