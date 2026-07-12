// server/services/lessonService.ts
// Step 1 of the sequential pipeline: generate the Lesson (Knowledge Base) only.
// Quiz generation happens afterwards in quizService.ts, using this Lesson as input.

import { getGeminiClient, GEMINI_MODEL } from '../lib/gemini';
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
You are an experienced university professor, instructional designer, and curriculum expert.

Generate a complete university-level lesson.

Topic:
"${targetTopic}"

${manualPrompt ? `Instructor Notes:\n${manualPrompt}` : ""}

${activeFiles.length > 0
        ? `Reference Files:\n${activeFiles.join("\n")}`
        : ""}

Requirements:

1. Follow Bloom's Taxonomy.
2. Learning outcomes must use measurable action verbs.
3. Explain concepts from beginner → intermediate → advanced.
4. Keep explanations technically correct.
5. Do not introduce concepts outside the topic.
6. Include common misconceptions and explain why students misunderstand them.
7. Write concise but educational summaries.

Return ONLY valid JSON.

Schema:

{
  "topic": "...",
  "learningOutcomes":[
    "...",
    "...",
    "...",
    "..."
  ],
  "keyConcepts":[
    {
      "title":"...",
      "description":"..."
    }
  ],
  "commonMisconceptions":[
    {
      "title":"...",
      "explanation":"..."
    }
  ],
  "summary":"..."
}
`;

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: generationPrompt,
        config:{
          responseMimeType:'application/json',
          temperature:0.5,
          topP:0.9,
          topK:40
        }
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