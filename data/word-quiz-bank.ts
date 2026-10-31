import { DAILY_GK_QUESTIONS, getDailyGKOptions } from "@/lib/daily-knowledge";

export type WordQuizQuestion = {
  id: string;
  question: string;
  answer: string;
  options: [string, string, string, string];
  explanation: string;
  clue: string;
  topic: string;
};

// A balanced 300-question general-knowledge set: geography, science,
// world capitals and chemical elements. Every item is a direct MCQ.
const selected = [
  ...DAILY_GK_QUESTIONS.filter(q => q.id.startsWith("geography-")),
  ...DAILY_GK_QUESTIONS.filter(q => q.id.startsWith("science-")),
  ...DAILY_GK_QUESTIONS.filter(q => q.id.startsWith("capital-")).slice(0, 50),
  ...DAILY_GK_QUESTIONS.filter(q => q.id.startsWith("element-")).slice(0, 50),
].filter((q, index, all) => all.findIndex(x => x.question.trim().toLowerCase() === q.question.trim().toLowerCase()) === index)
 .slice(0, 300);

export const WORD_QUIZ_BANK: WordQuizQuestion[] = selected.map((q, index) => {
  const topic = q.id.startsWith("geography-") ? "Geography & World Places"
    : q.id.startsWith("science-") ? "Science & Nature"
    : q.id.startsWith("capital-") ? "World Capitals" : "Chemistry";
  const rawOptions = getDailyGKOptions(q, index + 37);
  const poolPrefix = q.id.startsWith("geography-") ? "geography-"
    : q.id.startsWith("science-") ? "science-"
    : q.id.startsWith("capital-") ? "capital-" : "element-";
  const pool = [...new Set(DAILY_GK_QUESTIONS.filter(item => item.id.startsWith(poolPrefix)).map(item => item.answer))];
  const uniqueOptions = [...new Set(rawOptions)];
  for (let step = 0; uniqueOptions.length < 4 && step < pool.length; step++) {
    const candidate = pool[(index * 7 + step) % pool.length];
    if (!uniqueOptions.includes(candidate)) uniqueOptions.push(candidate);
  }
  const options = uniqueOptions.slice(0, 4) as [string, string, string, string];
  return {
    id: "wordquiz-" + String(index + 1).padStart(3, "0"),
    question: q.question,
    answer: q.answer,
    options,
    explanation: "Correct answer: " + q.answer + ".",
    clue: q.question,
    topic,
  };
});
