import { getGeminiClient, GEMINI_MODEL } from "../lib/gemini";
import { LessonData } from "../../src/types";

export interface MisconceptionResult {
  detected: boolean;
  concept?: string;
  explanation?: string;
  severity?: "low" | "medium" | "high";
}

export async function detectMisconception(
  studentAnswer: string,
  lesson: LessonData,
): Promise<MisconceptionResult> {
  const ai = getGeminiClient();

  if (!ai) {
    return {
      detected: false,
    };
  }

  const prompt = `
You are an educational assessment AI.

Your job is to detect conceptual misunderstanding.

Analyze the student's statement:

"${studentAnswer}"


Lesson Topic:
${lesson.topic}


Key Concepts:
${lesson.keyConcepts.map((c) => `- ${c.title}: ${c.description}`).join("\n")}


Known Misconceptions:
${lesson.commonMisconceptions
  .map((m) => `- ${m.title}: ${m.explanation}`)
  .join("\n")}


Determine whether the student has a misconception.

Return ONLY JSON:

{
  "detected": true,
  "concept": "concept name",
  "explanation": "why this is incorrect",
  "severity": "low"
}

If there is no misconception:

{
  "detected": false
}
`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
  });

  try {
    const text = response.text ?? "{}";

    const cleaned = text.replace("```json", "").replace("```", "").trim();

    return JSON.parse(cleaned);
  } catch {
    return {
      detected: false,
    };
  }
}
