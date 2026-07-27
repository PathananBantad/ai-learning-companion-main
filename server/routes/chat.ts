import { Router, Request, Response } from "express";
import { state } from "../data/lesson";
import { getAIClient, AI_MODEL } from "../lib/ai";
import { ChatMessage } from "../types/chat";
import { retrieveContext } from "../services/retrieval.service"; // ดึงข้อมูล RAG เข้ามาใช้งานจริง

const router = Router();

router.post("/chat", async (req: Request, res: Response) => {
  const {
    messages,
    sessionId,
  }: {
    messages: ChatMessage[];
    sessionId?: number | null;
  } = req.body;

  if (!messages || messages.length === 0) {
    return res.status(400).json({
      error: "Missing chat messages",
    });
  }

  const latestUserMessage = messages[messages.length - 1]?.text ?? "";

  const ai = getAIClient();
  if (!ai) {
    return res.status(500).json({
      error: "AI client not available. Please configure API keys.",
    });
  }

  try {
    // 1. ดึงบริบทที่เกี่ยวข้องมากที่สุดจากฐานความรู้ของบทเรียนผ่านระบบ RAG
    const retrievedSources = await retrieveContext(latestUserMessage);
    const ragContextBlock =
      retrievedSources.length > 0
        ? retrievedSources
            .map((s) => `[แหล่งอ้างอิง: ${s.source}]\nเนื้อหา: ${s.content}`)
            .join("\n\n")
        : "ไม่มีแหล่งข้อมูลวิชาการเพิ่มเติมที่ตรงกับคำถามโดยตรง";

    // 2. ออกแบบ System Prompt ให้มีความเฉพาะเจาะจง อิงตามเนื้อหา RAG ที่ดึงขึ้นมาได้
    const chatContext = `
      คุณคือผู้ช่วยการเรียนรู้อัจฉริยะประจำเป็นสถาบัน (AI Learning Companion) ที่มีความรอบรู้ สุภาพ และมีจิตวิทยาในการสอนที่ดีเยี่ยม
      ขณะนี้คุณกำลังสนทนาและดูแลนักศึกษาในเรื่องบทเรียนหัวข้อหลัก: "${state.currentLesson?.topic || "เนื้อหาเรียนรู้ประจำบทเรียน"}"

      --- ข้อมูลอ้างอิงจากบทเรียนที่สอดคล้องที่สุด (RAG Context) ---
      กรุณาใช้และอ้างอิงข้อมูลด้านล่างนี้ในการตอบคำถามของนักศึกษาเพื่อให้มีความถูกต้องตามหลักสูตรวิชาการสูงสุด:
      ${ragContextBlock}
      ---------------------------------------------------------

      คำถามล่าสุดของนักศึกษาคือ: "${latestUserMessage}"

      ข้อกำหนดในการตอบสนอง (Strict Guidelines):
      1. ตอบเป็นภาษาไทย ด้วยโทนเสียงที่สุภาพ อบอุ่น เป็นมิตร และสนับสนุนการเรียนรู้
      2. หากวิเคราะห์ข้อมูลใน RAG Context แล้วพบว่านักศึกษากำลังเข้าใจคลาดเคลื่อน ให้ใช้คำอธิบายที่นุ่มนวลและชี้นำให้เกิดความเข้าใจใหม่ที่ถูกต้อง
      3. พยายามแตกประเด็นให้เข้าใจง่าย มีการเปรียบเทียบ (Analogy) หรือแสดงตัวอย่างโค้ดสั้นๆ (ถ้าเหมาะสมกับประเด็น)
      4. จัดรูปแบบคำตอบให้มีความโปร่งตา สะอาด สะดวกแก่การศึกษา
      5. หากนักศึกษาแสดงความเข้าใจครบถ้วน หรือแสดงความสนใจ คุณสามารถตั้งคำถามสั้นๆ ท้ายคำตอบเพื่อช่วยกระตุ้นการคิดวิเคราะห์เพิ่มเติมได้
    `;

    // 3. ส่งเนื้อหาให้ AI ประมวลผลคำตอบกลับมา
    const response = await ai.chat.completions.create({
      model: AI_MODEL,
      messages: [{ role: "user", content: chatContext }],
    });

    res.json({
      text:
        response.choices[0].message.content ||
        "ยินดีให้คำปรึกษาเกี่ยวกับบทเรียนเพิ่มเติมครับ",
    });
    return;
  } catch (err) {
    console.error("Error generating AI chat response with RAG:", err);
    res.status(500).json({
      error:
        "Failed to connect to AI server. Please make sure GEMINI_API_KEY is correctly set.",
    });
    return;
  }
});

export default router;
