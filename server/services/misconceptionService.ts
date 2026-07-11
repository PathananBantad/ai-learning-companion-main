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

    const mapped = question.misconceptionMap?.[String(studentAnswer)];

    if (mapped) {
      misconceptions.push(mapped);
    } else {
      misconceptions.push(
        `ยังไม่เข้าใจแนวคิดเรื่อง "${question.conceptMatched}" อย่างถ่องแท้`
      );
    }
  });

  return Array.from(new Set(misconceptions));
}