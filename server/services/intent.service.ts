export type StudentIntent =
  | "explain"
  | "quiz"
  | "summary"
  | "example"
  | "general";

export function detectIntent(question: string): StudentIntent {
  const q = question.toLowerCase();

  if (q.includes("explain") || q.includes("why") || q.includes("how")) {
    return "explain";
  }

  if (q.includes("quiz") || q.includes("test")) {
    return "quiz";
  }

  if (q.includes("summary") || q.includes("summarize")) {
    return "summary";
  }

  if (q.includes("example")) {
    return "example";
  }

  return "general";
}
