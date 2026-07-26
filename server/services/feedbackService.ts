// server/services/feedbackService.ts

import { getAIClient, AI_MODEL } from '../lib/ai';
import { buildFeedbackPrompt } from '../prompts/feedbackPrompt';

export interface FeedbackResult {
  level: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  encouragement: string;
}

export async function generateFeedback(
    score: number,
    strengths: string[],
    weaknesses: string[],
    misconceptions: string[]
): Promise<FeedbackResult> {
  const ai = getAIClient();

  if (ai) {
    try {
      const prompt = buildFeedbackPrompt(score, strengths, weaknesses, misconceptions);


      const response = await ai.chat.completions.create({
        model: AI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });

      const text = response.choices[0].message?.content?.trim();
      if (!text) throw new Error('AI returned an empty response.');

      const cleanedText = text.replace(/^```json\s*/, '').replace(/```$/, '').trim();
      return JSON.parse(cleanedText) as FeedbackResult;
    } catch (error) {
      console.error('Feedback generation failed, falling back:', error);
    }
  }

  // Fallback (ไม่มี key หรือ AI call ล้มเหลว) — สอดคล้องกับ lessonService.ts / quizService.ts
  const level = score >= 90 ? 'ดีมาก' : score >= 70 ? 'ดี' : 'ควรปรับปรุง';
  return {
    level,
    summary: `คุณทำคะแนนได้ ${score}/100 คะแนน`,
    strengths: strengths.length > 0 ? strengths : ['ยังไม่มีข้อมูลจุดแข็งที่ชัดเจน'],
    weaknesses: weaknesses.length > 0 ? weaknesses : ['ยังไม่มีข้อมูลจุดที่ควรพัฒนา'],
    recommendations:
        misconceptions.length > 0
            ? misconceptions.map((m) => `ทบทวนเรื่อง: ${m}`)
            : ['ลองทบทวนเนื้อหาบทเรียนอีกครั้ง'],
    encouragement: 'สู้ ๆ นะครับ การเรียนรู้เป็นกระบวนการที่ต้องใช้เวลา'
  };
}