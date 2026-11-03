"use client";

import { useRef, useState } from "react";

type Question = { question: string; options: string[]; answer: number; fact: string };

const QUESTIONS: Question[] = [
  { question: "Which animal has three hearts?", options: ["Dolphin", "Octopus", "Sea turtle", "Penguin"], answer: 1, fact: "An octopus has three hearts: two pump blood to the gills and one pumps it to the rest of the body." },
  { question: "Which planet rotates on its side?", options: ["Mars", "Venus", "Uranus", "Mercury"], answer: 2, fact: "Uranus has an extreme axial tilt of about 98 degrees, making it appear to rotate on its side." },
  { question: "What is the only mammal capable of true flight?", options: ["Flying squirrel", "Sugar glider", "Bat", "Colugo"], answer: 2, fact: "Bats are the only mammals capable of powered, sustained flight." },
  { question: "Which country gifted the Statue of Liberty to the United States?", options: ["Italy", "France", "Spain", "Canada"], answer: 1, fact: "France gifted the Statue of Liberty to the United States; it was dedicated in 1886." },
  { question: "What is the largest ocean on Earth?", options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"], answer: 3, fact: "The Pacific Ocean is the largest and deepest of Earth's five oceans." },
  { question: "Which bird is famous for being able to fly backwards?", options: ["Kingfisher", "Hummingbird", "Swift", "Sparrow"], answer: 1, fact: "Hummingbirds can hover and fly backwards thanks to the way their wings move." },
  { question: "What is the main ingredient in traditional guacamole?", options: ["Cucumber", "Green peas", "Avocado", "Zucchini"], answer: 2, fact: "Traditional guacamole is made primarily from mashed avocado." },
  { question: "Which metal is liquid at ordinary room temperature?", options: ["Mercury", "Aluminium", "Copper", "Iron"], answer: 0, fact: "Mercury is a metal that remains liquid at typical room temperature." },
  { question: "How many sides does a dodecagon have?", options: ["10", "11", "12", "14"], answer: 2, fact: "A dodecagon is a polygon with twelve sides." },
  { question: "Which instrument has 88 keys on a standard modern version?", options: ["Accordion", "Piano", "Harp", "Organ"], answer: 1, fact: "A standard modern piano has 88 keys: 52 white keys and 36 black keys." }
];

export default function NativeTriviaQuiz({ userId, remaining, onRemainingChange, onExit }: {
  userId: string | null;
  remaining: number;
  onRemainingChange: (value: number) => void;
  onExit: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [busy, setBusy] = useState(false);
  const consumed = useRef(false);
  const question = QUESTIONS[index];

  const playTone = (correct: boolean) => {
    try {
      const audio = new Audio(correct ? "/correct.mp3" : "/Lose.mp3");
      audio.volume = 0.85;
      void audio.play().catch(() => {});
    } catch {}
  };

  const choose = async (option: number) => {
    if (chosen !== null || busy || finished) return;
    setBusy(true);
    if (userId && !consumed.current) {
      const challengeId = "trivio-native-" + Date.now() + "-" + Math.random().toString(36).slice(2);
      try {
        const response = await fetch("/api/game-access", {
          method: "POST",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sectionId: "quiz-world", gameTypeId: "trivio", challengeId })
        });
        const data = await response.json();
        if (!response.ok) {
          onRemainingChange(Number(data.remaining ?? 0));
          setBusy(false);
          return;
        }
        consumed.current = true;
        onRemainingChange(Number(data.remaining ?? Math.max(0, remaining - 1)));
      } catch {
        setBusy(false);
        return;
      }
    }
    const correct = option === question.answer;
    setChosen(option);
    if (correct) setScore(value => value + 1);
    playTone(correct);
    setBusy(false);
  };

  const next = () => {
    if (index === QUESTIONS.length - 1) setFinished(true);
    else { setIndex(value => value + 1); setChosen(null); }
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <section className="mx-auto w-full overflow-hidden rounded-3xl border border-violet-200 bg-white text-slate-900 shadow-2xl">
      <header className="bg-gradient-to-r from-violet-700 via-fuchsia-700 to-indigo-800 px-5 py-5 text-white sm:px-7">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-white/80">Quiz World · Fun Trivia</span>
          <span className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-extrabold">{remaining} plays left today</span>
        </div>
        <h2 className="mt-2 text-2xl font-black sm:text-3xl">Fun Trivia Challenge</h2>
        <p className="mt-1 text-sm text-white/85">10 questions · Choose the best answer · See your score</p>
      </header>
      {finished ? (
        <div className="px-5 py-10 text-center sm:px-8">
          <div className="text-5xl">🏆</div>
          <h3 className="mt-3 text-2xl font-black">Quiz complete!</h3>
          <p className="mt-2 text-lg font-bold text-violet-800">You scored {score} out of {QUESTIONS.length}</p>
          <p className="mt-2 text-sm text-slate-600">{score === 10 ? "Perfect score! Brilliant work." : score >= 7 ? "Excellent effort!" : score >= 4 ? "Good try — keep exploring!" : "Keep practising. You can do it!"}</p>
          <button type="button" onClick={onExit} className="mt-6 rounded-xl bg-violet-700 px-6 py-3 font-extrabold text-white shadow-lg hover:bg-violet-800">Back to Quiz World</button>
        </div>
      ) : (
        <div className="p-5 sm:p-7">
          <div className="mb-5 flex items-center justify-between text-xs font-extrabold text-slate-500">
            <span>QUESTION {index + 1} OF {QUESTIONS.length}</span>
            <span>SCORE: {score}</span>
          </div>
          <div className="mb-3 h-2 overflow-hidden rounded-full bg-violet-100"><div className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-700 transition-all" style={{ width: ((index + 1) / QUESTIONS.length * 100) + "%" }} /></div>
          <h3 className="mb-6 text-xl font-black leading-snug sm:text-2xl">{question.question}</h3>
          <div className="grid gap-3">
            {question.options.map((option, optionIndex) => {
              const isCorrect = optionIndex === question.answer;
              const isChosen = chosen === optionIndex;
              const style = chosen === null ? "border-violet-200 bg-white hover:border-violet-500 hover:bg-violet-50" : isCorrect ? "border-emerald-500 bg-emerald-50 text-emerald-900" : isChosen ? "border-rose-500 bg-rose-50 text-rose-900" : "border-slate-200 bg-slate-50 text-slate-500";
              return <button key={option} type="button" disabled={chosen !== null || busy} onClick={() => void choose(optionIndex)} className={"flex min-h-14 items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left font-bold transition " + style}><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-black text-violet-800">{String.fromCharCode(65 + optionIndex)}</span><span>{option}</span>{chosen !== null && isCorrect && <span className="ml-auto text-xl">✓</span>}{chosen !== null && isChosen && !isCorrect && <span className="ml-auto text-xl">✕</span>}</button>;
            })}
          </div>
          {chosen !== null && <div className={"mt-5 rounded-2xl p-4 " + (chosen === question.answer ? "bg-emerald-50 text-emerald-900" : "bg-rose-50 text-rose-900")}>
            <p className="font-black">{chosen === question.answer ? "Correct! 🎉" : "Not quite! The correct answer is " + question.options[question.answer] + "."}</p>
            <p className="mt-1 text-sm leading-6">{question.fact}</p>
            <button type="button" onClick={next} className="mt-4 rounded-xl bg-violet-700 px-5 py-2.5 text-sm font-extrabold text-white shadow hover:bg-violet-800">{index === QUESTIONS.length - 1 ? "See my score" : "Next question →"}</button>
          </div>}
        </div>
      )}
      </section>
      <a href="https://trivio.net/" target="_blank" rel="noopener noreferrer" className="mt-4 block rounded-2xl border border-violet-200 bg-white px-4 py-3 text-center text-sm font-bold text-violet-800 shadow transition hover:bg-violet-50">
        🧠 100 Fun Trivia Questions With Answers (Tested on Friends) — more free trivia at Trivio.NET
      </a>
    </div>
  );
}
