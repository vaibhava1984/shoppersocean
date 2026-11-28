export function formatFreeQuotaLabel(count: number, privileged: boolean, kind: "quiz" | "game"): string {
  const safeCount = Math.max(0, Number.isFinite(count) ? Math.floor(count) : 0);
  const unit = kind === "quiz"
    ? safeCount === 1 ? "quiz" : "quizzes"
    : safeCount === 1 ? "game" : "games";
  return `${safeCount} free ${unit} left${privileged ? " for today" : ""}`;
}
