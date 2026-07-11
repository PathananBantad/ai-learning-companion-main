// server/services/lessonService.ts
// Step 1 of the sequential pipeline: generate the Lesson (Knowledge Base) only.
// Quiz generation happens afterwards in quizService.ts, using this Lesson as input.

import { getGeminiClient } from '../lib/gemini';
import { Lesson } from '../data/lesson';

interface GenerateLessonParams {
  topic?: string;
  uploadedFiles?: string[];
  manualPrompt?: string;
}

export async function generateLesson({
  topic,
  uploadedFiles,
  manualPrompt
}: GenerateLessonParams): Promise<Lesson> {
  const targetTopic = topic || 'Modern Web Engineering';
  const activeFiles = uploadedFiles || [];

  const ai = getGeminiClient();

  if (ai) {
    const generationPrompt = `
      You are a world-class university syllabus and curriculum designer.
      Create a comprehensive, highly educational Knowledge Base for the topic: "${targetTopic}".
      ${manualPrompt ? `Additional instructor guidelines: "${manualPrompt}"` : ''}

      IMPORTANT: Write ALL content (topic, learningOutcomes, keyConcepts, commonMisconceptions, summary) in Thai language (ภาษาไทย). Keep JSON keys in English exactly as specified below.

      Respond STRICTLY with a valid JSON object matching this schema. Do not output markdown backticks or any text other than the raw JSON object itself:
      {
        "topic": "Cleaned up topic name",
        "learningOutcomes": ["Outcome 1", "Outcome 2", "Outcome 3", "Outcome 4"],
        "keyConcepts": [
          { "title": "Concept 1 Title", "description": "Highly accurate 2-sentence description of the concept" },
          { "title": "Concept 2 Title", "description": "Highly accurate 2-sentence description of the concept" },
          { "title": "Concept 3 Title", "description": "Highly accurate 2-sentence description of the concept" }
        ],
        "commonMisconceptions": [
          { "title": "Misconception 1 Title", "explanation": "Detailed explanation correcting the misconception" },
          { "title": "Misconception 2 Title", "explanation": "Detailed explanation correcting the misconception" }
        ],
        "summary": "A warm, high-level educational summary of this topic for university students (3 sentences)."
      }
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: generationPrompt,
        config: { responseMimeType: 'application/json' }
      });

      const textResponse = response.text?.trim() || '';
      const cleanJSON = textResponse.replace(/^```json\s*/, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(cleanJSON);

      return {
        id: 'lesson-' + Date.now(),
        topic: parsed.topic || targetTopic,
        learningOutcomes: parsed.learningOutcomes || [],
        keyConcepts: parsed.keyConcepts || [],
        commonMisconceptions: parsed.commonMisconceptions || [],
        knowledgeBaseStatus: 'ready',
        uploadedFiles: activeFiles.length > 0 ? activeFiles : ['manually_configured.txt'],
        summary: parsed.summary || 'สร้างสรุปเนื้อหาสำเร็จแล้ว'
      };
    } catch (err) {
      console.error('Error generating lesson via Gemini:', err);
      // fall through to offline fallback below
    }
  }

  // Fallback (no API key, or Gemini call failed)
  return {
    id: 'lesson-' + Date.now(),
    topic: targetTopic,
    learningOutcomes: [
      `ระบุแนวคิดหลักที่เกี่ยวข้องกับ ${targetTopic}`,
      `นำกรอบทฤษฎีของ ${targetTopic} ไปประยุกต์ใช้ในสถานการณ์จริง`,
      `วิเคราะห์และปรับปรุงการออกแบบของ ${targetTopic}`
    ],
    keyConcepts: [
      { title: `แนวคิดหลักของ ${targetTopic}`, description: `หลักการพื้นฐานที่กำหนดว่า ${targetTopic} ทำงานอย่างไรในสภาพแวดล้อมปัจจุบัน` },
      { title: `วงจรของ ${targetTopic}`, description: `ความเข้าใจเกี่ยวกับสถานะและขั้นตอนต่าง ๆ ของ ${targetTopic}` }
    ],
    commonMisconceptions: [
      { title: `ความเข้าใจผิดเรื่อง ${targetTopic}`, explanation: `หลายคนเข้าใจว่า ${targetTopic} ต้องใช้การตั้งค่าที่ซับซ้อน แต่จริง ๆ แล้ววิธีที่เรียบง่ายก็ใช้งานได้ดี` }
    ],
    knowledgeBaseStatus: 'ready',
    uploadedFiles: activeFiles.length > 0 ? activeFiles : ['fallback_data.txt'],
    summary: `ตั้งค่าบทเรียนสำรองสำหรับ ${targetTopic} เรียบร้อยแล้ว กรุณาเพิ่ม GEMINI_API_KEY เพื่อใช้งานการสร้างเนื้อหาแบบเต็มรูปแบบ`
  };
}