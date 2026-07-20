import { Router, Request, Response } from "express";
import { state } from "../data/lesson";
import { getGeminiClient } from "../lib/gemini";
import { buildTutorPrompt } from "../prompts/tutorPrompt";
import { retrieveContext } from "../services/retrieval.service";

const router = Router();

// AI Assistant Chat Route
router.post("/chat", async (req: Request, res: Response) => {
  const { messages, activeLessonContext } = req.body;
  if (!messages || messages.length === 0) {
    res.status(400).json({ error: "Missing chat messages" });
    return;
  }

  const latestUserMessage = messages[messages.length - 1].text;

  const ai = getGeminiClient();
  if (ai) {
    try {
      const contexts = await retrieveContext(latestUserMessage);

      const chatContext = buildTutorPrompt(
        state.currentLesson,
        latestUserMessage,
        contexts,
      );

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: chatContext,
      });

      res.json({
        text:
          response.text || "I am ready to help you with the lesson material.",
      });
      return;
    } catch (err) {
      console.error("Error generating AI chat response:", err);
      res.status(500).json({
        error:
          "Failed to connect to AI server. Simulating fallback offline tutoring response.",
      });
      return;
    }
  }

  // Falling back to offline interactive simulator responses
  let offlineResponse = "";
  const queryLower = latestUserMessage.toLowerCase();

  if (queryLower.includes("explain") || queryLower.includes("again")) {
    offlineResponse = `Let's break down one of our key concepts: **${state.currentLesson.keyConcepts[0]?.title}**. \n\n${state.currentLesson.keyConcepts[0]?.description} \n\nThink of it as a physical letter sent through the post office: the mail carrier doesn't remember your last letter; each envelope contains all information needed.`;
  } else if (queryLower.includes("example")) {
    offlineResponse = `Here is a real-world example of **${state.currentLesson.commonMisconceptions[0]?.title}**: \n\nSuppose you submit a form to log in with a password. If the URL is \`http://example.com\`, even if you send a POST request, any hacker on the same Wi-Fi can capture your password in plain text. Only **HTTPS** encrypts it during transit!`;
  } else if (
    queryLower.includes("summarize") ||
    queryLower.includes("summary")
  ) {
    offlineResponse = `Sure, here is the summary of **${state.currentLesson.topic}**: \n\n${state.currentLesson.summary}`;
  } else if (queryLower.includes("quiz") || queryLower.includes("test")) {
    offlineResponse = `Let's do a quick check! \n\n**Question**: If you send a GET request three times to retrieve a profile page, does the server state change?\n\n*Type your answer below! (Hint: Is GET safe?)*`;
  } else {
    offlineResponse = `That is an excellent academic inquiry regarding **${state.currentLesson.topic}**! \n\nTo better master this: \n1. Study the **learning outcomes** shown on your student dashboard.\n2. Review the **common misconceptions** like *${state.currentLesson.commonMisconceptions[0]?.title}*.\n3. Take our interactive **Practice Quiz** on the Quiz screen!`;
  }

  res.json({
    text:
      offlineResponse +
      "\n\n*(Simulated response. To activate live Gemini intelligence, please add your GEMINI_API_KEY inside the Secrets panel.)*",
  });
});

export default router;
