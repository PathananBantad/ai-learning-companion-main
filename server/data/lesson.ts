// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface KeyConcept {
  title: string;
  description: string;
}

export interface Misconception {
  title: string;
  explanation: string;
}

export interface Lesson {
  id: string;
  topic: string;
  learningOutcomes: string[];
  keyConcepts: KeyConcept[];
  commonMisconceptions: Misconception[];
  knowledgeBaseStatus: 'idle' | 'uploading' | 'ready';
  uploadedFiles: string[];
  summary: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  conceptMatched: string;
  misconceptionMap?: { [optionIndex: string]: string };
  recommendationMap?: { [optionIndex: string]: string };
}

export interface Submission {
  score: number;
  answers: Record<string, number>;
}

// ---------------------------------------------------------------------------
// Default / seed data (kept pre-populated so the app is immediately immersive)
// ---------------------------------------------------------------------------

const defaultLesson: Lesson = {
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
  knowledgeBaseStatus: 'ready',
  uploadedFiles: ['web_protocols_syllabus.pdf'],
  summary: 'This lesson covers the cornerstone of web communication: the Hypertext Transfer Protocol (HTTP) and the REST architectural pattern. You will master standard request-response life-cycles, idempotency, and state workarounds, preparing you to design and debug modern cloud APIs.'
};

const defaultQuizQuestions: QuizQuestion[] = [
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

const defaultSimulatedSubmissions: Submission[] = [
  { score: 75, answers: { q1: 1, q2: 1, q3: 0, q4: 1 } },
  { score: 100, answers: { q1: 1, q2: 1, q3: 1, q4: 1 } },
  { score: 50, answers: { q1: 0, q2: 1, q3: 0, q4: 1 } },
  { score: 75, answers: { q1: 1, q2: 1, q3: 1, q4: 0 } },
  { score: 75, answers: { q1: 1, q2: 1, q3: 0, q4: 1 } }
];

const defaultSimulatedAnalytics: any = {
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
  studentSubmissionsCount: 28,
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
      id: 'STU-8921',
      name: 'Sarah Jenkins',
      quizScore: 95,
      learningProgress: 90,
      learningOutcomeAchievement: [
        { name: 'Core HTTP Verbs & CRUD', score: 100 },
        { name: 'Stateless HTTP & Sessions', score: 95 },
        { name: 'Idempotency Concepts', score: 90 },
        { name: 'Web Security (POST/HTTPS)', score: 95 }
      ],
      strengths: ['HTTP Verbs', 'Stateless Session Management'],
      weaknesses: ['None'],
      commonMisconceptions: ['None'],
      aiFeedbackSummary: 'Demonstrated exemplary mastery across all domains. Fully understands REST design constraints and idempotency guarantees.',
      recommendedTopics: ['Advanced GraphQL federated architectures'],
      lastActivity: 'Completed diagnostic quiz on 07/03 08:12'
    },
    {
      id: 'STU-4412',
      name: 'Alex Mercer',
      quizScore: 75,
      learningProgress: 70,
      learningOutcomeAchievement: [
        { name: 'Core HTTP Verbs & CRUD', score: 90 },
        { name: 'Stateless HTTP & Sessions', score: 80 },
        { name: 'Idempotency Concepts', score: 50 },
        { name: 'Web Security (POST/HTTPS)', score: 80 }
      ],
      strengths: ['REST verbs', 'Status codes'],
      weaknesses: ['Idempotency semantics of PUT/POST'],
      commonMisconceptions: ['Assumed POST is safe & idempotent'],
      aiFeedbackSummary: 'Excellent overall foundation but struggles with idempotency constraints. Needs to clarify why repeating a POST payload can duplicate database resources.',
      recommendedTopics: ['Idempotent operations vs Safe operations'],
      lastActivity: 'Engaged with AI Tutor on Idempotency on 07/03 07:45'
    },
    {
      id: 'STU-3109',
      name: 'Elena Rostova',
      quizScore: 85,
      learningProgress: 82,
      learningOutcomeAchievement: [
        { name: 'Core HTTP Verbs & CRUD', score: 95 },
        { name: 'Stateless HTTP & Sessions', score: 85 },
        { name: 'Idempotency Concepts', score: 80 },
        { name: 'Web Security (POST/HTTPS)', score: 80 }
      ],
      strengths: ['CRUD implementation', 'Idempotency'],
      weaknesses: ['JWT statelessness'],
      commonMisconceptions: ['Believes session state must reside on the DB'],
      aiFeedbackSummary: 'Solid comprehension of REST constraints. Slight misunderstanding of stateless scaling implications using JWT vs stateful session cookies.',
      recommendedTopics: ['Stateless authentication with JWT', 'Token invalidation strategies'],
      lastActivity: 'Submitted Quiz 1 on 07/02 16:30'
    },
    {
      id: 'STU-7201',
      name: 'Marcus Vance',
      quizScore: 60,
      learningProgress: 55,
      learningOutcomeAchievement: [
        { name: 'Core HTTP Verbs & CRUD', score: 70 },
        { name: 'Stateless HTTP & Sessions', score: 60 },
        { name: 'Idempotency Concepts', score: 50 },
        { name: 'Web Security (POST/HTTPS)', score: 60 }
      ],
      strengths: ['Basic GET/POST routing'],
      weaknesses: ['Stateless HTTP architecture', 'Idempotency of PUT vs PATCH'],
      commonMisconceptions: ['Equates HTTP POST with database encryption by default'],
      aiFeedbackSummary: 'Requires review of core stateless paradigms. Struggled with secure transmission concepts and confused raw payload payloads with transport-layer security.',
      recommendedTopics: ['Statelessness vs state persistence', 'TLS/HTTPS transport layers'],
      lastActivity: 'Completed practice flashcards on 07/02 11:20'
    },
    {
      id: 'STU-1102',
      name: 'Chloe Zhao',
      quizScore: 90,
      learningProgress: 88,
      learningOutcomeAchievement: [
        { name: 'Core HTTP Verbs & CRUD', score: 100 },
        { name: 'Stateless HTTP & Sessions', score: 90 },
        { name: 'Idempotency Concepts', score: 80 },
        { name: 'Web Security (POST/HTTPS)', score: 90 }
      ],
      strengths: ['Web Security', 'HTTP Verbs and Responses'],
      weaknesses: ['Edge cases in PUT vs PATCH'],
      commonMisconceptions: ['None'],
      aiFeedbackSummary: 'Exceptional grasp of network fundamentals and security patterns. Minor confusion on standard idempotency profiles for PATCH verbs.',
      recommendedTopics: ['RFC 5789 PATCH specifications'],
      lastActivity: 'Submitted diagnostic quiz on 07/03 08:29'
    },
    {
      id: 'STU-5541',
      name: 'Devon Lane',
      quizScore: 45,
      learningProgress: 40,
      learningOutcomeAchievement: [
        { name: 'Core HTTP Verbs & CRUD', score: 60 },
        { name: 'Stateless HTTP & Sessions', score: 40 },
        { name: 'Idempotency Concepts', score: 30 },
        { name: 'Web Security (POST/HTTPS)', score: 50 }
      ],
      strengths: ['Basic CRUD ideas'],
      weaknesses: ['Sessions and cookie security', 'Idempotency definitions', 'POST vs PUT'],
      commonMisconceptions: ['Believes POST is secure by default', 'Confused PUT with safe reads'],
      aiFeedbackSummary: 'Struggling with standard HTTP web-model definitions. Triggered multiple major misconceptions on basic POST routing and encryption rules. Needs targeted instructor counseling.',
      recommendedTopics: ['Intro to Web Architecture', 'HTTP methods and their safety guarantees'],
      lastActivity: 'Attempted quiz 2 times on 07/01 14:02'
    }
  ]
};

// ---------------------------------------------------------------------------
// Shared mutable application state
// ---------------------------------------------------------------------------
// NOTE: This is exported as a single object (rather than individual `let`
// bindings) so that other modules can safely mutate its properties
// (`state.currentLesson = ...`) — reassigning an imported ES module binding
// directly from another file is not allowed, but mutating a property on an
// imported object is.

export const state = {
  activeClassCode: 'AEGIS101',
  currentLesson: defaultLesson,
  quizQuestions: defaultQuizQuestions,
  simulatedSubmissionsCount: 28,
  simulatedSubmissions: defaultSimulatedSubmissions,
  simulatedAnalytics: defaultSimulatedAnalytics
};


//Misconceptions 
