import { Router, Request, Response } from "express";
import { state } from "../data/lesson";
import { getGeminiClient } from "../lib/gemini";
import { supabase } from "../lib/supabase";
import { saveQuizResult, getQuizResults } from "../services/quizResultService";
import { GEMINI_MODEL } from "../lib/gemini";
import { generateFeedback } from "../services/feedbackService";
import { detectQuizMisconceptions } from "../services/misconceptionService";
import { generateRecommendations } from "../services/recommendationService";

const router = Router();

// Get current lesson content
router.get("/lesson", (req: Request, res: Response) => {
  res.json({
    lesson: state.currentLesson,
    questions: state.quizQuestions,
  });
});

// Generate Knowledge Base using AI or update lesson topic manually
router.post("/lesson/update", async (req: Request, res: Response) => {
  const { topic, uploadedFiles, manualPrompt } = req.body;

  const targetTopic = topic || "Modern Web Engineering";
  const activeFiles = uploadedFiles || [];

  const ai = getGeminiClient();
  if (ai) {
    try {
      const generationPrompt = `
        You are a world-class university syllabus and curriculum designer.
        Create a comprehensive, highly educational Knowledge Base and lesson plan for the topic: "${targetTopic}".
        ${manualPrompt ? `Additional instructor guidelines: "${manualPrompt}"` : ""}

        For EVERY quiz question, you MUST also include "misconceptionMap" and "recommendationMap".
        - The keys are the index (as a string) of each WRONG option — i.e. every index except correctIndex.
        - Each value in "misconceptionMap" must describe the SPECIFIC wrong belief a student would hold if they picked that exact wrong option. Do not write a generic statement like "does not understand the concept" — describe what the student likely believes instead. Write in Thai.
        - Each value in "recommendationMap" must give a specific, actionable review tip tied to that specific wrong option. Write in Thai.
        - Do not reuse the same misconception or recommendation text across different wrong options in the same question — each wrong option represents a distinct misunderstanding.

        Respond STRICTLY with a valid JSON object matching this schema. Do not output markdown backticks like \`\`\`json or any text other than the raw JSON object itself:
        {
          "topic": "Cleaned up topic name",
          "learningOutcomes": ["Outcome 1", "Outcome 2", "Outcome 3", "Outcome 4"],
          "keyConcepts": [
            { "title": "Concept 1 Title", "description": "Highly accurate 2-sentence description of the concept" },
            { "title": "Concept 2 Title", "description": "Highly accurate 2-sentence description of the concept" },
            { "title": "Concept 3 Title", "description": "Highly accurate 2-sentence description of the concept" }
          ],
          "commonMisconceptions": [
            { "title": "Misconception 1 Title", "explanation": "Detailed explanation correcting the misconception" },
            { "title": "Misconception 2 Title", "explanation": "Detailed explanation correcting the misconception" }
          ],
          "summary": "A warm, high-level educational summary of this topic for university students (3 sentences).",
          "quizQuestions": [
            {
              "id": "q1",
              "question": "A multiple choice question testing Concept 1",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correctIndex": 0,
              "explanation": "Clear educational explanation of why Option A is correct",
              "conceptMatched": "Concept 1 Title",
              "misconceptionMap": {
                "1": "The specific wrong belief a student holds if they pick Option B (in Thai)",
                "2": "The specific wrong belief a student holds if they pick Option C (in Thai)",
                "3": "The specific wrong belief a student holds if they pick Option D (in Thai)"
              },
              "recommendationMap": {
                "1": "What to review if the student picked Option B (in Thai)",
                "2": "What to review if the student picked Option C (in Thai)",
                "3": "What to review if the student picked Option D (in Thai)"
              }
            },
            {
              "id": "q2",
              "question": "A multiple choice question testing Concept 2",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correctIndex": 1,
              "explanation": "Clear educational explanation of why Option B is correct",
              "conceptMatched": "Concept 2 Title",
              "misconceptionMap": {
                "0": "The specific wrong belief a student holds if they pick Option A (in Thai)",
                "2": "The specific wrong belief a student holds if they pick Option C (in Thai)",
                "3": "The specific wrong belief a student holds if they pick Option D (in Thai)"
              },
              "recommendationMap": {
                "0": "What to review if the student picked Option A (in Thai)",
                "2": "What to review if the student picked Option C (in Thai)",
                "3": "What to review if the student picked Option D (in Thai)"
              }
            },
            {
              "id": "q3",
              "question": "A multiple choice question testing Concept 3",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correctIndex": 2,
              "explanation": "Clear educational explanation of why Option C is correct",
              "conceptMatched": "Concept 3 Title",
              "misconceptionMap": {
                "0": "The specific wrong belief a student holds if they pick Option A (in Thai)",
                "1": "The specific wrong belief a student holds if they pick Option B (in Thai)",
                "3": "The specific wrong belief a student holds if they pick Option D (in Thai)"
              },
              "recommendationMap": {
                "0": "What to review if the student picked Option A (in Thai)",
                "1": "What to review if the student picked Option B (in Thai)",
                "3": "What to review if the student picked Option D (in Thai)"
              }
            },
            {
              "id": "q4",
              "question": "A multiple choice question testing security or a misconception",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correctIndex": 3,
              "explanation": "Clear educational explanation correcting the misconception",
              "conceptMatched": "Concept 1 Title",
              "misconceptionMap": {
                "0": "The specific wrong belief a student holds if they pick Option A (in Thai)",
                "1": "The specific wrong belief a student holds if they pick Option B (in Thai)",
                "2": "The specific wrong belief a student holds if they pick Option C (in Thai)"
              },
              "recommendationMap": {
                "0": "What to review if the student picked Option A (in Thai)",
                "1": "What to review if the student picked Option B (in Thai)",
                "2": "What to review if the student picked Option C (in Thai)"
              }
            }
          ]
        }
      `;

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: generationPrompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const textResponse = response.text?.trim() || "";
      // Clean markdown wrapper just in case the model ignored standard directives
      const cleanJSON = textResponse
        .replace(/^```json\s*/, "")
        .replace(/```$/, "")
        .trim();
      const parsed = JSON.parse(cleanJSON);

      // Update the current global states
      state.currentLesson = {
        id: "lesson-" + Date.now(),
        topic: parsed.topic || targetTopic,
        learningOutcomes: parsed.learningOutcomes || [],
        keyConcepts: parsed.keyConcepts || [],
        commonMisconceptions: parsed.commonMisconceptions || [],
        knowledgeBaseStatus: "ready",
        uploadedFiles:
          activeFiles.length > 0 ? activeFiles : ["manually_configured.txt"],
        summary: parsed.summary || "Summary generated successfully.",
      };

      state.quizQuestions = parsed.quizQuestions || [];

      // Persist the generated lesson to Supabase so it survives server restarts
      const { data: lessonData, error: lessonInsertError } = await supabase
        .from("lessons")
        .insert({
          topic: state.currentLesson.topic,
          learning_outcomes: JSON.stringify(
            state.currentLesson.learningOutcomes,
          ),
          key_concepts: JSON.stringify(state.currentLesson.keyConcepts),
          misconceptions: JSON.stringify(
            state.currentLesson.commonMisconceptions,
          ),
        })
        .select();

      console.log("Lesson insert result:", lessonData);

      if (lessonInsertError) {
        console.error("Lesson insert error:", lessonInsertError);
      }

      // Reset class diagnostics to fit the new topic
      state.simulatedSubmissionsCount = 0;
      state.simulatedAnalytics = {
        averageScore: 0,
        outcomeAchievement: state.currentLesson.learningOutcomes.map(
          (outcome: string) => ({
            name:
              outcome.length > 30 ? outcome.substring(0, 30) + "..." : outcome,
            score: 0,
          }),
        ),
        mostIncorrectTopic: state.currentLesson.keyConcepts[0]?.title || "None",
        mostAskedQuestions: [
          {
            question: `Can you explain ${state.currentLesson.keyConcepts[0]?.title || "Topic"}?`,
            count: 0,
          },
        ],
        commonMisconceptions: state.currentLesson.commonMisconceptions.map(
          (mis: any) => ({
            topic: mis.title,
            count: 0,
            description: mis.explanation,
          }),
        ),
        studentSubmissionsCount: 0,
        weeklyTrend: [
          { day: "Mon", averageScore: 0, activeStudents: 0 },
          { day: "Tue", averageScore: 0, activeStudents: 0 },
          { day: "Wed", averageScore: 0, activeStudents: 0 },
          { day: "Thu", averageScore: 0, activeStudents: 0 },
          { day: "Fri", averageScore: 0, activeStudents: 0 },
        ],
        aiInsight:
          "A brand new knowledge base was generated. Encourage students to participate in the mock quiz to populate analytical insights.",
      };

      res.json({
        success: true,
        lesson: state.currentLesson,
        questions: state.quizQuestions,
      });
      return;
    } catch (err) {
      console.error("Error generating lesson via Gemini:", err);
      // Let it fall through to the manual fallback below instead of crashing
    }
  }

  // Fallback manual lesson update if no API key is set
  state.currentLesson = {
    id: "lesson-" + Date.now(),
    topic: targetTopic,
    learningOutcomes: [
      `Identify main concepts related to ${targetTopic}.`,
      `Apply theoretical frameworks of ${targetTopic} to academic scenarios.`,
      `Debug and improve design architectures of ${targetTopic}.`,
    ],
    keyConcepts: [
      {
        title: `${targetTopic} core frameworks`,
        description: `Fundamental paradigms defining how ${targetTopic} operates in modern environments.`,
      },
      {
        title: `${targetTopic} lifecycle`,
        description: `Understanding states, pipelines, and transitions inside a simulated ${targetTopic} process.`,
      },
    ],
    commonMisconceptions: [
      {
        title: `Over-complicating ${targetTopic}`,
        explanation: `Many practitioners believe ${targetTopic} requires complex enterprise setups, whereas standard minimal strategies work best.`,
      },
    ],
    knowledgeBaseStatus: "ready",
    uploadedFiles: activeFiles.length > 0 ? activeFiles : ["fallback_data.txt"],
    summary: `You have successfully set up a fallback curriculum for ${targetTopic}. Add a real GEMINI_API_KEY to experience fully customized academic syllabus generations.`,
  };

  state.quizQuestions = [
    {
      id: "fallback-q1",
      question: `Which of the following is the most critical pillar when studying ${targetTopic}?`,
      options: [
        "Unstructured experimentation",
        "Rigorous theoretical foundations",
        "Ignoring safety constraints",
        "Continuous redeployment",
      ],
      correctIndex: 1,
      explanation:
        "A strong academic understanding demands prioritizing robust foundations and systematic testing.",
      conceptMatched: `${targetTopic} core frameworks`,
    },
    {
      id: "fallback-q2",
      question: `What is a common pitfall when integrating ${targetTopic}?`,
      options: [
        "Reading documentation beforehand",
        "Deploying minimal styled elements",
        "Over-complicating configuration settings",
        "Collaborating with peers",
      ],
      correctIndex: 2,
      explanation:
        "Over-complicating setups introduces tech debt and increases cognitive load, making the framework harder to maintain.",
      conceptMatched: `Over-complicating ${targetTopic}`,
    },
  ];

  // Persist the fallback lesson to Supabase too, so it survives server restarts
  const { data: fallbackLessonData, error: fallbackLessonInsertError } =
    await supabase
      .from("lessons")
      .insert({
        topic: state.currentLesson.topic,
        learning_outcomes: JSON.stringify(state.currentLesson.learningOutcomes),
        key_concepts: JSON.stringify(state.currentLesson.keyConcepts),
        misconceptions: JSON.stringify(
          state.currentLesson.commonMisconceptions,
        ),
      })
      .select();

  console.log("Fallback lesson insert result:", fallbackLessonData);

  if (fallbackLessonInsertError) {
    console.error("Fallback lesson insert error:", fallbackLessonInsertError);
  }

  state.simulatedSubmissionsCount = 0;
  state.simulatedAnalytics = {
    averageScore: 0,
    outcomeAchievement: state.currentLesson.learningOutcomes.map(
      (o: string) => ({ name: o.substring(0, 30), score: 0 }),
    ),
    mostIncorrectTopic: "Over-complicating " + targetTopic,
    mostAskedQuestions: [
      { question: `What is the core of ${targetTopic}?`, count: 0 },
    ],
    commonMisconceptions: [
      {
        topic: `Over-complicating ${targetTopic}`,
        count: 0,
        description: "Assuming it requires a heavy setup.",
      },
    ],
    studentSubmissionsCount: 0,
    weeklyTrend: [
      { day: "Mon", averageScore: 0, activeStudents: 0 },
      { day: "Tue", averageScore: 0, activeStudents: 0 },
      { day: "Wed", averageScore: 0, activeStudents: 0 },
      { day: "Thu", averageScore: 0, activeStudents: 0 },
      { day: "Fri", averageScore: 0, activeStudents: 0 },
    ],
    aiInsight:
      "Knowledge Base loaded in offline mode. Setup GEMINI_API_KEY inside the Secrets panel to activate live university syllabus generation!",
  };

  res.json({
    success: true,
    lesson: state.currentLesson,
    questions: state.quizQuestions,
    simulated: true,
  });
});

// Submit student quiz answers
router.post("/quiz/submit", async (req: Request, res: Response) => {
  const { answers, name, studentId, classCode } = req.body;

  if (!name) {
    return res.status(400).json({
      error: "Name is required",
    });
  }

  if (!studentId) {
    return res.status(400).json({
      error: "Student ID is required",
    });
  }

  if (!answers) {
    res.status(400).json({ error: "Missing answers" });
    return;
  }

  let correctCount = 0;
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  state.quizQuestions.forEach((q) => {
    const studentAnswer = answers[q.id];
    const isCorrect = studentAnswer === q.correctIndex;

    if (isCorrect) {
      correctCount++;
      if (!strengths.includes(q.conceptMatched)) {
        strengths.push(q.conceptMatched);
      }
    } else {
      if (!weaknesses.includes(q.conceptMatched)) {
        weaknesses.push(q.conceptMatched);
      }
    }
  });

  const score = Math.round((correctCount / state.quizQuestions.length) * 100);

  // เรียกใช้ service ของ AI#2 แทน logic hardcode เดิม
  const misconceptionsTriggered = detectQuizMisconceptions(
    state.quizQuestions,
    answers,
  );
  const recommendations = generateRecommendations(
    state.quizQuestions,
    answers,
    score,
  );

  // Generate personalized AI feedback (ต้องอยู่หลัง misconceptionsTriggered เพราะใช้ค่านี้)
  const aiFeedback = await generateFeedback(
    score,
    strengths,
    weaknesses,
    misconceptionsTriggered,
  );

  // Keep active simulated analytics updated with the new result
  state.simulatedSubmissionsCount++;
  state.simulatedAnalytics.studentSubmissionsCount =
    state.simulatedSubmissionsCount;
  // update rolling average
  state.simulatedAnalytics.averageScore = Math.round(
    (state.simulatedAnalytics.averageScore * 10 + score) / 11,
  );

  // Dynamically insert active student's performance record for the instructor to review
  const dynamicStudent = {
    id: "STU-ACTIVE",
    name: "Active Student (You)",
    quizScore: score,
    learningProgress: Math.min(100, Math.round(score * 1.15)),
    learningOutcomeAchievement: [
      { name: "Core HTTP Verbs & CRUD", score: score >= 75 ? 100 : 75 },
      { name: "Stateless HTTP & Sessions", score: score >= 50 ? 80 : 50 },
      {
        name: "Idempotency Concepts",
        score: score >= 100 ? 100 : score >= 75 ? 75 : 40,
      },
      { name: "Web Security (POST/HTTPS)", score: score >= 75 ? 90 : 60 },
    ],
    strengths: strengths.length > 0 ? strengths : ["General Web Basics"],
    weaknesses: weaknesses.length > 0 ? weaknesses : ["None"],
    commonMisconceptions:
      misconceptionsTriggered.length > 0 ? misconceptionsTriggered : ["None"],
    aiFeedbackSummary:
      score >= 85
        ? "Superb retention of Web architecture models. Confidently distinguishes HTTP methods, caching headers, and idempotency guarantees."
        : "Understands core CRUD operations but shows minor gaps in HTTPS secure handshakes and stateful session caching. Recommend reviewing RFC specs.",
    recommendedTopics:
      recommendations.length > 0
        ? recommendations
        : ["Advanced GraphQL paradigms"],
    lastActivity: "Completed diagnostic quiz just now",
  };

  if (!state.simulatedAnalytics.students) {
    state.simulatedAnalytics.students = [];
  }
  // Remove previous active student mock record to avoid duplicate rows
  state.simulatedAnalytics.students = state.simulatedAnalytics.students.filter(
    (s: any) => s.id !== "STU-ACTIVE",
  );
  state.simulatedAnalytics.students.unshift(dynamicStudent);

  const attemptResult = {
    answers,
    score,
    strengths: strengths.length > 0 ? strengths : ["General Web Basics"],
    weaknesses: weaknesses.length > 0 ? weaknesses : [],
    misconceptionsTriggered,
    recommendations,
    aiFeedback,
  };

  try {
    console.log("Before saveQuizResult");

    const saved = await saveQuizResult({
      name,
      studentId,
      classCode,
      score,
      totalQuestions: state.quizQuestions.length,
      aiFeedback,
      misconceptionsTriggered,
    });
    console.log("Saved successfully:");
    console.log(saved);
  } catch (err) {
    console.error("Save quiz result failed:");
    console.error(err);
  }
  res.json(attemptResult);
});

router.get("/quiz-results", async (_req, res) => {
  try {
    const results = await getQuizResults();

    res.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (err: any) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});
export default router;
