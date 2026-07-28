import OpenAI from "openai";

// ตั้งค่าโมเดลหลัก โดยเลือกใช้ Gemini เป็นตัวเลือกแรกใน AI Studio และใช้ Qwen เป็นตัวสำรอง
const geminiKey = process.env.GEMINI_API_KEY;
const isGeminiConfigured = !!geminiKey && geminiKey !== "MY_GEMINI_API_KEY";

export const AI_MODEL = isGeminiConfigured
    ? "gemini-3.5-flash"
    : process.env.AI_MODEL || "qwen3.8-max-preview";

let aiClient: OpenAI | null = null;

export function getAIClient(): OpenAI | null {
  if (!aiClient) {
    const qwenKey = process.env.Qwen_API_KEY || process.env.QWEN_API_KEY;

    if (isGeminiConfigured) {
      console.log("Initializing AI client with Google Gemini API Key...");
      aiClient = new OpenAI({
        apiKey: geminiKey,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      });
    } else if (qwenKey && qwenKey !== "MY_AI_API_KEY") {
      console.log("Initializing AI client with Alibaba Qwen API Key...");
      aiClient = new OpenAI({
        apiKey: qwenKey,
        baseURL:
            "https://token-plan.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1",
      });
    } else {
      console.warn(
          "No active API Key found in environment variables (neither GEMINI_API_KEY nor QWEN_API_KEY).",
      );
    }
  }
  return aiClient;
}

// server/lib/ai.ts — เพิ่มฟังก์ชัน callWithFallback
export async function chatWithFallback(params: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const qwenKey = process.env.Qwen_API_KEY || process.env.QWEN_API_KEY;

  if (geminiKey && geminiKey !== "MY_GEMINI_API_KEY") {
    try {
      const gemini = new OpenAI({
        apiKey: geminiKey,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      });
      return await gemini.chat.completions.create({ ...params, model: "gemini-3.5-flash" });
    } catch (err) {
      console.warn("Gemini failed (likely quota), falling back to Qwen:", err);
      // ตกลงมาลอง Qwen ต่อ
    }
  }

  if (qwenKey && qwenKey !== "MY_AI_API_KEY") {
    const qwen = new OpenAI({
      apiKey: qwenKey,
      baseURL: "https://token-plan.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1",
    });
    return await qwen.chat.completions.create({ ...params, model: process.env.AI_MODEL || "qwen3.8-max-preview" });
  }

  throw new Error("No active AI provider configured");
}