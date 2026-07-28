export interface ChatMessage {
  id: string;
  sender: "student" | "ai";
  text: string;
  timestamp: string;
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
