import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Active Class Code state (defaults to AEGIS101)
let activeClassCode = 'AEGIS101';

// Pre-populated default data to keep the app immediately immersive
let currentLesson = {
  id: 'lesson-101',
  topic: 'Introduction to Web Protocols: HTTP & REST',
  learningOutcomes: [
    'Understand the core differences between GET, POST, PUT, and DELETE methods.',
    'Analyze the stateless nature of HTTP and how cookies/sessions maintain state.',
    'Explain the fundamental constraints of RESTful API design.',
    'Identify and differentiate common HTTP status codes (2xx, 3xx, 4xx, 5xx).'
  ],
  keyConcepts: [
    {
      title: 'Stateless HTTP Protocol',
      description: 'HTTP is fundamentally a stateless protocol. Every single request sent from a client to a server is treated as completely independent, with no inherent memory of prior interactions.'
    },
    {
      title: 'REST Architecture & CRUD',
      description: 'Representational State Transfer (REST) is an architectural style mapping HTTP methods directly to CRUD (Create, Read, Update, Delete) database operations: GET for Read, POST for Create, PUT for Update, and DELETE for Delete.'
    },
    {
      title: 'Idempotency',
      description: 'An idempotent operation produces the exact same result no matter how many times it is executed. GET, PUT, and DELETE are designed to be idempotent, whereas POST is not.'
    }
  ],
  commonMisconceptions: [
    {
      title: 'POST is Inherently Secure',
      explanation: 'Many students believe POST is automatically secure because it hides parameters from the URL. However, POST payload is sent in plain text in the HTTP body, and can be intercepted just as easily as GET unless encrypted using HTTPS/TLS.'
    },
    {
      title: 'Stateless Protocol Means No State Allowed',
      explanation: 'Statelessness applies strictly to the communication protocol itself. State management is accomplished at the application layer via persistent databases, cookies, or JSON Web Tokens (JWT).'
    }
  ],
  knowledgeBaseStatus: 'ready' as 'idle' | 'uploading' | 'ready',
  uploadedFiles: ['web_protocols_syllabus.pdf'],
  summary: 'This lesson covers the cornerstone of web communication: the Hypertext Transfer Protocol (HTTP) and the REST architectural pattern. You will master standard request-response life-cycles, idempotency, and state workarounds, preparing you to design and debug modern cloud APIs.'
};

let quizQuestions = [
  {
    id: 'q1',
    question: 'Which of the following HTTP methods is designed to be safe and idempotent, primarily used to retrieve resources without changing the server state?',
    options: ['POST', 'GET', 'PUT', 'DELETE'],
    correctIndex: 1,
    explanation: 'GET is designed to be a safe, read-only method. Since it should not modify any server data, executing it multiple times leaves the system in the same state (idempotent).',
    conceptMatched: 'REST Architecture & CRUD'
  },
  {
    id: 'q2',
    question: 'Why does POST not guarantee real transit security compared to GET, even though parameters do not appear in the URL?',
    options: [
      'POST data is restricted to small sizes.',
      'POST request body is still sent in plain text unless encrypted with HTTPS.',
      'POST requests are automatically cached by browsers.',
      'POST data is always hashed on the client side.'
    ],
    correctIndex: 1,
    explanation: 'Hiding parameters from the browser URL bar prevents them from appearing in browser history, but the actual payload travels in plain text in the HTTP request body. Full encryption via HTTPS is required for secure transit.',
    conceptMatched: 'POST is Inherently Secure'
  },
  {
    id: 'q3',
    question: 'What does it mean for an HTTP method to be "idempotent"?',
    options: [
      'It executes twice as fast on modern servers.',
      'Making multiple identical requests has the same effect as making a single request.',
      'It cannot be intercepted by proxies.',
      'The response is guaranteed to remain 200 OK.'
    ],
    correctIndex: 1,
    explanation: 'An HTTP method is idempotent if the side effects of making multiple identical requests are identical to the side effect of a single request. PUT and DELETE are idempotent; POST is not.',
    conceptMatched: 'Idempotency'
  },
  {
    id: 'q4',
    question: 'How do modern web applications manage user sessions if HTTP itself is completely stateless?',
    options: [
      'By forcing the client to reconnect every 5 seconds.',
      'By utilizing application-layer solutions like HTTP cookies, session IDs, and JWTs.',
      'By locking the IP address of the student at the router level.',
      'By storing state in the CSS styles.'
    ],
    correctIndex: 1,
    explanation: 'Because HTTP is stateless, developers bypass this restriction by passing unique tokens or identifiers (JWTs, session IDs in cookies) with each independent HTTP request to authenticate who the sender is.',
    conceptMatched: 'Stateless Protocol Means No State Allowed'
  }
];

let simulatedSubmissionsCount = 28;
let simulatedSubmissions = [
  { score: 75, answers: { q1: 1, q2: 1, q3: 0, q4: 1 } },
  { score: 100, answers: { q1: 1, q2: 1, q3: 1, q4: 1 } },
  { score: 50, answers: { q1: 0, q2: 1, q3: 0, q4: 1 } },
  { score: 75, answers: { q1: 1, q2: 1, q3: 1, q4: 0 } },
  { score: 75, answers: { q1: 1, q2: 1, q3: 0, q4: 1 } },
];

let simulatedAnalytics: any = {
  averageScore: 82,
  outcomeAchievement: [
    { name: 'Core HTTP Verbs & CRUD', score: 89 },
    { name: 'Stateless HTTP & Sessions', score: 85 },
    { name: 'Idempotency Concepts', score: 68 },
    { name: 'Web Security (POST/HTTPS)', score: 78 }
  ],
  mostIncorrectTopic: 'Idempotency Concepts',
  mostAskedQuestions: [
    { question: 'What is the exact definition of an idempotent method?', count: 14 },
    { question: 'Is PUT idempotent if the server state changes?', count: 9 },
    { question: 'Can GET request have a body?', count: 6 }
  ],
  commonMisconceptions: [
    { topic: 'POST is secure by default', count: 18, description: 'Students sending text passwords inside a raw POST body without HTTPS encryption.' },
    { topic: 'Idempotency vs Safety', count: 12, description: 'Confusing a safe read-only method (GET) with a non-safe idempotent method (PUT).' }
  ],
  studentSubmissionsCount: simulatedSubmissionsCount,
  weeklyTrend: [
    { day: 'Mon', averageScore: 78, activeStudents: 12 },
    { day: 'Tue', averageScore: 81, activeStudents: 19 },
    { day: 'Wed', averageScore: 84, activeStudents: 25 },
    { day: 'Thu', averageScore: 82, activeStudents: 28 },
    { day: 'Fri', averageScore: 85, activeStudents: 15 }
  ],
  aiInsight: '72% of students still misunderstand GET vs POST security. The majority mistakenly believe that hiding query parameters makes the data completely private. Recommend dedicating 5 minutes in your next lecture to demonstrate intercepting a raw HTTP POST payload using browser DevTools or a proxy.',
  students: [
    {
      id: "STU-8921",
      name: "Sarah Jenkins",
      quizScore: 95,
      learningProgress: 90,
      learningOutcomeAchievement: [
        { name: "Core HTTP Verbs & CRUD", score: 100 },
        { name: "Stateless HTTP & Sessions", score: 95 },
        { name: "Idempotency Concepts", score: 90 },
        { name: "Web Security (POST/HTTPS)", score: 95 }
      ],
      strengths: ["HTTP Verbs", "Stateless Session Management"],
      weaknesses: ["None"],
      commonMisconceptions: ["None"],
      aiFeedbackSummary: "Demonstrated exemplary mastery across all domains. Fully understands REST design constraints and idempotency guarantees.",
      recommendedTopics: ["Advanced GraphQL federated architectures"],
      lastActivity: "Completed diagnostic quiz on 07/03 08:12"
    },
    {
      id: "STU-4412",
      name: "Alex Mercer",
      quizScore: 75,
      learningProgress: 70,
      learningOutcomeAchievement: [
        { name: "Core HTTP Verbs & CRUD", score: 90 },
        { name: "Stateless HTTP & Sessions", score: 80 },
        { name: "Idempotency Concepts", score: 50 },
        { name: "Web Security (POST/HTTPS)", score: 80 }
      ],
      strengths: ["REST verbs", "Status codes"],
      weaknesses: ["Idempotency semantics of PUT/POST"],
      commonMisconceptions: ["Assumed POST is safe & idempotent"],
      aiFeedbackSummary: "Excellent overall foundation but struggles with idempotency constraints. Needs to clarify why repeating a POST payload can duplicate database resources.",
      recommendedTopics: ["Idempotent operations vs Safe operations"],
      lastActivity: "Engaged with AI Tutor on Idempotency on 07/03 07:45"
    },
    {
      id: "STU-3109",
      name: "Elena Rostova",
      quizScore: 85,
      learningProgress: 82,
      learningOutcomeAchievement: [
        { name: "Core HTTP Verbs & CRUD", score: 95 },
        { name: "Stateless HTTP & Sessions", score: 85 },
        { name: "Idempotency Concepts", score: 80 },
        { name: "Web Security (POST/HTTPS)", score: 80 }
      ],
      strengths: ["CRUD implementation", "Idempotency"],
      weaknesses: ["JWT statelessness"],
      commonMisconceptions: ["Believes session state must reside on the DB"],
      aiFeedbackSummary: "Solid comprehension of REST constraints. Slight misunderstanding of stateless scaling implications using JWT vs stateful session cookies.",
      recommendedTopics: ["Stateless authentication with JWT", "Token invalidation strategies"],
      lastActivity: "Submitted Quiz 1 on 07/02 16:30"
    },
    {
      id: "STU-7201",
      name: "Marcus Vance",
      quizScore: 60,
      learningProgress: 55,
      learningOutcomeAchievement: [
        { name: "Core HTTP Verbs & CRUD", score: 70 },
        { name: "Stateless HTTP & Sessions", score: 60 },
        { name: "Idempotency Concepts", score: 50 },
        { name: "Web Security (POST/HTTPS)", score: 60 }
      ],
      strengths: ["Basic GET/POST routing"],
      weaknesses: ["Stateless HTTP architecture", "Idempotency of PUT vs PATCH"],
      commonMisconceptions: ["Equates HTTP POST with database encryption by default"],
      aiFeedbackSummary: "Requires review of core stateless paradigms. Struggled with secure transmission concepts and confused raw payload payloads with transport-layer security.",
      recommendedTopics: ["Statelessness vs state persistence", "TLS/HTTPS transport layers"],
      lastActivity: "Completed practice flashcards on 07/02 11:20"
    },
    {
      id: "STU-1102",
      name: "Chloe Zhao",
      quizScore: 90,
      learningProgress: 88,
      learningOutcomeAchievement: [
        { name: "Core HTTP Verbs & CRUD", score: 100 },
        { name: "Stateless HTTP & Sessions", score: 90 },
        { name: "Idempotency Concepts", score: 80 },
        { name: "Web Security (POST/HTTPS)", score: 90 }
      ],
      strengths: ["Web Security", "HTTP Verbs and Responses"],
      weaknesses: ["Edge cases in PUT vs PATCH"],
      commonMisconceptions: ["None"],
      aiFeedbackSummary: "Exceptional grasp of network fundamentals and security patterns. Minor confusion on standard idempotency profiles for PATCH verbs.",
      recommendedTopics: ["RFC 5789 PATCH specifications"],
      lastActivity: "Submitted diagnostic quiz on 07/03 08:29"
    },
    {
      id: "STU-5541",
      name: "Devon Lane",
      quizScore: 45,
      learningProgress: 40,
      learningOutcomeAchievement: [
        { name: "Core HTTP Verbs & CRUD", score: 60 },
        { name: "Stateless HTTP & Sessions", score: 40 },
        { name: "Idempotency Concepts", score: 30 },
        { name: "Web Security (POST/HTTPS)", score: 50 }
      ],
      strengths: ["Basic CRUD ideas"],
      weaknesses: ["Sessions and cookie security", "Idempotency definitions", "POST vs PUT"],
      commonMisconceptions: ["Believes POST is secure by default", "Confused PUT with safe reads"],
      aiFeedbackSummary: "Struggling with standard HTTP web-model definitions. Triggered multiple major misconceptions on basic POST routing and encryption rules. Needs targeted instructor counseling.",
      recommendedTopics: ["Intro to Web Architecture", "HTTP methods and their safety guarantees"],
      lastActivity: "Attempted quiz 2 times on 07/01 14:02"
    }
  ]
};

// Lazy initialization of Gemini client to prevent crashing if GEMINI_API_KEY is missing on startup
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY') {
      geminiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }
  }
  return geminiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Endpoints

  // Get active class code
  app.get('/api/class/code', (req: Request, res: Response) => {
    res.json({ activeClassCode });
  });

  // Generate or set a custom class code
  app.post('/api/class/generate', (req: Request, res: Response) => {
    const { customCode } = req.body;
    if (customCode && customCode.trim()) {
      activeClassCode = customCode.trim().toUpperCase();
    } else {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      activeClassCode = `AEG-${result}`;
    }
    res.json({ activeClassCode });
  });

  // Verify entered class code from student join screen
  app.post('/api/class/verify', (req: Request, res: Response) => {
    const { code } = req.body;
    if (!code) {
      res.status(400).json({ error: 'Code is required' });
      return;
    }
    const isCorrect = code.trim().toUpperCase() === activeClassCode.toUpperCase();
    res.json({ success: isCorrect, activeClassCode });
  });

  // Get current lesson content
  app.get('/api/lesson', (req: Request, res: Response) => {
    res.json({
      lesson: currentLesson,
      questions: quizQuestions
    });
  });

  // Get teacher analytics
  app.get('/api/analytics', async (req: Request, res: Response) => {
    const refresh = req.query.refresh === 'true';
    const ai = getGeminiClient();
    
    // Only query Gemini if a manual refresh was requested or we don't have an insight yet
    if (ai && (refresh || !simulatedAnalytics.aiInsight)) {
      try {
        const prompt = `
          You are an AI Learning Companion instructor assistant.
          Analyze these current class statistics:
          - Average score: ${simulatedAnalytics.averageScore}%
          - Topic achievement scores: ${JSON.stringify(simulatedAnalytics.outcomeAchievement)}
          - Common misconceptions recorded: ${JSON.stringify(simulatedAnalytics.commonMisconceptions)}
          - Most incorrect topic: ${simulatedAnalytics.mostIncorrectTopic}

          Generate a highly specific, brief, professional teaching recommendation (max 3 sentences) for the instructor's dashboard.
          Highlight what the students struggle with and give an actionable intervention they can use in the next lecture.
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
        });

        if (response.text) {
          simulatedAnalytics.aiInsight = response.text.trim();
        }
      } catch (err: any) {
        console.error('Error generating AI analytics insights:', err.message || err);
        // Fallback or persist previous recommendation
      }
    }
    res.json(simulatedAnalytics);
  });

  // Generate individual student AI Insight
  app.post('/api/student-insight', async (req: Request, res: Response) => {
    const { student } = req.body;
    if (!student) {
      res.status(400).json({ error: 'Missing student data' });
      return;
    }

    const ai = getGeminiClient();
    if (ai) {
      try {
        const prompt = `
          You are an expert AI Education Co-pilot.
          Analyze this student's learning profile and generate a highly personalized diagnostic insight report.
          
          Student Profile:
          - Name: ${student.name}
          - ID: ${student.id}
          - Quiz Score: ${student.quizScore}%
          - Course Progress: ${student.learningProgress}%
          - Strengths: ${JSON.stringify(student.strengths)}
          - Weaknesses: ${JSON.stringify(student.weaknesses)}
          - Common Misconceptions: ${JSON.stringify(student.commonMisconceptions)}
          - Historical Achievements: ${JSON.stringify(student.learningOutcomeAchievement)}

          Generate an insightful JSON report summarizing:
          1. "understandingLevel": (e.g. Master, Proficient, Developing, or Needs Support - with 1-2 sentences of explanation)
          2. "misconceptions": (List 1-2 specific conceptual mistakes they make, or explain they are clear)
          3. "strengths": (List 1-2 learning strengths with brief explanations)
          4. "weaknesses": (List 1-2 learning weaknesses with brief explanations)
          5. "recommendations": (List 2 actionable personalized learning tips)
          6. "nextActivities": (List 2 suggested concrete next learning activities to improve)

          Respond ONLY with a valid JSON object matching the keys above. Do not output any markdown code blocks (such as \`\`\`json) or external text.
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        if (response.text) {
          const cleanJSON = response.text.trim().replace(/^```json\s*/, '').replace(/```$/, '').trim();
          const parsed = JSON.parse(cleanJSON);
          res.json(parsed);
          return;
        }
      } catch (err: any) {
        console.error('Error generating student AI insight with Gemini:', err.message || err);
      }
    }

    // High fidelity fallback matching the precise keys, customized based on the student's actual metrics
    const score = student.quizScore;
    let understandingLevel = 'Developing understanding. Demonstrates basic familiarity with key concepts but requires structured practice on edge cases.';
    if (score >= 90) {
      understandingLevel = 'Advanced Mastery. Demonstrates exceptional depth of comprehension in web routing, HTTP protocols, and security structures.';
    } else if (score >= 75) {
      understandingLevel = 'Proficient. Shows robust understanding of mainstream concepts with minor inconsistencies in technical edge cases.';
    } else if (score < 60) {
      understandingLevel = 'Needs Targeted Support. Requires systematic instruction on fundamental REST architecture and request/response life cycles.';
    }

    const fallbacks = {
      understandingLevel,
      misconceptions: student.commonMisconceptions && student.commonMisconceptions[0] !== 'None' 
        ? student.commonMisconceptions 
        : (score >= 85 ? ['None identified'] : ['Assuming hidden parameters are cryptographically secure by default']),
      strengths: student.strengths && student.strengths[0] !== 'None' 
        ? student.strengths.map((s: string) => `${s} - High score on corresponding questions.`)
        : ['Basic request lifecycle flow'],
      weaknesses: student.weaknesses && student.weaknesses[0] !== 'None'
        ? student.weaknesses.map((w: string) => `${w} - Showing slight hesitation on relevant questions.`)
        : (score >= 90 ? ['No major weaknesses identified'] : ['Technical definitions of PUT vs POST safety and idempotency']),
      recommendations: score >= 90 
        ? ['Review RFC 7231 standards for future architectural designs.', 'Examine enterprise OAuth scopes and session management systems.']
        : ['Use the interactive sandbox to practice making GET and POST requests.', 'Verify resource state changes for PUT and PATCH requests.'],
      nextActivities: score >= 90
        ? ['Assist peers on the class discussion board.', 'Implement a lightweight backend router matching REST parameters.']
        : ['Complete the HTTP Verbs practice card deck.', 'Ask the AI tutor: "Give me an example of PUT vs POST idempotency".']
    };

    res.json(fallbacks);
  });

  // Submit student quiz answers
  app.post('/api/quiz/submit', (req: Request, res: Response) => {
    const { answers } = req.body;
    if (!answers) {
       res.status(400).json({ error: 'Missing answers' });
       return;
    }

    let correctCount = 0;
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const misconceptionsTriggered: string[] = [];
    const recommendations: string[] = [];

    quizQuestions.forEach((q) => {
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
        if (q.id === 'q2' && studentAnswer === 0) {
          misconceptionsTriggered.push('Hiding query params equals encryption');
          recommendations.push('Review how HTTPS/TLS TLS handshake actually secures raw HTTP body streams.');
        }
        if (q.id === 'q3') {
          misconceptionsTriggered.push('Confusing safe operations with idempotent operations');
          recommendations.push('Recall that an action is idempotent if repeating it yields the same server state, even if it alters it once (like PUT).');
        }
      }
    });

    const score = Math.round((correctCount / quizQuestions.length) * 100);

    // Provide default feedback/recommendations
    if (score === 100) {
      recommendations.push('Excellent job! You have fully mastered this lesson. Try to assist peers on the course discussion board.');
    } else {
      recommendations.push('Use the AI chat assistant to ask for "Give me an example" regarding your incorrect concepts.');
    }

    // Keep active simulated analytics updated with the new result
    simulatedSubmissionsCount++;
    simulatedAnalytics.studentSubmissionsCount = simulatedSubmissionsCount;
    // update rolling average
    simulatedAnalytics.averageScore = Math.round(
      ((simulatedAnalytics.averageScore * 10) + score) / 11
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
        { name: "Idempotency Concepts", score: score >= 100 ? 100 : (score >= 75 ? 75 : 40) },
        { name: "Web Security (POST/HTTPS)", score: score >= 75 ? 90 : 60 }
      ],
      strengths: strengths.length > 0 ? strengths : ["General Web Basics"],
      weaknesses: weaknesses.length > 0 ? weaknesses : ["None"],
      commonMisconceptions: misconceptionsTriggered.length > 0 ? misconceptionsTriggered : ["None"],
      aiFeedbackSummary: score >= 85 
        ? "Superb retention of Web architecture models. Confidently distinguishes HTTP methods, caching headers, and idempotency guarantees." 
        : "Understands core CRUD operations but shows minor gaps in HTTPS secure handshakes and stateful session caching. Recommend reviewing RFC specs.",
      recommendedTopics: recommendations.length > 0 ? recommendations : ["Advanced GraphQL paradigms"],
      lastActivity: "Completed diagnostic quiz just now"
    };

    if (!simulatedAnalytics.students) {
      simulatedAnalytics.students = [];
    }
    // Remove previous active student mock record to avoid duplicate rows
    simulatedAnalytics.students = simulatedAnalytics.students.filter((s: any) => s.id !== "STU-ACTIVE");
    simulatedAnalytics.students.unshift(dynamicStudent);

    const attemptResult = {
      answers,
      score,
      strengths: strengths.length > 0 ? strengths : ['General Web Basics'],
      weaknesses: weaknesses.length > 0 ? weaknesses : [],
      misconceptionsTriggered,
      recommendations
    };

    res.json(attemptResult);
  });

  // Generate Knowledge Base using AI or update lesson topic manually
  app.post('/api/lesson/update', async (req: Request, res: Response) => {
    const { topic, uploadedFiles, manualPrompt } = req.body;

    const targetTopic = topic || 'Modern Web Engineering';
    const activeFiles = uploadedFiles || [];

    const ai = getGeminiClient();
    if (ai) {
      try {
        const generationPrompt = `
          You are a world-class university syllabus and curriculum designer.
          Create a comprehensive, highly educational Knowledge Base and lesson plan for the topic: "${targetTopic}".
          ${manualPrompt ? `Additional instructor guidelines: "${manualPrompt}"` : ''}

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
                "conceptMatched": "Concept 1 Title"
              },
              {
                "id": "q2",
                "question": "A multiple choice question testing Concept 2",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctIndex": 1,
                "explanation": "Clear educational explanation of why Option B is correct",
                "conceptMatched": "Concept 2 Title"
              },
              {
                "id": "q3",
                "question": "A multiple choice question testing Concept 3",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctIndex": 2,
                "explanation": "Clear educational explanation of why Option C is correct",
                "conceptMatched": "Concept 3 Title"
              },
              {
                "id": "q4",
                "question": "A multiple choice question testing security or a misconception",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctIndex": 3,
                "explanation": "Clear educational explanation correcting the misconception",
                "conceptMatched": "Concept 1 Title"
              }
            ]
          }
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: generationPrompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const textResponse = response.text?.trim() || '';
        // Clean markdown wrapper just in case the model ignored standard directives
        const cleanJSON = textResponse.replace(/^```json\s*/, '').replace(/```$/, '').trim();
        const parsed = JSON.parse(cleanJSON);

        // Update the current global states
        currentLesson = {
          id: 'lesson-' + Date.now(),
          topic: parsed.topic || targetTopic,
          learningOutcomes: parsed.learningOutcomes || [],
          keyConcepts: parsed.keyConcepts || [],
          commonMisconceptions: parsed.commonMisconceptions || [],
          knowledgeBaseStatus: 'ready',
          uploadedFiles: activeFiles.length > 0 ? activeFiles : ['manually_configured.txt'],
          summary: parsed.summary || 'Summary generated successfully.'
        };

        quizQuestions = parsed.quizQuestions || [];

        // Reset class diagnostics to fit the new topic
        simulatedSubmissionsCount = 0;
        simulatedAnalytics = {
          averageScore: 0,
          outcomeAchievement: currentLesson.learningOutcomes.map((outcome) => ({
            name: outcome.length > 30 ? outcome.substring(0, 30) + '...' : outcome,
            score: 0
          })),
          mostIncorrectTopic: currentLesson.keyConcepts[0]?.title || 'None',
          mostAskedQuestions: [
            { question: `Can you explain ${currentLesson.keyConcepts[0]?.title || 'Topic'}?`, count: 0 }
          ],
          commonMisconceptions: currentLesson.commonMisconceptions.map((mis) => ({
            topic: mis.title,
            count: 0,
            description: mis.explanation
          })),
          studentSubmissionsCount: 0,
          weeklyTrend: [
            { day: 'Mon', averageScore: 0, activeStudents: 0 },
            { day: 'Tue', averageScore: 0, activeStudents: 0 },
            { day: 'Wed', averageScore: 0, activeStudents: 0 },
            { day: 'Thu', averageScore: 0, activeStudents: 0 },
            { day: 'Fri', averageScore: 0, activeStudents: 0 }
          ],
          aiInsight: 'A brand new knowledge base was generated. Encourage students to participate in the mock quiz to populate analytical insights.'
        };

         res.json({ success: true, lesson: currentLesson, questions: quizQuestions });
         return;
      } catch (err) {
        console.error('Error generating lesson via Gemini:', err);
         res.status(500).json({ error: 'Failed to generate knowledge base via Gemini. Using fallback configuration.' });
         return;
      }
    }

    // Fallback manual lesson update if no API key is set
    currentLesson = {
      id: 'lesson-' + Date.now(),
      topic: targetTopic,
      learningOutcomes: [
        `Identify main concepts related to ${targetTopic}.`,
        `Apply theoretical frameworks of ${targetTopic} to academic scenarios.`,
        `Debug and improve design architectures of ${targetTopic}.`
      ],
      keyConcepts: [
        { title: `${targetTopic} core frameworks`, description: `Fundamental paradigms defining how ${targetTopic} operates in modern environments.` },
        { title: `${targetTopic} lifecycle`, description: `Understanding states, pipelines, and transitions inside a simulated ${targetTopic} process.` }
      ],
      commonMisconceptions: [
        { title: `Over-complicating ${targetTopic}`, explanation: `Many practitioners believe ${targetTopic} requires complex enterprise setups, whereas standard minimal strategies work best.` }
      ],
      knowledgeBaseStatus: 'ready',
      uploadedFiles: activeFiles.length > 0 ? activeFiles : ['fallback_data.txt'],
      summary: `You have successfully set up a fallback curriculum for ${targetTopic}. Add a real GEMINI_API_KEY to experience fully customized academic syllabus generations.`
    };

    quizQuestions = [
      {
        id: 'fallback-q1',
        question: `Which of the following is the most critical pillar when studying ${targetTopic}?`,
        options: ['Unstructured experimentation', 'Rigorous theoretical foundations', 'Ignoring safety constraints', 'Continuous redeployment'],
        correctIndex: 1,
        explanation: 'A strong academic understanding demands prioritizing robust foundations and systematic testing.',
        conceptMatched: `${targetTopic} core frameworks`
      },
      {
        id: 'fallback-q2',
        question: `What is a common pitfall when integrating ${targetTopic}?`,
        options: [
          'Reading documentation beforehand',
          'Deploying minimal styled elements',
          'Over-complicating configuration settings',
          'Collaborating with peers'
        ],
        correctIndex: 2,
        explanation: 'Over-complicating setups introduces tech debt and increases cognitive load, making the framework harder to maintain.',
        conceptMatched: `Over-complicating ${targetTopic}`
      }
    ];

    simulatedSubmissionsCount = 0;
    simulatedAnalytics = {
      averageScore: 0,
      outcomeAchievement: currentLesson.learningOutcomes.map((o) => ({ name: o.substring(0, 30), score: 0 })),
      mostIncorrectTopic: 'Over-complicating ' + targetTopic,
      mostAskedQuestions: [{ question: `What is the core of ${targetTopic}?`, count: 0 }],
      commonMisconceptions: [{ topic: `Over-complicating ${targetTopic}`, count: 0, description: 'Assuming it requires a heavy setup.' }],
      studentSubmissionsCount: 0,
      weeklyTrend: [
        { day: 'Mon', averageScore: 0, activeStudents: 0 },
        { day: 'Tue', averageScore: 0, activeStudents: 0 },
        { day: 'Wed', averageScore: 0, activeStudents: 0 },
        { day: 'Thu', averageScore: 0, activeStudents: 0 },
        { day: 'Fri', averageScore: 0, activeStudents: 0 }
      ],
      aiInsight: 'Knowledge Base loaded in offline mode. Setup GEMINI_API_KEY inside the Secrets panel to activate live university syllabus generation!'
    };

    res.json({ success: true, lesson: currentLesson, questions: quizQuestions, simulated: true });
  });

  // AI Assistant Chat Route
  app.post('/api/chat', async (req: Request, res: Response) => {
    const { messages, activeLessonContext } = req.body;
    if (!messages || messages.length === 0) {
       res.status(400).json({ error: 'Missing chat messages' });
       return;
    }

    const latestUserMessage = messages[messages.length - 1].text;

    const ai = getGeminiClient();
    if (ai) {
      try {
        const chatContext = `
          You are a highly helpful, patient, and knowledgeable university AI Learning Companion.
          You are tutoring a student regarding this current weekly lesson:
          - Lesson Topic: "${currentLesson.topic}"
          - Key Concepts: ${JSON.stringify(currentLesson.keyConcepts)}
          - Common Misconceptions: ${JSON.stringify(currentLesson.commonMisconceptions)}

          Student is asking: "${latestUserMessage}"

          Use clear, academic but approachable language. Break down complex things into bite-sized analogies.
          Strictly keep responses clean, structured, and informative. If they ask to be quizzed, give them a simple sample question.
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: chatContext,
        });

        res.json({
          text: response.text || 'I am ready to help you with the lesson material.'
        });
        return;
      } catch (err) {
        console.error('Error generating AI chat response:', err);
         res.status(500).json({ error: 'Failed to connect to AI server. Simulating fallback offline tutoring response.' });
         return;
      }
    }

    // Falling back to offline interactive simulator responses
    let offlineResponse = '';
    const queryLower = latestUserMessage.toLowerCase();

    if (queryLower.includes('explain') || queryLower.includes('again')) {
      offlineResponse = `Let's break down one of our key concepts: **${currentLesson.keyConcepts[0]?.title}**. \n\n${currentLesson.keyConcepts[0]?.description} \n\nThink of it as a physical letter sent through the post office: the mail carrier doesn't remember your last letter; each envelope contains all information needed.`;
    } else if (queryLower.includes('example')) {
      offlineResponse = `Here is a real-world example of **${currentLesson.commonMisconceptions[0]?.title}**: \n\nSuppose you submit a form to log in with a password. If the URL is \`http://example.com\`, even if you send a POST request, any hacker on the same Wi-Fi can capture your password in plain text. Only **HTTPS** encrypts it during transit!`;
    } else if (queryLower.includes('summarize') || queryLower.includes('summary')) {
      offlineResponse = `Sure, here is the summary of **${currentLesson.topic}**: \n\n${currentLesson.summary}`;
    } else if (queryLower.includes('quiz') || queryLower.includes('test')) {
      offlineResponse = `Let's do a quick check! \n\n**Question**: If you send a GET request three times to retrieve a profile page, does the server state change?\n\n*Type your answer below! (Hint: Is GET safe?)*`;
    } else {
      offlineResponse = `That is an excellent academic inquiry regarding **${currentLesson.topic}**! \n\nTo better master this: \n1. Study the **learning outcomes** shown on your student dashboard.\n2. Review the **common misconceptions** like *${currentLesson.commonMisconceptions[0]?.title}*.\n3. Take our interactive **Practice Quiz** on the Quiz screen!`;
    }

    res.json({
      text: offlineResponse + '\n\n*(Simulated response. To activate live Gemini intelligence, please add your GEMINI_API_KEY inside the Secrets panel.)*'
    });
  });

  // Serve static client files in production, use Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Learning Companion Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
