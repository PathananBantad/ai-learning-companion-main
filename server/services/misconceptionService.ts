import { getChatCompletion, isAIAvailable } from "../lib/ai";
import { Lesson, QuizQuestion } from "../data/lesson";

export interface MisconceptionResult {
  detected: boolean;
  concept?: string;
  explanation?: string;
  severity?: "low" | "medium" | "high";
}

// ============================================================
// AI Tutor Chat
// ใช้ตรวจ misconception จากข้อความที่นักศึกษาพิมพ์ถาม
// ============================================================
export async function detectMisconception(
    studentAnswer: string,
    lesson: Lesson,
): Promise<MisconceptionResult> {
  if (!isAIAvailable()) {
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

  try {
    const response = await getChatCompletion({
      messages: [
        {
          role: "system",
          content:
              "You are an educational assessment AI. Return ONLY valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text = response.choices[0]?.message?.content ?? "{}";

    const cleaned = text.replace("```json", "").replace("```", "").trim();

    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Error detecting misconception via AI:", err);
    return {
      detected: false,
    };
  }
}

// ============================================================
// Quiz
// ใช้ตรวจ misconception จากคำตอบของนักศึกษา
// โดยดูจาก misconceptionMap ของแต่ละข้อ
// ============================================================
export function detectQuizMisconceptions(
    questions: QuizQuestion[],
    answers: Record<string, number>,
): string[] {
  const misconceptions: string[] = [];

  questions.forEach((question) => {
    const selectedAnswer = answers[question.id];

    // ยังไม่ได้ตอบ
    if (selectedAnswer === undefined) {
      return;
    }

    // ตอบถูก ไม่เกิด misconception
    if (selectedAnswer === question.correctIndex) {
      return;
    }

    // ดึง misconception ที่ตรงกับตัวเลือกที่นักศึกษาเลือก
    const misconception = question.misconceptionMap?.[String(selectedAnswer)];

    if (misconception && !misconceptions.includes(misconception)) {
      misconceptions.push(misconception);
    }
  });

  return misconceptions;
}