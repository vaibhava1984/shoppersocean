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
  },
  {
    "id": "moral-morale",
    "title": "Moral and morale",
    "difference": "\"Moral\" is a noun or adjective relating to principles of right and wrong, or a lesson learned. \"Morale\" is a noun meaning the overall confidence, enthusiasm, and discipline of a group.",
    "examples": [
      {
        "label": "Moral",
        "sentence": "The fable teaches a valuable moral about honesty and hard work."
      },
      {
        "label": "Morale",
        "sentence": "Winning the championship game boosted the team's morale significantly."
      }
    ]
  },
  {
    "id": "ordinance-ordnance",
    "title": "Ordinance and ordnance",
    "difference": "\"Ordinance\" is a noun meaning a municipal law, rule, or authoritative decree. \"Ordnance\" is a noun referring to military weapons, artillery, ammunition, and munitions.",
    "examples": [
      {
        "label": "Ordinance",
        "sentence": "The city council passed a strict noise ordinance for residential areas."
      },
      {
        "label": "Ordnance",
        "sentence": "Military experts safely disposed of unexploded ordnance found on-site."
      }
    ]
  },
  {
    "id": "peak-peek-pique",
    "title": "Peak, peek, and pique",
    "difference": "\"Peak\" is a noun or adjective meaning the pointed top of a mountain or maximum level. \"Peek\" is a verb or noun meaning a quick, furtive look. \"Pique\" is a verb meaning to stimulate interest or provoke annoyance.",
    "examples": [
      {
        "label": "Peak",
        "sentence": "Climbers reached the snowy peak of the mountain just before noon."
      },
      {
        "label": "Peek",
        "sentence": "She took a quick peek inside the wrapped birthday present."
      },
      {
        "label": "Pique",
        "sentence": "The mysterious headline served to pique my curiosity immediately."
      }
    ]
  },
  {
    "id": "pedal-peddle",
    "title": "Pedal and peddle",
    "difference": "\"Pedal\" is a noun or verb referring to a foot-operated lever on a machine or vehicle. \"Peddle\" is a verb meaning to promote, hawk, or travel around selling goods.",
    "examples": [
      {
        "label": "Pedal",
        "sentence": "Press down on the bicycle pedal to increase your speed."
      },
      {
        "label": "Peddle",
        "sentence": "Street vendors traveled through the town square to peddle handmade crafts."
      }
    ]
  },
  {
    "id": "persecute-prosecute",
    "title": "Persecute and prosecute",
    "difference": "\"Persecute\" is a verb meaning to harass, oppress, or mistreat someone persistently based on race or beliefs. \"Prosecute\" is a verb meaning to institute legal proceedings against a criminal suspect.",
    "examples": [
      {
        "label": "Persecute",
        "sentence": "Historically, minority groups faced efforts to persecute them unfairly."
      },
      {
        "label": "Prosecute",
        "sentence": "The district attorney vowed to prosecute all offenders to the fullest extent."
      }
    ]
  },
  {
    "id": "personal-personnel",
    "title": "Personal and personnel",
    "difference": "\"Personal\" is an adjective meaning private, individual, or relating to a specific person. \"Personnel\" is a noun meaning the human workforce or staff employed by an organization.",
    "examples": [
      {
        "label": "Personal",
        "sentence": "Please keep this information strictly confidential and personal."
      },
      {
        "label": "Personnel",
        "sentence": "Human resources handles all hiring and employee personnel files."
      }
    ]
  },
  {
    "id": "plain-plane",
    "title": "Plain and plane",
    "difference": "\"Plain\" is an adjective or noun meaning clear, simple, or an expanse of flat land. \"Plane\" is a noun meaning an airplane, a flat geometric surface, or a carpentry tool.",
    "examples": [
      {
        "label": "Plain",
        "sentence": "The instructions were written in plain English so everyone could understand."
      },
      {
        "label": "Plane",
        "sentence": "The commercial plane landed safely at the international airport."
      }
    ]
  },
  {
    "id": "pore-pour",
    "title": "Pore and pour",
    "difference": "\"Pore\" is a noun meaning a tiny opening in the skin, or a verb meaning to study or read something intently. \"Pour\" is a verb meaning to flow or cause liquid to stream out continuously.",
    "examples": [
      {
        "label": "Pore",
        "sentence": "The researcher spent hours to pore over the historical archives."
      },
      {
        "label": "Pour",
        "sentence": "Please pour me a refreshing glass of cold water."
      }
    ]
  },
  {
    "id": "precede-proceed",
    "title": "Precede and proceed",
    "difference": "\"Precede\" is a verb meaning to come before something in time, order, or rank. \"Proceed\" is a verb meaning to carry on, advance, or move forward with an action.",
    "examples": [
      {
        "label": "Precede",
        "sentence": "Lightning flashes typically precede the sound of thunder during storms."
      },
      {
        "label": "Proceed",
        "sentence": "You may now proceed with your presentation to the board."
      }
    ]
  },
  {
    "id": "presence-presents",
    "title": "Presence and presents",
    "difference": "\"Presence\" is a noun meaning the state of being present or existing in a place. \"Presents\" is the plural noun meaning gifts or items given to someone.",
    "examples": [
      {
        "label": "Presence",
        "sentence": "Her calming presence helped ease everyone's anxiety during the crisis."
      },
      {
        "label": "Presents",
        "sentence": "Children eagerly opened their birthday presents under the tree."
      }
    ]
  },
  {
    "id": "principal-principle",
    "title": "Principal and principle",
    "difference": "\"Principal\" is a noun or adjective meaning the head of a school, main, or a sum of money bearing interest. \"Principle\" is a noun meaning a fundamental truth, rule, or moral standard.",
    "examples": [
      {
        "label": "Principal",
        "sentence": "The school principal addressed the students during the morning assembly."
      },
      {
        "label": "Principle",
        "sentence": "He refused to compromise on his core ethical principle of honesty."
      }
    ]
  },
  {
    "id": "prophecy-prophesy",
    "title": "Prophecy and prophesy",
    "difference": "\"Prophecy\" is a noun meaning a prediction of future events. \"Prophesy\" is a verb meaning to predict or foretell future events or utter divine inspired messages.",
    "examples": [
      {
        "label": "Prophecy",
        "sentence": "The ancient myth spoke of a strange prophecy coming true."
      },
      {
        "label": "Prophesy",
        "sentence": "Prophets in ancient times would prophesy about coming kingdoms."
      }
    ]
  },
  {
    "id": "quiet-quite",
    "title": "Quiet and quite",
    "difference": "\"Quiet\" is an adjective or noun meaning making little or no noise; silent. \"Quite\" is an adverb meaning to a certain extent, fairly, or completely/very.",
    "examples": [
      {
        "label": "Quiet",
        "sentence": "Please keep the library study hall zone quiet for readers."
      },
      {
        "label": "Quite",
        "sentence": "The movie turned out to be quite entertaining in the end."
      }
    ]
  },
  {
    "id": "quote-quotation",
    "title": "Quote and quotation",
    "difference": "\"Quote\" is a verb meaning to repeat exact words, or often used informally as a noun. \"Quotation\" is the formal noun meaning a group of words repeated from a book or speech.",
    "examples": [
      {
        "label": "Quote",
        "sentence": "He loved to quote famous lines from Shakespearean plays."
      },
      {
        "label": "Quotation",
        "sentence": "She selected an inspiring quotation to start her research essay."
      }
    ]
  },
  {
    "id": "raise-raze",
    "title": "Raise and raze",
    "difference": "\"Raise\" is a verb meaning to lift, elevate, or build up. \"Raze\" is a verb meaning to completely demolish, tear down, or destroy a building or town.",
    "examples": [
      {
        "label": "Raise",
        "sentence": "Workers tried to raise the heavy metal beam using a crane."
      },
      {
        "label": "Raze",
        "sentence": "Authorities planned to raze the abandoned warehouse to build a park."
      }
    ]
  },
  {
    "id": "rational-rationale",
    "title": "Rational and rationale",
    "difference": "\"Rational\" is an adjective meaning based on or in accordance with reason or logic. \"Rationale\" is a noun meaning a set of reasons or logical explanation for a course of action.",
    "examples": [
      {
        "label": "Rational",
        "sentence": "She made a calm and rational decision under pressure."
      },
      {
        "label": "Rationale",
        "sentence": "The manager explained the strategic rationale behind the new policy."
      }
    ]
  },
  {
    "id": "reckless-wreckless",
    "title": "Reckless and wreckless",
    "difference": "\"Reckless\" is an adjective meaning acting without thinking or showing a lack of care for consequences. \"Wreckless\" is a common misspelling and is not a standard accepted word in formal English.",
    "examples": [
      {
        "label": "Reckless",
        "sentence": "Speeding through residential zones is a dangerous and reckless habit."
      },
      {
        "label": "Wreckless",
        "sentence": "(Incorrect usage; use reckless instead to mean careless)."
      }
    ]
  },
  {
    "id": "respectfully-respectively",
    "title": "Respectfully and respectively",
    "difference": "\"Respectfully\" means showing politeness, honor, and respect. \"Respectively\" means separately or in the exact order previously mentioned.",
    "examples": [
      {
        "label": "Respectfully",
        "sentence": "The student bowed respectfully before the martial arts master."
      },
      {
        "label": "Respectively",
        "sentence": "John and Mary won first and second place, respectively."
      }
    ]
  },
  {
    "id": "right-rite-wright",
    "title": "Right, rite, and wright",
    "difference": "\"Right\" means correct, morally good, or a legal entitlement. \"Rite\" is a noun meaning a religious or ceremonial solemn act or custom. \"Wright\" is a noun meaning a maker or builder.",
    "examples": [
      {
        "label": "Right",
        "sentence": "Make sure your answers are mathematically right before submitting."
      },
      {
        "label": "Rite",
        "sentence": "The cultural initiation rite marked the transition into adulthood."
      },
      {
        "label": "Wright",
        "sentence": "The shipwright worked meticulously on building the wooden hull."
      }
    ]
  },
  {
    "id": "role-roll",
    "title": "Role and roll",
    "difference": "\"Role\" is a noun meaning an actor's part in a play or a function assumed by someone. \"Roll\" is a noun or verb meaning a cylinder of food/paper, or to turn over and over.",
    "examples": [
      {
        "label": "Role",
        "sentence": "She played a starring role in the school theatrical drama production."
      },
      {
        "label": "Roll",
        "sentence": "Please pass me a warm dinner roll from the basket."
      }
    ]
  },
  {
    "id": "salient-resilient",
    "title": "Salient and resilient",
    "difference": "\"Salient\" is an adjective meaning most noticeable, prominent, or important. \"Resilient\" is an adjective meaning able to recover quickly from tough conditions or bounce back.",
    "examples": [
      {
        "label": "Salient",
        "sentence": "The speaker highlighted the most salient points of the report."
      },
      {
        "label": "Resilient",
        "sentence": "Small businesses proved remarkably resilient during economic downturns."
      }
    ]
  },
  {
    "id": "sanguine-genuine",
    "title": "Sanguine and genuine",
    "difference": "\"Sanguine\" is an adjective meaning optimistic or positive, especially in an apparently bad situation. \"Genuine\" is an adjective meaning truly what something is said to be; authentic.",
    "examples": [
      {
        "label": "Sanguine",
        "sentence": "Despite the delays, the team remained sanguine about winning."
      },
      {
        "label": "Genuine",
        "sentence": "The museum expert confirmed the diamond necklace was genuine."
      }
    ]
  },
  {
    "id": "scarcely-sparsely",
    "title": "Scarcely and sparsely",
    "difference": "\"Scarcely\" is an adverb meaning barely, almost not at all. \"Sparsely\" is an adverb meaning thinly scattered or distributed over a wide area.",
    "examples": [
      {
        "label": "Scarcely",
        "sentence": "There was scarcely enough food left for the final guest."
      },
      {
        "label": "Sparsely",
        "sentence": "The desert region remained sparsely populated by humans."
      }
    ]
  },
  {
    "id": "sensual-sensuous",
    "title": "Sensual and sensuous",
    "difference": "\"Sensual\" is an adjective relating to or involving physical gratification of the senses, often sexual. \"Sensuous\" is an adjective meaning affecting or derived from the senses, providing aesthetic pleasure.",
    "examples": [
      {
        "label": "Sensual",
        "sentence": "The luxury spa retreat promised a deeply sensual relaxation experience."
      },
      {
        "label": "Sensuous",
        "sentence": "She enjoyed the sensuous pleasure of walking barefoot through soft grass."
      }
    ]
  },
  {
    "id": "shear-sheer",
    "title": "Shear and sheer",
    "difference": "\"Shear\" is a verb meaning to cut off fleece, hair, or wool. \"Sheer\" is an adjective meaning perpendicular, utter/complete, or very thin and transparent fabric.",
    "examples": [
      {
        "label": "Shear",
        "sentence": "Farmers shear sheep every spring to harvest their thick wool."
      },
      {
        "label": "Sheer",
        "sentence": "The climbers faced a sheer rock face with no handholds."
      }
    ]
  },
  {
    "id": "stationary-stationery",
    "title": "Stationary and stationery",
    "difference": "\"Stationary\" is an adjective meaning not moving, staying in one place. \"Stationery\" is a noun referring to writing materials like paper and envelopes.",
    "examples": [
      {
        "label": "Stationary",
        "sentence": "The car remained stationary at the red traffic light."
      },
      {
        "label": "Stationery",
        "sentence": "She purchased custom monogrammed stationery for writing letters."
      }
    ]
  },
  {
    "id": "statue-stature-statute",
    "title": "Statue, stature, and statute",
    "difference": "\"Statue\" is a carved or cast figure of a person or animal. \"Stature\" is a person's natural height or level of respect/achievement. \"Statute\" is a written law passed by a legislative body.",
    "examples": [
      {
        "label": "Statue",
        "sentence": "A bronze statue of the historic leader stood in the town square."
      },
      {
        "label": "Stature",
        "sentence": "The seasoned diplomat grew in political stature over the years."
      },
      {
        "label": "Statute",
        "sentence": "Breaking the corporate tax code violated federal law statute."
      }
    ]
  },
  {
    "id": "straight-strait",
    "title": "Straight and strait",
    "difference": "\"Straight\" means extending in a continuous line without curves. \"Strait\" is a noun meaning a narrow passage of water connecting two seas, or a state of distress.",
    "examples": [
      {
        "label": "Straight",
        "sentence": "Draw a straight line connecting point A to point B."
      },
      {
        "label": "Strait",
        "sentence": "Cargo ships navigated carefully through the narrow oceanic strait."
      }
    ]
  },
  {
    "id": "subtle-submerge",
    "title": "Subtle and submerge",
    "difference": "\"Subtle\" is an adjective meaning delicate, precise, and not obvious. \"Submerge\" is a verb meaning to push or plunge completely beneath the surface of liquid.",
    "examples": [
      {
        "label": "Subtle",
        "sentence": "There was a subtle hint of mint in the chocolate dessert."
      },
      {
        "label": "Submerge",
        "sentence": "Scuba divers watched the submarine submerge into deep blue water."
      }
    ]
  },
  {
    "id": "suit-suite",
    "title": "Suit and suite",
    "difference": "\"Suit\" is a noun or verb referring to a set of matching outer garments or legal lawsuits. \"Suite\" is a noun meaning a set of connected rooms in a hotel or a collection of musical pieces.",
    "examples": [
      {
        "label": "Suit",
        "sentence": "He wore a sharp black tailored suit to the business meeting."
      },
      {
        "label": "Suite",
        "sentence": "The newlyweds booked a luxury penthouse suite at the resort."
      }
    ]
  },
  {
    "id": "taught-taut",
    "title": "Taught and taut",
    "difference": "\"Taught\" is the past tense and past participle of the verb \"to teach\". \"Taut\" is an adjective meaning stretched or pulled tight; not slack.",
    "examples": [
      {
        "label": "Taught",
        "sentence": "My grandfather taught me how to fish when I was young."
      },
      {
        "label": "Taut",
        "sentence": "Pull the tent ropes taut so the structure remains secure in wind."
      }
    ]
  },
  {
    "id": "than-then",
    "title": "Than and then",
    "difference": "\"Than\" is a conjunction and preposition used for comparisons. \"Then\" is an adverb indicating a sequence of time or consequence.",
    "examples": [
      {
        "label": "Than",
        "sentence": "Mount Everest is much higher than any other mountain."
      },
      {
        "label": "Then",
        "sentence": "We ate dinner at a restaurant and then went to a movie."
      }
    ]
  },
  {
    "id": "their-there-theyre",
    "title": "Their, there, and they're",
    "difference": "\"Their\" is a possessive pronoun belonging to them. \"There\" indicates a place or location. \"They're\" is a contraction of the words \"they are\".",
    "examples": [
      {
        "label": "Their",
        "sentence": "The students left their backpacks in the school locker room."
      },
      {
        "label": "There",
        "sentence": "Please put the heavy box of books over there on the desk."
      },
      {
        "label": "They're",
        "sentence": "They're planning to visit Europe during the summer vacation."
      }
    ]
  },
  {
    "id": "threw-through",
    "title": "Threw and through",
    "difference": "\"Threw\" is the past tense of the verb \"to throw\". \"Through\" is a preposition or adverb indicating movement from one side to the other.",
    "examples": [
      {
        "label": "Threw",
        "sentence": "The pitcher threw a fast strike across home plate."
      },
      {
        "label": "Through",
        "sentence": "The train traveled through the dark mountain tunnel."
      }
    ]
  },
  {
    "id": "tortuous-torturous",
    "title": "Tortuous and torturous",
    "difference": "\"Tortuous\" means full of twists, turns, or overly complex and winding. \"Torturous\" means involving or causing extreme pain, suffering, or torture.",
    "examples": [
      {
        "label": "Tortuous",
        "sentence": "The sports car drove along the tortuous mountain switchback road."
      },
      {
        "label": "Torturous",
        "sentence": "Waiting in line for hours in scorching heat proved torturous."
      }
    ]
  },
  {
    "id": "track-tract",
    "title": "Track and tract",
    "difference": "\"Track\" is a noun or verb meaning a path, course, or footprint left behind. \"Tract\" is a noun meaning an area of land or a pamphlet/leaflet of religious or political nature.",
    "examples": [
      {
        "label": "Track",
        "sentence": "Runners sprinted around the oval running track during the meet."
      },
      {
        "label": "Tract",
        "sentence": "They purchased a large wooded tract of land to build a cabin."
      }
    ]
  },
  {
    "id": "turbid-turgid",
    "title": "Turbid and turgid",
    "difference": "\"Turbid\" means cloudy, opaque, or thick with stirred-up sediment. \"Turgid\" means swollen, congested, or artificially pompous in language style.",
    "examples": [
      {
        "label": "Turbid",
        "sentence": "Heavy rainstorms left the river water muddy and turbid."
      },
      {
        "label": "Turgid",
        "sentence": "The academic essay was filled with overly complex, turgid prose."
      }
    ]
  },
  {
    "id": "unabashed-bashful",
    "title": "Unabashed and bashful",
    "difference": "\"Unabashed\" means not embarrassed, discomposed, or ashamed. \"Bashful\" means shy, excessively timid, or reluctant to draw attention.",
    "examples": [
      {
        "label": "Unabashed",
        "sentence": "She was unabashed about sharing her unique artistic vision."
      },
      {
        "label": "Bashful",
        "sentence": "The young boy felt too bashful to speak in front of the audience."
      }
    ]
  },
  {
    "id": "principled-unprincipled",
    "title": "Principled and unprincipled",
    "difference": "\"Principled\" means acting in accordance with strong moral principles. \"Unprincipled\" means lacking moral principles, unscrupulous, or unethical.",
    "examples": [
      {
        "label": "Principled",
        "sentence": "She took a firm, principled stand against corporate corruption."
      },
      {
        "label": "Unprincipled",
        "sentence": "The con artist engaged in unprincipled financial schemes."
      }
    ]
  },
  {
    "id": "urban-urbane",
    "title": "Urban and urbane",
    "difference": "\"Urban\" is an adjective relating to cities or densely populated towns. \"Urbane\" is an adjective meaning courteous, refined, elegant, and suave in manner.",
    "examples": [
      {
        "label": "Urban",
        "sentence": "City planners worked on expanding public transit networks in the urban core."
      },
      {
        "label": "Urbane",
        "sentence": "The host charmed guests at the dinner party with his urbane wit."
      }
    ]
  },
  {
    "id": "vain-vane-vein",
    "title": "Vain, vane, and vein",
    "difference": "\"Vain\" means having an excessively high opinion of one's appearance or useless. \"Vane\" refers to a weather blade showing wind direction. \"Vein\" is a blood vessel or geological mineral crack.",
    "examples": [
      {
        "label": "Vain",
        "sentence": "All his attempts to fix the broken engine proved vain."
      },
      {
        "label": "Vane",
        "sentence": "The weather vane on the rooftop spun rapidly in the wind."
      },
      {
        "label": "Vein",
        "sentence": "The nurse located a clear vein in her arm before drawing blood."
      }
    ]
  },
  {
    "id": "venal-venial",
    "title": "Venal and venial",
    "difference": "\"Venal\" means showing or motivated by susceptibility to bribery. \"Venial\" means minor, pardonable, or forgivable.",
    "examples": [
      {
        "label": "Venal",
        "sentence": "Investigators uncovered a venal network of corrupt politicians."
      },
      {
        "label": "Venial",
        "sentence": "Telling a small white lie to spare feelings is considered a venial fault."
      }
    ]
  },
  {
    "id": "veracious-voracious",
    "title": "Veracious and voracious",
    "difference": "\"Veracious\" means speaking or representing the truth. \"Voracious\" means wanting or devouring great quantities of food or eager for knowledge.",
    "examples": [
      {
        "label": "Veracious",
        "sentence": "The witness provided a veracious account of the accident details."
      },
      {
        "label": "Voracious",
        "sentence": "He is a voracious reader who finishes multiple books every week."
      }
    ]
  },
  {
    "id": "vice-vise",
    "title": "Vice and vise",
    "difference": "\"Vice\" is a noun meaning immoral or wicked behavior. \"Vise\" is a noun referring to a metal clamping tool used to hold objects steady.",
    "examples": [
      {
        "label": "Vice",
        "sentence": "Greed is widely considered a destructive personal vice."
      },
      {
        "label": "Vise",
        "sentence": "The carpenter clamped the wooden block securely in a metal vise."
      }
    ]
  },
  {
    "id": "waiver-waver",
    "title": "Waiver and waver",
    "difference": "\"Waiver\" is a noun meaning an act of voluntarily relinquishing a right or claim. \"Waver\" is a verb meaning to become unsteady, hesitate, or fluctuate in opinion.",
    "examples": [
      {
        "label": "Waiver",
        "sentence": "Participants signed a liability waiver before joining the extreme sport."
      },
      {
        "label": "Waver",
        "sentence": "Her voice began to waver slightly as she started her speech."
      }
    ]
  },
  {
    "id": "warrant-warranty",
    "title": "Warrant and warranty",
    "difference": "\"Warrant\" is a noun or verb meaning a legal document authorizing an action or justification. \"Warranty\" is a noun meaning a written guarantee given to a buyer by a manufacturer.",
    "examples": [
      {
        "label": "Warrant",
        "sentence": "Police officers obtained a search warrant from the judge."
      },
      {
        "label": "Warranty",
        "sentence": "The new television comes with a two-year manufacturer warranty."
      }
    ]
  },
  {
    "id": "weather-whether",
    "title": "Weather and whether",
    "difference": "\"Weather\" refers to atmospheric conditions like rain, temperature, and wind. \"Whether\" is a conjunction used to express a choice or alternative possibilities.",
    "examples": [
      {
        "label": "Weather",
        "sentence": "Outdoor events depend heavily on favorable weekend weather conditions."
      },
      {
        "label": "Whether",
        "sentence": "I cannot decide whether I should order tea or coffee."
      }
    ]
  },
  {
    "id": "who-whom",
    "title": "Who and whom",
    "difference": "\"Who\" is a subjective pronoun used as the subject of a sentence performing an action. \"Whom\" is an objective pronoun used as the object of a verb or preposition.",
    "examples": [
      {
        "label": "Who",
        "sentence": "Who left the front door open during the storm?"
      },
      {
        "label": "Whom",
        "sentence": "To whom should I address this formal business letter?"
      }
    ]
  },
  {
    "id": "your-youre",
    "title": "Your and you're",
    "difference": "\"Your\" is a possessive pronoun indicating something belongs to you. \"You're\" is a contraction combining the words \"you are\".",
    "examples": [
      {
        "label": "Your",
        "sentence": "Please remember to bring your notebook to class tomorrow."
      },
      {
        "label": "You're",
        "sentence": "You're going to love the surprise party we organized."
      }
    ]
  },
  {
    "id": "zany-zen",
    "title": "Zany and zen",
    "difference": "\"Zany\" is an adjective meaning amusingly unconventional, eccentric, or bizarre. \"Zen\" is a noun/adjective relating to a school of Buddhism emphasizing peace, calm, and mindfulness.",
    "examples": [
      {
        "label": "Zany",
        "sentence": "The comedy show featured a series of zany and unpredictable sketches."
      },
      {
        "label": "Zen",
        "sentence": "She created a quiet, zen atmosphere in her meditation room."
      }
    ]
  },
  {
    "id": "adapt-adopt",
    "title": "Adapt and adopt",
    "difference": "Adapt means to adjust to new conditions; adopt means to accept, take up, or begin using something.",
    "examples": [
      {
        "label": "Adapt",
        "sentence": "Animals must adapt to changes in their environment."
      },
      {
        "label": "Adopt",
        "sentence": "The school plans to adopt a new teaching method."
      }
    ]
  },
  {
    "id": "altar-alter",
    "title": "Altar and alter",
    "difference": "An altar is a sacred table or structure used in religious ceremonies; alter means to change or modify something.",
    "examples": [
      {
        "label": "Altar",
        "sentence": "The couple stood before the altar during the ceremony."
      },
      {
        "label": "Alter",
        "sentence": "The tailor agreed to alter the jacket."
      }
    ]
  },
  {
    "id": "aural-oral",
    "title": "Aural and oral",
    "difference": "Aural relates to hearing or sound; oral relates to the mouth or spoken communication.",
    "examples": [
      {
        "label": "Aural",
        "sentence": "The musician has excellent aural skills."
      },
      {
        "label": "Oral",
        "sentence": "The students will take an oral examination."
      }
    ]
  },
  {
    "id": "bale-bail",
    "title": "Bale and bail",
    "difference": "A bale is a large bundle of material; bail is security paid for temporary release from custody, or the act of removing water from a boat.",
    "examples": [
      {
        "label": "Bale",
        "sentence": "The farmer stacked a bale of hay in the barn."
      },
      {
        "label": "Bail",
        "sentence": "The judge granted bail to the accused."
      }
    ]
  },
  {
    "id": "bizarre-bazaar",
    "title": "Bizarre and bazaar",
    "difference": "Bizarre means very strange or unusual; a bazaar is a market where goods are sold.",
    "examples": [
      {
        "label": "Bizarre",
        "sentence": "The detective heard a bizarre explanation."
      },
      {
        "label": "Bazaar",
        "sentence": "We bought handmade gifts at the bazaar."
      }
    ]
  },
  {
    "id": "block-bloc",
    "title": "Block and bloc",
    "difference": "A block can be a solid piece, obstruction, or group of buildings; a bloc is a group united by a common interest.",
    "examples": [
      {
        "label": "Block",
        "sentence": "A fallen tree blocked the road."
      },
      {
        "label": "Bloc",
        "sentence": "The nations formed a trade bloc."
      }
    ]
  },
  {
    "id": "boar-bore",
    "title": "Boar and bore",
    "difference": "A boar is a male pig, especially a wild one; bore can mean make a hole or cause boredom, and is also the past tense of bear.",
    "examples": [
      {
        "label": "Boar",
        "sentence": "A wild boar emerged from the forest."
      },
      {
        "label": "Bore",
        "sentence": "The lengthy speech began to bore the audience."
      }
    ]
  },
  {
    "id": "boy-buoy",
    "title": "Boy and buoy",
    "difference": "A boy is a male child or young man; a buoy is a floating marker used on water.",
    "examples": [
      {
        "label": "Boy",
        "sentence": "The boy helped his father in the garden."
      },
      {
        "label": "Buoy",
        "sentence": "The buoy marks the safe channel for boats."
      }
    ]
  },
  {
    "id": "bridal-bridle",
    "title": "Bridal and bridle",
    "difference": "Bridal relates to a bride or wedding; a bridle is equipment used to control a horse, or a verb meaning to restrain.",
    "examples": [
      {
        "label": "Bridal",
        "sentence": "She chose a beautiful bridal gown."
      },
      {
        "label": "Bridle",
        "sentence": "The rider checked the horse’s bridle."
      }
    ]
  },
  {
    "id": "broach-brooch",
    "title": "Broach and brooch",
    "difference": "Broach means to introduce a subject for discussion; a brooch is a decorative ornament fastened to clothing.",
    "examples": [
      {
        "label": "Broach",
        "sentence": "He was reluctant to broach the subject of money."
      },
      {
        "label": "Brooch",
        "sentence": "She pinned a gold brooch to her coat."
      }
    ]
  },
  {
    "id": "caliber-calibre",
    "title": "Caliber and calibre",
    "difference": "Caliber and calibre are alternative spellings of the same word, referring to quality, ability, or the internal diameter of a gun barrel.",
    "examples": [
      {
        "label": "Caliber",
        "sentence": "The university attracts scholars of the highest caliber."
      },
      {
        "label": "Calibre",
        "sentence": "The team needs players of international calibre."
      }
    ]
  },
  {
    "id": "canvas-canvass",
    "title": "Canvas and canvass",
    "difference": "Canvas is strong, heavy fabric; canvass means to seek opinions, votes, or support by asking people.",
    "examples": [
      {
        "label": "Canvas",
        "sentence": "The artist painted a landscape on canvas."
      },
      {
        "label": "Canvass",
        "sentence": "Volunteers went door to door to canvass voters."
      }
    ]
  },
  {
    "id": "carat-caret-karat",
    "title": "Carat, caret, and karat",
    "difference": "Carat measures gemstone weight; caret is the proofreading symbol ^; karat measures gold purity.",
    "examples": [
      {
        "label": "Carat",
        "sentence": "The ring contains a one-carat diamond."
      },
      {
        "label": "Caret",
        "sentence": "The editor used a caret to mark the insertion point."
      },
      {
        "label": "Karat",
        "sentence": "The necklace is made of 18-karat gold."
      }
    ]
  },
  {
    "id": "cavalry-chivalry",
    "title": "Cavalry and chivalry",
    "difference": "Cavalry refers to soldiers or a military unit; chivalry refers to ideals of honour, courtesy, and considerate behaviour.",
    "examples": [
      {
        "label": "Cavalry",
        "sentence": "The cavalry crossed the open field."
      },
      {
        "label": "Chivalry",
        "sentence": "He believes courtesy and chivalry are still important."
      }
    ]
  },
  {
    "id": "census-senses",
    "title": "Census and senses",
    "difference": "A census is an official population count; senses are faculties such as sight, hearing, smell, taste, and touch.",
    "examples": [
      {
        "label": "Census",
        "sentence": "The government conducts a census every ten years."
      },
      {
        "label": "Senses",
        "sentence": "The aroma appealed to all her senses."
      }
    ]
  },
  {
    "id": "climactic-climatic",
    "title": "Climactic and climatic",
    "difference": "Climactic relates to the most exciting or decisive point; climatic relates to climate and long-term weather conditions.",
    "examples": [
      {
        "label": "Climactic",
        "sentence": "The climactic scene surprised every viewer."
      },
      {
        "label": "Climatic",
        "sentence": "Climatic changes have affected local agriculture."
      }
    ]
  },
  {
    "id": "coarse-course",
    "title": "Coarse and course",
    "difference": "Coarse means rough in texture or lacking refinement; course can mean a path, class, direction, or part of a meal.",
    "examples": [
      {
        "label": "Coarse",
        "sentence": "The coarse fabric irritated her skin."
      },
      {
        "label": "Course",
        "sentence": "He enrolled in a computer programming course."
      }
    ]
  },
  {
    "id": "collaborate-corroborate",
    "title": "Collaborate and corroborate",
    "difference": "Collaborate means to work jointly; corroborate means to confirm a claim with supporting evidence.",
    "examples": [
      {
        "label": "Collaborate",
        "sentence": "The two teams will collaborate on the project."
      },
      {
        "label": "Corroborate",
        "sentence": "The video helped corroborate the witness’s account."
      }
    ]
  },
  {
    "id": "complementary-complimentary",
    "title": "Complementary and complimentary",
    "difference": "Complementary means completing or going well with something; complimentary means free of charge or expressing praise.",
    "examples": [
      {
        "label": "Complementary",
        "sentence": "The curtains are complementary to the wall colour."
      },
      {
        "label": "Complimentary",
        "sentence": "The hotel provides complimentary breakfast."
      }
    ]
  },
  {
    "id": "confidant-confident",
    "title": "Confidant and confident",
    "difference": "A confidant is a trusted person with whom secrets are shared; confident means sure of oneself or certain.",
    "examples": [
      {
        "label": "Confidant",
        "sentence": "She told the secret to her closest confidant."
      },
      {
        "label": "Confident",
        "sentence": "He felt confident before the interview."
      }
    ]
  },
  {
    "id": "continual-continuous",
    "title": "Continual and continuous",
    "difference": "Continual describes repeated events with possible breaks; continuous describes something uninterrupted.",
    "examples": [
      {
        "label": "Continual",
        "sentence": "Continual interruptions made it hard to work."
      },
      {
        "label": "Continuous",
        "sentence": "The machine needs a continuous power supply."
      }
    ]
  },
  {
    "id": "core-corps",
    "title": "Core and corps",
    "difference": "Core means the central or most important part; corps means an organized group, often military or professional.",
    "examples": [
      {
        "label": "Core",
        "sentence": "Honesty is at the core of their relationship."
      },
      {
        "label": "Corps",
        "sentence": "The medical corps assisted the injured."
      }
    ]
  },
  {
    "id": "correspondents-co-respondents",
    "title": "Correspondents and co-respondents",
    "difference": "Correspondents are people who report news or exchange messages; co-respondents are people jointly named as respondents in a legal case.",
    "examples": [
      {
        "label": "Correspondents",
        "sentence": "Foreign correspondents reported from the capital."
      },
      {
        "label": "Co-respondents",
        "sentence": "The petition named two co-respondents."
      }
    ]
  },
  {
    "id": "credible-credulous",
    "title": "Credible and credulous",
    "difference": "Credible means believable or trustworthy; credulous describes someone too ready to believe things without evidence.",
    "examples": [
      {
        "label": "Credible",
        "sentence": "The report was based on credible sources."
      },
      {
        "label": "Credulous",
        "sentence": "A credulous reader might believe the false story."
      }
    ]
  },
  {
    "id": "criteria-criterion",
    "title": "Criteria and criterion",
    "difference": "Criteria is the plural of criterion; criterion is the singular word for a standard used in judging something.",
    "examples": [
      {
        "label": "Criteria",
        "sentence": "Applicants must meet all the eligibility criteria."
      },
      {
        "label": "Criterion",
        "sentence": "Experience is an important criterion for the role."
      }
    ]
  },
  {
    "id": "cygnet-signet",
    "title": "Cygnet and signet",
    "difference": "A cygnet is a young swan; a signet is a seal or a ring bearing an engraved seal.",
    "examples": [
      {
        "label": "Cygnet",
        "sentence": "A cygnet swam beside its mother."
      },
      {
        "label": "Signet",
        "sentence": "The letter was sealed with a signet ring."
      }
    ]
  },
  {
    "id": "decent-descent-dissent",
    "title": "Decent, descent, and dissent",
    "difference": "Decent means respectable or acceptable; descent means movement downward or ancestry; dissent means disagreement.",
    "examples": [
      {
        "label": "Decent",
        "sentence": "They found a decent hotel near the station."
      },
      {
        "label": "Descent",
        "sentence": "The aircraft began its descent."
      },
      {
        "label": "Dissent",
        "sentence": "Several members voiced dissent."
      }
    ]
  },
  {
    "id": "definite-defiant",
    "title": "Definite and defiant",
    "difference": "Definite means clear, certain, or precisely determined; defiant describes open resistance to authority.",
    "examples": [
      {
        "label": "Definite",
        "sentence": "We need a definite answer today."
      },
      {
        "label": "Defiant",
        "sentence": "The defiant student refused to obey."
      }
    ]
  },
  {
    "id": "delusion-illusion",
    "title": "Delusion and illusion",
    "difference": "A delusion is a firmly held false belief; an illusion is a misleading appearance or impression.",
    "examples": [
      {
        "label": "Delusion",
        "sentence": "He was under the delusion that everyone opposed him."
      },
      {
        "label": "Illusion",
        "sentence": "The mirrors created an illusion of space."
      }
    ]
  },
  {
    "id": "deprecate-depreciate",
    "title": "Deprecate and depreciate",
    "difference": "Deprecate means to express disapproval or mark something as discouraged or obsolete; depreciate means to decrease in value.",
    "examples": [
      {
        "label": "Deprecate",
        "sentence": "The director continued to deprecate wasteful practices."
      },
      {
        "label": "Depreciate",
        "sentence": "Cars generally depreciate over time."
      }
    ]
  },
  {
    "id": "deprivation-depravation",
    "title": "Deprivation and depravation",
    "difference": "Deprivation means lack of basic needs or comforts; depravation means moral corruption or degradation.",
    "examples": [
      {
        "label": "Deprivation",
        "sentence": "Sleep deprivation can affect memory."
      },
      {
        "label": "Depravation",
        "sentence": "The story depicts the depravation of a corrupt society."
      }
    ]
  },
  {
    "id": "detractor-distracter",
    "title": "Detractor and distracter",
    "difference": "A detractor is someone who criticizes a person or thing; a distracter is something that diverts attention (often spelled distractor).",
    "examples": [
      {
        "label": "Detractor",
        "sentence": "Even his detractor praised the speech."
      },
      {
        "label": "Distracter",
        "sentence": "The test included a plausible distracter among the choices."
      }
    ]
  },
  {
    "id": "device-devise",
    "title": "Device and devise",
    "difference": "A device is a tool or piece of equipment; devise is a verb meaning to plan, invent, or create.",
    "examples": [
      {
        "label": "Device",
        "sentence": "The technician repaired the electronic device."
      },
      {
        "label": "Devise",
        "sentence": "The team had to devise a new strategy."
      }
    ]
  },
  {
    "id": "diffuse-defuse",
    "title": "Diffuse and defuse",
    "difference": "Diffuse means to spread over an area or make less concentrated; defuse means to reduce tension or remove a fuse.",
    "examples": [
      {
        "label": "Diffuse",
        "sentence": "The curtains diffuse the sunlight."
      },
      {
        "label": "Defuse",
        "sentence": "She tried to defuse the argument."
      }
    ]
  },
  {
    "id": "dour-tower",
    "title": "Dour and tower",
    "difference": "Dour means stern, gloomy, or unfriendly; a tower is a tall structure, and tower can also mean to rise high above.",
    "examples": [
      {
        "label": "Dour",
        "sentence": "The dour manager rarely smiled."
      },
      {
        "label": "Tower",
        "sentence": "A stone tower stood above the village."
      }
    ]
  },
  {
    "id": "dual-duel",
    "title": "Dual and duel",
    "difference": "Dual means consisting of two parts or having two functions; a duel is a contest or fight between two people.",
    "examples": [
      {
        "label": "Dual",
        "sentence": "The phone has a dual-camera system."
      },
      {
        "label": "Duel",
        "sentence": "The rivals challenged each other to a duel."
      }
    ]
  },
  {
    "id": "elusive-illusive",
    "title": "Elusive and illusive",
    "difference": "Elusive means difficult to find or understand; illusive means deceptive or based on an illusion and is less common.",
    "examples": [
      {
        "label": "Elusive",
        "sentence": "The cause of the problem remained elusive."
      },
      {
        "label": "Illusive",
        "sentence": "The apparent solution proved illusive."
      }
    ]
  },
  {
    "id": "enervate-energize",
    "title": "Enervate and energize",
    "difference": "Enervate means to weaken or drain energy; energize means to give energy, enthusiasm, or strength.",
    "examples": [
      {
        "label": "Enervate",
        "sentence": "The exhausting journey began to enervate the team."
      },
      {
        "label": "Energize",
        "sentence": "A short walk can energize you."
      }
    ]
  },
  {
    "id": "enormity-enormousness",
    "title": "Enormity and enormousness",
    "difference": "Enormity can refer to extreme seriousness or wickedness and is also used for great scale; enormousness specifically refers to immense size or extent.",
    "examples": [
      {
        "label": "Enormity",
        "sentence": "The report revealed the enormity of the damage."
      },
      {
        "label": "Enormousness",
        "sentence": "The enormousness of the stadium amazed visitors."
      }
    ]
  },
  {
    "id": "epigram-and-epitaph",
    "title": "Epigram and epitaph",
    "difference": "\"Epigram\" is a noun meaning a concise, clever, or witty saying or remark. \"Epitaph\" is a noun referring to a phrase or written tribute inscribed on a tombstone in memory of a deceased person.",
    "examples": [
      {
        "label": "Epigram",
        "sentence": "The witty author opened each chapter with a memorable satirical epigram."
      },
      {
        "label": "Epitaph",
        "sentence": "Family members carefully selected a peaceful epitaph for the marble gravestone."
      }
    ]
  },
  {
    "id": "equable-and-equitable",
    "title": "Equable and equitable",
    "difference": "\"Equable\" is an adjective meaning not easily disturbed, tranquil, or having a calm and even temper (or stable weather). \"Equitable\" is an adjective meaning fair, just, and impartial in treatment.",
    "examples": [
      {
        "label": "Equable",
        "sentence": "She maintained an equable temperament even during high-pressure crises."
      },
      {
        "label": "Equitable",
        "sentence": "The mediator proposed an equitable settlement satisfying both parties."
      }
    ]
  },
  {
    "id": "expatriate-and-repatriate",
    "title": "Expatriate and repatriate",
    "difference": "\"Expatriate\" means to live outside one's native country, or a person who does so. \"Repatriate\" means to send someone back or return them to their home country or citizenship.",
    "examples": [
      {
        "label": "Expatriate",
        "sentence": "Many corporate professionals choose to work as an expatriate abroad."
      },
      {
        "label": "Repatriate",
        "sentence": "The government made arrangements to repatriate displaced citizens safely."
      }
    ]
  },
  {
    "id": "facetious-and-fictitious",
    "title": "Facetious and fictitious",
    "difference": "\"Facetious\" means treating serious issues with deliberately inappropriate humor or flippancy. \"Fictional\" or \"fictitious\" means created, made up, or not genuine and false.",
    "examples": [
      {
        "label": "Facetious",
        "sentence": "His facetious remarks during the serious safety briefing annoyed the manager."
      },
      {
        "label": "Fictitious",
        "sentence": "The spy novel featured an elaborate plot involving fictitious organizations."
      }
    ]
  },
  {
    "id": "fawn-and-phone",
    "title": "Fawn and phone",
    "difference": "\"Fawn\" is a verb meaning to give servile flattery or display exaggerated affection to gain favor, or a noun meaning a young deer. \"Phone\" is a noun or verb referring to a telephone device.",
    "examples": [
      {
        "label": "Fawn",
        "sentence": "Sales associates were trained not to fawn over customers too aggressively."
      },
      {
        "label": "Phone",
        "sentence": "Please remember to charge your mobile phone before leaving the house."
      }
    ]
  },
  {
    "id": "feat-and-feet",
    "title": "Feat and feet",
    "difference": "\"Feat\" is a noun referring to an achievement requiring great courage, skill, or strength. \"Feet\" is the plural noun referring to the lower extremities of the legs used for standing.",
    "examples": [
      {
        "label": "Feat",
        "sentence": "Climbing the sheer rock face without ropes was an incredible physical feat."
      },
      {
        "label": "Feet",
        "sentence": "Running a marathon puts a tremendous amount of strain on your feet."
      }
    ]
  },
  {
    "id": "fend-and-friend",
    "title": "Fend and friend",
    "difference": "\"Fend\" is a verb meaning to defend, ward off, or look after oneself without help. \"Friend\" is a noun referring to a person whom one knows and with whom one has a bond of mutual affection.",
    "examples": [
      {
        "label": "Fend",
        "sentence": "Orphaned animals must learn early how to fend for themselves in the wild."
      },
      {
        "label": "Friend",
        "sentence": "She invited her best childhood friend to attend the graduation party."
      }
    ]
  },
  {
    "id": "fisher-and-fissure",
    "title": "Fisher and fissure",
    "difference": "\"Fisher\" is a noun referring to someone who catches fish or a North American mammal. \"Fissure\" is a noun referring to a narrow opening, crack, or split in rock or tissue.",
    "examples": [
      {
        "label": "Fisher",
        "sentence": "A solitary fisher cast his line peacefully into the morning river."
      },
      {
        "label": "Fissure",
        "sentence": "Geologists examined a deep volcanic fissure running across the rocky valley."
      }
    ]
  },
  {
    "id": "flack-and-flak",
    "title": "Flack and flak",
    "difference": "\"Flack\" is a noun meaning publicity agent or press flack. \"Flak\" is a noun meaning anti-aircraft fire or strong criticism and opposition.",
    "examples": [
      {
        "label": "Flack",
        "sentence": "The celebrity hired an experienced public relations flack to handle media."
      },
      {
        "label": "Flak",
        "sentence": "The controversial new policy drew heavy flak from opposition politicians."
      }
    ]
  },
  {
    "id": "flagrant-and-fragrant",
    "title": "Flagrant and fragrant",
    "difference": "\"Flagrant\" is an adjective meaning conspicuously offensive, glaring, or obviously bad. \"Fragrant\" is an adjective meaning having a pleasant, sweet smell.",
    "examples": [
      {
        "label": "Flagrant",
        "sentence": "Embezzling funds from the charity was a flagrant violation of trust."
      },
      {
        "label": "Fragrant",
        "sentence": "Blooming jasmine flowers filled the warm summer evening with a fragrant aroma."
      }
    ]
  },
  {
    "id": "flea-and-flee",
    "title": "Flea and flee",
    "difference": "\"Flea\" is a noun referring to a small, wingless parasitic jumping insect. \"Flee\" is a verb meaning to run away from a place or danger rapidly.",
    "examples": [
      {
        "label": "Flea",
        "sentence": "The veterinarian prescribed a specialized topical treatment to keep fleas off the dog."
      },
      {
        "label": "Flee",
        "sentence": "Residents were ordered to evacuate and flee the approaching wildfire immediately."
      }
    ]
  },
  {
    "id": "flex-and-fleck",
    "title": "Flex and fleck",
    "difference": "\"Flex\" is a verb meaning to bend a muscle or joint. \"Fleck\" is a noun meaning a very small patch of color or light, a speck.",
    "examples": [
      {
        "label": "Flex",
        "sentence": "Bodybuilders love to flex their muscles in front of the competition mirror."
      },
      {
        "label": "Fleck",
        "sentence": "The antique painting had a delicate fleck of gold leaf embedded in the paint."
      }
    ]
  },
  {
    "id": "flout-and-flaunt",
    "title": "Flout and flaunt",
    "difference": "\"Flout\" means to openly disobey, disregard, or defy a rule or law. \"Flaunt\" means to show off, display proudly, or exhibit ostentatiously.",
    "examples": [
      {
        "label": "Flout",
        "sentence": "Drivers who speed choose to flout basic traffic safety regulations."
      },
      {
        "label": "Flaunt",
        "sentence": "Successful entrepreneurs sometimes like to flaunt their wealth publicly."
      }
    ]
  },
  {
    "id": "formally-and-formerly",
    "title": "Formally and formerly",
    "difference": "\"Formally\" means in a conventional, official, or ceremonial manner. \"Formerly\" means in the past, previously, or at an earlier time.",
    "examples": [
      {
        "label": "Formally",
        "sentence": "Guests were requested to dress formally for the evening gala event."
      },
      {
        "label": "Formerly",
        "sentence": "The modern café was formerly an old industrial manufacturing warehouse."
      }
    ]
  },
  {
    "id": "fortuitous-and-fortunate",
    "title": "Fortuitous and fortunate",
    "difference": "\"Fortuitous\" means happening by a lucky accident or chance (not necessarily fortunate, though often confused). \"Fortunate\" means favored by good luck or prosperous.",
    "examples": [
      {
        "label": "Fortuitous",
        "sentence": "Their chance meeting at the airport proved to be a fortuitous coincidence."
      },
      {
        "label": "Fortunate",
        "sentence": "She felt fortunate to survive the major car accident without injury."
      }
    ]
  },
  {
    "id": "found-and-founded",
    "title": "Found and founded",
    "difference": "\"Found\" is the present-tense verb meaning to discover or establish an organization. \"Founded\" is the past tense of \"to found\" meaning established, or the past tense of \"to find\".",
    "examples": [
      {
        "label": "Found",
        "sentence": "Archaeologists hoped to found new evidence regarding ancient civilizations."
      },
      {
        "label": "Founded",
        "sentence": "The technology startup was founded by two university graduates."
      }
    ]
  },
  {
    "id": "gamble-and-gambol",
    "title": "Gamble and gambol",
    "difference": "\"Gamble\" is a verb or noun meaning to play games of chance for money or take risky bets. \"Gambol\" is a verb meaning to run or jump about playfully, to frolic.",
    "examples": [
      {
        "label": "Gamble",
        "sentence": "Visiting a casino to gamble can lead to rapid financial losses."
      },
      {
        "label": "Gambol",
        "sentence": "Young lambs began to gambol across the green spring meadow."
      }
    ]
  },
  {
    "id": "gantt-and-gauntlet",
    "title": "Gantt and gauntlet",
    "difference": "\"Gantt\" refers to a type of bar chart used in project management (Gantt chart). \"Gauntlet\" refers to a stout medieval glove or a severe trial/challenge.",
    "examples": [
      {
        "label": "Gantt",
        "sentence": "The project manager created a detailed Gantt chart to track task schedules."
      },
      {
        "label": "Gauntlet",
        "sentence": "The knight threw down his heavy steel gauntlet to challenge his rival."
      }
    ]
  },
  {
    "id": "gibe-jibe-and-gybe",
    "title": "Gibe, jibe, and gybe",
    "difference": "\"Gibe\" means to jeer or mock insultingly. \"Jibe\" means to agree or be consistent. \"Gybe\" is a sailing term meaning to change a sailing vessel's course.",
    "examples": [
      {
        "label": "Gibe",
        "sentence": "Bullies hurled a cruel gibe at the new student on the playground."
      },
      {
        "label": "Jibe",
        "sentence": "The witness's statement did not jibe with the physical forensic evidence."
      },
      {
        "label": "Gybe",
        "sentence": "The skipper needed to gybe the yacht smoothly to catch the changing wind."
      }
    ]
  },
  {
    "id": "gratis-and-gracious",
    "title": "Gratis and gracious",
    "difference": "\"Gratis\" means free of charge, without cost. \"Gracious\" means courteous, kind, and pleasant, especially to those of lower status.",
    "examples": [
      {
        "label": "Gratis",
        "sentence": "Admission to the public art gallery on Tuesdays is entirely gratis."
      },
      {
        "label": "Gracious",
        "sentence": "The host remained gracious and welcoming despite the unexpected delays."
      }
    ]
  },
  {
    "id": "grizzly-and-grisly",
    "title": "Grizzly and grisly",
    "difference": "\"Grizzly\" refers to a large North American brown bear or graying hair. \"Grisly\" means causing horror, disgust, or revulsion, gruesome.",
    "examples": [
      {
        "label": "Grizzly",
        "sentence": "Campers were warned about grizzly bears foraging for food in the park."
      },
      {
        "label": "Grisly",
        "sentence": "Detectives investigated a grisly crime scene inside the abandoned cabin."
      }
    ]
  },
  {
    "id": "guaranty-and-guarantee",
    "title": "Guaranty and guarantee",
    "difference": "\"Guaranty\" is a legal promise or formal undertaking to answer for another's debt. \"Guarantee\" is a formal assurance or promise that certain conditions will be fulfilled.",
    "examples": [
      {
        "label": "Guaranty",
        "sentence": "The bank required a financial guaranty before approving the commercial loan."
      },
      {
        "label": "Guarantee",
        "sentence": "The manufacturer offered a lifetime warranty guarantee on all parts."
      }
    ]
  },
  {
    "id": "hangar-and-hanger",
    "title": "Hangar and hanger",
    "difference": "\"Hangar\" is a large building with extensive floor area for housing aircraft. \"Hanger\" is a curved loop device used for hanging garments in a closet.",
    "examples": [
      {
        "label": "Hangar",
        "sentence": "Mechanics rolled the private jet inside the spacious aircraft hangar."
      },
      {
        "label": "Hanger",
        "sentence": "She hung her winter coat neatly on a wooden clothes hanger."
      }
    ]
  },
  {
    "id": "hardly-and-sternly",
    "title": "Hardly and sternly",
    "difference": "\"Hardly\" means barely or almost not at all. \"Sternly\" means in a serious, strict, or severe manner.",
    "examples": [
      {
        "label": "Hardly",
        "sentence": "There was hardly any food left in the refrigerator after the weekend."
      },
      {
        "label": "Sternly",
        "sentence": "The teacher spoke sternly to the students who arrived late."
      }
    ]
  },
  {
    "id": "haul-and-hall",
    "title": "Haul and hall",
    "difference": "\"Haul\" means to pull or drag with effort. \"Hall\" is a large room, corridor, or building used for assemblies.",
    "examples": [
      {
        "label": "Haul",
        "sentence": "Workers used a winch to haul the heavy cargo crate onto the deck."
      },
      {
        "label": "Hall",
        "sentence": "Students hurried down the long school hall to reach their next class."
      }
    ]
  },
  {
    "id": "heal-heel-and-he-ll",
    "title": "Heal, heel, and he'll",
    "difference": "\"Heal\" means to become healthy again or cure. \"Heel\" is the back part of the foot or shoe. \"He'll\" is a contraction for \"he will\".",
    "examples": [
      {
        "label": "Heal",
        "sentence": "Deep cuts take time to heal properly without leaving severe scars."
      },
      {
        "label": "Heel",
        "sentence": "The high heel of her formal shoe snapped while walking on gravel."
      },
      {
        "label": "He'll",
        "sentence": "He'll arrive at the train station by seven o'clock tonight."
      }
    ]
  },
  {
    "id": "hoarse-and-horse",
    "title": "Hoarse and horse",
    "difference": "\"Hoarse\" means sounding rough and harsh, typically as the result of sore throat or shouting. \"Horse\" is a large quadruped mammal used for riding and farm work.",
    "examples": [
      {
        "label": "Hoarse",
        "sentence": "Cheering loudly at the football match left his voice completely hoarse."
      },
      {
        "label": "Horse",
        "sentence": "The majestic white horse galloped gracefully across the open pasture."
      }
    ]
  },
  {
    "id": "imply-and-infer",
    "title": "Imply and infer",
    "difference": "\"Imply\" means to strongly suggest or hint at something without stating it directly (done by the speaker/writer). \"Infer\" means to deduce or conclude information from evidence and reasoning (done by the listener/reader).",
    "examples": [
      {
        "label": "Imply",
        "sentence": "Her tone seemed to imply that she was unhappy with the decision."
      },
      {
        "label": "Infer",
        "sentence": "Auditors were able to infer financial discrepancies from the missing receipts."
      }
    ]
  },
  {
    "id": "incipient-and-insipid",
    "title": "Incipient and insipid",
    "difference": "\"Incipient\" means in an initial stage; beginning to happen or develop. \"Insipid\" means lacking flavor, vigor, or interest; bland.",
    "examples": [
      {
        "label": "Incipient",
        "sentence": "Scientists detected incipient signs of corrosion on the metal bridge beam."
      },
      {
        "label": "Insipid",
        "sentence": "The watery soup tasted completely insipid and lacked any spices."
      }
    ]
  },
  {
    "id": "indict-and-indictment",
    "title": "Indict and indictment",
    "difference": "\"Indict\" is a verb meaning to formally charge or accuse someone of a serious crime. \"Indictment\" is the noun form of the formal accusation.",
    "examples": [
      {
        "label": "Indict",
        "sentence": "A grand jury voted to indict the executive on charges of fraud."
      },
      {
        "label": "Indictment",
        "sentence": "Prosecutors issued a formal indictment detailing counts of corruption."
      }
    ]
  },
  {
    "id": "inoculate-and-vaccinate",
    "title": "Inoculate and vaccinate",
    "difference": "\"Inoculate\" and \"vaccinate\" are often used interchangeably to mean administering a vaccine to produce immunity, though historically inoculation used material from a patient.",
    "examples": [
      {
        "label": "Inoculate",
        "sentence": "Health workers traveled to rural villages to inoculate children against polio."
      },
      {
        "label": "Vaccinate",
        "sentence": "Pediatricians recommend parents vaccinate infants according to schedule."
      }
    ]
  },
  {
    "id": "interments-and-internments",
    "title": "Interments and internments",
    "difference": "\"Interments\" refers to the burial of a corpse in a grave. \"Internments\" refers to the state of being confined as a prisoner, especially for political reasons.",
    "examples": [
      {
        "label": "Interments",
        "sentence": "Historic cemetery records documented hundreds of quiet military interments."
      },
      {
        "label": "Internments",
        "sentence": "The wartime policy led to the unjust internments of civilian populations."
      }
    ]
  },
  {
    "id": "irrelevant-and-irreverent",
    "title": "Irrelevant and irreverent",
    "difference": "\"Irrelevant\" means not connected to or relevant to the matter at hand. \"Irreverent\" means showing a lack of respect for people or things that are generally taken seriously.",
    "examples": [
      {
        "label": "Irrelevant",
        "sentence": "The speaker brought up several irrelevant details during the debate."
      },
      {
        "label": "Irreverent",
        "sentence": "The comedian's irreverent jokes shocked some conservative audience members."
      }
    ]
  },
  {
    "id": "jargon-and-argot",
    "title": "Jargon and argot",
    "difference": "\"Jargon\" is special words or expressions used by a particular profession or group. \"Argot\" is the slang or secret language used by a particular group or subculture.",
    "examples": [
      {
        "label": "Jargon",
        "sentence": "Medical journals are often difficult to read due to technical scientific jargon."
      },
      {
        "label": "Argot",
        "sentence": "Detectives studied the secret criminal argot used by the smuggling ring."
      }
    ]
  },
  {
    "id": "jealous-and-envious",
    "title": "Jealous and envious",
    "difference": "\"Jealous\" typically involves fear of losing something you have to a rival (possessive). \"Envious\" involves wanting something that someone else has (covetous).",
    "examples": [
      {
        "label": "Jealous",
        "sentence": "He felt jealous when his partner spent time with new colleagues."
      },
      {
        "label": "Envious",
        "sentence": "She felt envious of her friend's brand-new luxury sports car."
      }
    ]
  },
  {
    "id": "kernel-and-colonel",
    "title": "Kernel and colonel",
    "difference": "\"Kernel\" is a softer, edible part of a nut or seed, or a core. \"Colonel\" (pronounced \"kernel\") is an army officer rank.",
    "examples": [
      {
        "label": "Kernel",
        "sentence": "Popcorn kernels must be heated until they burst into fluffy snacks."
      },
      {
        "label": "Colonel",
        "sentence": "A decorated army colonel led the military battalion into formation."
      }
    ]
  },
  {
    "id": "knot-and-not",
    "title": "Knot and not",
    "difference": "\"Knot\" is a fastening made by tying a piece of string or rope. \"Not\" is an adverb used to express negation, denial, or refusal.",
    "examples": [
      {
        "label": "Knot",
        "sentence": "Sailors tied a secure knot around the wooden cleat on the dock."
      },
      {
        "label": "Not",
        "sentence": "She decided not to attend the evening party due to exhaustion."
      }
    ]
  },
  {
    "id": "lessor-and-lessee",
    "title": "Lessor and lessee",
    "difference": "\"Lessor\" is a person who leases property to someone else (the landlord). \"Lessee\" is a person who holds the lease of a property (the tenant).",
    "examples": [
      {
        "label": "Lessor",
        "sentence": "The commercial lessor required a security deposit before handing over keys."
      },
      {
        "label": "Lessee",
        "sentence": "The business lessee signed a three-year lease agreement for the office space."
      }
    ]
  },
  {
    "id": "levy-and-levee",
    "title": "Levy and levee",
    "difference": "\"Levy\" means to impose or collect a tax, fee, or fine. \"Levee\" is an embankment built to prevent the overflow of a river.",
    "examples": [
      {
        "label": "Levy",
        "sentence": "The local government decided to levy a new tax on commercial properties."
      },
      {
        "label": "Levee",
        "sentence": "Emergency workers reinforced the river levee to prevent floodwaters."
      }
    ]
  },
  {
    "id": "liable-and-libel",
    "title": "Liable and libel",
    "difference": "\"Liable\" means legally responsible or likely to do something. \"Libel\" is a published false statement that is damaging to a person's reputation; written defamation.",
    "examples": [
      {
        "label": "Liable",
        "sentence": "Manufacturers are held strictly liable for defective product safety hazards."
      },
      {
        "label": "Libel",
        "sentence": "The newspaper faced a costly libel lawsuit after publishing false accusations."
      }
    ]
  },
  {
    "id": "luxuriant-and-luxurious",
    "title": "Luxuriant and luxurious",
    "difference": "\"Luxuriant\" means growing thickly, lush, or abundantly rich in production. \"Luxurious\" means characterized by luxury, extremely comfortable, or expensive and lavish.",
    "examples": [
      {
        "label": "Luxuriant",
        "sentence": "The tropical rainforest featured luxuriant green foliage and exotic plants."
      },
      {
        "label": "Luxurious",
        "sentence": "They booked a luxurious suite at the five-star beachfront resort."
      }
    ]
  },
  {
    "id": "mackerel-and-macrame",
    "title": "Mackerel and macrame",
    "difference": "\"Mackerel\" is a fast-swimming oceanic food fish with dark vertical stripes. \"Macrame\" is a textile craft using knotting techniques to make decorative hangings.",
    "examples": [
      {
        "label": "Mackerel",
        "sentence": "The local fisherman caught fresh mackerel off the rocky coastline."
      },
      {
        "label": "Macrame",
        "sentence": "She spent the weekend crafting an intricate wall hanging using macrame cords."
      }
    ]
  },
  {
    "id": "mall-and-maul",
    "title": "Mall and maul",
    "difference": "\"Mall\" is a large enclosed shopping center or pedestrian retail area. \"Maul\" is a verb meaning to wound, scratch, or savage violently with claws or heavy handling, or a heavy hammer.",
    "examples": [
      {
        "label": "Mall",
        "sentence": "Teenagers gathered inside the crowded suburban shopping mall on Saturday."
      },
      {
        "label": "Maul",
        "sentence": "Wildlife officials warned hikers about bears known to maul stray livestock."
      }
    ]
  },
  {
    "id": "manner-and-manor",
    "title": "Manner and manor",
    "difference": "\"Manner\" means a way in which a thing is done or a person's behavior. \"Manor\" is a large country house with lands, historically belonging to a lord.",
    "examples": [
      {
        "label": "Manner",
        "sentence": "He answered all the interview questions in a polite and professional manner."
      },
      {
        "label": "Manor",
        "sentence": "The historic English manor was surrounded by extensive green gardens."
      }
    ]
  },
  {
    "id": "marital-and-martial",
    "title": "Marital and martial",
    "difference": "\"Marital\" relates to marriage or the relationship between spouses. \"Martial\" relates to fighting, war, combat, or the military.",
    "examples": [
      {
        "label": "Marital",
        "sentence": "Couples often seek professional counseling to resolve marital disputes."
      },
      {
        "label": "Martial",
        "sentence": "Students learned self-defense techniques in their weekly martial arts class."
      }
    ]
  },
  {
    "id": "maybe-and-may-be",
    "title": "Maybe and may be",
    "difference": "\"Maybe\" is an adverb meaning perhaps or possibly. \"May be\" is a verb phrase expressing possibility.",
    "examples": [
      {
        "label": "Maybe",
        "sentence": "Maybe we can reschedule our meeting for next week."
      },
      {
        "label": "May be",
        "sentence": "The package you ordered may be delivered by tomorrow afternoon."
      }
    ]
  },
  {
    "id": "mean-and-mien",
    "title": "Mean and mien",
    "difference": "\"Mean\" can mean average, unkind, or signify something. \"Mien\" is a noun referring to a person's appearance, air, or facial expression indicating their mood.",
    "examples": [
      {
        "label": "Mean",
        "sentence": "Calculating the mathematical mean requires adding all values and dividing by the count."
      },
      {
        "label": "Mien",
        "sentence": "Despite the stressful situation, she maintained a calm and confident mien."
      }
    ]
  },
  {
    "id": "medal-and-meddle",
    "title": "Medal and meddle",
    "difference": "\"Medal\" is a flat metal disc awarded as a prize or honor. \"Meddle\" is a verb meaning to interfere in something that is not one's concern.",
    "examples": [
      {
        "label": "Medal",
        "sentence": "The champion athlete proudly wore her gold medal around her neck."
      },
      {
        "label": "Meddle",
        "sentence": "It is unwise to meddle in private family affairs that do not concern you."
      }
    ]
  },
  {
    "id": "mega-and-meter",
    "title": "Mega and meter",
    "difference": "\"Mega\" is a prefix meaning one million or extraordinarily large. \"Meter\" is a fundamental unit of length in the metric system, or a measuring device.",
    "examples": [
      {
        "label": "Mega",
        "sentence": "The tech corporation invested millions in a mega data center."
      },
      {
        "label": "Meter",
        "sentence": "The track runner completed the four-hundred-meter race in record time."
      }
    ]
  },
  {
    "id": "meretricious-and-meritorious",
    "title": "Meretricious and meritorious",
    "difference": "\"Meretricious\" means apparently attractive but having in reality no value or integrity. \"Meritorious\" means deserving reward, praise, or formal recognition.",
    "examples": [
      {
        "label": "Meretricious",
        "sentence": "The advertisement relied on flashy graphics and meretricious promises."
      },
      {
        "label": "Meritorious",
        "sentence": "The firefighter received a medal for his meritorious service during the rescue."
      }
    ]
  },
  {
    "id": "metal-and-mettle",
    "title": "Metal and mettle",
    "difference": "\"Metal\" is a solid material such as iron, gold, or steel. \"Mettle\" is a person's ability to cope well with difficulties; spirit or resilience.",
    "examples": [
      {
        "label": "Metal",
        "sentence": "The heavy gate was constructed from durable wrought iron."
      },
      {
        "label": "Mettle",
        "sentence": "The grueling mountain climb tested the young hikers' true mettle."
      }
    ]
  },
  {
    "id": "mewl-and-muddle",
    "title": "Mewl and muddle",
    "difference": "\"Mewl\" means to cry weakly or whimper like a baby. \"Muddle\" means to bring into a disordered or confused state, or a confused mess.",
    "examples": [
      {
        "label": "Mewl",
        "sentence": "The hungry kitten began to mewl softly near the back door."
      },
      {
        "label": "Muddle",
        "sentence": "Misplacing the financial folders caused a major muddle in the office."
      }
    ]
  },
  {
    "id": "milieu-and-mildew",
    "title": "Milieu and mildew",
    "difference": "\"Milieu\" is a person's social environment, setting, or surroundings. \"Mildew\" is a thin, whitish fungus that grows on plants or damp materials.",
    "examples": [
      {
        "label": "Milieu",
        "sentence": "Growing up in an artistic milieu shaped her creative career path."
      },
      {
        "label": "Mildew",
        "sentence": "Damp basement conditions caused dark spots of mildew to form on the walls."
      }
    ]
  },
  {
    "id": "mimeograph-and-monograph",
    "title": "Mimeograph and monograph",
    "difference": "\"Mimeograph\" is an old duplicating machine using a stencil. \"Monograph\" is a detailed written study of a single specialized subject.",
    "examples": [
      {
        "label": "Mimeograph",
        "sentence": "Old school offices used a mechanical mimeograph to print worksheets."
      },
      {
        "label": "Monograph",
        "sentence": "The professor published an academic monograph on medieval history."
      }
    ]
  },
  {
    "id": "miscreant-and-minimalist",
    "title": "Miscreant and minimalist",
    "difference": "\"Miscreant\" is a person who behaves badly or breaks the law. \"Minimalist\" is a person who advocates minimalism or simple, sparse design.",
    "examples": [
      {
        "label": "Miscreant",
        "sentence": "Police officers quickly apprehended the miscreant who stole the bicycle."
      },
      {
        "label": "Minimalist",
        "sentence": "Her apartment was decorated in a clean, minimalist aesthetic style."
      }
    ]
  },
  {
    "id": "monologue-and-dialogue",
    "title": "Monologue and dialogue",
    "difference": "\"Monologue\" is a long speech by one actor in a play or movie. \"Dialogue\" is a conversation between two or more people.",
    "examples": [
      {
        "label": "Monologue",
        "sentence": "The actor delivered a powerful theatrical monologue on stage."
      },
      {
        "label": "Dialogue",
        "sentence": "Open dialogue between team members is essential for resolving conflicts."
      }
    ]
  },
  {
    "id": "moot-and-mute",
    "title": "Moot and mute",
    "difference": "\"Moot\" means subject to debate, arguable, or having no practical significance. \"Mute\" means silent, unable to speak, or silencing sound.",
    "examples": [
      {
        "label": "Moot",
        "sentence": "With the project canceled, the budget debate became completely moot."
      },
      {
        "label": "Mute",
        "sentence": "He pressed the remote control button to mute the loud television commercial."
      }
    ]
  },
  {
    "id": "mutate-and-mutilate",
    "title": "Mutate and mutilate",
    "difference": "\"Mutate\" means to change or alter form, often genetically. \"Mutilate\" means to inflict severe damage or disfigurement upon a body or object.",
    "examples": [
      {
        "label": "Mutate",
        "sentence": "Viruses can mutate rapidly over time, creating new resistant strains."
      },
      {
        "label": "Mutilate",
        "sentence": "Vandals tried to mutilate the historic public sculpture in the park."
      }
    ]
  },
  {
    "id": "myth-and-methodology",
    "title": "Myth and methodology",
    "difference": "\"Myth\" is a traditional story or widely held false belief. \"Methodology\" is a system of methods used in a particular area of study or activity.",
    "examples": [
      {
        "label": "Myth",
        "sentence": "Ancient cultures created stories and myths to explain natural phenomena."
      },
      {
        "label": "Methodology",
        "sentence": "The research team outlined a rigorous statistical methodology."
      }
    ]
  },
  {
    "id": "nadir-and-zenith",
    "title": "Nadir and zenith",
    "difference": "\"Nadir\" is the lowest point or point of greatest adversity. \"Zenith\" is the time at which something is most powerful or successful; the peak.",
    "examples": [
      {
        "label": "Nadir",
        "sentence": "Losing his job marked the financial nadir of his professional career."
      },
      {
        "label": "Zenith",
        "sentence": "Winning the championship trophy brought the team to its career zenith."
      }
    ]
  },
  {
    "id": "naive-and-native",
    "title": "Naïve and native",
    "difference": "\"Naïve\" means showing a lack of experience, wisdom, or judgment. \"Native\" relates to someone born in a particular place or a local indigenous plant or animal.",
    "examples": [
      {
        "label": "Naïve",
        "sentence": "She was initially too naïve to recognize the dishonest business scam."
      },
      {
        "label": "Native",
        "sentence": "Koalas are native marsupials found across Australian eucalyptus forests."
      }
    ]
  },
  {
    "id": "natal-and-neonatal",
    "title": "Natal and neonatal",
    "difference": "\"Natal\" relates to birth or the date or place of birth. \"Neonatal\" relates to newborn babies, especially the first month after birth.",
    "examples": [
      {
        "label": "Natal",
        "sentence": "Hospital records documented the infant's exact natal weight and time."
      },
      {
        "label": "Neonatal",
        "sentence": "Specialized doctors worked tirelessly inside the neonatal intensive care unit."
      }
    ]
  },
  {
    "id": "natty-and-gnarly",
    "title": "Natty and gnarly",
    "difference": "\"Natty\" means smart and fashionable in appearance. \"Gnarly\" means knotted, rugged, or difficult or dangerous (also used in surf slang).",
    "examples": [
      {
        "label": "Natty",
        "sentence": "He wore a natty tailored suit to the corporate awards banquet."
      },
      {
        "label": "Gnarly",
        "sentence": "Surfers braved the gnarly ocean waves during the coastal storm."
      }
    ]
  },
  {
    "id": "naval-and-navel",
    "title": "Naval and navel",
    "difference": "\"Naval\" relates to a country's navy, ships, or marine military forces. \"Navel\" is the anatomical belly button on the human abdomen.",
    "examples": [
      {
        "label": "Naval",
        "sentence": "The country's naval fleet patrolled international shipping lanes."
      },
      {
        "label": "Navel",
        "sentence": "She wore a crop top that exposed her midriff and navel."
      }
    ]
  },
  {
    "id": "negligent-and-negligible",
    "title": "Negligent and negligible",
    "difference": "\"Negligent\" means failing to take proper care in doing something; careless. \"Negligible\" means so small or unimportant as to be not worth considering.",
    "examples": [
      {
        "label": "Negligent",
        "sentence": "The security guard was fired for being negligent on duty."
      },
      {
        "label": "Negligible",
        "sentence": "The minor scratch on the used car had a negligible effect on its price."
      }
    ]
  },
  {
    "id": "nepotism-and-despotism",
    "title": "Nepotism and despotism",
    "difference": "\"Nepotism\" is the practice of favoring relatives or friends by those with power or influence. \"Despotism\" is the exercise of absolute power, typically in a cruel way.",
    "examples": [
      {
        "label": "Nepotism",
        "sentence": "Hiring family members for executive positions was criticized as corporate nepotism."
      },
      {
        "label": "Despotism",
        "sentence": "Citizens rebelled against years of cruel royal despotism and tyranny."
      }
    ]
  },
  {
    "id": "nettle-and-mettle",
    "title": "Nettle and mettle",
    "difference": "\"Nettle\" is a prickly plant or a verb meaning to irritate or annoy. \"Mettle\" means resilience, courage, or spirit.",
    "examples": [
      {
        "label": "Nettle",
        "sentence": "Walking through the overgrown brush caused skin irritation from stinging nettles."
      },
      {
        "label": "Mettle",
        "sentence": "Her calm response to repeated setbacks showed remarkable mettle."
      }
    ]
  },
  {
    "id": "nocturnal-and-diurnal",
    "title": "Nocturnal and diurnal",
    "difference": "\"Nocturnal\" means active at night. \"Diurnal\" means active during the daytime.",
    "examples": [
      {
        "label": "Nocturnal",
        "sentence": "Owls and bats are typical nocturnal creatures that hunt after dark."
      },
      {
        "label": "Diurnal",
        "sentence": "Most songbirds follow a diurnal routine, resting during night hours."
      }
    ]
  },
  {
    "id": "nominal-and-numinal",
    "title": "Nominal and numinal",
    "difference": "\"Nominal\" means existing in name only or a very small or insignificant amount. \"Numinal\" relates to spiritual or divine numinous essence.",
    "examples": [
      {
        "label": "Nominal",
        "sentence": "The museum charged only a nominal admission fee for students."
      },
      {
        "label": "Numinal",
        "sentence": "Philosophers contemplated the deep numinal mysteries of existence."
      }
    ]
  },
  {
    "id": "nostalgia-and-anesthesia",
    "title": "Nostalgia and anesthesia",
    "difference": "\"Nostalgia\" is a sentimental longing for the past. \"Anesthesia\" is insensibility to pain induced by medical drugs.",
    "examples": [
      {
        "label": "Nostalgia",
        "sentence": "Looking through old family photo albums filled her with warm nostalgia."
      },
      {
        "label": "Anesthesia",
        "sentence": "The surgeon administered general anesthesia before starting the operation."
      }
    ]
  },
  {
    "id": "notorious-and-illustrious",
    "title": "Notorious and illustrious",
    "difference": "\"Notorious\" means famous or well known, typically for something bad. \"Illustrious\" means well respected, admired, and distinguished.",
    "examples": [
      {
        "label": "Notorious",
        "sentence": "The gang was notorious for executing elaborate bank robberies."
      },
      {
        "label": "Illustrious",
        "sentence": "An illustrious group of Nobel laureates attended the science gala."
      }
    ]
  },
  {
    "id": "novice-and-connoisseur",
    "title": "Novice and connoisseur",
    "difference": "\"Novice\" is a person new to or inexperienced in a field. \"Connoisseur\" is an expert judge in matters of taste or fine arts.",
    "examples": [
      {
        "label": "Novice",
        "sentence": "The ski instructor taught basic balance techniques to the skiing novice."
      },
      {
        "label": "Connoisseur",
        "sentence": "The connoisseur identified the vintage notes immediately."
      }
    ]
  },
  {
    "id": "noxious-and-obnoxious",
    "title": "Noxious and obnoxious",
    "difference": "\"Noxious\" means harmful, poisonous, or very unpleasant, typically describing substances. \"Obnoxious\" means extremely unpleasant, offensive, or objectionable, typically describing behavior or people.",
    "examples": [
      {
        "label": "Noxious",
        "sentence": "Chemical factories release noxious fumes into the atmosphere."
      },
      {
        "label": "Obnoxious",
        "sentence": "His obnoxious behavior at the restaurant annoyed other diners."
      }
    ]
  },
  {
    "id": "nuance-and-instance",
    "title": "Nuance and instance",
    "difference": "\"Nuance\" is a subtle difference in shade of meaning, expression, or sound. \"Instance\" is an example or single occurrence.",
    "examples": [
      {
        "label": "Nuance",
        "sentence": "Translators must capture every linguistic nuance of the original poem."
      },
      {
        "label": "Instance",
        "sentence": "This is a clear instance of technical system failure."
      }
    ]
  },
  {
    "id": "nurture-and-nature",
    "title": "Nurture and nature",
    "difference": "\"Nurture\" means caring for and encouraging the growth or development of someone. \"Nature\" is the inherent physical world or someone's innate character.",
    "examples": [
      {
        "label": "Nurture",
        "sentence": "Parents strive to nurture creativity and curiosity in their children."
      },
      {
        "label": "Nature",
        "sentence": "Exploring wild forests helps people appreciate the beauty of nature."
      }
    ]
  },
  {
    "id": "oaf-and-oases",
    "title": "Oaf and oases",
    "difference": "\"Oaf\" is a clumsy, stupid, or awkward person. \"Oases\" is the plural of oasis, a fertile spot in a desert where water is found.",
    "examples": [
      {
        "label": "Oaf",
        "sentence": "The clumsy oaf knocked over the fragile vase in the antique shop."
      },
      {
        "label": "Oases",
        "sentence": "Desert travelers rejoiced upon discovering shaded green oases."
      }
    ]
  },
  {
    "id": "obese-and-astute",
    "title": "Obese and astute",
    "difference": "\"Obese\" means grossly overweight. \"Astute\" means having or showing an ability to accurately assess situations or people and turn this to one's advantage.",
    "examples": [
      {
        "label": "Obese",
        "sentence": "Veterinarians noted that overfeeding can cause pets to become obese."
      },
      {
        "label": "Astute",
        "sentence": "The astute investor predicted the market shift before competitors."
      }
    ]
  },
  {
    "id": "objective-and-subjective",
    "title": "Objective and subjective",
    "difference": "\"Objective\" means not influenced by personal feelings or opinions when considering facts. \"Subjective\" means based on or influenced by personal feelings, tastes, or opinions.",
    "examples": [
      {
        "label": "Objective",
        "sentence": "Scientists strive to maintain objective analysis during experiments."
      },
      {
        "label": "Subjective",
        "sentence": "Art critique is often highly subjective and varies by individual."
      }
    ]
  },
  {
    "id": "oblivious-and-observant",
    "title": "Oblivious and observant",
    "difference": "\"Oblivious\" means not aware of or not concerned about what is happening around one. \"Observant\" means quick to notice or perceive things; alert.",
    "examples": [
      {
        "label": "Oblivious",
        "sentence": "He walked past the sign completely oblivious to the warning message."
      },
      {
        "label": "Observant",
        "sentence": "The observant detective noticed subtle clues left at the crime scene."
      }
    ]
  },
  {
    "id": "obtuse-and-acute",
    "title": "Obtuse and acute",
    "difference": "\"Obtuse\" means annoyingly insensitive or slow to understand, or an angle greater than 90 degrees. \"Acute\" means sharp, severe, or an angle less than 90 degrees.",
    "examples": [
      {
        "label": "Obtuse",
        "sentence": "He played dumb and pretended to be obtuse during questioning."
      },
      {
        "label": "Acute",
        "sentence": "The patient experienced acute abdominal pain requiring emergency care."
      }
    ]
  },
  {
    "id": "odious-and-odorous",
    "title": "Odious and odorous",
    "difference": "\"Odious\" means extremely unpleasant or repulsive. \"Odorous\" means having a smell, especially a strong or unpleasant one.",
    "examples": [
      {
        "label": "Odious",
        "sentence": "Stealing money from charitable donations is an odious crime."
      },
      {
        "label": "Odorous",
        "sentence": "Decaying organic waste produced an intensely odorous smell."
      }
    ]
  },
  {
    "id": "official-and-officious",
    "title": "Official and officious",
    "difference": "\"Official\" relates to an authority or public office. \"Officious\" means assertively domineering in an annoying bureaucratic way; meddlesome.",
    "examples": [
      {
        "label": "Official",
        "sentence": "The government agency issued an official statement regarding policy."
      },
      {
        "label": "Officious",
        "sentence": "The officious security guard demanded unnecessary paperwork."
      }
    ]
  },
  {
    "id": "ominous-and-auspicious",
    "title": "Ominous and auspicious",
    "difference": "\"Ominous\" means giving the troubling impression that something bad is going to happen. \"Auspicious\" means conducive to success; favorable.",
    "examples": [
      {
        "label": "Ominous",
        "sentence": "Dark, ominous storm clouds gathered quickly over the mountains."
      },
      {
        "label": "Auspicious",
        "sentence": "Clear skies and warm weather provided an auspicious start to the trip."
      }
    ]
  },
  {
    "id": "opaque-and-transparent",
    "title": "Opaque and transparent",
    "difference": "\"Opaque\" means not able to be seen through. \"Transparent\" means allowing light to pass through so that objects behind can be distinctly seen.",
    "examples": [
      {
        "label": "Opaque",
        "sentence": "Heavy curtains made the bedroom windows completely opaque."
      },
      {
        "label": "Transparent",
        "sentence": "Clean glass windows are transparent and let sunlight flood in."
      }
    ]
  },
  {
    "id": "oppress-and-suppress",
    "title": "Oppress and suppress",
    "difference": "\"Oppress\" means to keep someone in subjection and hardship unjustly. \"Suppress\" means to forcibly put an end to or prevent the development of something.",
    "examples": [
      {
        "label": "Oppress",
        "sentence": "Tyrannical rulers often attempt to oppress marginalized populations."
      },
      {
        "label": "Suppress",
        "sentence": "Authorities worked quickly to suppress public riots and protests."
      }
    ]
  },
  {
    "id": "organic-and-inorganic",
    "title": "Organic and inorganic",
    "difference": "\"Organic\" relates to living matter or food produced without synthetic chemicals. \"Inorganic\" relates to matter that is not organic, often of mineral origin.",
    "examples": [
      {
        "label": "Organic",
        "sentence": "She prefers buying fresh organic vegetables from local farmers."
      },
      {
        "label": "Inorganic",
        "sentence": "Rocks and minerals are classified as inorganic chemical substances."
      }
    ]
  },
  {
    "id": "ostensible-and-ostentatious",
    "title": "Ostensible and ostentatious",
    "difference": "\"Ostensible\" means stated or appearing to be true, but not necessarily so. \"Ostentatious\" means designed to impress or attract notice; showy and pretentious.",
    "examples": [
      {
        "label": "Ostensible",
        "sentence": "His ostensible reason for visiting was business, but he really wanted a vacation."
      },
      {
        "label": "Ostentatious",
        "sentence": "The billionaire drove an ostentatious gold-plated sports car."
      }
    ]
  },
  {
    "id": "palate-palette-and-pallet",
    "title": "Palate, palette, and pallet",
    "difference": "\"Palate\" is the roof of the mouth or sense of taste. \"Palette\" is an artist's board for mixing paints. \"Pallet\" is a portable platform for storing goods.",
    "examples": [
      {
        "label": "Palate",
        "sentence": "Rich dark chocolate appeals to a sophisticated palate."
      },
      {
        "label": "Palette",
        "sentence": "The painter mixed vibrant oil colors on her wooden palette."
      },
      {
        "label": "Pallet",
        "sentence": "Warehouse workers stacked heavy cardboard boxes onto a wooden pallet."
      }
    ]
  },
  {
    "id": "panic-and-panicky",
    "title": "Panic and panicky",
    "difference": "“Panic” is a noun or verb referring to sudden uncontrollable fear or anxiety. “Panicky” is an adjective describing someone who feels or shows such fear.",
    "examples": [
      { "label": "Panic", "sentence": "Hearing the loud fire alarm caused immediate panic among shoppers." },
      { "label": "Panicky", "sentence": "She felt panicky when she realized her passport was missing." }
    ]
  },
  {
    "id": "paranoia-and-xenophobia",
    "title": "Paranoia and xenophobia",
    "difference": "“Paranoia” is an irrational or delusional suspicion, often involving persecution. “Xenophobia” is fear or dislike of people from other countries.",
    "examples": [
      { "label": "Paranoia", "sentence": "Excessive stress can sometimes trigger feelings of groundless paranoia." },
      { "label": "Xenophobia", "sentence": "Cultural education programs work actively to eliminate xenophobia." }
    ]
  },
  {
    "id": "parasite-and-parakeet",
    "title": "Parasite and parakeet",
    "difference": "A “parasite” is an organism that lives on or in another organism and obtains nutrients from it. A “parakeet” is a small, often brightly colored parrot with a long tail.",
    "examples": [
      { "label": "Parasite", "sentence": "Ticks are a common external parasite affecting domestic dogs." },
      { "label": "Parakeet", "sentence": "A colorful green parakeet chirped happily inside its cage." }
    ]
  },
  {
    "id": "parody-and-tragedy",
    "title": "Parody and tragedy",
    "difference": "A “parody” imitates a work or style with exaggeration, usually for comic effect. A “tragedy” is an event causing great suffering or a serious dramatic work.",
    "examples": [
      { "label": "Parody", "sentence": "The comedy film featured a hilarious parody of classic spy thrillers." },
      { "label": "Tragedy", "sentence": "The sudden factory explosion resulted in a terrible human tragedy." }
    ]
  },
  {
    "id": "pastoral-and-pastiche",
    "title": "Pastoral and pastiche",
    "difference": "“Pastoral” relates to the countryside or rural life. A “pastiche” is an artistic work that imitates the style of another artist or work.",
    "examples": [
      { "label": "Pastoral", "sentence": "Sheep grazed peacefully across the green pastoral landscape." },
      { "label": "Pastiche", "sentence": "The musical score was a clever pastiche of 1980s pop genres." }
    ]
  },
  {
    "id": "patent-and-latent",
    "title": "Patent and latent",
    "difference": "“Patent” can mean obvious or refer to an official right protecting an invention. “Latent” means present but hidden or not yet developed.",
    "examples": [
      { "label": "Patent", "sentence": "The inventor filed a legal patent for her new solar-powered device." },
      { "label": "Latent", "sentence": "Children often possess latent musical talents waiting to be discovered." }
    ]
  },
  {
    "id": "pathos-and-bathos",
    "title": "Pathos and bathos",
    "difference": "“Pathos” is a quality that evokes pity, sadness, or compassion. “Bathos” is an abrupt shift from elevated seriousness to something trivial or ridiculous.",
    "examples": [
      { "label": "Pathos", "sentence": "The heartbreaking movie scene was filled with genuine pathos." },
      { "label": "Bathos", "sentence": "The solemn speech descended into bathos when his phone rang loudly." }
    ]
  },
  {
    "id": "paucity-and-plethora",
    "title": "Paucity and plethora",
    "difference": "“Paucity” means a scarcity or insufficient amount. “Plethora” means a large or excessive amount.",
    "examples": [
      { "label": "Paucity", "sentence": "There was a noticeable paucity of reliable evidence supporting the claim." },
      { "label": "Plethora", "sentence": "The festival offered a plethora of delicious food choices." }
    ]
  },
  {
    "id": "peer-and-pier",
    "title": "Peer and pier",
    "difference": "A “peer” is someone of equal age or status, or a verb meaning to look closely. A “pier” is a structure projecting into water, often used by boats or visitors.",
    "examples": [
      { "label": "Peer", "sentence": "Students collaborated with their peers on the science project." },
      { "label": "Pier", "sentence": "Fishermen cast their lines from the wooden ocean pier." }
    ]
  },
  {
    "id": "penal-and-penile",
    "title": "Penal and penile",
    "difference": "“Penal” relates to punishment or the system of criminal penalties. “Penile” is the anatomical adjective relating to the penis.",
    "examples": [
      { "label": "Penal", "sentence": "The country's penal code imposes strict sentences for white-collar crime." },
      { "label": "Penile", "sentence": "Medical researchers published a study on penile health and treatment." }
    ]
  },
  {
    "id": "pendant-and-pendent",
    "title": "Pendant and pendent",
    "difference": "A “pendant” is an ornament that hangs from a necklace. “Pendent” means hanging down or, in some contexts, remaining undecided or pending.",
    "examples": [
      { "label": "Pendant", "sentence": "She wore a sparkling diamond pendant on a thin silver chain." },
      { "label": "Pendent", "sentence": "Vines hung in a pendent fashion from the greenhouse rafters." }
    ]
  },
  {
    "id": "perquisite-and-prerequisite",
    "title": "Perquisite and prerequisite",
    "difference": "A “perquisite” is an extra benefit or privilege attached to a job. A “prerequisite” is a condition that must be met before something else can happen.",
    "examples": [
      { "label": "Perquisite", "sentence": "Free company car usage was a major job perquisite." },
      { "label": "Prerequisite", "sentence": "Passing basic calculus is a strict prerequisite for advanced physics." }
    ]
  },
  {
    "id": "perspicacious-and-perspicuous",
    "title": "Perspicacious and perspicuous",
    "difference": "“Perspicacious” means having keen insight or judgment. “Perspicuous” means clearly expressed and easy to understand.",
    "examples": [
      { "label": "Perspicacious", "sentence": "The perspicacious analyst uncovered the financial fraud quickly." },
      { "label": "Perspicuous", "sentence": "The professor delivered a perspicuous lecture on quantum physics." }
    ]
  },
  {
    "id": "perverse-and-pervious",
    "title": "Perverse and pervious",
    "difference": "“Perverse” describes deliberately unreasonable or unacceptable behavior. “Pervious” means permeable or allowing liquid to pass through.",
    "examples": [
      { "label": "Perverse", "sentence": "He took a perverse pleasure in arguing against obvious facts." },
      { "label": "Pervious", "sentence": "Sandy soil is highly pervious, allowing rainwater to drain quickly." }
    ]
  },
  {
    "id": "phenomenon-and-phenomena",
    "title": "Phenomenon and phenomena",
    "difference": "“Phenomenon” is the singular form for an event or occurrence. “Phenomena” is its plural form.",
    "examples": [
      { "label": "Phenomenon", "sentence": "An aurora is a breathtaking natural optical phenomenon." },
      { "label": "Phenomena", "sentence": "Scientists studied seismic phenomena recorded across tectonic plates." }
    ]
  },
  {
    "id": "philistine-and-polyglot",
    "title": "Philistine and polyglot",
    "difference": "A “philistine” is a person indifferent or hostile to culture and the arts. A “polyglot” is someone who knows or uses several languages.",
    "examples": [
      { "label": "Philistine", "sentence": "He dismissed modern abstract art with a typical philistine attitude." },
      { "label": "Polyglot", "sentence": "The seasoned diplomat was a true polyglot fluent in five languages." }
    ]
  },
  {
    "id": "physiognomy-and-phrenology",
    "title": "Physiognomy and phrenology",
    "difference": "“Physiognomy” refers to facial features or expression, historically—and unreliably—thought to reveal character. “Phrenology” is a discredited pseudoscience that claimed skull shape revealed mental traits.",
    "examples": [
      { "label": "Physiognomy", "sentence": "Victorian novelists sometimes described characters' supposed moral traits through physiognomy." },
      { "label": "Phrenology", "sentence": "Nineteenth-century researchers mistakenly used phrenology to judge intelligence." }
    ]
  },
  {
    "id": "pittance-and-patience",
    "title": "Pittance and patience",
    "difference": "A “pittance” is a very small or inadequate amount of money. “Patience” is the ability to tolerate delay or difficulty calmly.",
    "examples": [
      { "label": "Pittance", "sentence": "Working long hours for a mere pittance left employees frustrated." },
      { "label": "Patience", "sentence": "Teaching young children requires immense dedication and patience." }
    ]
  },
  {
    "id": "plaintive-and-plaint",
    "title": "Plaintive and plaint",
    "difference": "“Plaintive” describes a sound that is sad or mournful. A “plaint” is an old or formal term for a complaint or grievance.",
    "examples": [
      { "label": "Plaintive", "sentence": "A plaintive cry echoed through the dark forest at night." },
      { "label": "Plaint", "sentence": "The citizen filed a formal plaint against the zoning violation." }
    ]
  },
  {
    "id": "plastic-and-elastic",
    "title": "Plastic and elastic",
    "difference": "“Plastic” can mean easily shaped or refer to synthetic polymers. “Elastic” describes something that can return to its original shape after being stretched.",
    "examples": [
      { "label": "Plastic", "sentence": "Sculptors used a soft, plastic clay to form the figurine." },
      { "label": "Elastic", "sentence": "Rubber bands are highly elastic and stretch easily under tension." }
    ]
  },
  {
    "id": "plebeian-and-patrician",
    "title": "Plebeian and patrician",
    "difference": "“Plebeian” relates to common people or can mean lacking refinement. “Patrician” relates to the aristocracy or suggests refined, upper-class manners.",
    "examples": [
      { "label": "Plebeian", "sentence": "Ancient Roman senators looked down upon plebeian citizens." },
      { "label": "Patrician", "sentence": "The family lived in a grand estate reflecting patrician elegance." }
    ]
  },
  {
    "id": "pliable-and-pliant",
    "title": "Pliable and pliant",
    "difference": "Both words can mean flexible or easily bent. “Pliable” can also suggest being easily influenced, while “pliant” often emphasizes adaptability or willingness to yield.",
    "examples": [
      { "label": "Pliable", "sentence": "Fresh willow branches are remarkably pliable and easy to weave." },
      { "label": "Pliant", "sentence": "The material remained pliant enough to shape by hand." }
    ]
  },
  {
    "id": "podiatrist-and-pediatrician",
    "title": "Podiatrist and pediatrician",
    "difference": "A “podiatrist” specializes in diagnosing and treating foot and ankle conditions. A “pediatrician” specializes in the medical care of infants, children, and adolescents.",
    "examples": [
      { "label": "Podiatrist", "sentence": "She visited a podiatrist to treat her chronic heel pain." },
      { "label": "Pediatrician", "sentence": "Parents brought their sick infant to the local pediatrician." }
    ]
  },
  {
    "id": "polemic-and-polite",
    "title": "Polemic and polite",
    "difference": "A “polemic” is a strong verbal or written attack on an opinion or position. “Polite” means showing good manners or courtesy.",
    "examples": [
      { "label": "Polemic", "sentence": "The philosopher published a fierce political polemic against tyranny." },
      { "label": "Polite", "sentence": "Always remember to be polite and courteous to customers." }
    ]
  },
  {
    "id": "pomade-and-pomander",
    "title": "Pomade and pomander",
    "difference": "“Pomade” is a scented ointment used to style hair. A “pomander” is a fragrant ball or container of aromatic substances used to scent the air.",
    "examples": [
      { "label": "Pomade", "sentence": "He slicked back his hair neatly using a scented styling pomade." },
      { "label": "Pomander", "sentence": "She placed a dried orange pomander inside her winter clothes closet." }
    ]
  },
  {
    "id": "poor-and-pore",
    "title": "Poor and pore",
    "difference": "“Poor” can mean lacking money or being of low quality. “Pore” is a tiny opening in the skin, and as a verb in “pore over” means to study closely.",
    "examples": [
      { "label": "Poor", "sentence": "Heavy rain destroyed crops, leaving farmers in a poor financial state." },
      { "label": "Pore", "sentence": "Researchers spent hours poring over ancient historical manuscripts." }
    ]
  },
  {
    "id": "portable-and-potable",
    "title": "Portable and potable",
    "difference": "“Portable” means easy to carry or move. “Potable” means safe or suitable to drink.",
    "examples": [
      { "label": "Portable", "sentence": "The modern laptop computer is lightweight and easily portable." },
      { "label": "Potable", "sentence": "Emergency workers distributed clean, potable water to flood victims." }
    ]
  },
  {
    "id": "portent-and-potable",
    "title": "Portent and potable",
    "difference": "A “portent” is a sign or warning of something significant or momentous to come. “Potable” means safe to drink.",
    "examples": [
      { "label": "Portent", "sentence": "Dark storm clouds gathering rapidly served as an ominous portent." },
      { "label": "Potable", "sentence": "Ensuring access to potable water is essential for public health." }
    ]
  },
  {
    "id": "pragmatic-and-dogmatic",
    "title": "Pragmatic and dogmatic",
    "difference": "“Pragmatic” means practical and realistic. “Dogmatic” describes someone who asserts beliefs as unquestionably true, often without considering evidence.",
    "examples": [
      { "label": "Pragmatic", "sentence": "Management adopted a pragmatic approach to resolve supply delays." },
      { "label": "Dogmatic", "sentence": "He refused to compromise during debates because of his dogmatic views." }
    ]
  },
  {
    "id": "precipitate-and-precipitous",
    "title": "Precipitate and precipitous",
    "difference": "“Precipitate” can mean to cause something to happen suddenly or prematurely. “Precipitous” means very steep or, figuratively, rash and hasty.",
    "examples": [
      { "label": "Precipitate", "sentence": "Unforeseen economic shifts can precipitate sudden market crashes." },
      { "label": "Precipitous", "sentence": "The hikers stopped at the edge of a precipitous mountain cliff." }
    ]
  },
  {
    "id": "preempt-and-exempt",
    "title": "Preempt and exempt",
    "difference": "“Preempt” means to take action before someone else or prevent something from occurring. “Exempt” means free from an obligation or liability.",
    "examples": [
      { "label": "Preempt", "sentence": "The network special will preempt tonight's regular television sitcom." },
      { "label": "Exempt", "sentence": "Senior citizens are exempt from paying certain municipal property taxes." }
    ]
  },
  {
    "id": "premier-and-premiere",
    "title": "Premier and premiere",
    "difference": "“Premier” means first in importance or rank and can also refer to a head of government. “Premiere” is the first public performance or screening of a work.",
    "examples": [
      { "label": "Premier", "sentence": "The company is recognized as a premier provider of cloud software." },
      { "label": "Premiere", "sentence": "Actors walked down the red carpet for the grand movie premiere." }
    ]
  },
  {
    "id": "prescribe-and-proscribe",
    "title": "Prescribe and proscribe",
    "difference": "“Prescribe” means to recommend or authorize a treatment or rule. “Proscribe” means to forbid or officially condemn something.",
    "examples": [
      { "label": "Prescribe", "sentence": "Doctors prescribe antibiotics to treat bacterial infections." },
      { "label": "Proscribe", "sentence": "Local laws strictly proscribe driving vehicles without a valid license." }
    ]
  },
  {
    "id": "presentiment-and-resentment",
    "title": "Presentiment and resentment",
    "difference": "A “presentiment” is an intuitive feeling about something that may happen, often unpleasant. “Resentment” is bitter anger at perceived unfair treatment.",
    "examples": [
      { "label": "Presentiment", "sentence": "She felt a sudden dark presentiment before opening the letter." },
      { "label": "Resentment", "sentence": "Unfair workplace favoritism caused deep resentment among staff." }
    ]
  },
  {
    "id": "primeval-and-medieval",
    "title": "Primeval and medieval",
    "difference": "“Primeval” relates to the earliest ages of the world or history. “Medieval” relates to the Middle Ages.",
    "examples": [
      { "label": "Primeval", "sentence": "Thick primeval forests covered the untamed wilderness." },
      { "label": "Medieval", "sentence": "Historic castles stand as iconic monuments of medieval architecture." }
    ]
  },
  {
    "id": "pristine-and-murky",
    "title": "Pristine and murky",
    "difference": "“Pristine” means clean and unspoiled or in its original condition. “Murky” means dark, cloudy, or dirty.",
    "examples": [
      { "label": "Pristine", "sentence": "The secluded beach featured crystal-clear water and pristine white sand." },
      { "label": "Murky", "sentence": "Heavy rains left the river water muddy and murky." }
    ]
  },
  {
    "id": "probate-and-probation",
    "title": "Probate and probation",
    "difference": "“Probate” is the legal process of proving and administering a will. “Probation” is a period of supervision or testing, including supervision imposed after a criminal conviction.",
    "examples": [
      { "label": "Probate", "sentence": "Lawyers filed the deceased person's will through the probate court." },
      { "label": "Probation", "sentence": "The offender served two years of supervised community probation." }
    ]
  },
  {
    "id": "profane-and-profound",
    "title": "Profane and profound",
    "difference": "“Profane” can mean secular or irreverent toward something sacred. “Profound” means very great or showing deep insight.",
    "examples": [
      { "label": "Profane", "sentence": "The ancient text distinguished between sacred and profane rituals." },
      { "label": "Profound", "sentence": "The inspirational speaker shared profound insights on human psychology." }
    ]
  },
  {
    "id": "profligate-and-prolific",
    "title": "Profligate and prolific",
    "difference": "“Profligate” means recklessly wasteful or extravagant. “Prolific” means highly productive or producing many works or offspring.",
    "examples": [
      { "label": "Profligate", "sentence": "His profligate spending habits quickly led to financial trouble." },
      { "label": "Prolific", "sentence": "The award-winning author was a prolific writer of science fiction." }
    ]
  },
  {
    "id": "prominent-and-imminent",
    "title": "Prominent and imminent",
    "difference": "“Prominent” means important, well-known, or conspicuously projecting. “Imminent” means about to happen very soon.",
    "examples": [
      { "label": "Prominent", "sentence": "A prominent scientist delivered the keynote conference address." },
      { "label": "Imminent", "sentence": "Dark, gathering storm clouds signaled an imminent downpour." }
    ]
  },
  {
    "id": "prophesy-and-prophecy",
    "title": "Prophesy and prophecy",
    "difference": "“Prophesy” is a verb meaning to predict future events. “Prophecy” is a noun referring to the prediction itself.",
    "examples": [
      { "label": "Prophesy", "sentence": "Ancient oracles would prophesy about the rise of great kingdoms." },
      { "label": "Prophecy", "sentence": "The old myth spoke of an ancient prophecy finally coming true." }
    ]
  },
  {
    "id": "prostrate-and-prostate",
    "title": "Prostrate and prostate",
    "difference": "“Prostrate” means lying flat, especially face down, often from exhaustion or humility. The “prostate” is a gland in the male reproductive system.",
    "examples": [
      { "label": "Prostrate", "sentence": "Exhausted hikers lay prostrate on the grass to catch their breath." },
      { "label": "Prostate", "sentence": "Regular medical screenings are essential for monitoring prostate health." }
    ]
  },
  {
    "id": "protagonist-and-antagonist",
    "title": "Protagonist and antagonist",
    "difference": "A “protagonist” is the central character in a story or drama. An “antagonist” opposes the protagonist.",
    "examples": [
      { "label": "Protagonist", "sentence": "The brave protagonist fought courageously to save her kingdom." },
      { "label": "Antagonist", "sentence": "A cunning villain served as the primary antagonist in the story." }
    ]
  },
  {
    "id": "ascent-and-assent",
    "title": "Ascent and assent",
    "difference": "“Ascent” means the act of climbing or moving upward. “Assent” means agreement, approval, or consent.",
    "examples": [
      { "label": "Ascent", "sentence": "The steep mountain ascent proved exhausting for the hikers." },
      { "label": "Assent", "sentence": "The board of directors gave their assent to the new policy." }
    ]
  },
  {
    "id": "compliment-and-complement",
    "title": "Compliment and complement",
    "difference": "A “compliment” is an expression of praise. A “complement” is something that completes or enhances something else.",
    "examples": [
      { "label": "Compliment", "sentence": "She received a wonderful compliment on her new haircut." },
      { "label": "Complement", "sentence": "The rich red wine proved to be a perfect complement to the steak dinner." }
    ]
  },
  {
    "id": "idle-and-idol",
    "title": "Idle and idol",
    "difference": "“Idle” means inactive or not working. An “idol” is an image worshipped as a deity or a person greatly admired.",
    "examples": [
      { "label": "Idle", "sentence": "Leaving the car engine idle for too long wastes fuel." },
      { "label": "Idol", "sentence": "Many young fans regard the singer as their idol." }
    ]
  },
  {
    "id": "lightning-and-lightening",
    "title": "Lightning and lightening",
    "difference": "“Lightning” is the electrical discharge seen during a storm. “Lightening” means making something lighter in weight, color, or intensity.",
    "examples": [
      { "label": "Lightning", "sentence": "A brilliant flash of lightning illuminated the dark night sky." },
      { "label": "Lightening", "sentence": "Adding white paint is effective for lightening dark wall colors." }
    ]
  },
  {
    "id": "ascent-and-descent",
    "title": "Ascent and descent",
    "difference": "“Ascent” means movement upward. “Descent” means movement downward.",
    "examples": [
      { "label": "Ascent", "sentence": "The steep hike required a steady upward ascent." },
      { "label": "Descent", "sentence": "The plane began its final descent toward the runway." }
    ]
  },
  {
    "id": "confident-and-confidant",
    "title": "Confident and confidant",
    "difference": "“Confident” means feeling or showing self-assurance. A “confidant” is a trusted person with whom private matters are shared.",
    "examples": [
      { "label": "Confident", "sentence": "She felt confident about passing her final exams." },
      { "label": "Confidant", "sentence": "He considered his brother his closest confidant." }
    ]
  },
  {
    "id": "flour-and-flower",
    "title": "Flour and flower",
    "difference": "“Flour” is a powder made by grinding grain, used in baking. A “flower” is the blossom of a plant.",
    "examples": [
      { "label": "Flour", "sentence": "She used wheat flour to bake fresh bread." },
      { "label": "Flower", "sentence": "A bright red flower bloomed in the garden." }
    ]
  },
  {
    "id": "health-and-heal",
    "title": "Health and heal",
    "difference": "“Health” is the state of physical or mental well-being. “Heal” means to recover or make something healthy again.",
    "examples": [
      { "label": "Health", "sentence": "Eating nutritious food is essential for good health." },
      { "label": "Heal", "sentence": "Cuts and scrapes take time to heal properly." }
    ]
  },
  {
    "id": "write-and-right",
    "title": "Write and right",
    "difference": "“Write” means to form words or symbols. “Right” can mean correct, proper, or the opposite of left.",
    "examples": [
      { "label": "Write", "sentence": "Students write notes in their notebooks during class." },
      { "label": "Right", "sentence": "Make sure your math answers are right before submitting." }
    ]
  },
  {
    "id": "absolve-and-absorb",
    "title": "Absolve and absorb",
    "difference": "\"Absolve\" means to declare someone free from blame, guilt, or responsibility. \"Absorb\" means to take in or soak up liquid, energy, or information.",
    "examples": [
      { "label": "Absolve", "sentence": "The judge decided to absolve the defendant of all legal charges." },
      { "label": "Absorb", "sentence": "A thick kitchen sponge can quickly absorb spilled water from the counter." }
    ]
  },
  {
    "id": "aggregate-and-egress",
    "title": "Aggregate and egress",
    "difference": "\"Aggregate\" means a whole formed by combining several separate elements. \"Egress\" means the action of going out of or leaving a place; an exit.",
    "examples": [
      { "label": "Aggregate", "sentence": "The company calculated the aggregate sales for the entire fiscal year." },
      { "label": "Egress", "sentence": "Building codes require clear emergency egress routes in every public theatre." }
    ]
  },
  {
    "id": "alibi-and-alumni",
    "title": "Alibi and alumni",
    "difference": "\"Alibi\" is a claim or evidence that someone was elsewhere when an act took place. \"Alumni\" is the plural term for graduates or former students of a school or college.",
    "examples": [
      { "label": "Alibi", "sentence": "The suspect provided a reliable alibi proving he was at home during the robbery." },
      { "label": "Alumni", "sentence": "The university invited its alumni to attend the annual fundraising gala." }
    ]
  },
  {
    "id": "ameliorate-and-annihilate",
    "title": "Ameliorate and annihilate",
    "difference": "\"Ameliorate\" means to make something bad or unsatisfactory better. \"Annihilate\" means to destroy utterly or obliterate completely.",
    "examples": [
      { "label": "Ameliorate", "sentence": "New community policies helped ameliorate traffic congestion downtown." },
      { "label": "Annihilate", "sentence": "Powerful shockwaves can annihilate fragile structures instantly." }
    ]
  },
  {
    "id": "amortize-and-atomize",
    "title": "Amortize and atomize",
    "difference": "\"Amortize\" means to gradually write off the cost of an asset or pay off a debt over time. \"Atomize\" means to convert a liquid into tiny droplets or particles.",
    "examples": [
      { "label": "Amortize", "sentence": "The business chose to amortize the expensive equipment purchase over five years." },
      { "label": "Atomize", "sentence": "The laboratory sprayer can atomize liquid into a fine mist." }
    ]
  },
  {
    "id": "anachronism-and-aneurysm",
    "title": "Anachronism and aneurysm",
    "difference": "\"Anachronism\" is something belonging to a period other than the one in which it exists. \"Aneurysm\" is a localized enlargement of an artery caused by a weakened arterial wall.",
    "examples": [
      { "label": "Anachronism", "sentence": "Featuring a mechanical wristwatch in a medieval play created an anachronism." },
      { "label": "Aneurysm", "sentence": "Doctors performed surgery to repair a dangerous brain aneurysm." }
    ]
  },
  {
    "id": "anodyne-and-antidote",
    "title": "Anodyne and antidote",
    "difference": "\"Anodyne\" is something that relieves pain or is soothing and inoffensive. \"Antidote\" is a remedy that counteracts a poison.",
    "examples": [
      { "label": "Anodyne", "sentence": "Soft instrumental music served as an anodyne for her stressful workday." },
      { "label": "Antidote", "sentence": "Medical staff quickly administered the correct antidote to neutralize the toxin." }
    ]
  },
  {
    "id": "apathy-and-antipathy",
    "title": "Apathy and antipathy",
    "difference": "\"Apathy\" means lack of interest, enthusiasm, or concern. \"Antipathy\" means a deep-seated feeling of dislike, aversion, or hostility.",
    "examples": [
      { "label": "Apathy", "sentence": "Voter turnout was low due to widespread public apathy toward local politics." },
      { "label": "Antipathy", "sentence": "Years of corporate rivalry created deep antipathy between the two executives." }
    ]
  },
  {
    "id": "apex-and-nadir",
    "title": "Apex and nadir",
    "difference": "\"Apex\" means the highest point or peak of something. \"Nadir\" means the lowest point or point of greatest adversity.",
    "examples": [
      { "label": "Apex", "sentence": "Reaching the mountain's apex required hours of grueling physical climbing." },
      { "label": "Nadir", "sentence": "Losing his life savings marked the financial nadir of his career." }
    ]
  },
  {
    "id": "append-and-appraise",
    "title": "Append and appraise",
    "difference": "\"Append\" means to add something as a supplement or attachment. \"Appraise\" means to assess, evaluate, or estimate the value of property.",
    "examples": [
      { "label": "Append", "sentence": "Please remember to append your signature at the bottom of the contract." },
      { "label": "Appraise", "sentence": "An expert came to appraise the antique grandfather clock." }
    ]
  },
  {
    "id": "arbitrate-and-agitate",
    "title": "Arbitrate and agitate",
    "difference": "\"Arbitrate\" means to settle a dispute as an impartial third party. \"Agitate\" means to disturb or make someone anxious, or to campaign publicly for change.",
    "examples": [
      { "label": "Arbitrate", "sentence": "A neutral mediator was brought in to arbitrate the labor dispute." },
      { "label": "Agitate", "sentence": "Strong winds began to agitate the calm surface of the lake." }
    ]
  },
  {
    "id": "arraign-and-arrange",
    "title": "Arraign and arrange",
    "difference": "\"Arraign\" means to call someone before a court to answer a criminal charge. \"Arrange\" means to put things in a particular order or position.",
    "examples": [
      { "label": "Arraign", "sentence": "Police officers planned to arraign the suspect before the magistrate on Monday." },
      { "label": "Arrange", "sentence": "She took time to arrange the colorful flowers neatly in a glass vase." }
    ]
  },
  {
    "id": "ascetic-and-aesthetic",
    "title": "Ascetic and aesthetic",
    "difference": "\"Ascetic\" describes a life of severe self-discipline and abstention from indulgence. \"Aesthetic\" relates to beauty, art, or the appreciation of beautiful things.",
    "examples": [
      { "label": "Ascetic", "sentence": "Monks lived an ascetic lifestyle devoid of material luxuries." },
      { "label": "Aesthetic", "sentence": "The modern apartment was decorated with a clean, minimalist aesthetic." }
    ]
  },
  {
    "id": "aspiration-and-expiration",
    "title": "Aspiration and expiration",
    "difference": "\"Aspiration\" means a hope or ambition to achieve something. \"Expiration\" means the act of breathing out or the end of a fixed period.",
    "examples": [
      { "label": "Aspiration", "sentence": "Her ultimate career aspiration is to become a leading neurosurgeon." },
      { "label": "Expiration", "sentence": "Check the milk carton label to find the exact expiration date." }
    ]
  },
  {
    "id": "assail-and-assault",
    "title": "Assail and assault",
    "difference": "\"Assail\" means to attack someone or trouble them persistently. \"Assault\" means a physical attack or the legal offense of threatening or using violence.",
    "examples": [
      { "label": "Assail", "sentence": "Critics began to assail the politician's new economic proposal." },
      { "label": "Assault", "sentence": "The intruder was arrested and charged with criminal assault." }
    ]
  },
  {
    "id": "astound-and-amuse",
    "title": "Astound and amuse",
    "difference": "\"Astound\" means to shock or greatly surprise someone. \"Amuse\" means to entertain or make someone laugh.",
    "examples": [
      { "label": "Astound", "sentence": "The magician's clever card tricks never failed to astound the audience." },
      { "label": "Amuse", "sentence": "The funny comedy show managed to amuse children and adults alike." }
    ]
  },
  {
    "id": "atrophy-and-hypertrophy",
    "title": "Atrophy and hypertrophy",
    "difference": "\"Atrophy\" means to waste away or decline through underuse. \"Hypertrophy\" means enlargement of an organ or tissue through an increase in cell size.",
    "examples": [
      { "label": "Atrophy", "sentence": "Muscles will quickly atrophy if left immobilized in a cast for weeks." },
      { "label": "Hypertrophy", "sentence": "Heavy weightlifting can stimulate muscle hypertrophy." }
    ]
  },
  {
    "id": "audacious-and-auspicious",
    "title": "Audacious and auspicious",
    "difference": "\"Audacious\" means showing a willingness to take surprisingly bold risks. \"Auspicious\" means favorable or promising; conducive to success.",
    "examples": [
      { "label": "Audacious", "sentence": "The startup company launched an audacious marketing campaign." },
      { "label": "Auspicious", "sentence": "Clear blue skies provided an auspicious start to their wedding day." }
    ]
  },
  {
    "id": "augur-and-augury",
    "title": "Augur and augury",
    "difference": "\"Augur\" means to indicate or predict a future outcome; it can also refer to an ancient Roman prophet. \"Augury\" is a sign or omen of what may happen in the future.",
    "examples": [
      { "label": "Augur", "sentence": "Strong early sales figures augur well for the new product launch." },
      { "label": "Augury", "sentence": "The unusual bird call was interpreted as an augury of change." }
    ]
  },
  {
    "id": "autonomy-and-automation",
    "title": "Autonomy and automation",
    "difference": "\"Autonomy\" means freedom from external control or independence. \"Automation\" means the use of machines or automatic systems to perform tasks.",
    "examples": [
      { "label": "Autonomy", "sentence": "Regional states demanded greater political autonomy from the central government." },
      { "label": "Automation", "sentence": "Modern factories rely heavily on robotics and industrial automation." }
    ]
  },
  {
    "id": "bane-and-boon",
    "title": "Bane and boon",
    "difference": "\"Bane\" is a cause of great distress, annoyance, or destruction. \"Boon\" is something helpful or beneficial; a blessing.",
    "examples": [
      { "label": "Bane", "sentence": "Invasive weed species have become the bane of local farmers." },
      { "label": "Boon", "sentence": "The new public transit line proved to be a major boon for commuters." }
    ]
  },
  {
    "id": "barter-and-bargain",
    "title": "Barter and bargain",
    "difference": "\"Barter\" means to exchange goods or services for other goods without money. \"Bargain\" means an agreement between parties or something bought at a favorable price.",
    "examples": [
      { "label": "Barter", "sentence": "Ancient traders used to barter wheat and spices for metal tools." },
      { "label": "Bargain", "sentence": "Shoppers searched the outdoor market for a good bargain on clothes." }
    ]
  },
  {
    "id": "beatific-and-beautiful",
    "title": "Beatific and beautiful",
    "difference": "\"Beatific\" means expressing or imparting bliss, happiness, or saintly calm. \"Beautiful\" means pleasing to the senses or mind.",
    "examples": [
      { "label": "Beatific", "sentence": "The smiling baby slept with a peaceful, beatific expression." },
      { "label": "Beautiful", "sentence": "Sunset views over the ocean look exceptionally beautiful." }
    ]
  },
  {
    "id": "belie-and-betray",
    "title": "Belie and betray",
    "difference": "\"Belie\" means to give a false impression of something. \"Betray\" means to expose someone to danger or break trust.",
    "examples": [
      { "label": "Belie", "sentence": "His friendly smile tended to belie his fiercely competitive nature." },
      { "label": "Betray", "sentence": "Secret agents must never betray confidential state security information." }
    ]
  },
  {
    "id": "belittle-and-belay",
    "title": "Belittle and belay",
    "difference": "\"Belittle\" means to make someone or something seem unimportant. \"Belay\" is a climbing term meaning to secure a rope; it can also be an order to stop.",
    "examples": [
      { "label": "Belittle", "sentence": "Constructive managers mentor employees rather than belittle their efforts." },
      { "label": "Belay", "sentence": "The lead climber called out an instruction to belay the safety rope." }
    ]
  },
  {
    "id": "beneficial-and-beneficiary",
    "title": "Beneficial and beneficiary",
    "difference": "\"Beneficial\" means producing a good or favorable result. \"Beneficiary\" is a person who receives an advantage, funds, or property from a will or trust.",
    "examples": [
      { "label": "Beneficial", "sentence": "Regular aerobic exercise has many beneficial effects on health." },
      { "label": "Beneficiary", "sentence": "The charitable foundation was named the primary beneficiary in her will." }
    ]
  },
  {
    "id": "bereaved-and-bereft",
    "title": "Bereaved and bereft",
    "difference": "\"Bereaved\" describes someone who has suffered the death of a loved one. \"Bereft\" means deprived of or lacking something.",
    "examples": [
      { "label": "Bereaved", "sentence": "Community members offered comfort and support to the bereaved family." },
      { "label": "Bereft", "sentence": "The old abandoned mansion stood cold and bereft of furniture." }
    ]
  },
  {
    "id": "besiege-and-beseech",
    "title": "Besiege and beseech",
    "difference": "\"Besiege\" means to surround a place, usually with armed forces, or crowd it oppressively. \"Beseech\" means to ask someone urgently and fervently; implore.",
    "examples": [
      { "label": "Besiege", "sentence": "Medieval armies would besiege enemy castles until supplies ran out." },
      { "label": "Beseech", "sentence": "The desperate explorer began to beseech passing travelers for food." }
    ]
  },
  {
    "id": "blatant-and-latent",
    "title": "Blatant and latent",
    "difference": "\"Blatant\" means done openly and unashamedly; glaringly obvious. \"Latent\" means existing but hidden or not yet developed.",
    "examples": [
      { "label": "Blatant", "sentence": "Ignoring safety regulations during the inspection was a blatant violation." },
      { "label": "Latent", "sentence": "Careful analysis revealed latent design flaws in the prototype engine." }
    ]
  },
  {
    "id": "bliss-and-bluster",
    "title": "Bliss and bluster",
    "difference": "\"Bliss\" means perfect happiness or joy. \"Bluster\" means loud, aggressive, or indignant talk that often has little effect.",
    "examples": [
      { "label": "Bliss", "sentence": "Lounging on the tropical beach provided hours of quiet bliss." },
      { "label": "Bluster", "sentence": "Ignore his angry political bluster; he rarely takes actual action." }
    ]
  },
  {
    "id": "bogus-and-fungus",
    "title": "Bogus and fungus",
    "difference": "\"Bogus\" means counterfeit, fake, or not genuine. \"Fungus\" is a spore-producing organism such as a mold or mushroom.",
    "examples": [
      { "label": "Bogus", "sentence": "The con artist tried to deposit a bogus check at the local bank." },
      { "label": "Fungus", "sentence": "Damp forest soil provides ideal growing conditions for woodland fungus." }
    ]
  },
  {
    "id": "bourgeois-and-bohemian",
    "title": "Bourgeois and bohemian",
    "difference": "\"Bourgeois\" relates to the middle class and often to conventional values. \"Bohemian\" describes a socially unconventional, artistic lifestyle.",
    "examples": [
      { "label": "Bourgeois", "sentence": "They chose a comfortable bourgeois lifestyle in the suburbs." },
      { "label": "Bohemian", "sentence": "The young painters lived a free-spirited bohemian life in the city." }
    ]
  },
  {
    "id": "bovine-and-canine",
    "title": "Bovine and canine",
    "difference": "\"Bovine\" relates to cattle or cows. \"Canine\" relates to dogs or members of the dog family.",
    "examples": [
      { "label": "Bovine", "sentence": "Large herds of bovine livestock grazed quietly across the pasture." },
      { "label": "Canine", "sentence": "Police units used specialized canine teams to track lost hikers." }
    ]
  },
  {
    "id": "bravado-and-bravery",
    "title": "Bravado and bravery",
    "difference": "\"Bravado\" is a show of boldness intended to impress or intimidate. \"Bravery\" is genuine courage in facing danger or difficulty.",
    "examples": [
      { "label": "Bravado", "sentence": "His tough outward bravado hid a deeply nervous personality." },
      { "label": "Bravery", "sentence": "Firefighters displayed incredible bravery while rescuing trapped residents." }
    ]
  },
  {
    "id": "broach-and-bleach",
    "title": "Broach and bleach",
    "difference": "\"Broach\" means to raise a subject for discussion. \"Bleach\" means to whiten or sterilize using chemical agents.",
    "examples": [
      { "label": "Broach", "sentence": "She hesitated to broach the difficult subject of salary during reviews." },
      { "label": "Bleach", "sentence": "Laundry workers used liquid chlorine bleach to clean white fabrics." }
    ]
  },
  {
    "id": "bumptious-and-scrumptious",
    "title": "Bumptious and scrumptious",
    "difference": "\"Bumptious\" means self-assertive or proud to an irritating degree. \"Scrumptious\" means extremely delicious or tasty.",
    "examples": [
      { "label": "Bumptious", "sentence": "His bumptious attitude during meetings annoyed his colleagues." },
      { "label": "Scrumptious", "sentence": "The bakery sold scrumptious chocolate brownies and pastries." }
    ]
  },
  {
    "id": "cache-and-cachet",
    "title": "Cache and cachet",
    "difference": "\"Cache\" is a hidden collection of items or a computer memory store. \"Cachet\" is prestige or a state of being respected and admired.",
    "examples": [
      { "label": "Cache", "sentence": "Detectives discovered a hidden cache of gold coins in the attic." },
      { "label": "Cachet", "sentence": "Owning a vintage sports car carries a certain social cachet." }
    ]
  },
  {
    "id": "cackle-and-crackle",
    "title": "Cackle and crackle",
    "difference": "\"Cackle\" means to give a harsh, loud laugh, like a hen. \"Crackle\" means to make a rapid series of sharp snapping noises.",
    "examples": [
      { "label": "Cackle", "sentence": "The storyteller let out a sudden spooky cackle at the campfire." },
      { "label": "Crackle", "sentence": "Dry firewood began to crackle and pop in the fireplace." }
    ]
  },
  {
    "id": "cadaver-and-chancellor",
    "title": "Cadaver and chancellor",
    "difference": "\"Cadaver\" is a dead human body, especially one used for medical study. \"Chancellor\" is the head of a university or a senior government official.",
    "examples": [
      { "label": "Cadaver", "sentence": "Medical students studied anatomy using a preserved human cadaver." },
      { "label": "Chancellor", "sentence": "The university chancellor delivered the graduation commencement speech." }
    ]
  },
  {
    "id": "cajole-and-coerce",
    "title": "Cajole and coerce",
    "difference": "\"Cajole\" means to persuade through persistent coaxing or flattery. \"Coerce\" means to compel someone through force, threats, or intimidation.",
    "examples": [
      { "label": "Cajole", "sentence": "She tried to cajole her younger brother into sharing his dessert." },
      { "label": "Coerce", "sentence": "Totalitarian regimes use fear to coerce citizens into obedience." }
    ]
  },
  {
    "id": "callous-and-callus",
    "title": "Callous and callus",
    "difference": "\"Callous\" means showing cruel or insensitive disregard for others. \"Callus\" is a thickened, hardened area of skin.",
    "examples": [
      { "label": "Callous", "sentence": "Stealing from charity funds reflects a deeply callous attitude." },
      { "label": "Callus", "sentence": "Playing guitar frequently can cause a hard callus to form on fingertips." }
    ]
  },
  {
    "id": "canine-and-feline",
    "title": "Canine and feline",
    "difference": "\"Canine\" relates to dogs. \"Feline\" relates to cats or cat-like animals.",
    "examples": [
      { "label": "Canine", "sentence": "The veterinarian specializes in canine dental and surgical care." },
      { "label": "Feline", "sentence": "Leopards and lions are majestic wild feline predators." }
    ]
  },
  {
    "id": "capacious-and-capricious",
    "title": "Capacious and capricious",
    "difference": "\"Capacious\" means having a lot of space inside; roomy. \"Capricious\" means given to sudden, unpredictable changes of mood or behavior.",
    "examples": [
      { "label": "Capacious", "sentence": "The large travel backpack featured a capacious main compartment." },
      { "label": "Capricious", "sentence": "The weather in the mountains can be unpredictable and capricious." }
    ]
  },
  {
    "id": "captivate-and-excavate",
    "title": "Captivate and excavate",
    "difference": "\"Captivate\" means to charm or hold someone's attention. \"Excavate\" means to dig out or uncover something, such as buried artifacts.",
    "examples": [
      { "label": "Captivate", "sentence": "The talented musicians managed to captivate the entire audience." },
      { "label": "Excavate", "sentence": "Archaeologists began to excavate the ancient Roman ruins carefully." }
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
