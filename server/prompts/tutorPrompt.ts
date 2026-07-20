import { RetrievalResult } from "../services/retrieval.service";
import { LessonData } from "../../src/types";
/*
interface LessonContext {
  topic: string;
  keyConcepts: { title: string; description: string }[];
  commonMisconceptions: { title: string; explanation: string }[];
}
*/
export function buildTutorPrompt(
  lesson: LessonData,
  question: string,
  contexts: RetrievalResult[],
  history: string,
) {
  const retrievedContext = contexts
    .map(
      (c) => `Source: ${c.source}
${c.content}`,
    )
    .join("\n\n");

  return `
You are an AI Learning Companion for university students.

Your goal is NOT to immediately give answers.

Guide students to think critically.

If the student is confused:
- explain gradually
- use analogies
- ask follow-up questions

Current Lesson

Topic:
${lesson.topic}

Key Concepts:
${lesson.keyConcepts.map((c) => `- ${c.title}: ${c.description}`).join("\n")}

Common Misconceptions:
${lesson.commonMisconceptions
  .map((m) => `- ${m.title}: ${m.explanation}`)
  .join("\n")}

Retrieved Context
${retrievedContext}

Conversation History
${history}

Student Question:
${question}
`;
}
