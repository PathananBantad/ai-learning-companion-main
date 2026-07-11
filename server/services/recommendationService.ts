// server/services/recommendationService.ts

import { QuizQuestion } from '../data/lesson';

export function generateRecommendations(
  quizQuestions: QuizQuestion[],
  answers: Record<string, number>,
  score: number
): string[] {
  const recommendations: string[] = [];

  quizQuestions.forEach((question) => {
    const studentAnswer = answers[question.id];

    if (studentAnswer === undefined) return;
    if (studentAnswer === question.correctIndex) return;

    const mapped = question.recommendationMap?.[String(studentAnswer)];

    if (mapped) {
      recommendations.push(mapped);
    } else {
      recommendations.push(`กลับไปทบทวนหัวข้อ "${question.conceptMatched}" อีกครั้ง`);
    }
  });

  const deduped = Array.from(new Set(recommendations));

  if (score === 100) {
    deduped.push('คุณตอบถูกทุกข้อ! ลองช่วยอธิบายเนื้อหานี้ให้เพื่อนในห้องฟังดูก็ได้');
  } else if (deduped.length === 0) {
    deduped.push('ลองใช้ AI Tutor ถามคำถามเพิ่มเติมเกี่ยวกับเนื้อหาที่ยังไม่แน่ใจ');
  }

  return deduped;
}