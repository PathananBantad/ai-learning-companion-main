
import { Router, Request, Response } from 'express';
import { state } from '../data/lesson';
import { getAIClient , AI_MODEL } from '../lib/ai';
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

    
  const latestUserMessage = messages[messages.length - 1]?.text ?? "";

  const ai = getAIClient();
  if (!ai) {
    return res.status(500).json({
      error: "AI client not available",
    });
  }
    try {
      const chatContext = `
        You are a highly helpful, patient, and knowledgeable university AI Learning Companion.
        You are tutoring a student regarding this current weekly lesson:
        - Lesson Topic: "${state.currentLesson.topic}"
        - Key Concepts: ${JSON.stringify(state.currentLesson.keyConcepts)}
        - Common Misconceptions: ${JSON.stringify(state.currentLesson.commonMisconceptions)}

        Student is asking: "${latestUserMessage}"

        Use clear, academic but approachable language. Break down complex things into bite-sized analogies.
        Strictly keep responses clean, structured, and informative. If they ask to be quizzed, give them a simple sample question.
      `;

      const response = await ai.chat.completions.create({
        model: AI_MODEL,
        messages: [{ role: 'user', content: chatContext }]
      });

      res.json({
        text: response.choices[0].message.content || 'I am ready to help you with the lesson material.'
      });
      return;
    } catch (err) {
      console.error('Error generating AI chat response:', err);
      res.status(500).json({ error: 'Failed to connect to AI server. Simulating fallback offline tutoring response.' });
      return;
    }
  }
);

export default router;
