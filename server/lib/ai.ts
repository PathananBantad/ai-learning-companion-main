import OpenAI from 'openai';

// Central place to change the OpenAI model used across the whole app.
// Pointed at Qwen via Alibaba Cloud's OpenAI-compatible endpoint
export const AI_MODEL = process.env.AI_MODEL || 'qwen3.8-max-preview';

let aiClient: OpenAI | null = null;

export function getAIClient(): OpenAI | null {
  if (!aiClient) {
    const key = process.env.Qwen_API_KEY || process.env.QWEN_API_KEY;
    if (key && key !== 'MY_AI_API_KEY') {
      aiClient = new OpenAI({
        apiKey: key,
        baseURL: 'https://token-plan.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1',
      });
    }
  }
  return aiClient;
}