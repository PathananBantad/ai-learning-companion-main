import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, GraduationCap, BookOpen, MessageSquare, HelpCircle, 
  Award, BarChart2, LogOut, ArrowLeft, RefreshCw, AlertCircle, CheckCircle 
} from 'lucide-react';

// Import subcomponents
import LandingPage from './components/LandingPage';
import TeacherPortal from './components/TeacherPortal';
import StudentDashboard from './components/StudentDashboard';
import AIChat from './components/AIChat';
import QuizPage from './components/QuizPage';
import PersonalizedFeedback from './components/PersonalizedFeedback';
import TeacherDashboard from './components/TeacherDashboard';
import JoinClass from './components/JoinClass';

// Import Types
import { LessonData, QuizQuestion, QuizAttempt, AnalyticsData, ChatMessage } from './types';

export default function App() {
  // Navigation State
  const [role, setRole] = useState<'landing' | 'student' | 'teacher'>('landing');
  const [studentView, setStudentView] = useState<'dashboard' | 'chat' | 'quiz' | 'feedback'>('dashboard');
  const [teacherView, setTeacherView] = useState<'setup' | 'analytics'>('setup');

  // Class Code System States
  const [classCode, setClassCode] = useState<string>('AEGIS101');
  const [studentJoinedCode, setStudentJoinedCode] = useState<string | null>(() => {
    return localStorage.getItem('aegis_joined_class_code');
  });
  const [isGeneratingClassCode, setIsGeneratingClassCode] = useState(false);

  // Student Identity States
  const [studentName, setStudentName] = useState<string>(() => {
    return localStorage.getItem('aegis_student_name') || '';
  });
  const [studentId, setStudentId] = useState<string>(() => {
    return localStorage.getItem('aegis_student_id') || '';
  });

  // Backend States
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [recentActivity, setRecentActivity] = useState<string[]>([]);

  // Telemetry & Loaders
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);
  const [isRespondingChat, setIsRespondingChat] = useState(false);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeySet, setApiKeySet] = useState(true);

  // Sync initial lesson data and analytics from the Express server
  const syncSyllabus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Parallel fetch for lesson and class code
      const [lessonRes, classRes] = await Promise.all([
        fetch('/api/lesson'),
        fetch('/api/class/code')
      ]);

      if (!lessonRes.ok) throw new Error('Failed to retrieve active lesson.');
      const data = await lessonRes.json();
      setLesson(data.lesson);
      setQuestions(data.questions);

      if (classRes.ok) {
        const classData = await classRes.json();
        setClassCode(classData.activeClassCode);
      }

      // Check if API key is injected (represented in response or verified separately)
      // This is for display warning cards to user only
      if (data.lesson && data.lesson.topic) {
        setRecentActivity([
          `Synchronized Course Materials: "${data.lesson.topic}"`,
          'Reviewed default lecture outcomes'
        ]);
      }
    } catch (err: any) {
      console.error(err);
      setError('Could not connect to the Express backend server. Please verify execution.');
    } finally {
      setIsLoading(false);
    }
  };

  const syncAnalytics = async (refresh: boolean = false) => {
    try {
      setIsGeneratingInsight(true);
      const res = await fetch(`/api/analytics${refresh ? '?refresh=true' : ''}`);
      if (!res.ok) throw new Error('Failed to retrieve class analytics.');
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingInsight(false);
    }
  };

  useEffect(() => {
    syncSyllabus();
    syncAnalytics();
  }, []);

  // Set default greeting message when student opens Chat
  useEffect(() => {
    if (lesson && chatHistory.length === 0) {
      setChatHistory([
        {
          id: 'welcome-chat',
          sender: 'ai',
          text: `Hi there! I am your AI Learning Companion for today's lesson: "${lesson.topic}". \n\nI can explain concepts, provide concrete code examples, summarize the material, or quiz you. What would you like to explore first?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [lesson, chatHistory]);

  // Role click triggers
  const handleSelectRole = (selectedRole: 'student' | 'teacher') => {
    setRole(selectedRole);
    if (selectedRole === 'student') {
      setStudentView('dashboard');
    } else {
      setTeacherView('setup');
      syncAnalytics();
    }
  };

  // POST: Weekly Lesson Setup Generation
  const handleGenerateKnowledgeBase = async (topic: string, files: string[], manualPrompt: string) => {
    try {
      setIsGeneratingLesson(true);
      const res = await fetch('/api/lesson/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, uploadedFiles: files, manualPrompt })
      });

      if (!res.ok) throw new Error('Failed to generate customized syllabus.');
      const data = await res.json();

      setLesson(data.lesson);
      setQuestions(data.questions);
      setQuizAttempt(null); // Reset student quiz on lesson update
      
      // Clear previous chats and push initial prompt
      setChatHistory([
        {
          id: 'welcome-chat-new',
          sender: 'ai',
          text: `A new course syllabus has been updated: "${data.lesson.topic}". \n\nI have fully ingested the course files and generated a custom interactive practice quiz. Ask me any questions to begin your study guide!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      setRecentActivity([
        `Instructor updated lecture focus: "${data.lesson.topic}"`,
        'AI synthesized new knowledge base and practice quiz questions'
      ]);

      setTeacherView('setup');
    } catch (err) {
      console.error(err);
      alert('Generation failed or took too long. Using robust fallback topic configuration.');
    } finally {
      setIsGeneratingLesson(false);
    }
  };

  // POST: Chat Message Query
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'student',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMsg]);
    setIsRespondingChat(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatHistory, userMsg],
          activeLessonContext: lesson
        })
      });

      if (!res.ok) throw new Error('AI responding error.');
      const data = await res.json();

      setChatHistory(prev => [
        ...prev,
        {
          id: 'ai-msg-' + Date.now(),
          sender: 'ai',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      setRecentActivity(prev => [
        `Asked AI tutor: "${text.length > 30 ? text.substring(0, 30) + '...' : text}"`,
        ...prev.slice(0, 4)
      ]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [
        ...prev,
        {
          id: 'ai-error-' + Date.now(),
          sender: 'ai',
          text: 'Apologies, I encountered an issue connecting to the AI server. Please retry in a moment.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsRespondingChat(false);
    }
  };

  // POST: Submit Student Quiz
  const handleSubmitQuiz = async (answers: { [key: string]: number }) => {
    try {
      setIsSubmittingQuiz(true);
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          name: studentName,
          studentId: studentId,
          classCode: studentJoinedCode
        })
      });

      if (!res.ok) throw new Error('Failed to evaluate assessment answers.');
      const data = await res.json();

      setQuizAttempt(data);
      
      setRecentActivity(prev => [
        `Completed Practice Quiz (Score: ${data.score}%)`,
        ...prev.slice(0, 4)
      ]);

      // Redirect student to feedback tab automatically
      setStudentView('feedback');
    } catch (err) {
      console.error(err);
      alert('Error submitting quiz.');
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const handleRetakeQuiz = () => {
    setQuizAttempt(null);
    setStudentView('quiz');
    setRecentActivity(prev => [
      'Restarted practice assessment unit',
      ...prev.slice(0, 4)
    ]);
  };

  const handleGenerateClassCode = async (customCode?: string) => {
    try {
      setIsGeneratingClassCode(true);
      const res = await fetch('/api/class/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customCode })
      });
      if (!res.ok) throw new Error('Failed to generate code.');
      const data = await res.json();
      setClassCode(data.activeClassCode);
      setRecentActivity(prev => [
        `Updated Class Access Code: "${data.activeClassCode}"`,
        ...prev.slice(0, 4)
      ]);
    } catch (err) {
      console.error(err);
      alert('Error updating class code.');
    } finally {
      setIsGeneratingClassCode(false);
    }
  };

  if (role === 'landing') {
    return <LandingPage onSelectRole={handleSelectRole} />;
  }

  // Intercept students who have not successfully entered the active class code
  if (role === 'student' && studentJoinedCode !== classCode) {
    return (
      <JoinClass 
        onJoinSuccess={(code, studentInfo) => {
          setStudentJoinedCode(code);
          localStorage.setItem('aegis_joined_class_code', code);

          setStudentName(studentInfo.studentName);
          setStudentId(studentInfo.studentId);
          localStorage.setItem('aegis_student_name', studentInfo.studentName);
          localStorage.setItem('aegis_student_id', studentInfo.studentId);
        }}
        onBackToLanding={() => setRole('landing')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between" id="full-app-root">
      
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo & Course */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setRole('landing')}
              className="flex items-center gap-2 group text-left"
            >
              <div className="bg-brand-blue/10 text-brand-blue p-2 rounded-xl group-hover:bg-brand-blue group-hover:text-white transition">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="font-display font-bold text-base tracking-tight text-slate-900 block leading-tight">
                  Aegis Companion
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Active Unit
                </span>
              </div>
            </button>
            <div className="hidden md:block text-slate-300">|</div>
            <div className="hidden md:block bg-slate-50 border border-slate-100 rounded-lg px-3 py-1 max-w-[250px] truncate text-xs font-semibold text-slate-600">
              {lesson ? lesson.topic : 'Loading Course...'}
            </div>
          </div>

          {/* Dynamic Action Buttons based on Role */}
          <div className="flex items-center gap-2">
            
            {role === 'student' ? (
              <>
                <button
                  onClick={() => setStudentView('dashboard')}
                  className={`text-xs font-bold px-3.5 py-2 rounded-xl transition ${
                    studentView === 'dashboard' 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setStudentView('chat')}
                  className={`text-xs font-bold px-3.5 py-2 rounded-xl transition ${
                    studentView === 'chat' 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Chat Assistant
                </button>
                <button
                  onClick={() => setStudentView('quiz')}
                  className={`text-xs font-bold px-3.5 py-2 rounded-xl transition ${
                    studentView === 'quiz' 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Quiz Page
                </button>
                <button
                  onClick={() => setStudentView('feedback')}
                  className={`text-xs font-bold px-3.5 py-2 rounded-xl transition ${
                    studentView === 'feedback' 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Personalized Feedback
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setTeacherView('setup')}
                  className={`text-xs font-bold px-4 py-2 rounded-xl transition ${
                    teacherView === 'setup' 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Weekly Lesson Setup
                </button>
                <button
                  onClick={() => { setTeacherView('analytics'); syncAnalytics(); }}
                  className={`text-xs font-bold px-4 py-2 rounded-xl transition ${
                    teacherView === 'analytics' 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Course Analytics
                </button>
              </>
            )}

            {/* Switch role / logout button */}
            <div className="w-px h-6 bg-slate-200 mx-2 hidden sm:block" />
            <button
              onClick={() => setRole('landing')}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 transition py-2 px-3 border border-slate-200 hover:border-slate-300 rounded-xl flex items-center gap-1.5 shadow-sm"
              title="Return to Welcome Screen"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Switch Role</span>
            </button>

          </div>

        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-grow">
        
        {isLoading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-4 text-center">
            <RefreshCw className="w-10 h-10 animate-spin text-brand-blue" />
            <p className="text-slate-400 text-sm font-semibold">Synchronizing university academic database...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-2xl max-w-lg mx-auto text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
            <h3 className="font-display font-bold text-lg">Server Connection Interrupted</h3>
            <p className="text-xs leading-relaxed">{error}</p>
            <button 
              onClick={syncSyllabus}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition"
            >
              Retry Sync
            </button>
          </div>
        ) : (
          <div>
            {/* STUDENT EXPERIENCE */}
            {role === 'student' && (
              <div className="space-y-6">
                {studentView === 'dashboard' && (
                  <StudentDashboard 
                    lesson={lesson!} 
                    quizAttempt={quizAttempt} 
                    onNavigate={setStudentView}
                    recentActivity={recentActivity}
                  />
                )}
                {studentView === 'chat' && (
                  <AIChat 
                    lesson={lesson!} 
                    chatHistory={chatHistory} 
                    onSendMessage={handleSendMessage}
                    isResponding={isRespondingChat}
                  />
                )}
                {studentView === 'quiz' && (
                  <QuizPage 
                    questions={questions} 
                    onSubmitQuiz={handleSubmitQuiz}
                    isSubmitting={isSubmittingQuiz}
                  />
                )}
                {studentView === 'feedback' && (
                  <PersonalizedFeedback 
                    quizAttempt={quizAttempt} 
                    questions={questions}
                    onNavigate={setStudentView}
                    onRetakeQuiz={handleRetakeQuiz}
                  />
                )}
              </div>
            )}

            {/* INSTRUCTOR EXPERIENCE */}
            {role === 'teacher' && (
              <div className="space-y-6">
                {teacherView === 'setup' && (
                  <TeacherPortal 
                    lesson={lesson!} 
                    onGenerateKnowledgeBase={handleGenerateKnowledgeBase}
                    isGenerating={isGeneratingLesson}
                    apiKeySet={apiKeySet}
                    classCode={classCode}
                    onGenerateClassCode={handleGenerateClassCode}
                    isGeneratingClassCode={isGeneratingClassCode}
                  />
                )}
                {teacherView === 'analytics' && (
                    analytics ? (
                        <TeacherDashboard
                            analytics={analytics}
                            isGeneratingInsight={isGeneratingInsight}
                            apiKeySet={apiKeySet}
                            onRefreshInsight={() => syncAnalytics(true)}
                        />
                    ) : (
                        <div className="text-center py-10">
                          Loading analytics...
                        </div>
                    )
                )}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-slate-400 text-xs font-medium">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Aegis Academic AI. Deployed in sandbox environment.</p>
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5 text-emerald-600">
              <CheckCircle className="w-3.5 h-3.5" /> Full Stack Active
            </span>
            <span>•</span>
            <span className="text-slate-400">Node JS Port 3000</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
