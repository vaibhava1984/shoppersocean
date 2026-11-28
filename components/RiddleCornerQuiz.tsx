"use client";

import { useEffect, useState } from "react";
import { formatFreeQuotaLabel } from "@/lib/game-quota-label";
import GameQuotaPopup from "@/components/GameQuotaPopup";

const RAW_QUESTIONS: Array<[string, string[], number, string]> = [["I have keys but no locks. I have space but no room. You can enter, but you can't go outside. What am I?",["A piano","A computer keyboard","A map","A spaceship"],1,"A computer keyboard features keys, a spacebar, and an enter key, but has no physical rooms."],["What has to be broken before you can use it?",["A promise","An egg","A coconut","A glass window"],1,"An eggshell must be cracked open before you can cook or consume what is inside."],["I am full of holes, yet I still hold water. What am I?",["A fishing net","A sponge","A colander","A rain cloud"],1,"A sponge is filled with porous air pockets that trap and retain water."],["What goes up and down but never moves anywhere?",["An elevator","A temperature","A staircase","A seesaw"],2,"A staircase stays fixed in place while people use it to walk up or down."],["What has one eye, but cannot see anything at all?",["A storm","A sewing needle","A potato","A keyhole"],1,"A sewing needle features an eye through which thread passes, but it possesses no vision."],["What has a head and a tail, but no body?",["A coin","A snake","A comet","A hammer"],0,"A coin traditionally features a 'heads' side and a 'tails' side without any torso."],["What can travel all around the world while staying stuck in one corner?",["A compass","A postage stamp","An anchor","A globe"],1,"A postage stamp stays fixed in the corner of an envelope while traveling internationally."],["What has many teeth, but is completely unable to bite?",["A shark","A zipper","A comb","A saw"],2,"A hair comb has a row of teeth used for styling, not biting."],["What belongs to you, but everyone else uses it much more than you do?",["Your toothbrush","Your name","Your car","Your telephone number"],1,"Your name is yours, but it is primarily spoken and used by other people to refer to you."],["I am light as a feather, yet even the strongest person in the world cannot hold me for very long. What am I?",["A breath","Your breath","A bubble","A shadow"],1,"Holding your breath becomes physically impossible after a short duration due to biological reflex."],["What gets wetter and wetter the more it dries?",["A sponge","A towel","A raincoat","A river"],1,"A towel absorbs moisture from wet surfaces, making itself wetter as it dries other things."],["What has words, but never speaks a single sound?",["A diary","A book","A computer screen","A letter"],1,"A book contains written words and stories but requires a reader to make them sound."],["What has a thumb and four fingers, but absolutely no flesh, feathers, scales, or bone?",["A robot hand","A glove","An X-ray","A statue"],1,"A glove is shaped like a hand with fingers and a thumb, but is made entirely of fabric or leather."],["What can you catch, but never throw?",["A cold","A baseball","A falling star","A rumor"],0,"You can catch an illness like a cold, but it is not a physical object you can throw."],["What is dark by nature, but always gets brighter when light shines on it?",["A cave","A photograph","A chalkboard","The moon"],1,"A photographic negative or print reveals its clear image only when exposed to light."],["What is bought by the yard, but worn by the foot?",["Carpet","Shoes","Socks","Pants"],0,"Carpeting is traditionally sold by linear yards and laid down for feet to walk upon."],["What building has the most stories inside it?",["A skyscraper","A library","A courthouse","A school"],1,"A library contains thousands of books, and every book is filled with stories."],["What runs all around a garden, but never moves an inch?",["A garden hose","A fence","An ant","A path"],1,"A fence encloses or runs along the perimeter of a garden while remaining stationary."],["What has four fingers and a thumb, but has no blood or bones?",["A mannequin hand","A glove","A skeleton hand","A puppet"],1,"A glove has finger sleeves and a thumb compartment without biological tissue."],["What starts with the letter T, ends with T, and has T in it?",["A teapot","A tent","A trout","A tract"],0,"A teapot starts with T, ends with T, and literally contains 'T' (tea) inside it."],["If you drop me from the tallest skyscraper, I will surely break; but if you toss me into water, I will stay completely fine. What am I?",["A glass cup","A piece of paper","An egg","A feather"],1,"A sheet of paper flutters and will not shatter upon hitting the ground or water."],["What goes through cities and fields, but never moves?",["A highway","A river","A railway","A road"],3,"A road extends across cities and countryside landscapes without changing its geographic position."],["What has a neck, but no head?",["A shirt","A bottle","A guitar","A vase"],1,"A glass bottle features a narrow neck section leading up to the opening, but no head."],["What can fill an entire room without taking up any physical space?",["Light","Smoke","Sound","Air"],0,"Light illuminates every corner of a room instantly without occupying mass."],["What is so fragile that simply saying its name breaks it?",["Silence","Glass","Trust","A secret"],0,"The moment you speak aloud to name 'silence', you break it with sound."],["I have four legs in the morning, two legs at noon, and three legs in the evening. What am I?",["A dog","A human","A chair","An alien"],1,"A human crawls on all fours as an infant, walks on two legs as an adult, and uses a walking cane in old age."],["What is brown and sticky?",["Chocolate","Mud","A stick","Caramel"],2,"A stick is quite literally a wooden stick, which is brown and... a stick!"],["What invention lets you look straight through solid brick walls?",["X-rays","A window","A periscope","Glasses"],1,"A window built into a wall allows you to see right through it."],["What can you break without ever touching it or picking it up?",["A heart","A promise","A record","A glass"],1,"A promise or oath can be broken simply by failing to keep your word."],["What has to be fed constantly, but will die if you give it anything to drink?",["A fireplace","A plant","An engine","A monster"],0,"A fire needs a constant supply of wood to burn, but water will immediately extinguish it."],["What goes around the world while staying tucked inside a corner?",["A postage stamp","A compass","An envelope","A postcard"],0,"A postage stamp travels globally affixed to mail while staying in the upper corner."],["What has hands, but cannot clap?",["A clock","A statue","A mannequin","A robot"],0,"A clock has hour and minute hands that point to numbers, but it has no palms to clap."],["What is taken before you can ever get it?",["A photograph","A test","A breath","An oath"],0,"A photograph must be captured or 'taken' by a camera before you can possess the image."],["What has legs, but is unable to walk anywhere?",["A table","A dog","A pair of pants","A spider"],0,"A table stands on four legs to support items, but cannot move on its own."],["What has a bottom at the very top?",["A mountain","A pair of shoes","Your legs","A ladder"],1,"Your feet, which wear shoes at the bottom of your body, are positioned inside footwear."],["What has a single eye, but is completely blind?",["A hurricane","A potato","A sewing needle","A camera lens"],2,"A sewing needle has an eye opening, but no organic sight."],["What gets sharper the more you use it?",["A knife","Your brain","A pencil","Your wit"],1,"Your brain and mental sharpness improve with continuous learning and problem-solving."],["What can you keep after giving it away to someone else?",["Your word","Your money","Your secret","Your hat"],0,"You can give someone your word (a promise), yet still keep integrity if you stay true to it."],["What is always coming, but never actually arrives?",["Tomorrow","Winter","The future","Success"],0,"When tomorrow finally arrives, it becomes today, meaning 'tomorrow' is always a day away."],["What has a tongue, but cannot taste or speak?",["A shoe","A bell","A lizard","A snake"],0,"A shoe features a fabric tongue under the laces, but has no mouth or taste buds."],["What has an infinite number of keys, but opens not a single door?",["A piano","A key chain","A computer","A typewriter"],0,"A musical piano has white and black keys used for playing notes, not locks."],["What goes up when rain comes down?",["An umbrella","A kite","A thermometer","A river"],0,"An umbrella is raised upward over your head when rain starts falling."],["What has a spine, but no bones inside?",["A book","A jellyfish","A cactus","A fence"],0,"A book features a binding spine holding its pages together without any skeletal structure."],["What can you swallow that can also swallow you back?",["Water","Pride","Fear","A pill"],0,"You can drink (swallow) water, but a massive wave or flood can also swallow you."],["What has a thumb and four fingers, yet is not alive?",["A glove","A mannequin","A robot","A statue"],0,"A glove is designed with finger slots and a thumb slot while being inanimate."],["What has teeth, but cannot eat or chew?",["A saw","A shark","A comb","A zipper"],0,"A hand saw features sharp metal teeth used for cutting through wood."],["What goes around the entire world while staying in one exact spot?",["A compass","An equator","A GPS satellite","A flagpole"],3,"A flagpole stays firmly rooted in one place while flags flutter around it globally."],["What has a head, a tail, is brown in color, and has no legs?",["A penny","A worm","A peanut","A caterpillar"],0,"A copper penny features a heads side and a tails side without any legs."],["What can you break simply by speaking its name aloud?",["Silence","A glass","A promise","A secret"],0,"Speaking breaks the quiet stillness of silence."],["What has one head, one foot, and four legs?",["A bed","A table","A monster","A cot"],0,"A traditional bed has a headboard, a footboard, and four supporting legs."],["What is full of holes, yet still manages to hold water without leaking?",["A sponge","A net","A bucket","A barrel"],0,"A sponge absorbs liquid inside its porous matrix."],["What has a thumb and four fingers, but is completely missing any bones?",["A glove","A sock","A mitten","A puppet"],0,"A glove is shaped like a hand with fingers and a thumb, but contains no skeletal structure."],["What can you hold in your left hand that you can never hold in your right hand?",["Your right elbow","A pen","Your right hand","A spoon"],0,"Anatomically, you can only use your left hand to grasp your right elbow."],["What gets bigger the more you take away from it?",["A hole","A shadow","A mountain","A balloon"],0,"Digging dirt out of the ground makes a hole larger the more material you remove."],["What has to be broken first before anyone can ever use it?",["An egg","A coconut","A lock","A seal"],0,"An eggshell must be cracked open before cooking."],["What has a neck, but is completely missing a head?",["A bottle","A shirt","A guitar","A sweater"],0,"A glass bottle features a narrow neck leading to the opening."],["What runs all around a backyard, yet never moves an inch?",["A fence","A garden hose","A pathway","A sprinkler"],0,"A fence bounds the perimeter of a yard without walking."],["What can you catch easily, but never throw away?",["A cold","A ball","A frisbee","A boomerang"],0,"You can catch a viral illness like a cold, but it cannot be thrown."],["What has words, but never speaks out loud?",["A book","A computer","A radio","A phone"],0,"Books contain written stories without vocal cords."],["What has a face and two hands, but no arms or legs?",["A clock","A coin","A compass","A watch"],0,"A clock features a dial face and two hands to indicate time."],["What has an eye, but cannot see anything?",["A sewing needle","A storm","A potato","A button"],0,"A sewing needle has an eye opening for thread."],["What goes up and down without ever moving?",["A staircase","An elevator","A temperature","A seesaw"],0,"Staircases remain stationary while people walk up and down them."],["What is light as a feather, yet even the strongest weightlifter cannot hold it for long?",["Your breath","A bubble","A shadow","Smoke"],0,"Holding your breath becomes physically impossible after a brief period."],["What is black when you buy it, red when you use it, and gray when you throw it away?",["Charcoal","A match","A tire","An ink pen"],0,"Charcoal is black, turns red-hot when burning, and leaves gray ash."],["What has a bottom at the very top of it?",["Your legs","A mountain","A tree","A ladder"],0,"Your feet, which wear shoes at the bottom of your limbs, are attached to your legs."],["What can fill an entire room without taking up any physical space?",["Light","Smoke","Air","Dust"],0,"Light illuminates space instantly without mass."],["What gets wetter and wetter the more it dries?",["A towel","A sponge","A raincoat","A mop"],0,"A towel absorbs moisture, becoming wetter as it dries objects."],["What has keys, but opens no locks or doors?",["A piano","A keyboard","A map","A keyring"],0,"A musical piano has keys for playing musical notes."],["What has branches, but no leaves, trunk, or fruit?",["A bank","A river","A road","A railway"],0,"A financial bank has branch locations across cities."],["What can you keep after giving it to someone else?",["Your word","Your money","Your book","Your keys"],0,"You can give someone your word and keep your commitment."],["What has a tongue, but cannot taste or speak a word?",["A shoe","A bell","A snake","A frog"],0,"A shoe has a fabric tongue under its laces."],["What goes through cities, fields, and mountains, but never moves?",["A road","A river","The wind","A train"],0,"A road remains fixed across landscapes."],["What is bought by the yard, but worn by the foot?",["Carpet","Socks","Shoes","Pants"],0,"Carpeting is sold by linear yards and walked on by feet."],["What building has the most stories inside it?",["A library","A skyscraper","An apartment","A hotel"],0,"A library houses countless books filled with stories."],["What has a spine, but no bones?",["A book","A jellyfish","A cactus","A leaf"],0,"A book has a binding spine holding pages together."],["What has hands, but cannot clap?",["A clock","A statue","A mannequin","A robot"],0,"A clock has clock hands that point to numbers."],["What is taken before you can ever get it?",["A photograph","A test","A breath","An order"],0,"A photograph must be captured by a camera."],["What has legs, but cannot walk anywhere?",["A table","A chair","A desk","A bed"],0,"A table stands on legs without walking."],["What starts with T, ends with T, and has T in it?",["A teapot","A tent","A trout","A tract"],0,"A teapot starts with T, ends with T, and holds tea inside."],["What goes up when rain comes down?",["An umbrella","A kite","A thermometer","A river"],0,"An umbrella is opened upward during rain."],["What can you break without touching it?",["A promise","A glass","A plate","A vase"],0,"A promise can be broken verbally."],["What has to be fed constantly, but dies if given water?",["A fire","A plant","An engine","A machine"],0,"Fire needs wood to burn, but water extinguishes it."],["What is always coming, but never arrives?",["Tomorrow","Winter","The future","Morning"],0,"When tomorrow arrives, it becomes today."],["What has an infinite number of keys, but opens no doors?",["A piano","A keyboard","A keyring","A map"],0,"A piano has musical keys."],["What has a head and a tail, but no body?",["A coin","A snake","A comet","A hammer"],0,"A coin has a heads and tails side."],["What can you catch, but never throw?",["A cold","A ball","A frisbee","A dart"],0,"You catch an illness like a cold."],["What is dark by nature, but glows brighter when light shines on it?",["A photograph","A cave","A chalkboard","The moon"],0,"A photograph reveals its image under light exposure."],["What invention lets you look right through solid brick walls?",["A window","X-rays","A periscope","Glasses"],0,"A window is built into walls to see through them."],["What gets sharper the more you use it?",["Your brain","A knife","A pencil","A sword"],0,"Your mind sharpens with continuous learning."],["What can you swallow that can also swallow you back?",["Water","Pride","Fear","A pill"],0,"Water can be swallowed by you, or a massive wave can swallow you."],
  ["Take off my skin and I won't cry, but you certainly will! What am I?",["A banana","An onion","A coconut","A potato"],1,"Peeling the layers of an onion releases sulfur compounds that cause your eyes to tear up."],
  ["What can you break even if you never pick it up, touch it, or hold it in your hands?",["A promise","A glass window","An egg","A ceramic plate"],0,"A promise or commitment can be broken entirely with spoken words or actions."],
  ["What is surrounded by water on all sides, yet if you drink it, it will only make you thirstier?",["A swimming pool","The ocean","A freshwater lake","An oasis"],1,"Ocean water is laden with salt; drinking it dehydrates the human body rapidly."],
  ["What has a single foot, but absolutely no legs or body to speak of?",["A mountain","A snail","A mushroom","A tree"],2,"A mushroom consists of a cap supported by a stem, botanically referred to as a stipe or foot."],
  ["What is so delicate and fragile that even uttering its name aloud destroys it instantly?",["Silence","Glass","A secret","Trust"],0,"The moment you speak to name 'silence', you fill the air with sound and break it."],
  ["What has a golden head and a golden tail, but completely lacks a body in between?",["A golden coin","A sunflower","A golden dragon statue","A wheat stalk"],0,"A gold coin features a heads side and a tails side without a torso."],
  ["What goes through a brand-new green door, but refuses to ever open it?",["A key","Paint","A breeze","A locksmith"],1,"Liquid paint is brushed or spread through a door surface during painting, coating it permanently."],
  ["What is yours to keep, but somehow every single person you meet uses it more than you do?",["Your name","Your car","Your house","Your telephone"],0,"Your name belongs to you, but others speak it constantly to address you."],
  ["What has roots as tall as a towering tree, yet climbs much higher than any mountain?",["A skyscraper","A mountain range","A cloud","A tower"],2,"Clouds drift high into the upper atmosphere, towering far above physical mountains."],
  ["What has a thumb and four individual fingers, yet possesses no living blood, flesh, or bone?",["A glove","A robot arm","A mannequin hand","An X-ray scan"],0,"A winter glove is tailored with finger slots and a thumb while being completely inanimate."],
  ["What has a mouth of stone, but never speaks; and runs continuously, yet stays completely in place?",["A waterfall","A river","A clock","A statue"],0,"A waterfall flows relentlessly over rocky ledges while remaining fixed to the landscape."],
  ["What has to be lit up before it can ever give you any light?",["A candle","A flashlight","A match","A lamp"],0,"A wax candle must have its wick ignited with flame before it illuminates a dark room."],
  ["What can you completely fill with empty air without taking up any actual storage space?",["A balloon","A bubble","A tire","A room"],3,"Air fills every empty room around us naturally without requiring separate storage containers."],
  ["What has two hands to wave with, a round face, but no legs to walk across a room?",["A clock","A statue","A snowman","A doll"],0,"A traditional analog clock has hour and minute hands sweeping across a circular dial face."],
  ["What gets shorter every time you take a bath or shower in clean water?",["A bar of soap","A towel","A sponge","A loofah"],0,"A bar of soap dissolves and wears down gradually with every use."],
  ["What can you easily hold in your bare hands without touching it at all?",["Your breath","A shadow","A secret","A thought"],0,"You hold your breath inside your respiratory system without physical hand contact."],
  ["What is born big, grows smaller over time through hard work, and eventually disappears?",["A bar of soap","A candle","A piece of chalk","An ice cube"],2,"A piece of chalk starts full-sized and wears down into dust as it writes on a chalkboard."],
  ["What has three feet, but cannot walk a single step on its own?",["A tripod","A yardstick","A sofa","A stool"],0,"A photographic tripod stands on three legs to steady cameras without walking."],
  ["What has a single eye in the center, but is completely unable to see?",["A sewing needle","A hurricane","A potato sprout","A buttonhole"],0,"A sewing needle has an eye opening for thread but lacks optical vision."],
  ["What can travel straight through solid glass windows without breaking them into pieces?",["Sunlight","A bullet","A stone","A hammer"],0,"Sunlight and light waves pass right through transparent glass panes."],
  ["What has a spine made of cardboard or leather, but has no skeleton inside?",["A book","A notebook","A binder","A ledger"],0,"A book features a binding spine holding paper sheets together."],
  ["What goes up into the sky and never comes down, no matter how long you wait?",["Your age","A hot air balloon","A rocket","A bird"],0,"Your age increases continuously every year and never reverses."],
  ["What can you serve, but can never actually eat or taste?",["A tennis ball","A meal","A cake","A drink"],0,"In racket sports like tennis or badminton, players serve the ball across the net."],
  ["What has a neck, but no shoulders, chest, or head?",["A bottle","A shirt","A guitar","A sweater"],0,"A glass bottle features a narrow neck section below its opening."],
  ["What has a bed, but never sleeps in it; and runs constantly, but has no legs?",["A river","A car","A clock","A train"],0,"A river flows within a riverbed across the terrain without legs."],
  ["What has teeth, but cannot bite or chew your food?",["A zipper","A shark","A comb","A fork"],0,"A clothing zipper has interlocking metal or plastic teeth."],
  ["What gets bigger the more dirt you dig out of it?",["A hole","A mountain","A trench","A tunnel"],0,"Digging soil out expands the overall size of a hole."],
  ["What has a bow, but cannot shoot arrows?",["A violin","A gift box","A ship","A clown"],0,"A violin player uses a horsehair bow across strings to create music."],
  ["What has a bottom located at the very top of your body?",["Your shoes","Your hat","Your hair","Your brain"],0,"Shoes cover your feet at the lowest part of your limbs."],
  ["What is full of wonderful stories, yet cannot speak a single word out loud?",["A library book","A radio","A television","A computer"],0,"Books contain written plots and characters without vocal cords."]
];
const QUESTIONS = RAW_QUESTIONS.map(([question, options, answer, fact], index) => ({ id: index + 1, question, options, answer, fact }));

export default function RiddleCornerQuiz({ userId, isPrivileged, remaining, quotaLimit, onRemainingChange, onExit }: {
  userId: string | null;
  isPrivileged: boolean;
  remaining: number;
  quotaLimit: number;
  onRemainingChange: (value: number) => void;
  onExit: () => void;
}) {
  const [questionIndex, setQuestionIndex] = useState<number | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [reservationSessionId] = useState(() => "riddle-session-" + Date.now() + "-" + Math.random().toString(36).slice(2));
  const question = questionIndex === null ? null : QUESTIONS[questionIndex];

  const playTone = (correct: boolean) => {
    try {
      const audio = new Audio(correct ? "/correct.mp3" : "/Lose.mp3");
      audio.volume = 0.85;
      void audio.play().catch(() => {});
    } catch {}
  };

  const reserveNextQuestion = async (excludeIndex: number | null = null) => {
    if (!userId) return;
    if (questionIndex === null) setLoading(true);
    setErrorMessage("");
    try {
      const quotaResponse = await fetch("/api/game-access", { cache: "no-store" });
      const quotaData = await quotaResponse.json();
      if (!quotaResponse.ok) {
        setErrorMessage(quotaData.error || "Please sign in to play.");
        setLoading(false);
        return;
      }
      const privileged = Boolean(quotaData.isAdmin || quotaData.isSubscribed);
      const currentRemaining = Number(privileged ? quotaData.remainingByType?.riddle ?? 0 : quotaData.remainingBySection?.["riddle-corner"] ?? 0);
      onRemainingChange(currentRemaining);
      if (currentRemaining <= 0) {
        setErrorMessage(privileged ? "Your quota for this section today has been exhausted. Please visit tomorrow to play again." : "Your free quota for this section has been exhausted. Please subscribe to enjoy further.");
        setLoading(false);
        return;
      }

      const candidates = QUESTIONS.map((_: any, i: number) => i).filter((i: number) => i !== excludeIndex).filter((index: number, _: number, list: number[]) => {
        const key = QUESTIONS[index].question.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim().slice(0, 300);
        return list.findIndex(other => QUESTIONS[other].question.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim().slice(0, 300) === key) === list.indexOf(index);
      });
      for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
      }
      for (const candidateIndex of candidates) {
        const candidate = QUESTIONS[candidateIndex];
        const response = await fetch("/api/game-access", {
          method: "POST", cache: "no-store", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sectionId: "riddle-corner", gameTypeId: "riddle",
            challengeId: "riddle-q-" + candidate.id, challengeQuestion: candidate.question,
            legacyChallengeIds: QUESTIONS.filter((item: any) => item.question.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim().slice(0, 300) === candidate.question.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim().slice(0, 300)).map((item: any) => "riddle-q-" + item.id),
            reserveQuestion: true, reservationSessionId
          })
        });
        const data = await response.json();
        if (response.ok && data.reserved) {
          const resumedId = data.resumed && typeof data.challengeId === "string"
            ? Number(data.challengeId.replace("riddle-q-", ""))
            : Number(candidate.id);
          const resumedIndex = QUESTIONS.findIndex((item: any) => Number(item.id) === resumedId);
          if (resumedIndex < 0) {
            setErrorMessage("Your saved question could not be restored. Please try again.");
            setLoading(false);
            return;
          }
          setQuestionIndex(resumedIndex);
          setChosen(null);
          setLoading(false);
          return;
        }
        if (response.status !== 409) {
          setErrorMessage(data.error || "Questions could not be loaded. Please try again.");
          setLoading(false);
          return;
        }
      }
      const bankQuestionPairs = QUESTIONS.map((item: any) => ({
        challengeId: "riddle-q-" + item.id,
        questionKey: item.question.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim().slice(0, 300),
        legacyChallengeIds: QUESTIONS.filter((other: any) => other.question.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim().slice(0, 300) === item.question.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim().slice(0, 300)).map((other: any) => "riddle-q-" + other.id)
      })).filter((item: any, index: number, all: any[]) => all.findIndex(other => other.questionKey === item.questionKey) === index);
      const resetResponse = await fetch("/api/game-access", {
        method: "POST", cache: "no-store", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId: "riddle-corner", gameTypeId: "riddle", resetQuestionBank: true, bankQuestionPairs })
      });
      const resetData = await resetResponse.json();
      if (resetResponse.ok && resetData.bankReset) {
        window.setTimeout(() => void reserveNextQuestion(null), 50);
        return;
      }
      setErrorMessage("You have completed all available riddles in this section. Your next round will begin after the full bank is completed.");
    } catch {
      setErrorMessage("Questions could not be loaded. Please try again.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (userId) void reserveNextQuestion();
    // Load the first unseen riddle when the player enters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const choose = async (option: number) => {
    if (!question || chosen !== null || submitting) return;
    setSubmitting(true);
    try {
      const response = await fetch("/api/game-access", {
        method: "POST", cache: "no-store", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionId: "riddle-corner", gameTypeId: "riddle",
          challengeId: "riddle-q-" + question.id, challengeQuestion: question.question,
          reservationSessionId
        })
      });
      const data = await response.json();
      if (!response.ok) {
        onRemainingChange(Number(data.sectionRemaining ?? data.remaining ?? 0));
        setErrorMessage(isPrivileged ? "Your quota for this section today has been exhausted. Please visit tomorrow to play again." : "Your free quota for this section has been exhausted. Please subscribe to enjoy further.");
        setSubmitting(false);
        return;
      }
      const nextRemaining = Number(data.isAdmin || data.isSubscribed ? data.remaining ?? 0 : data.sectionRemaining ?? 0);
      onRemainingChange(nextRemaining);
      if (nextRemaining <= 0) {
        const correct = option === question.answer;
        if (correct) setScore(value => value + 1);
        playTone(correct);
        setQuestionIndex(null);
        setChosen(null);
        setErrorMessage(isPrivileged ? "Your quota for this section today has been exhausted. Please visit tomorrow to play again." : "Your free quota for this section has been exhausted. Please subscribe to enjoy further.");
        setSubmitting(false);
        return;
      }
      setChosen(option);
      if (option === question.answer) {
        setScore(value => value + 1);
        playTone(true);
        window.setTimeout(() => void reserveNextQuestion(question.id - 1), 5000);
      } else {
        playTone(false);
      }
    } catch {
      setErrorMessage("Your answer could not be recorded. Please try again.");
    }
    setSubmitting(false);
  };

  if (!userId) return null;
  return (
    <>
    <div className="mx-auto w-full max-w-3xl">
      <section className="mx-auto w-full overflow-hidden rounded-3xl border border-violet-200 bg-white text-slate-900 shadow-2xl">
        <div className="flex justify-end px-5 pt-4 sm:px-7"><span className="rounded-full border border-emerald-200 bg-gradient-to-r from-emerald-50 to-cyan-50 px-4 py-2 text-xs font-black text-emerald-900">{formatFreeQuotaLabel(remaining, isPrivileged, "game")}</span></div>
        {loading && !question ? (
          <div className="px-5 py-12 text-center font-bold text-violet-800">Loading your next question…</div>
        ) : question ? (
          <div className="p-5 sm:p-7">
            <div className="mb-5 flex items-center justify-between text-xs font-extrabold text-slate-500">
              <span>{Math.max(0, quotaLimit - remaining)} out of {quotaLimit} qsns</span>
              <span>SCORE: {score}</span>
            </div>
            <h3 className="mb-6 text-xl font-black leading-snug sm:text-2xl">{question.question}</h3>
            <div className="grid gap-3">
              {question.options.map((option: string, optionIndex: number) => {
                const isCorrect = optionIndex === question.answer;
                const isChosen = chosen === optionIndex;
                const style = chosen === null ? ["border-sky-400 bg-gradient-to-br from-sky-100 to-cyan-200 text-sky-950 hover:border-sky-600","border-violet-400 bg-gradient-to-br from-violet-100 to-fuchsia-200 text-violet-950 hover:border-violet-600","border-amber-400 bg-gradient-to-br from-amber-100 to-yellow-200 text-amber-950 hover:border-amber-600","border-emerald-400 bg-gradient-to-br from-emerald-100 to-lime-200 text-emerald-950 hover:border-emerald-600"][optionIndex%4] : isCorrect ? "border-emerald-600 bg-gradient-to-br from-emerald-100 to-green-200 text-emerald-950" : isChosen ? "border-rose-600 bg-gradient-to-br from-rose-100 to-pink-200 text-rose-950" : "border-slate-200 bg-slate-50 text-slate-500";
                return <button key={option} type="button" disabled={chosen !== null || submitting} onClick={() => void choose(optionIndex)} className={"flex min-h-14 items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left font-bold transition " + style}><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-black text-violet-800">{String.fromCharCode(65 + optionIndex)}</span><span>{option}</span>{chosen !== null && isCorrect && <span className="ml-auto text-xl">✓</span>}{chosen !== null && isChosen && !isCorrect && <span className="ml-auto text-xl">✕</span>}</button>;
              })}
            </div>
            {chosen !== null && <div className={"mt-5 rounded-2xl p-4 " + (chosen === question.answer ? "bg-emerald-50 text-emerald-900" : "bg-rose-50 text-rose-900")}>
              <p className="font-black">{chosen === question.answer ? "Correct! 🎉" : `No !! The correct answer is (${String.fromCharCode(65 + question.answer)})`}</p>
              {chosen === question.answer && <p className="mt-1 text-sm leading-6">{question.fact}</p>}
              {chosen !== question.answer && <button type="button" onClick={() => void reserveNextQuestion(question.id - 1)} className="mt-4 rounded-xl bg-violet-700 px-5 py-2.5 text-sm font-extrabold text-white shadow hover:bg-violet-800">Next question →</button>}
            </div>}
          </div>
        ) : (
          <div className="px-5 py-10 text-center">
            <p className="font-bold text-slate-700">{errorMessage}</p>
            {remaining > 0 && <button type="button" onClick={() => void reserveNextQuestion()} className="mt-4 rounded-xl bg-violet-700 px-5 py-2.5 font-extrabold text-white">Try again</button>}
            <button type="button" onClick={onExit} className="mt-4 ml-2 rounded-xl border border-violet-200 px-5 py-2.5 font-extrabold text-violet-800">Back to Quiz World</button>
          </div>
        )}
      </section>
    </div>
    <GameQuotaPopup open={!loading && remaining <= 0} isPrivileged={isPrivileged} resetKey="riddle-corner" />
    </>
  );
}