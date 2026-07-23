import { Router, Request, Response } from "express";
import { generateTutorResponse } from "../services/chat.service";
import { ChatMessage } from "../types/chat";

const router = Router();

router.post("/chat", async (req: Request, res: Response) => {
  const {
    messages,
    sessionId,
  }: {
    messages: ChatMessage[];
    sessionId?: number | null;
  } = req.body;

  if (!messages || messages.length === 0) {
    return res.status(400).json({
      error: "Missing chat messages",
    });
  }

  try {
    const result = await generateTutorResponse(messages, sessionId);

    return res.json(result);
  } catch (err) {
    console.error("[CHAT ROUTE ERROR]", err);

    return res.status(500).json({
      error: "Failed to connect to AI server.",
    });
  }
});

export default router;
