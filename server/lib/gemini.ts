import { GoogleGenAI } from '@google/genai';

// Central place to change the Gemini model version for the whole app
export const GEMINI_MODEL = 'gemini-3.1-flash-lite';

let geminiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY') {
      geminiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' }
        }
      });
    }
  }
  return geminiClient;
}