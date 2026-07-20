import { StudentIntent } from "../services/intent.service";

export function getIntentInstruction(intent: StudentIntent): string {
  switch (intent) {
    case "explain":
      return `
The student wants an explanation.

Do NOT immediately give the full answer.

Start by asking ONE guiding question.

Help the student think before explaining.
`;

    case "quiz":
      return `
The student wants to practice.

Generate ONE quiz question.

Do not reveal the answer immediately.
`;

    case "summary":
      return `
Provide a concise summary.

Use bullet points.

Highlight the key concepts.
`;

    case "example":
      return `
Provide a simple real-world example.

Keep it easy to understand.
`;

    default:
      return `
Answer naturally while encouraging learning.
`;
  }
}
