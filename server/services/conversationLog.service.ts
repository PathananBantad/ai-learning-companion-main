import { supabaseAdmin } from "../lib/supabase";

interface SaveConversationLogParams {
  sessionId?: number | null;
  role: "user" | "assistant";
  message: string;
  intent?: string | null;
  misconceptionDetected?: boolean;
  misconceptionConcept?: string | null;
}

export async function saveConversationLog({
  sessionId = null,
  role,
  message,
  intent = null,
  misconceptionDetected = false,
  misconceptionConcept = null,
}: SaveConversationLogParams) {
  const { data, error } = await supabaseAdmin
    .from("conversation_logs")
    .insert({
      session_id: sessionId,
      role,
      message,
      intent,
      misconception_detected: misconceptionDetected,
      misconception_concept: misconceptionConcept,
    })
    .select()
    .single();

  if (error) {
    console.error("[CONVERSATION LOG] Failed to save:", error);
    throw error;
  }

  console.log("[CONVERSATION LOG] Saved:", data.id);

  return data;
}
