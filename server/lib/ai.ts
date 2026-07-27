import OpenAI from "openai";

// ตั้งค่าโมเดลหลัก โดยเลือกใช้ Gemini เป็นตัวเลือกแรกใน AI Studio และใช้ Qwen เป็นตัวสำรอง
export const AI_MODEL = process.env.GEMINI_API_KEY
  ? "gemini-2.5-flash"
  : process.env.AI_MODEL || "qwen3.8-max-preview";

let aiClient: OpenAI | null = null;

export function getAIClient(): OpenAI | null {
  if (!aiClient) {
    const geminiKey = process.env.GEMINI_API_KEY;
    const qwenKey = process.env.Qwen_API_KEY || process.env.QWEN_API_KEY;

    if (geminiKey && geminiKey !== "MY_GEMINI_API_KEY") {
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
