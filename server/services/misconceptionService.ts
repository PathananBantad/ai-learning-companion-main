// server/services/misconceptionService.ts
//
// Pure function: given the quiz questions (with their misconceptionMap, produced by
// quizService.ts at generation time) and the student's raw answers, figure out which
// misconceptions were actually triggered.

import { QuizQuestion } from '../data/lesson';

export function detectMisconceptions(
  quizQuestions: QuizQuestion[],
  answers: Record<string, number>
): string[] {
  const misconceptions: string[] = [];

  quizQuestions.forEach((question) => {
    const studentAnswer = answers[question.id];

    if (studentAnswer === undefined) return;
    if (studentAnswer === question.correctIndex) return;

    // การ์ด "หัวข้อที่ควรพัฒนา" อยากโชว์แค่ชื่อหัวข้อ ไม่โชว์จุดสับสนละเอียด
    // จึงเก็บแค่ conceptMatched (ชื่อหัวข้อ) พอ ไม่ต้อง fallback เป็นประโยคอธิบาย
    misconceptions.push(question.conceptMatched);
  });

  return Array.from(new Set(misconceptions));
}