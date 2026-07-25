import OpenAI from 'openai';

// Central place to change the Qwen model version for the whole app
export const AI_MODEL = 'qwen3.8-max-preview';

let aiClient: OpenAI | null = null;

export function getAIClient(): OpenAI | null {
  if (!aiClient) {
    const key = process.env.AI_API_KEY;
    if (key && key !== 'MY_AI_API_KEY') {
      aiClient = new OpenAI({
        apiKey: key,
        baseURL: "https://token-plan.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1"

      });
    }
  }
  return aiClient;
}