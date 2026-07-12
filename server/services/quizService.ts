// server/services/quizService.ts
// Step 2 of the sequential pipeline: generate Quiz questions FROM the already-generated
// Lesson (not from the raw topic string). This is what makes the pipeline "sequential":
// quiz content is grounded in lesson.keyConcepts / lesson.commonMisconceptions.

import { getGeminiClient, GEMINI_MODEL } from '../lib/gemini';
import { Lesson, QuizQuestion } from '../data/lesson';

export async function generateQuizFromLesson(lesson: Lesson): Promise<QuizQuestion[]> {
  const ai = getGeminiClient();

  if (ai) {
    const conceptList = lesson.keyConcepts
      .map((c, i) => `${i + 1}. ${c.title}: ${c.description}`)
      .join('\n');

    const misconceptionList = lesson.commonMisconceptions
      .map((m, i) => `${i + 1}. ${m.title}: ${m.explanation}`)
      .join('\n');

    const generationPrompt = `
      You are a university quiz designer. Create a 4-question multiple choice quiz
      that tests ONLY the concepts below — do not introduce any topic that is not
      covered in this Key Concepts / Misconceptions list.

      IMPORTANT: Write ALL content (question, options, explanation, misconceptionMap, recommendationMap) in Thai language (ภาษาไทย). Keep JSON keys in English exactly as specified below.

      Lesson topic: "${lesson.topic}"
      Lesson summary: "${lesson.summary}"

      Key Concepts:
      ${conceptList}

      Common Misconceptions (use these to write plausible wrong answers):
      ${misconceptionList}

      For every wrong answer option, explain in "misconceptionMap" what mistaken belief
      picking that option reveals, and in "recommendationMap" what the student should
      review as a result. Use the option's index (as a string, e.g. "0") as the key.
      Do not include an entry for the correct option index.

      Respond STRICTLY with a valid JSON array matching this schema. No markdown, no extra text:
      [
        {
          "id": "q1",
          "question": "...",
          "options": ["...", "...", "...", "..."],
          "correctIndex": 0,
          "explanation": "Why the correct option is correct",
          "conceptMatched": "Must exactly match one of the Key Concept titles above",
          "misconceptionMap": { "1": "Explanation of the misconception behind option 1", "2": "..." },
          "recommendationMap": { "1": "What to review if option 1 was picked", "2": "..." }
        }
      ]
    `;

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: generationPrompt,
        config: { responseMimeType: 'application/json' }
      });

      const textResponse = response.text?.trim() || '';
      const cleanJSON = textResponse.replace(/^```json\s*/, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(cleanJSON);

      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as QuizQuestion[];
      }
    } catch (err) {
      console.error('Error generating quiz via Gemini:', err);
    }
  }

  // Fallback: derive a minimal quiz directly from the lesson's own concepts/misconceptions
  const fallbackConcept = lesson.keyConcepts[0]?.title || lesson.topic;
  const fallbackMisconception = lesson.commonMisconceptions[0];

  const questions: QuizQuestion[] = [
    {
      id: 'fallback-q1',
      question: `ข้อใดเกี่ยวข้องกับ "${fallbackConcept}" มากที่สุด?`,
      options: [
        lesson.keyConcepts[0]?.description || 'แนวคิดหลักจากบทเรียน',
        'แนวคิดที่ไม่เกี่ยวข้องกับบทเรียนนี้',
        'รายละเอียดปลีกย่อยที่ไม่สำคัญ',
        'ไม่มีข้อใดถูก'
      ],
      correctIndex: 0,
      explanation: `นี่คือแนวคิดหลักของ "${fallbackConcept}" ตามที่ปรากฏในบทเรียน`,
      conceptMatched: fallbackConcept,
      misconceptionMap: { '1': 'สับสนกับแนวคิดที่อยู่นอกเหนือขอบเขตของบทเรียนนี้' },
      recommendationMap: { '1': `ทบทวนหัวข้อ "${fallbackConcept}" ในสรุปบทเรียนอีกครั้ง` }
    }
  ];

  if (fallbackMisconception) {
    questions.push({
      id: 'fallback-q2',
      question: `ข้อความนี้ถูกต้องหรือไม่: "${fallbackMisconception.title}"`,
      options: ['ถูกต้อง', 'ไม่ถูกต้อง เป็นความเข้าใจผิดที่พบบ่อย', 'ไม่สามารถระบุได้', 'ไม่เกี่ยวข้อง'],
      correctIndex: 1,
      explanation: fallbackMisconception.explanation,
      conceptMatched: fallbackConcept,
      misconceptionMap: { '0': fallbackMisconception.explanation },
      recommendationMap: { '0': `กลับไปอ่านหัวข้อ "ความเข้าใจผิดที่พบบ่อย" เรื่อง "${fallbackMisconception.title}" อีกครั้ง` }
    });
  }

  return questions;
}