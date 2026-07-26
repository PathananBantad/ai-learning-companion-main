import OpenAI from 'openai';

// Central place to change the OpenAI model used across the whole app.
// (Previously pointed at Qwen via Alibaba Cloud's OpenAI-compatible endpoint;
// now uses the real OpenAI API.)
export const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini';

let aiClient: OpenAI | null = null;

export function getAIClient(): OpenAI | null {
  if (!aiClient) {
    const key = process.env.AI_API_KEY;
    if (key && key !== 'MY_AI_API_KEY') {
      // No baseURL override -> defaults to https://api.openai.com/v1
      aiClient = new OpenAI({
        apiKey: key,
      });
    }
  }
  return aiClient;
}