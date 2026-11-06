"use client";

import { useEffect, useState } from "react";

type Question = { question: string; options: string[]; answer: number; fact: string };

const QUESTIONS: Question[] = [
  {
    "question": "Which planet is known as the Red Planet?",
    "options": [
      "Venus",
      "Mars",
      "Jupiter",
      "Saturn"
    ],
    "answer": 1,
    "fact": "Mars is called the Red Planet because iron oxide (rust) covers its surface."
  },
  {
    "question": "What is the capital city of France?",
    "options": [
      "London",
      "Berlin",
      "Paris",
      "Madrid"
    ],
    "answer": 2,
    "fact": "Paris is the capital and most populous city of France."
  },
  {
    "question": "Which chemical element has the symbol 'O'?",
    "options": [
      "Gold",
      "Oxygen",
      "Osmium",
      "Silver"
    ],
    "answer": 1,
    "fact": "Oxygen is a chemical element with symbol O and atomic number 8."
  },
  {
    "question": "What is the largest mammal on Earth?",
    "options": [
      "African Elephant",
      "Blue Whale",
      "Giraffe",
      "Hippopotamus"
    ],
    "answer": 1,
    "fact": "The blue whale is the largest animal known to have ever lived."
  },
  {
    "question": "Who painted the Mona Lisa?",
    "options": [
      "Vincent van Gogh",
      "Pablo Picasso",
      "Leonardo da Vinci",
      "Claude Monet"
    ],
    "answer": 2,
    "fact": "Leonardo da Vinci painted the Mona Lisa during the Italian Renaissance."
  },
  {
    "question": "What is the boiling point of water at standard atmospheric pressure?",
    "options": [
      "50°C",
      "100°C",
      "150°C",
      "212°C"
    ],
    "answer": 1,
    "fact": "Pure water boils at 100 degrees Celsius (212 degrees Fahrenheit) at sea level."
  },
  {
    "question": "Which country is home to the ancient pyramid complex of Giza?",
    "options": [
      "Mexico",
      "Sudan",
      "Egypt",
      "Iraq"
    ],
    "answer": 2,
    "fact": "Giza is located on the west bank of the Nile River, near Cairo, Egypt."
  },
  {
    "question": "What is the hardest natural substance on Earth?",
    "options": [
      "Gold",
      "Iron",
      "Diamond",
      "Quartz"
    ],
    "answer": 2,
    "fact": "Diamond is a solid form of carbon with its atoms arranged in a crystal structure, scoring 10 on the Mohs scale."
  },
  {
    "question": "Which instrument is used to measure earthquakes?",
    "options": [
      "Barometer",
      "Seismograph",
      "Thermometer",
      "Hygrometer"
    ],
    "answer": 1,
    "fact": "A seismograph detects and records seismic waves produced by earthquakes."
  },
  {
    "question": "What is the official currency of Japan?",
    "options": [
      "Yuan",
      "Won",
      "Yen",
      "Ringgit"
    ],
    "answer": 2,
    "fact": "The Japanese yen is the official currency of Japan and a major world reserve currency."
  },
  {
    "question": "Which gas makes up the majority of Earth's atmosphere?",
    "options": [
      "Oxygen",
      "Carbon Dioxide",
      "Nitrogen",
      "Argon"
    ],
    "answer": 2,
    "fact": "Nitrogen constitutes approximately 78% of the Earth's atmosphere."
  },
  {
    "question": "What is the capital city of Canada?",
    "options": [
      "Toronto",
      "Vancouver",
      "Ottawa",
      "Montreal"
    ],
    "answer": 2,
    "fact": "Ottawa is the federally designated capital of Canada."
  },
  {
    "question": "Which artist is famous for cutting off part of his ear?",
    "options": [
      "Pablo Picasso",
      "Vincent van Gogh",
      "Claude Monet",
      "Salvador Dali"
    ],
    "answer": 1,
    "fact": "Dutch painter Vincent van Gogh famously mutilated his ear during a breakdown."
  },
  {
    "question": "What is the chemical symbol for gold?",
    "options": [
      "Ag",
      "Au",
      "Gd",
      "Go"
    ],
    "answer": 1,
    "fact": "Au comes from aurum, the Latin word for gold."
  },
  {
    "question": "Which ocean is the largest on Earth?",
    "options": [
      "Atlantic Ocean",
      "Indian Ocean",
      "Pacific Ocean",
      "Arctic Ocean"
    ],
    "answer": 2,
    "fact": "The Pacific Ocean is the largest and deepest of all oceanic divisions."
  },
  {
    "question": "What is the capital city of Italy?",
    "options": [
      "Milan",
      "Florence",
      "Venice",
      "Rome"
    ],
    "answer": 3,
    "fact": "Rome is the historic and political capital city of Italy."
  },
  {
    "question": "Which planet is closest to the Sun?",
    "options": [
      "Venus",
      "Earth",
      "Mercury",
      "Mars"
    ],
    "answer": 2,
    "fact": "Mercury is the smallest and closest planet to the sun in our solar system."
  },
  {
    "question": "What is the chemical symbol for silver?",
    "options": [
      "Si",
      "Ag",
      "Sv",
      "As"
    ],
    "answer": 1,
    "fact": "Ag represents silver, derived from the Latin argentum."
  },
  {
    "question": "Which animal is traditionally known as the King of the Jungle?",
    "options": [
      "Tiger",
      "Lion",
      "Elephant",
      "Leopard"
    ],
    "answer": 1,
    "fact": "The lion is nicknamed the king of the jungle despite inhabiting grasslands and plains."
  },
  {
    "question": "What is the freezing point of water in Celsius?",
    "options": [
      "-10°C",
      "0°C",
      "10°C",
      "100°C"
    ],
    "answer": 1,
    "fact": "Water freezes at zero degrees Celsius under normal atmospheric pressure."
  },
  {
    "question": "Which country has the largest land area in the world?",
    "options": [
      "China",
      "Canada",
      "United States",
      "Russia"
    ],
    "answer": 3,
    "fact": "Russia is the largest country globally, spanning over 17 million square kilometers."
  },
  {
    "question": "What is the primary structural protein in human hair and nails?",
    "options": [
      "Collagen",
      "Keratin",
      "Fibrin",
      "Elastin"
    ],
    "answer": 1,
    "fact": "Keratin is the fibrous structural protein that protects cells and builds hair and nails."
  },
  {
    "question": "Which scientist introduced the laws of motion and universal gravitation?",
    "options": [
      "Albert Einstein",
      "Isaac Newton",
      "Galileo Galilei",
      "Thomas Edison"
    ],
    "answer": 1,
    "fact": "Sir Isaac Newton outlined classical mechanics through his revolutionary laws of motion."
  },
  {
    "question": "What is the capital of South Korea?",
    "options": [
      "Busan",
      "Seoul",
      "Incheon",
      "Daegu"
    ],
    "answer": 1,
    "fact": "Seoul is the sprawling capital city of South Korea."
  },
  {
    "question": "Which ocean is the smallest of the world's five oceans?",
    "options": [
      "Indian Ocean",
      "Arctic Ocean",
      "Southern Ocean",
      "Atlantic Ocean"
    ],
    "answer": 1,
    "fact": "The Arctic Ocean is the smallest and shallowest of the world's major oceans."
  },
  {
    "question": "What is the chemical symbol for sodium?",
    "options": [
      "So",
      "Sd",
      "Na",
      "Nm"
    ],
    "answer": 2,
    "fact": "Na is derived from the Neo-Latin word natrium."
  },
  {
    "question": "Which country is home to the ancient ruin of Machu Picchu?",
    "options": [
      "Mexico",
      "Peru",
      "Brazil",
      "Chile"
    ],
    "answer": 1,
    "fact": "Machu Picchu is a 15th-century Inca citadel situated high in the Andes Mountains in Peru."
  },
  {
    "question": "What is the capital city of Brazil?",
    "options": [
      "Rio de Janeiro",
      "Sao Paulo",
      "Brasilia",
      "Salvador"
    ],
    "answer": 2,
    "fact": "Brasilia is the planned federal capital city of Brazil."
  },
  {
    "question": "Which tree is famous for producing acorns?",
    "options": [
      "Pine",
      "Oak",
      "Maple",
      "Willow"
    ],
    "answer": 1,
    "fact": "Oak trees produce hard, woody nuts known as acorns."
  },
  {
    "question": "What is the main organ of the human nervous system?",
    "options": [
      "Heart",
      "Brain",
      "Stomach",
      "Lungs"
    ],
    "answer": 1,
    "fact": "The brain acts as the central command center for the human nervous system."
  },
  {
    "question": "Which gas is most abundant in the universe?",
    "options": [
      "Oxygen",
      "Hydrogen",
      "Nitrogen",
      "Carbon Dioxide"
    ],
    "answer": 1,
    "fact": "Hydrogen is the lightest and most abundant chemical element in the observable universe."
  },
  {
    "question": "What is the capital city of Germany?",
    "options": [
      "Munich",
      "Berlin",
      "Frankfurt",
      "Hamburg"
    ],
    "answer": 1,
    "fact": "Berlin is the historic capital city and cultural heart of Germany."
  },
  {
    "question": "What is the chemical symbol for copper?",
    "options": [
      "Co",
      "Cu",
      "Cp",
      "Cr"
    ],
    "answer": 1,
    "fact": "Cu is derived from cuprum, the Latin word for copper."
  },
  {
    "question": "Which mountain is the highest peak in the world?",
    "options": [
      "K2",
      "Kangchenjunga",
      "Mount Everest",
      "Makalu"
    ],
    "answer": 2,
    "fact": "Mount Everest stands as the highest elevation above sea level on Earth."
  },
  {
    "question": "What is the primary currency of Japan?",
    "options": [
      "Yuan",
      "Yen",
      "Won",
      "Ringgit"
    ],
    "answer": 1,
    "fact": "The Japanese yen is the official monetary currency of Japan."
  },
  {
    "question": "Which organ in the human body cleanses blood and produces bile?",
    "options": [
      "Kidney",
      "Liver",
      "Pancreas",
      "Spleen"
    ],
    "answer": 1,
    "fact": "The liver plays a vital role in detoxification, protein synthesis, and biochemical production like bile."
  },
  {
    "question": "What is the freezing point of water in Fahrenheit?",
    "options": [
      "0°F",
      "32°F",
      "100°F",
      "212°F"
    ],
    "answer": 1,
    "fact": "Water freezes at 32 degrees Fahrenheit under normal atmospheric conditions."
  },
  {
    "question": "What is the chemical symbol for lead?",
    "options": [
      "Le",
      "Pb",
      "Ld",
      "Pd"
    ],
    "answer": 1,
    "fact": "Pb comes from the Latin word plumbum, meaning lead."
  },
  {
    "question": "Which planet is known for its prominent system of icy rings?",
    "options": [
      "Jupiter",
      "Saturn",
      "Uranus",
      "Neptune"
    ],
    "answer": 1,
    "fact": "Saturn is renowned for its spectacular and complex ring system."
  },
  {
    "question": "What is the largest bird alive today?",
    "options": [
      "Emu",
      "Albatross",
      "Ostrich",
      "Condor"
    ],
    "answer": 2,
    "fact": "The ostrich is the largest and heaviest living bird species on Earth."
  },
  {
    "question": "Which European country is famous for inventing pizza?",
    "options": [
      "France",
      "Greece",
      "Italy",
      "Spain"
    ],
    "answer": 2,
    "fact": "Traditional pizza originated in the Campania region of Italy, specifically in Naples."
  },
  {
    "question": "What is the official language of Brazil?",
    "options": [
      "Spanish",
      "Portuguese",
      "English",
      "French"
    ],
    "answer": 1,
    "fact": "Portuguese is spoken nationwide as the official language of Brazil."
  },
  {
    "question": "Which famous physicist developed the theories of relativity?",
    "options": [
      "Isaac Newton",
      "Galileo Galilei",
      "Albert Einstein",
      "Niels Bohr"
    ],
    "answer": 2,
    "fact": "Albert Einstein revolutionized modern physics through his special and general theories of relativity."
  },
  {
    "question": "What is the chemical formula for carbon dioxide?",
    "options": [
      "CO",
      "CO2",
      "C2O",
      "H2O"
    ],
    "answer": 1,
    "fact": "Carbon dioxide consists of one carbon atom bonded to two oxygen atoms (CO2)."
  },
  {
    "question": "Which continent contains the Amazon River basin?",
    "options": [
      "Africa",
      "Asia",
      "South America",
      "Australia"
    ],
    "answer": 2,
    "fact": "The Amazon River basin is located in South America, spanning across multiple countries."
  },
  {
    "question": "What is the capital city of Egypt?",
    "options": [
      "Alexandria",
      "Cairo",
      "Luxor",
      "Giza"
    ],
    "answer": 1,
    "fact": "Cairo is the bustling capital city of Egypt along the Nile River."
  },
  {
    "question": "Which gas do humans inhale to support cellular respiration?",
    "options": [
      "Nitrogen",
      "Oxygen",
      "Carbon Dioxide",
      "Hydrogen"
    ],
    "answer": 1,
    "fact": "Oxygen is the vital gas inhaled by humans to power cellular energy metabolism."
  },
  {
    "question": "What is the primary ingredient in chocolate?",
    "options": [
      "Cocoa beans",
      "Vanilla beans",
      "Coffee beans",
      "Sugar cane"
    ],
    "answer": 0,
    "fact": "Chocolate is processed from roasted and ground cacao seeds."
  },
  {
    "question": "Which instrument measures atmospheric pressure changes?",
    "options": [
      "Thermometer",
      "Barometer",
      "Hygrometer",
      "Altimeter"
    ],
    "answer": 1,
    "fact": "A barometer is used extensively in meteorology to measure atmospheric pressure."
  },
  {
    "question": "What is the capital of Spain?",
    "options": [
      "Barcelona",
      "Madrid",
      "Seville",
      "Valencia"
    ],
    "answer": 1,
    "fact": "Madrid is the central political and cultural capital of Spain."
  }
];

export default function NativeTriviaQuiz({ userId, remaining, quotaLimit, onRemainingChange, onExit }: {
  userId: string | null;
  remaining: number;
  quotaLimit: number;
  onRemainingChange: (value: number) => void;
  onExit: () => void;
}) {
  const [questionIndex, setQuestionIndex] = useState<number | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [signInVisible, setSignInVisible] = useState(true);
  const [reservationSessionId] = useState(() => "trivio-session-" + Date.now() + "-" + Math.random().toString(36).slice(2));
  const question = questionIndex === null ? null : QUESTIONS[questionIndex];

  useEffect(() => {
    if (userId) return;
    const timer = window.setTimeout(() => setSignInVisible(false), 5000);
    return () => window.clearTimeout(timer);
  }, [userId]);

  const playTone = (correct: boolean) => {
    try {
      const audio = new Audio(correct ? "/correct.mp3" : "/Lose.mp3");
      audio.volume = 0.85;
      void audio.play().catch(() => {});
    } catch {}
  };

  const reserveNextQuestion = async (excludeIndex: number | null = null) => {
    if (!userId) return;
    setLoading(true);
    setErrorMessage("");
    setQuestionIndex(null);
    setChosen(null);
    try {
      const quotaResponse = await fetch("/api/game-access", { cache: "no-store" });
      const quotaData = await quotaResponse.json();
      if (!quotaResponse.ok) {
        setErrorMessage(quotaData.error || "Please sign in to play.");
        setLoading(false);
        return;
      }
      const currentRemaining = Number(quotaData.remainingByType?.trivio ?? 0);
      onRemainingChange(currentRemaining);
      if (currentRemaining <= 0) {
        setErrorMessage("Your daily quota on this section is over. Please visit tomorrow.");
        setLoading(false);
        return;
      }

      const candidates = QUESTIONS.map((_, i) => i).filter(i => i !== excludeIndex);
      for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
      }
      for (const candidateIndex of candidates) {
        const candidate = QUESTIONS[candidateIndex];
        const challengeId = "trivio-q-" + candidateIndex;
        const response = await fetch("/api/game-access", {
          method: "POST",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sectionId: "quiz-world",
            gameTypeId: "trivio",
            challengeId,
            challengeQuestion: candidate.question,
            reserveQuestion: true,
            reservationSessionId
          })
        });
        const data = await response.json();
        if (response.ok && data.reserved) {
          setQuestionIndex(candidateIndex);
          setLoading(false);
          return;
        }
        if (response.status !== 409) {
          setErrorMessage(data.error || "Questions could not be loaded. Please try again.");
          setLoading(false);
          return;
        }
      }
      setErrorMessage("You have completed all available questions in this section. New questions will appear when more are added.");
    } catch {
      setErrorMessage("Questions could not be loaded. Please try again.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (userId) void reserveNextQuestion();
    // The first question is selected once when the signed-in player enters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const choose = async (option: number) => {
    if (!question || chosen !== null || loading) return;
    setLoading(true);
    const challengeId = "trivio-q-" + questionIndex;
    try {
      const response = await fetch("/api/game-access", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionId: "quiz-world",
          gameTypeId: "trivio",
          challengeId,
          challengeQuestion: question.question,
          reservationSessionId
        })
      });
      const data = await response.json();
      if (!response.ok) {
        onRemainingChange(Number(data.remaining ?? 0));
        setErrorMessage(data.error || "Your quota could not be verified.");
        setQuestionIndex(null);
        setLoading(false);
        return;
      }
      onRemainingChange(Number(data.remaining ?? Math.max(0, remaining - 1)));
      setChosen(option);
      const correct = option === question.answer;
      if (correct) setScore(value => value + 1);
      playTone(correct);
    } catch {
      setErrorMessage("Your answer could not be recorded. Please try again.");
    }
    setLoading(false);
  };

  if (!userId) return signInVisible ? (
    <div className="fixed inset-0 z-[10060] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm" role="alertdialog" aria-modal="true">
      <div className="w-full max-w-md overflow-hidden rounded-[1.75rem] border border-white/70 bg-white shadow-2xl">
        <div className="h-2 bg-gradient-to-r from-cyan-300 via-pink-500 to-violet-600" />
        <div className="bg-gradient-to-br from-indigo-700 via-violet-600 to-fuchsia-600 px-6 py-7 text-center text-white">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-3xl shadow-lg">🔐</div>
          <h3 className="mt-4 text-xl font-black">Please sign in to play</h3>
          <p className="mt-2 text-sm text-white/85">Sign in to access questions and games on Shoppers Ocean.</p>
          <a href="/login" className="mt-5 inline-flex rounded-full bg-white px-6 py-3 text-sm font-black text-indigo-700 shadow-lg">Sign in →</a>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <section className="mx-auto w-full overflow-hidden rounded-3xl border border-violet-200 bg-white text-slate-900 shadow-2xl">
        <header className="bg-gradient-to-r from-violet-700 via-fuchsia-700 to-indigo-800 px-5 py-5 text-white sm:px-7">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-white/80">Quiz World · General Knowledge Quiz</span>
            <span className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-extrabold">{remaining} plays left today</span>
          </div>
          <p className="mt-2 text-sm text-white/85">Choose the best answer</p>
        </header>
        {loading ? (
          <div className="px-5 py-12 text-center font-bold text-violet-800">Loading your next question…</div>
        ) : question ? (
          <div className="p-5 sm:p-7">
            <div className="mb-5 flex items-center justify-between text-xs font-extrabold text-slate-500">
              <span>{Math.max(0, quotaLimit - remaining)} out of 10 qsns</span>
              <span>SCORE: {score}</span>
            </div>
            <h3 className="mb-6 text-xl font-black leading-snug sm:text-2xl">{question.question}</h3>
            <div className="grid gap-3">
              {question.options.map((option, optionIndex) => {
                const isCorrect = optionIndex === question.answer;
                const isChosen = chosen === optionIndex;
                const style = chosen === null ? "border-violet-200 bg-white hover:border-violet-500 hover:bg-violet-50" : isCorrect ? "border-emerald-500 bg-emerald-50 text-emerald-900" : isChosen ? "border-rose-500 bg-rose-50 text-rose-900" : "border-slate-200 bg-slate-50 text-slate-500";
                return <button key={option} type="button" disabled={chosen !== null || loading} onClick={() => void choose(optionIndex)} className={"flex min-h-14 items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left font-bold transition " + style}><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-black text-violet-800">{String.fromCharCode(65 + optionIndex)}</span><span>{option}</span>{chosen !== null && isCorrect && <span className="ml-auto text-xl">✓</span>}{chosen !== null && isChosen && !isCorrect && <span className="ml-auto text-xl">✕</span>}</button>;
              })}
            </div>
            {chosen !== null && <div className={"mt-5 rounded-2xl p-4 " + (chosen === question.answer ? "bg-emerald-50 text-emerald-900" : "bg-rose-50 text-rose-900")}>
              <p className="font-black">{chosen === question.answer ? "Correct! 🎉" : `No !! The correct answer is (${String.fromCharCode(65 + question.answer)})`}</p>
              {chosen === question.answer && <p className="mt-1 text-sm leading-6">{question.fact}</p>}
              <button type="button" onClick={() => void reserveNextQuestion(questionIndex)} className="mt-4 rounded-xl bg-violet-700 px-5 py-2.5 text-sm font-extrabold text-white shadow hover:bg-violet-800">Next question →</button>
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
  );
}
