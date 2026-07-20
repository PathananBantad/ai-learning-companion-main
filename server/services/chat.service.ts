import { state } from "../data/lesson";
import { getGeminiClient, GEMINI_MODEL } from "../lib/gemini";
import { buildTutorPrompt } from "../prompts/tutorPrompt";
import { retrieveContext } from "./retrieval.service";
import { ChatMessage } from "../types/chat";

export async function generateTutorResponse(messages: ChatMessage[]) {
  const latestQuestion = messages[messages.length - 1].text;

  const contexts = await retrieveContext(latestQuestion);

  const conversationHistory = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.text}`)
    .join("\n");

  const prompt = buildTutorPrompt(
    state.currentLesson,
    latestQuestion,
    contexts,
    conversationHistory,
  );

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
