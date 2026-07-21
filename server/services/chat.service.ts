import { state } from "../data/lesson";
import { getGeminiClient, GEMINI_MODEL } from "../lib/gemini";
import { buildTutorPrompt } from "../prompts/tutorPrompt";
import { retrieveContext } from "./retrieval.service";
import { ChatMessage } from "../types/chat";
import { detectIntent } from "./intent.service";
import { detectMisconception } from "./misconceptionService";

export async function generateTutorResponse(messages: ChatMessage[]) {
  const latestQuestion = messages[messages.length - 1]?.text ?? "";

  console.log("[CHAT] Question:", latestQuestion);

  const intent = detectIntent(latestQuestion);
  console.log("[CHAT] Intent:", intent);

  const contexts = await retrieveContext(latestQuestion);
  console.log("[CHAT] Retrieved contexts:", contexts.length);

  const conversationHistory = messages
    .map((m) => `${(m.role ?? "user").toUpperCase()}: ${m.text}`)
    .join("\n");

  const prompt = buildTutorPrompt(
    state.currentLesson,
    latestQuestion,
    contexts,
    conversationHistory,
    intent,
  );

  const ai = getGeminiClient();

  if (!ai) {
    console.error("[CHAT] Gemini client is not configured");

    return {
      text: "Gemini client is not configured.",
    };
  }

  console.log("[CHAT] Calling Gemini...");

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
  });

  const aiText =
    response.text ?? "I am ready to help you with the lesson material.";

  console.log("[CHAT] Gemini response received");

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

  return {
    text: aiText,
    misconception,
  };
}
