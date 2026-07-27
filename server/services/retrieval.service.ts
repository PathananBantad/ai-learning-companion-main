import { state, Lesson } from "../data/lesson";

export interface RetrievalResult {
  source: string;
  content: string;
}

export async function retrieveContext(
  question: string,
  customLesson?: Lesson,
): Promise<RetrievalResult[]> {
  const lesson = customLesson || state.currentLesson;
  if (!lesson) return [];

  const contexts: RetrievalResult[] = [];

  // 1. ใส่หัวข้อบทเรียนหลักเป็นบริบทพื้นฐาน
  contexts.push({
    source: "หัวข้อบทเรียนหลัก",
    content: lesson.topic,
  });

  // 2. ใส่แนวคิดสำคัญทั้งหมดเข้าไปในคลังเพื่อเตรียมค้นหา
  if (lesson.keyConcepts) {
    lesson.keyConcepts.forEach((concept) => {
      contexts.push({
        source: `แนวคิด: ${concept.title}`,
        content: concept.description,
      });
    });
  }

  // 3. ใส่ข้อเข้าใจผิดที่พบบ่อยเข้าไปเตรียมค้นหา
  if (lesson.commonMisconceptions) {
    lesson.commonMisconceptions.forEach((item) => {
      contexts.push({
        source: `ความเข้าใจผิด: ${item.title}`,
        content: item.explanation,
      });
    });
  }

  // 4. ทำการจัดอันดับความเกี่ยวข้อง (Simple Keyword Overlap Ranking)
  const queryTerms = question
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 1);

  if (queryTerms.length === 0) {
    // หากคำถามสั้นเกินไป คืนค่าบริบทเริ่มต้น 4 ตัวแรก
    return contexts.slice(0, 4);
  }

  const scoredContexts = contexts.map((ctx) => {
    const combinedText = (ctx.source + " " + ctx.content).toLowerCase();
    let score = 0;

    queryTerms.forEach((term) => {
      if (combinedText.includes(term)) {
        score += 1;
      }
    });

    return { ctx, score };
  });

  // เรียงลำดับจากคะแนนความสอดคล้องมากที่สุดไปหาน้อยที่สุด
  scoredContexts.sort((a, b) => b.score - a.score);

  // ส่งข้อมูลเฉพาะบริบทที่สอดคล้องที่สุดกลับไปสูงสุด 4 ลำดับแรก
  return scoredContexts.map((item) => item.ctx).slice(0, 4);
}
