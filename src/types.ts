export interface LessonData {
  student_id: string;
  topic: string;
  learningOutcomes: string[];
  keyConcepts: { title: string; description: string }[];
  commonMisconceptions: { title: string; explanation: string }[];
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

export interface QuizAttempt {
  answers: { [key: string]: number }; // questionId -> selectedIndex
  score: number; // percentage
  strengths: string[];
  weaknesses: string[];
  misconceptionsTriggered: string[];
  recommendations: string[];
  aiFeedback?: {
    level: string;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    encouragement: string;
  };
}

export interface StudentAnalytics {
  student_id: string;
  name: string;
  quizScore: number;
  learningProgress: number;
  learningOutcomeAchievement: { name: string; score: number }[];
  strengths: string[];
  weaknesses: string[];
  commonMisconceptions: string[];
  aiFeedbackSummary: string;
  recommendedTopics: string[];
  lastActivity: string;
}

export interface AnalyticsData {
  averageScore: number;
  outcomeAchievement: { name: string; score: number }[];
  mostIncorrectTopic: string;
  mostAskedQuestions: { question: string; count: number }[];
  commonMisconceptions: { topic: string; count: number; description: string }[];
  studentSubmissionsCount: number;
  weeklyTrend: { day: string; averageScore: number; activeStudents: number }[];
  aiInsight: string;
  students?: StudentAnalytics[];
}

export interface ChatMessage {
  id: string;
  sender: 'student' | 'ai';
  text: string;
  timestamp: string;
}
