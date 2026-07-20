import { state } from "../data/lesson";
import { getGeminiClient, GEMINI_MODEL } from "../lib/gemini";
import { buildTutorPrompt } from "../prompts/tutorPrompt";
import { retrieveContext } from "./retrieval.service";

export async function generateTutorResponse(question: string) {
  const contexts = await retrieveContext(question);

  const prompt = buildTutorPrompt(state.currentLesson, question, contexts);

  const ai = getGeminiClient();

  if (!ai) {
    return {
      text: "Gemini client is not configured.",
    };
  }

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
  });

  return {
    text: response.text ?? "I am ready to help you with the lesson material.",
  };
}
