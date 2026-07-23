import { state } from "../data/lesson";
import { getGeminiClient, GEMINI_MODEL } from "../lib/gemini";
import { buildTutorPrompt } from "../prompts/tutorPrompt";
import { retrieveContext } from "./retrieval.service";
import { ChatMessage } from "../types/chat";
import { detectIntent } from "./intent.service";
import { detectMisconception } from "./misconceptionService";
import { saveConversationLog } from "./conversationLog.service";

export async function generateTutorResponse(
  messages: ChatMessage[],
  sessionId?: number | null,
) {
  const latestQuestion = messages[messages.length - 1]?.text ?? "";

  console.log("[CHAT] Question:", latestQuestion);

  // 1. Detect student intent
  const intent = detectIntent(latestQuestion);
  console.log("[CHAT] Intent:", intent);

  // 2. Retrieve relevant context
  const contexts = await retrieveContext(latestQuestion);
  console.log("[CHAT] Retrieved contexts:", contexts.length);

  // 3. Build conversation history
  const conversationHistory = messages
    .map((m) => `${(m.role ?? "user").toUpperCase()}: ${m.text}`)
    .join("\n");

  // 4. Build AI prompt
  const prompt = buildTutorPrompt(
    state.currentLesson,
    latestQuestion,
    contexts,
    conversationHistory,
    intent,
  );

  // 5. Get Gemini client
  const ai = getGeminiClient();

  if (!ai) {
    console.error("[CHAT] Gemini client is not configured");

    return {
      text: "Gemini client is not configured.",
    };
  }

  // 6. Generate AI response
  console.log("[CHAT] Calling Gemini...");

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
  });

  const aiText =
    response.text ?? "I am ready to help you with the lesson material.";

  console.log("[CHAT] Gemini response received");

  // 7. Detect misconception
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

  // 8. Save student message
  try {
    await saveConversationLog({
      sessionId,
      role: "user",
      message: latestQuestion,
      intent,
      misconceptionDetected: misconception?.detected ?? false,
      misconceptionConcept: misconception?.concept ?? null,
    });

    // 9. Save AI response
    await saveConversationLog({
      sessionId,
      role: "assistant",
      message: aiText,
    });

    console.log("[CONVERSATION LOG] Saved successfully");
  } catch (error) {
    // Log failure should not break AI chat
    console.error("[CONVERSATION LOG] Failed to save:", error);
  }

  return {
    text: aiText,
    misconception,
  };
}
