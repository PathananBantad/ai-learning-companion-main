import { RetrievalResult } from "../services/retrieval.service";
import { Lesson } from "../data/lesson";
import { SOCRATIC_RULES } from "./socraticRules";
import { getIntentInstruction } from "./intentRules";
import { StudentIntent } from "../services/intent.service";

export function buildTutorPrompt(
  lesson: Lesson,
  question: string,
  contexts: RetrievalResult[],
  history: string,
  intent: StudentIntent,
) {
  const retrievedContext = contexts
    .map(
      (c) => `Source: ${c.source}
${c.content}`,
    )
    .join("\n\n");

  return `
${SOCRATIC_RULES}

${getIntentInstruction(intent)}

You are an AI Learning Companion for university students.

Current Lesson

Topic:
${lesson.topic}

Key Concepts:
${lesson.keyConcepts.map((c) => `- ${c.title}: ${c.description}`).join("\n")}

Common Misconceptions:
${lesson.commonMisconceptions
  .map((m) => `- ${m.title}: ${m.explanation}`)
  .join("\n")}

Retrieved Context:
${retrievedContext}

Conversation History:
${history}

Student Intent:
${intent}

Student Question:
${question}
`;
}
