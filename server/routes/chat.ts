import { Router, Request, Response } from "express";
import { generateTutorResponse } from "../services/chat.service";

const router = Router();

router.post("/chat", async (req: Request, res: Response) => {
  const { messages } = req.body;

  if (!messages || messages.length === 0) {
    return res.status(400).json({
      error: "Missing chat messages",
    });
  }

  const latestUserMessage = messages[messages.length - 1].text;

  try {
    const result = await generateTutorResponse(latestUserMessage);
    return res.json(result);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Failed to connect to AI server.",
    });
  }
});

export default router;
