import { state } from "../data/lesson";
import { buildTutorPrompt } from "../prompts/tutorPrompt";
import { retrieveContext } from "./retrieval.service";
import { ChatMessage } from "../types/chat";
import { detectIntent } from "./intent.service";
import { detectMisconception } from "./misconceptionService";
import { saveConversationLog } from "./conversationLog.service";
import { getAIClient, AI_MODEL } from "../lib/ai";


export async function generateTutorResponse(
  messages: ChatMessage[],
  sessionId?: number | null,
) {
  const latestQuestion = messages[messages.length - 1]?.text ?? "";

  console.log("[CHAT] Question:", latestQuestion);

  // 1. Detect student intent
  const intent = detectIntent(latestQuestion);
  console.log("[CHAT] Intent:", intent);

  // 2. Retrieve relevant context
  const contexts = await retrieveContext(latestQuestion);
  console.log("[CHAT] Retrieved contexts:", contexts.length);

  // 3. Build conversation history
  const conversationHistory = messages
    .map((m) => `${(m.role ?? "user").toUpperCase()}: ${m.text}`)
    .join("\n");

  // 4. Build AI prompt
  const prompt = buildTutorPrompt(
    state.currentLesson,
    latestQuestion,
    contexts,
    conversationHistory,
    intent,
  );


  const ai = getAIClient();

  if (!ai) {
    console.error("[CHAT] AI client is not configured");

    return {
      text: "AI client is not configured.",
    };
  }

  // 6. Generate AI response
  console.log("[CHAT] Calling AI...");

  const response = await ai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      {
        role: "system",
        content: `
คุณคือ AI Tutor สำหรับช่วยนักเรียนเรียนบทเรียน

หน้าที่ของคุณ
- ตอบเป็นภาษาไทยเสมอ
- อธิบายเข้าใจง่าย เหมาะสำหรับนักศึกษา
- ใช้ข้อมูลจากบทเรียนและข้อมูลที่ Retrieve มาเป็นหลัก
- หากข้อมูลไม่มีในบทเรียน ให้บอกตรง ๆ ว่าไม่มีข้อมูล แทนการเดา
- หากนักเรียนเข้าใจผิด ให้ช่วยอธิบายใหม่อย่างสุภาพ พร้อมยกตัวอย่าง
- ใช้น้ำเสียงเป็นมิตร สนับสนุนการเรียนรู้
- ตอบเป็นข้อความธรรมดา ไม่ต้องใช้ Markdown
      `,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const aiText =
    response.choices[0]?.message?.content ??
    "พร้อมช่วยอธิบายบทเรียนให้คุณเสมอ";

  console.log("[CHAT] AI response received");

  // 7. Detect misconception
  let misconception = null;

  if (intent === "explain" || intent === "general") {
    try {
      console.log("[MISCONCEPTION] Starting detection...");

      misconception = await detectMisconception(
        latestQuestion,
        state.currentLesson,
      );

      console.log("[MISCONCEPTION] Result:", misconception);
    } catch (error) {
      console.error("[MISCONCEPTION] Detection failed:", error);
    }
  }

  // 8. Save student message
  try {
    await saveConversationLog({
      sessionId,
      role: "assistant",
      message: aiText,
    });

    // 9. Save AI response
    await saveConversationLog({
      sessionId,
      role: "assistant",
      message: aiText,
    });

    console.log("[CONVERSATION LOG] Saved successfully");
  } catch (error) {
    // Log failure should not break AI chat
    console.error("[CONVERSATION LOG] Failed to save:", error);
  }

  return {
    text: aiText,
    misconception,
  };
}
