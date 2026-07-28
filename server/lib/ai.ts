import OpenAI from "openai";

// ============================================================
// AI Provider Abstraction Layer
// ลำดับความสำคัญ: ลอง Gemini ก่อนเสมอ ถ้า error (เช่นโควตาหมด/คีย์ผิด)
// จะ fallback ไปใช้ Qwen โดยอัตโนมัติแบบ real-time โดยไม่ต้อง restart server
// ============================================================

const GEMINI_MODEL = "gemini-3.5-flash";
const QWEN_MODEL = process.env.AI_MODEL || "qwen3.8-max-preview";

function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return !!key && key !== "MY_GEMINI_API_KEY";
}

function isQwenConfigured(): boolean {
  const key = process.env.Qwen_API_KEY || process.env.QWEN_API_KEY;
  return !!key && key !== "MY_AI_API_KEY";
}

/** true ถ้ามีอย่างน้อยหนึ่ง provider (Gemini หรือ Qwen) ที่พร้อมใช้งาน */
export function isAIAvailable(): boolean {
  return isGeminiConfigured() || isQwenConfigured();
}

let geminiClient: OpenAI | null = null;
let qwenClient: OpenAI | null = null;

function getGeminiClient(): OpenAI | null {
  if (!isGeminiConfigured()) return null;
  if (!geminiClient) {
    console.log("Initializing AI client with Google Gemini API Key...");
    geminiClient = new OpenAI({
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    });
  }
  return geminiClient;
}

function getQwenClient(): OpenAI | null {
  if (!isQwenConfigured()) return null;
  if (!qwenClient) {
    console.log("Initializing AI client with Alibaba Qwen API Key...");
    const qwenKey = process.env.Qwen_API_KEY || process.env.QWEN_API_KEY;
    qwenClient = new OpenAI({
      apiKey: qwenKey,
      baseURL:
          "https://token-plan.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1",
    });
  }
  return qwenClient;
}

type ChatCompletionParams = Omit<
    OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming,
    "model"
>;

/**
 * เรียก chat completion แบบมี fallback อัตโนมัติ:
 * 1. ถ้ามี Gemini key -> ลอง Gemini ก่อนเสมอ
 * 2. ถ้า Gemini error (โควตาหมด/ล่ม/คีย์ผิด) -> fallback ไป Qwen ทันที (ถ้ามี key)
 * 3. ถ้าไม่มี Gemini key ตั้งแต่แรก -> ใช้ Qwen ตรง ๆ
 * 4. ถ้าไม่มี provider ไหนพร้อมใช้งานเลย -> throw error ให้ผู้เรียกไป fallback แบบ offline เอง
 */
export async function getChatCompletion(
    params: ChatCompletionParams,
): Promise<OpenAI.Chat.Completions.ChatCompletion> {
  const gemini = getGeminiClient();

  if (gemini) {
    try {
      return await gemini.chat.completions.create({
        model: GEMINI_MODEL,
        ...params,
      });
    } catch (err: any) {
      console.warn(
          "[AI] Gemini call failed, falling back to Qwen:",
          err?.message || err,
      );
    }
  }

  const qwen = getQwenClient();
  if (qwen) {
    return await qwen.chat.completions.create({
      model: QWEN_MODEL,
      ...params,
    });
  }

  throw new Error(
      "No AI provider available: GEMINI_API_KEY is missing/invalid or failed, and no valid QWEN_API_KEY fallback is configured.",
  );
}

// ============================================================
// Legacy exports — เก็บไว้เผื่อมีโค้ดเก่าที่ยังเรียกใช้ตรง ๆ
// ไม่แนะนำให้ใช้ในไฟล์ใหม่ ให้ใช้ getChatCompletion() + isAIAvailable() แทน
// ============================================================

/** @deprecated ใช้ getChatCompletion() แทน เพราะรองรับ fallback อัตโนมัติ */
export function getAIClient(): OpenAI | null {
  return getGeminiClient() || getQwenClient();
}

/** @deprecated model ที่ getChatCompletion() เลือกใช้จริงอาจต่างจากนี้ตอน fallback */
export const AI_MODEL = isGeminiConfigured() ? GEMINI_MODEL : QWEN_MODEL;