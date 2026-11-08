"use client";

import { useEffect, useState } from "react";
import GameQuotaPopup from "@/components/GameQuotaPopup";

type WordPair = { id: string; title: string; difference: string; examples: { label: string; sentence: string }[] };

// The first entry is the sample supplied for the section layout.
// New entries can be appended here as the word-pair batches are provided.
const WORD_PAIRS: WordPair[] = [
  {
    "id": "affect-effect",
    "title": "Affect and effect",
    "difference": "\"Affect\" is generally a verb meaning to influence or produce a change in something. \"Effect\" is usually a noun meaning the result or outcome of that change.",
    "examples": [
      {
        "label": "Affect",
        "sentence": "Lack of sleep can negatively affect your focus during the day."
      },
      {
        "label": "Effect",
        "sentence": "The new study showed a positive effect on student grades."
      }
    ]
  },
  {
    "id": "accept-except",
    "title": "Accept and except",
    "difference": "\"Accept\" is a verb meaning to receive, agree to, or take something offered. \"Except\" is usually a preposition or conjunction meaning excluding or other than.",
    "examples": [
      {
        "label": "Accept",
        "sentence": "She was thrilled to accept the job offer after the interview."
      },
      {
        "label": "Except",
        "sentence": "Everyone attended the seminar except for John, who was feeling unwell."
      }
    ]
  },
  {
    "id": "advice-advise",
    "title": "Advice and advise",
    "difference": "\"Advice\" is a noun meaning guidance or recommendations given about what someone should do. \"Advise\" is a verb meaning to give counsel, recommendations, or guidance.",
    "examples": [
      {
        "label": "Advice",
        "sentence": "My mentor gave me valuable advice on how to manage my time efficiently."
      },
      {
        "label": "Advise",
        "sentence": "The financial expert will advise you on the best investment strategies."
      }
    ]
  },
  {
    "id": "allusion-illusion",
    "title": "Allusion and illusion",
    "difference": "\"Allusion\" is a noun meaning an indirect reference or hint to something. \"Illusion\" is a noun meaning a false impression, deceptive appearance, or optical trick.",
    "examples": [
      {
        "label": "Allusion",
        "sentence": "The author's latest novel contains a subtle allusion to classical mythology."
      },
      {
        "label": "Illusion",
        "sentence": "The stage magician created an incredible illusion of floating in mid-air."
      }
    ]
  },
  {
    "id": "amoral-immoral",
    "title": "Amoral and immoral",
    "difference": "\"Amoral\" is an adjective meaning completely lacking any moral sense, or indifferent to right and wrong. \"Immoral\" is an adjective meaning actively violating moral principles or behaving in a way that is considered evil or wrong.",
    "examples": [
      {
        "label": "Amoral",
        "sentence": "Newborn babies are considered amoral because they lack the cognitive ability to understand ethics."
      },
      {
        "label": "Immoral",
        "sentence": "Stealing money from a charity organization is widely regarded as immoral."
      }
    ]
  },
  {
    "id": "appraise-apprise",
    "title": "Appraise and apprise",
    "difference": "\"Appraise\" is a verb meaning to assess, evaluate, or estimate the value or quality of something. \"Apprise\" is a verb meaning to inform, notify, or give notice to someone.",
    "examples": [
      {
        "label": "Appraise",
        "sentence": "The certified expert came to appraise the antique painting before the auction."
      },
      {
        "label": "Apprise",
        "sentence": "Please apprise the project manager of any major changes in the schedule."
      }
    ]
  },
  {
    "id": "assent-ascent",
    "title": "Assent and ascent",
    "difference": "\"Assent\" is a noun or verb meaning official approval, agreement, or consent. \"Ascent\" is a noun meaning the act of rising, climbing, or moving upward.",
    "examples": [
      {
        "label": "Assent",
        "sentence": "The board of directors gave their assent to proceed with the merger."
      },
      {
        "label": "Ascent",
        "sentence": "The steep mountain ascent proved exhausting for the hikers."
      }
    ]
  },
  {
    "id": "averse-adverse",
    "title": "Averse and adverse",
    "difference": "\"Averse\" is an adjective meaning having a strong dislike, opposition, or reluctance toward something. \"Adverse\" is an adjective meaning harmful, unfavorable, or acting against one's interests.",
    "examples": [
      {
        "label": "Averse",
        "sentence": "He is entirely averse to taking unnecessary risks with his investments."
      },
      {
        "label": "Adverse",
        "sentence": "The flight was canceled due to adverse weather conditions."
      }
    ]
  },
  {
    "id": "bare-bear",
    "title": "Bare and bear",
    "difference": "\"Bare\" is an adjective or verb meaning uncovered, naked, or empty. \"Bear\" is a verb meaning to carry, endure, or support, or a noun referring to the large wild animal.",
    "examples": [
      {
        "label": "Bare",
        "sentence": "Walking on the hot sand with bare feet can be quite painful."
      },
      {
        "label": "Bear",
        "sentence": "She had to bear a lot of pressure during the final exam week."
      }
    ]
  },
  {
    "id": "beside-besides",
    "title": "Beside and besides",
    "difference": "\"Beside\" is a preposition meaning next to or alongside someone or something. \"Besides\" is a preposition or adverb meaning in addition to, or apart from.",
    "examples": [
      {
        "label": "Beside",
        "sentence": "She sat down beside her best friend on the train."
      },
      {
        "label": "Besides",
        "sentence": "Besides French, he is also fluent in Spanish and German."
      }
    ]
  },
  {
    "id": "board-bored",
    "title": "Board and bored",
    "difference": "\"Board\" is a noun meaning a long piece of wood or a governing group of officials, or a verb meaning to get onto a vehicle. \"Bored\" is an adjective meaning feeling weary and restless through lack of interest.",
    "examples": [
      {
        "label": "Board",
        "sentence": "The carpenter cut the wooden board to fit the window frame."
      },
      {
        "label": "Bored",
        "sentence": "The students grew bored during the excessively long lecture."
      }
    ]
  },
  {
    "id": "breath-breathe",
    "title": "Breath and breathe",
    "difference": "\"Breath\" is a noun meaning the air inhaled and exhaled from the lungs. \"Breathe\" is a verb meaning the physical action of taking air in and out.",
    "examples": [
      {
        "label": "Breath",
        "sentence": "Take a deep breath and try to relax before your presentation."
      },
      {
        "label": "Breathe",
        "sentence": "It is important to remember to breathe deeply during meditation."
      }
    ]
  },
  {
    "id": "capital-capitol",
    "title": "Capital and capitol",
    "difference": "\"Capital\" is a noun or adjective referring to a city housing a government, wealth/money, or uppercase letters. \"Capitol\" is a noun specifically referring to a building where a legislative body meets.",
    "examples": [
      {
        "label": "Capital",
        "sentence": "Paris is the capital city of France."
      },
      {
        "label": "Capitol",
        "sentence": "Protesters gathered outside the state capitol to voice their concerns."
      }
    ]
  },
  {
    "id": "censor-censure",
    "title": "Censor and censure",
    "difference": "\"Censor\" is a verb or noun meaning to suppress or examine media to remove objectionable content. \"Censure\" is a verb or noun meaning formal expression of severe disapproval or harsh criticism.",
    "examples": [
      {
        "label": "Censor",
        "sentence": "The government tried to censor sensitive political news articles."
      },
      {
        "label": "Censure",
        "sentence": "The committee voted to censure the politician for ethical misconduct."
      }
    ]
  },
  {
    "id": "cite-sight-site",
    "title": "Cite, sight, and site",
    "difference": "\"Cite\" is a verb meaning to quote a passage, book, or author as evidence. \"Sight\" is a noun or verb related to vision or seeing. \"Site\" is a noun meaning a location or place where something is situated.",
    "examples": [
      {
        "label": "Cite",
        "sentence": "You must cite your sources properly in an academic research paper."
      },
      {
        "label": "Sight",
        "sentence": "Losing his sight did not stop him from writing brilliant poetry."
      },
      {
        "label": "Site",
        "sentence": "The old warehouse was chosen as the site for the new community center."
      }
    ]
  },
  {
    "id": "complement-compliment",
    "title": "Complement and compliment",
    "difference": "\"Complement\" is a noun or verb meaning something that completes, enhances, or goes well with something else. \"Compliment\" is a noun or verb meaning a polite expression of praise or admiration.",
    "examples": [
      {
        "label": "Complement",
        "sentence": "The rich red wine proved to be a perfect complement to the steak dinner."
      },
      {
        "label": "Compliment",
        "sentence": "She received a wonderful compliment on her creative artwork."
      }
    ]
  },
  {
    "id": "comprise-compose",
    "title": "Comprise and compose",
    "difference": "\"Compose\" means to make up or form the parts of a whole (the parts compose the whole). \"Comprise\" means to include, contain, or consist of (the whole comprises the parts).",
    "examples": [
      {
        "label": "Compose",
        "sentence": "Seven distinct colors compose the visible light spectrum."
      },
      {
        "label": "Comprise",
        "sentence": "The committee comprises representatives from various departments."
      }
    ]
  },
  {
    "id": "conscience-conscious",
    "title": "Conscience and conscious",
    "difference": "\"Conscience\" is a noun meaning an inner feeling or moral sense of right and wrong. \"Conscious\" is an adjective meaning alert, awake, and aware of one's surroundings.",
    "examples": [
      {
        "label": "Conscience",
        "sentence": "His clear conscience allowed him to sleep peacefully at night."
      },
      {
        "label": "Conscious",
        "sentence": "The patient remained fully conscious throughout the minor medical procedure."
      }
    ]
  },
  {
    "id": "council-counsel",
    "title": "Council and counsel",
    "difference": "\"Council\" is a noun meaning an advisory or administrative governing body of people. \"Counsel\" is a noun or verb meaning professional advice, legal guidance, or to give advice.",
    "examples": [
      {
        "label": "Council",
        "sentence": "The city council approved funding for the new public park."
      },
      {
        "label": "Counsel",
        "sentence": "The defendant sought legal counsel before speaking to the investigators."
      }
    ]
  },
  {
    "id": "desert-dessert",
    "title": "Desert and dessert",
    "difference": "\"Desert\" is a noun meaning a dry, barren sandy region, or a verb meaning to abandon. \"Dessert\" is a noun meaning the sweet course eaten at the end of a meal.",
    "examples": [
      {
        "label": "Desert",
        "sentence": "Camels are uniquely adapted to survive in the harsh desert climate."
      },
      {
        "label": "Dessert",
        "sentence": "They ordered chocolate lava cake for dessert after dinner."
      }
    ]
  },
  {
    "id": "discreet-discrete",
    "title": "Discreet and discrete",
    "difference": "\"Discreet\" is an adjective meaning careful, prudent, and circumspect in one's speech or actions to avoid offense or draw attention. \"Discrete\" is an adjective meaning distinct, separate, or unrelated individual parts.",
    "examples": [
      {
        "label": "Discreet",
        "sentence": "She made discreet inquiries about the job opening to keep it private."
      },
      {
        "label": "Discrete",
        "sentence": "The computer program breaks down complex tasks into discrete steps."
      }
    ]
  },
  {
    "id": "disinterested-uninterested",
    "title": "Disinterested and uninterested",
    "difference": "\"Disinterested\" is an adjective meaning impartial, unbiased, or having no personal stake in a matter. \"Uninterested\" is an adjective meaning bored, indifferent, or lacking interest.",
    "examples": [
      {
        "label": "Disinterested",
        "sentence": "A disinterested third party was brought in to mediate the corporate dispute."
      },
      {
        "label": "Uninterested",
        "sentence": "He looked completely uninterested during the history lecture."
      }
    ]
  },
  {
    "id": "elicit-illicit",
    "title": "Elicit and illicit",
    "difference": "\"Elicit\" is a verb meaning to draw out, evoke, or extract a response or reaction. \"Illicit\" is an adjective meaning forbidden, illegal, or unauthorized by law or custom.",
    "examples": [
      {
        "label": "Elicit",
        "sentence": "The teacher tried to elicit creative answers from her students."
      },
      {
        "label": "Illicit",
        "sentence": "The police cracked down on an illicit trade ring operating downtown."
      }
    ]
  },
  {
    "id": "emigrate-immigrate",
    "title": "Emigrate and immigrate",
    "difference": "\"Emigrate\" is a verb meaning to leave one's own country to settle permanently in another (moving away). \"Immigrate\" is a verb meaning to come to live permanently in a foreign country (moving in).",
    "examples": [
      {
        "label": "Emigrate",
        "sentence": "Her grandparents chose to emigrate from Italy in the 1950s."
      },
      {
        "label": "Immigrate",
        "sentence": "Many families hope to immigrate to Canada for better career opportunities."
      }
    ]
  },
  {
    "id": "eminent-immanent",
    "title": "Eminent and immanent",
    "difference": "\"Eminent\" is an adjective meaning famous, respected, and distinguished within a particular sphere. \"Immanent\" is an adjective meaning inherent, existing within, or permanent in nature.",
    "examples": [
      {
        "label": "Eminent",
        "sentence": "An eminent scientist delivered the keynote speech at the conference."
      },
      {
        "label": "Immanent",
        "sentence": "Philosophers debated whether ethical values are immanent in human consciousness."
      }
    ]
  },
  {
    "id": "envelop-envelope",
    "title": "Envelop and envelope",
    "difference": "\"Envelop\" means to wrap up, cover, or surround completely. \"Envelope\" is a flat paper container used for enclosing a letter or document.",
    "examples": [
      {
        "label": "Envelop",
        "sentence": "Thick morning fog began to envelop the entire valley."
      },
      {
        "label": "Envelope",
        "sentence": "She slipped the handwritten letter inside a sealed paper envelope."
      }
    ]
  },
  {
    "id": "every-day-everyday",
    "title": "Every day and everyday",
    "difference": "\"Every day\" is an adjective-noun phrase meaning each individual day or daily. \"Everyday\" is a single-word adjective meaning routine, ordinary, or customary.",
    "examples": [
      {
        "label": "Every day",
        "sentence": "I try to drink eight glasses of water every day."
      },
      {
        "label": "Everyday",
        "sentence": "Jeans and t-shirts are his choice of everyday casual clothing."
      }
    ]
  },
  {
    "id": "explicit-implicit",
    "title": "Explicit and implicit",
    "difference": "\"Explicit\" is an adjective meaning stated clearly, directly, and leaving no room for confusion. \"Implicit\" is an adjective meaning implied, understood indirectly without being directly expressed.",
    "examples": [
      {
        "label": "Explicit",
        "sentence": "The instructor gave explicit instructions on how to complete the lab experiment."
      },
      {
        "label": "Implicit",
        "sentence": "There was an implicit agreement of trust between the two business partners."
      }
    ]
  },
  {
    "id": "farther-further",
    "title": "Farther and further",
    "difference": "\"Farther\" refers strictly to physical, measurable distance. \"Further\" refers to metaphorical distance, degree, or time (meaning \"additional\" or \"more\").",
    "examples": [
      {
        "label": "Farther",
        "sentence": "She could not run any farther without taking a break."
      },
      {
        "label": "Further",
        "sentence": "We need further information before making a final decision."
      }
    ]
  },
  {
    "id": "flair-flare",
    "title": "Flair and flare",
    "difference": "\"Flair\" is a noun meaning a natural talent, style, or aptitude for something. \"Flare\" is a noun or verb meaning a sudden burst of bright flame, light, or emotion.",
    "examples": [
      {
        "label": "Flair",
        "sentence": "She has a distinct flair for interior design and color coordination."
      },
      {
        "label": "Flare",
        "sentence": "The pilot ignited an emergency signal flare to guide the rescue team."
      }
    ]
  },
  {
    "id": "flounder-founder",
    "title": "Flounder and founder",
    "difference": "\"Flounder\" is a verb meaning to struggle clumsily or thrash about, or a type of fish. \"Founder\" is a verb meaning to sink, fail completely, or collapse, or a noun meaning one who establishes an organization.",
    "examples": [
      {
        "label": "Flounder",
        "sentence": "Without clear guidance, the new employee began to flounder on the project."
      },
      {
        "label": "Founder",
        "sentence": "The startup company threatened to founder due to poor financial management."
      }
    ]
  },
  {
    "id": "foreword-forward",
    "title": "Foreword and forward",
    "difference": "\"Foreword\" is a noun meaning a short introductory essay or preface at the beginning of a book. \"Forward\" is an adverb or adjective meaning toward the front or ahead.",
    "examples": [
      {
        "label": "Foreword",
        "sentence": "The renowned author wrote a touching foreword for the poetry collection."
      },
      {
        "label": "Forward",
        "sentence": "Step forward so everyone in the room can hear you clearly."
      }
    ]
  },
  {
    "id": "gorilla-guerrilla",
    "title": "Gorilla and guerrilla",
    "difference": "\"Gorilla\" is a noun referring to the large, powerful African primate. \"Guerrilla\" is a noun or adjective referring to a member of an independent unofficial military group engaged in surprise raids.",
    "examples": [
      {
        "label": "Gorilla",
        "sentence": "The silverback gorilla rested peacefully in the dense jungle foliage."
      },
      {
        "label": "Guerrilla",
        "sentence": "The rebel forces utilized tactical guerrilla warfare strategies in the mountains."
      }
    ]
  },
  {
    "id": "hoard-horde",
    "title": "Hoard and horde",
    "difference": "\"Hoard\" is a noun or verb meaning a hidden store or stockpile of valuables accumulated carefully. \"Horde\" is a noun meaning a large, dense crowd or wandering multitude of people or animals.",
    "examples": [
      {
        "label": "Hoard",
        "sentence": "The dragon guarded its secret hoard of gold coins jealously."
      },
      {
        "label": "Horde",
        "sentence": "A massive horde of tourists rushed through the museum gates."
      }
    ]
  },
  {
    "id": "homogeneous-homogenous",
    "title": "Homogeneous and homogenous",
    "difference": "\"Homogeneous\" means consisting of parts that are all of the same kind or uniform throughout. \"Homogenous\" is a technical biological term meaning having a similar structure because of common ancestry.",
    "examples": [
      {
        "label": "Homogeneous",
        "sentence": "The population of the small town is largely homogeneous."
      },
      {
        "label": "Homogenous",
        "sentence": "Biologists analyzed the homogenous tissue samples under the microscope."
      }
    ]
  },
  {
    "id": "idol-idle",
    "title": "Idol and idle",
    "difference": "\"Idol\" is a noun meaning an image or representation of a god used as an object of worship, or a person greatly admired. \"Idle\" is an adjective or verb meaning lazy, inactive, or not working.",
    "examples": [
      {
        "label": "Idol",
        "sentence": "Pop singers often serve as a major idol for young teenagers."
      },
      {
        "label": "Idle",
        "sentence": "Leaving the car engine idle for too long wastes unnecessary fuel."
      }
    ]
  },
  {
    "id": "impassable-impassible",
    "title": "Impassable and impassible",
    "difference": "\"Impassable\" is an adjective meaning impossible to travel across or pass through due to obstruction. \"Impassible\" is an adjective meaning incapable of feeling pain, emotion, or suffering.",
    "examples": [
      {
        "label": "Impassable",
        "sentence": "Heavy snowfalls made the mountain highway completely impassable."
      },
      {
        "label": "Impassible",
        "sentence": "The stoic philosopher appeared impassible in the face of harsh criticism."
      }
    ]
  },
  {
    "id": "incredulous-incredible",
    "title": "Incredulous and incredible",
    "difference": "\"Incredulous\" is an adjective meaning unwilling or unable to believe something; skeptical. \"Incredible\" is an adjective meaning extraordinary, unbelievable, or hard to believe.",
    "examples": [
      {
        "label": "Incredulous",
        "sentence": "She gave an incredulous look when he told her he won the lottery."
      },
      {
        "label": "Incredible",
        "sentence": "The acrobat performed an incredible stunt high above the crowd."
      }
    ]
  },
  {
    "id": "ingenious-ingenuous",
    "title": "Ingenious and ingenuous",
    "difference": "\"Ingenious\" is an adjective meaning clever, original, and inventive. \"Ingenuous\" is an adjective meaning innocent, naive, artless, and showing childlike simplicity.",
    "examples": [
      {
        "label": "Ingenious",
        "sentence": "The engineer came up with an ingenious solution to fix the engine problem."
      },
      {
        "label": "Ingenuous",
        "sentence": "Her ingenuous remarks charmed everyone at the dinner party."
      }
    ]
  },
  {
    "id": "instance-instants",
    "title": "Instance and instants",
    "difference": "\"Instance\" is a noun meaning an example or single occurrence of something. \"Instants\" is the plural noun meaning tiny, specific moments of time.",
    "examples": [
      {
        "label": "Instance",
        "sentence": "This is a clear instance of copyright infringement."
      },
      {
        "label": "Instants",
        "sentence": "In a matter of brief instants, the car sped out of sight."
      }
    ]
  },
  {
    "id": "judicial-judicious",
    "title": "Judicial and judicious",
    "difference": "\"Judicial\" is an adjective relating to courts of law, judges, or the judicial system. \"Judicious\" is an adjective meaning having, showing, or exercising good judgment or sense.",
    "examples": [
      {
        "label": "Judicial",
        "sentence": "The judicial branch is responsible for interpreting constitutional laws."
      },
      {
        "label": "Judicious",
        "sentence": "Making a financial investment requires careful and judicious planning."
      }
    ]
  },
  {
    "id": "key-quay",
    "title": "Key and quay",
    "difference": "\"Key\" is a noun meaning a metal instrument used for locks or an explanation of a map/code. \"Quay\" is a noun meaning a stone pier or wharf where ships load and unload cargo.",
    "examples": [
      {
        "label": "Key",
        "sentence": "She misplaced the house key and had to wait outside."
      },
      {
        "label": "Quay",
        "sentence": "Fishermen tied their boats securely to the wooden quay."
      }
    ]
  },
  {
    "id": "later-latter",
    "title": "Later and latter",
    "difference": "\"Later\" refers to a time in the future or occurring after a specific time. \"Latter\" refers to the second of two things or people previously mentioned.",
    "examples": [
      {
        "label": "Later",
        "sentence": "I will call you back later this evening when I am free."
      },
      {
        "label": "Latter",
        "sentence": "Between coffee and tea, I prefer the latter."
      }
    ]
  },
  {
    "id": "lead-led",
    "title": "Lead and led",
    "difference": "\"Lead\" is a verb meaning to guide or conduct, or a noun referring to a heavy metallic element. \"Led\" is the past tense and past participle form of the verb \"to lead\".",
    "examples": [
      {
        "label": "Lead",
        "sentence": "Experienced guides will lead the expedition through the forest."
      },
      {
        "label": "Led",
        "sentence": "The tour guide led the visitors through the ancient castle ruins."
      }
    ]
  },
  {
    "id": "lie-lay",
    "title": "Lie and lay",
    "difference": "\"Lie\" is an intransitive verb meaning to recline or rest flat. \"Lay\" is a transitive verb meaning to place or put something down.",
    "examples": [
      {
        "label": "Lie",
        "sentence": "I am so tired that I need to lie down for a nap."
      },
      {
        "label": "Lay",
        "sentence": "Please lay the heavy book down gently on the wooden table."
      }
    ]
  },
  {
    "id": "lightening-lightning",
    "title": "Lightening and lightning",
    "difference": "\"Lightening\" is a verb meaning making something lighter in weight or color, or reducing darkness. \"Lightning\" is a noun referring to the sudden electrostatic discharge during a thunderstorm.",
    "examples": [
      {
        "label": "Lightening",
        "sentence": "Adding white paint is effective for lightening the dark shade."
      },
      {
        "label": "Lightning",
        "sentence": "A brilliant flash of lightning illuminated the dark night sky."
      }
    ]
  },
  {
    "id": "loath-loathe",
    "title": "Loath and loathe",
    "difference": "\"Loath\" is an adjective meaning reluctant, unwilling, or disinclined. \"Loathe\" is a verb meaning to feel intense disgust, hatred, or aversion toward someone or something.",
    "examples": [
      {
        "label": "Loath",
        "sentence": "He was loath to admit that he had made a major mistake."
      },
      {
        "label": "Loathe",
        "sentence": "She happens to loathe waking up early on cold winter mornings."
      }
    ]
  },
  {
    "id": "loose-lose",
    "title": "Loose and lose",
    "difference": "\"Loose\" is an adjective meaning not tight, free, or slack. \"Lose\" is a verb meaning to misplace something, fail to win, or suffer the loss of something.",
    "examples": [
      {
        "label": "Loose",
        "sentence": "The belt is too loose, so I need to tighten the buckle."
      },
      {
        "label": "Lose",
        "sentence": "Be careful not to lose your keys while traveling."
      }
    ]
  },
  {
    "id": "mantle-mantel",
    "title": "Mantle and mantel",
    "difference": "\"Mantle\" is a noun meaning a loose cloak, or an outer layer of the earth. \"Mantel\" is a noun specifically referring to the shelf above a fireplace opening.",
    "examples": [
      {
        "label": "Mantle",
        "sentence": "The majestic king wore a heavy velvet mantle during the ceremony."
      },
      {
        "label": "Mantel",
        "sentence": "Family portraits were neatly arranged across the stone fireplace mantel."
      }
    ]
  },
  {
    "id": "marshal-martial",
    "title": "Marshal and martial",
    "difference": "\"Marshal\" is a noun or verb referring to an officer of high rank or to arrange/organize. \"Martial\" is an adjective relating to war, combat, or the military.",
    "examples": [
      {
        "label": "Marshal",
        "sentence": "The grand parade was led by a decorated military marshal."
      },
      {
        "label": "Martial",
        "sentence": "Students practiced self-defense techniques in their martial arts class."
      }
    ]
  },
  {
    "id": "minor-miner",
    "title": "Minor and miner",
    "difference": "\"Minor\" is an adjective or noun meaning lesser in importance, or a person under legal age. \"Miner\" is a noun referring to a worker who extracts coal or minerals from the earth.",
    "examples": [
      {
        "label": "Minor",
        "sentence": "They only sustained minor injuries in the minor traffic accident."
      },
      {
        "label": "Miner",
        "sentence": "The coal miner emerged from the deep tunnel covered in dust."
      }
    ]
  }
];

export default function ConfusingWords({ userId }: { userId: string | null }) {
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [quotaPopup, setQuotaPopup] = useState(false);
  const [error, setError] = useState("");
  const [hasAccess, setHasAccess] = useState(false);

  const privileged = isAdmin || isSubscribed;
  const current = WORD_PAIRS[index];

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    let live = true;
    fetch("/api/game-access", { cache: "no-store" })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Quota could not be verified.");
        if (!live) return;
        setIsAdmin(Boolean(data.isAdmin));
        setIsSubscribed(Boolean(data.isSubscribed));
        const available = Number(data.remainingByType?.["confusing-words"] ?? 0);
        if (available <= 0) {
          setRemaining(0);
          setQuotaPopup(true);
          return;
        }
        const first = WORD_PAIRS[0];
        const charge = await fetch("/api/game-access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sectionId: "word-differences",
            gameTypeId: "confusing-words",
            challengeId: "confusing-words:" + first.id + ":" + Date.now()
          })
        });
        const charged = await charge.json();
        if (!charge.ok) {
          setRemaining(0);
          setQuotaPopup(true);
          return;
        }
        setRemaining(Number(charged.remaining ?? 0));
        setHasAccess(true);
      })
      .catch(err => { if (live) setError(err instanceof Error ? err.message : "Quota could not be verified."); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [userId]);

  useEffect(() => {
    if (!quotaPopup) return;
    const timer = window.setTimeout(() => setQuotaPopup(false), 5200);
    return () => window.clearTimeout(timer);
  }, [quotaPopup]);

  const showNext = async () => {
    if (busy || index >= WORD_PAIRS.length - 1 || remaining <= 0 || !userId) return;
    setBusy(true);
    setError("");
    try {
      const next = WORD_PAIRS[index + 1];
      const response = await fetch("/api/game-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionId: "word-differences",
          gameTypeId: "confusing-words",
          challengeId: "confusing-words:" + next.id + ":" + Date.now()
        })
      });
      const data = await response.json();
      if (!response.ok) {
        setQuotaPopup(true);
        setRemaining(0);
        return;
      }
      setRemaining(Number(data.remaining ?? 0));
      setHasAccess(true);
      setIndex(value => value + 1);
    } catch {
      setError("We couldn't verify your quota. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const quotaLabel = loading
    ? "Checking daily quota…"
    : `${remaining} ${privileged ? "words remaining today" : "free words remaining"}`;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3">
        <div>
          <h2 className="text-lg font-black text-slate-900">Confusing Words</h2>
          <p className="text-xs font-medium text-slate-600">Understand the difference, one word pair at a time.</p>
        </div>
        <span className="rounded-full border border-violet-200 bg-white px-3 py-1.5 text-xs font-black text-violet-800">{quotaLabel}</span>
      </div>

      {!userId ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center font-semibold text-slate-800">Please sign in to access this section.</div>
      ) : loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center font-semibold text-slate-600">Loading your word lesson…</div>
      ) : current && hasAccess ? (
        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 bg-gradient-to-r from-sky-50 via-white to-violet-50 px-5 py-5 text-center sm:px-8">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Word Pair {index + 1} of {WORD_PAIRS.length}</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight text-violet-700 sm:text-3xl">{index + 1}. {current.title}</h3>
          </div>
          <div className="space-y-6 px-5 py-6 text-[15px] leading-8 text-slate-950 sm:px-8 sm:py-8">
            <section>
              <h4 className="mb-2 text-base font-extrabold text-slate-950">Difference:</h4>
              <p>{current.difference}</p>
            </section>
            <section>
              <h4 className="mb-3 text-base font-extrabold text-slate-950">Examples:</h4>
              <div className="space-y-4">
                {current.examples.map(example => (
                  <div key={example.label} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="font-extrabold text-slate-950">{example.label}:</p>
                    <p className="mt-1 text-slate-950">{example.sentence}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <div className="border-t border-slate-100 bg-slate-50 px-5 py-5 text-center">
            <p className="mb-3 text-xs font-semibold text-slate-500">{index + 1} of {WORD_PAIRS.length}</p>
            <button type="button" onClick={showNext} disabled={busy || loading || remaining <= 0 || index >= WORD_PAIRS.length - 1} className="min-h-12 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 px-8 py-3 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45">
              {busy ? "Loading…" : "Next word →"}
            </button>
            {index >= WORD_PAIRS.length - 1 && <p className="mt-3 text-xs font-medium text-slate-500">More word pairs can be added to this section.</p>}
            {error && <p role="alert" className="mt-3 text-sm font-semibold text-rose-700">{error}</p>}
          </div>
        </article>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center font-semibold text-slate-700">{error || (remaining <= 0 ? "Your quota for this section has been exhausted for today." : "No word pairs are available yet.")}</div>
      )}
      <GameQuotaPopup open={quotaPopup} isSubscribed={privileged} resetKey="word-differences" />
    </div>
  );
}
