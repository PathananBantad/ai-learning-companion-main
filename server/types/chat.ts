export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}
export interface ChatResponse {
  text: string;
  misconception?: MisconceptionResult;
}

export interface MisconceptionResult {
  detected: boolean;
  concept?: string;
  explanation?: string;
  severity?: "low" | "medium" | "high";
}
