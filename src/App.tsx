import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  GraduationCap,
  BookOpen,
  MessageSquare,
  HelpCircle,
  Award,
  BarChart2,
  LogOut,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";

// Import subcomponents
import LandingPage from "./components/LandingPage";
import TeacherPortal from "./components/TeacherPortal";
import StudentDashboard from "./components/StudentDashboard";
import AIChat from "./components/AIChat";
import QuizPage from "./components/QuizPage";
import PersonalizedFeedback from "./components/PersonalizedFeedback";
import TeacherDashboard from "./components/TeacherDashboard";
import JoinClass from "./components/JoinClass";
import StudentComments from "./components/StudentComments";

// Import Types
import {
  LessonData,
  QuizQuestion,
  QuizAttempt,
  AnalyticsData,
  ChatMessage,
  CourseFeedback,
} from "./types";

export default function App() {
  // Navigation State
  // Restore the last active role/tab from localStorage so a page refresh
  // keeps the user where they were instead of bouncing back to the landing page.
  const [role, setRole] = useState<"landing" | "student" | "teacher">("landing");
  const [studentView, setStudentView] = useState<
    "dashboard" | "chat" | "quiz" | "feedback"
  >(() => {
    const saved = localStorage.getItem("aegis_student_view");
    return saved === "chat" || saved === "quiz" || saved === "feedback"
      ? saved
      : "dashboard";
  });
  const [teacherView, setTeacherView] = useState<
    "setup" | "analytics" | "comments"
  >(() => {
    const saved = localStorage.getItem("aegis_teacher_view");
    return saved === "analytics" || saved === "comments" ? saved : "setup";
  });

  // Keep localStorage in sync whenever the navigation state changes
  useEffect(() => {
    localStorage.setItem("aegis_role", role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem("aegis_student_view", studentView);
  }, [studentView]);

  useEffect(() => {
    localStorage.setItem("aegis_teacher_view", teacherView);
  }, [teacherView]);

  // Class Code System States
  const [classCode, setClassCode] = useState<string>("");
  const [studentJoinedCode, setStudentJoinedCode] = useState<string | null>(
    () => {
      return localStorage.getItem("aegis_joined_class_code");
    },
  );
  const [isGeneratingClassCode, setIsGeneratingClassCode] = useState(false);

  // Student Identity States
  const [studentName, setStudentName] = useState<string>(() => {
    return localStorage.getItem("aegis_student_name") || "";
  });
  const [studentId, setStudentId] = useState<string>(() => {
    return localStorage.getItem("aegis_student_id") || "";
  });
  const [sessionId, setSessionId] = useState<string | null>(() => {
    return localStorage.getItem("aegis_session_id") || null;
  });

  // Backend States
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt | null>(null);
  const [quizSaveStatus, setQuizSaveStatus] = useState<
    "idle" | "saved" | "failed"
  >("idle");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [recentActivity, setRecentActivity] = useState<string[]>([]);

  // Course Comments / Feedback States
  const [courseFeedbackList, setCourseFeedbackList] = useState<
    CourseFeedback[]
  >([]);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Teacher History States
  const [pastClasses, setPastClasses] = useState<
    { class_code: string; class_name: string; created_at: string }[]
  >([]);
  const [viewedClassCode, setViewedClassCode] = useState<string>("");

  // Telemetry & Loaders
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);
  const [isRespondingChat, setIsRespondingChat] = useState(false);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeySet, setApiKeySet] = useState(true);

  // Global popup notification (e.g. "knowledge base created")
  const [toast, setToast] = useState<
    { message: string; type: "success" | "error" } | null
  >(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const fetchLessonForClass = async (targetCode: string) => {
    try {
      const res = await fetch(`/api/lesson?classCode=${targetCode}`);
      if (res.ok) {
        const data = await res.json();
        setLesson(data.lesson);
        setQuestions(data.questions);
      }
    } catch (err) {
      console.error("Error fetching lesson for class:", err);
    }
  };

  // Sync initial lesson data and analytics from the Express server
  const syncSyllabus = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch class code first
      const classRes = await fetch("/api/class/code");
      let activeCode = "";
      if (classRes.ok) {
        const classData = await classRes.json();
        activeCode = classData.activeClassCode;
        setClassCode(activeCode);
      }

      // Determine which class code to fetch lesson for
      // If student and joined a specific class, use that. Otherwise use the active class.
      const targetCode = role === "student" && studentJoinedCode ? studentJoinedCode : activeCode;
      
      const lessonRes = await fetch(`/api/lesson${targetCode ? `?classCode=${targetCode}` : ""}`);
      if (!lessonRes.ok) throw new Error("Failed to retrieve active lesson.");
      const data = await lessonRes.json();
      
      setLesson(data.lesson);
      setQuestions(data.questions);

      // Check if API key is injected (represented in response or verified separately)
      // This is for display warning cards to user only
      if (data.lesson && data.lesson.topic) {
        setRecentActivity([
          `Synchronized Course Materials: "${data.lesson.topic}"`,
          "Reviewed default lecture outcomes",
        ]);
      }
    } catch (err: any) {
      console.error(err);
      setError(
        "Could not connect to the Express backend server. Please verify execution.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const syncAnalytics = async (
    refresh: boolean = false,
    targetClassCode?: string,
  ) => {
    try {
      setIsGeneratingInsight(true);
      const queryParams = new URLSearchParams();
      if (refresh) queryParams.append("refresh", "true");
      if (targetClassCode) queryParams.append("classCode", targetClassCode);

      const res = await fetch(`/api/analytics?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed to retrieve class analytics.");
      const data = await res.json();
      setAnalytics(data);
      
      if (targetClassCode) {
        setViewedClassCode(targetClassCode);
        fetchLessonForClass(targetClassCode);
      } else if (data.classCode) {
        setViewedClassCode(data.classCode);
        fetchLessonForClass(data.classCode);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingInsight(false);
    }
  };

  // Use a ref to keep track of the last student submission count without causing re-renders
  const studentCountRef = useRef(analytics?.studentSubmissionsCount || 0);

  // Keep the ref up to date when analytics changes
  useEffect(() => {
    if (analytics) {
      studentCountRef.current = analytics.studentSubmissionsCount;
    }
  }, [analytics]);

  // Add auto-refresh polling for Teacher Dashboard Analytics using lightweight check
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    // Only poll if we are in teacher role and viewing analytics
    if (role === "teacher" && teacherView === "analytics") {
      intervalId = setInterval(async () => {
        try {
          const currentClassCode = viewedClassCode || classCode;
          if (!currentClassCode) return;

          // Lightweight check: just count the rows in the database
          const res = await fetch(
            `/api/analytics/check-updates?classCode=${currentClassCode}&lastCount=${studentCountRef.current}`,
          );
          if (res.ok) {
            const data = await res.json();
            if (data.hasUpdates) {
              console.log("New submissions detected. Refreshing analytics...");
              syncAnalytics(false, currentClassCode);
            }
          }
        } catch (err) {
          console.error("Failed to check for analytics updates", err);
        }
      }, 5000); // 5 seconds polling to detect new students
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [role, teacherView, viewedClassCode, classCode]);

  const fetchPastClasses = async () => {
    try {
      const res = await fetch("/api/classes");
      if (res.ok) {
        const data = await res.json();
        setPastClasses(data.classes);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourseFeedback = async (targetClassCode?: string) => {
    try {
      setIsLoadingFeedback(true);
      const queryParams = new URLSearchParams();
      if (targetClassCode) queryParams.append("classCode", targetClassCode);

      const res = await fetch(`/api/course-feedback?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed to retrieve student comments.");
      const data = await res.json();
      setCourseFeedbackList(data.feedback || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  useEffect(() => {
    syncSyllabus();
    syncAnalytics();
  }, []);

  // Restore the student's most recent quiz attempt from the backend so the
  // Personalized Feedback page still has data after a page refresh (quizAttempt
  // itself is only ever set in-memory after a live quiz submission).
  useEffect(() => {
    const restoreLastQuizAttempt = async () => {
      if (role !== "student" || !studentJoinedCode || !studentId) return;
      if (quizAttempt) return; // already have a fresh attempt this session

      try {
        const params = new URLSearchParams({
          studentId,
          classCode: studentJoinedCode,
        });
        const res = await fetch(`/api/quiz/last?${params.toString()}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.attempt) {
          setQuizAttempt({ success: true, ...data.attempt });
          setQuizSaveStatus("saved");
        }
      } catch (err) {
        console.error("Failed to restore last quiz attempt", err);
      }
    };

    restoreLastQuizAttempt();
    // Only re-run when the student's identity/class actually changes, not on
    // every quizAttempt update (that would immediately re-fetch after a submit).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, studentJoinedCode, studentId]);

  // Set default greeting message when student opens Chat
  useEffect(() => {
    if (lesson && chatHistory.length === 0) {
      setChatHistory([
        {
          id: "welcome-chat",
          sender: "ai",
          text: `Hi there! I am your AI Learning Companion for today's lesson: "${lesson.topic}". \n\nI can explain concepts, provide concrete code examples, summarize the material, or quiz you. What would you like to explore first?`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }
  }, [lesson, chatHistory]);

  const handleSelectRole = (selectedRole: "student" | "teacher") => {
    setRole(selectedRole);
    if (selectedRole === "student") {
      setStudentView("dashboard");
    } else {
      setTeacherView("setup");
      syncAnalytics();
      fetchPastClasses();
    }
  };

  // POST: Weekly Lesson Setup Generation
  const handleGenerateKnowledgeBase = async (
    topic: string,
    files: File[],
    manualPrompt: string,
  ) => {
    try {
      setIsGeneratingLesson(true);
      const formData = new FormData();
      formData.append("topic", topic);
      formData.append("manualPrompt", manualPrompt);
      formData.append("classCode", classCode);
      files.forEach((f) => formData.append("files", f));

      const res = await fetch("/api/lesson/update", {
        method: "POST",
        body: formData, // ห้ามใส่ header Content-Type เอง ให้ browser ตั้ง boundary ให้อัตโนมัติ
      });

      if (!res.ok) throw new Error("Failed to generate customized syllabus.");
      const data = await res.json();

      setLesson(data.lesson);
      setQuestions(data.questions);
      setQuizAttempt(null); // Reset student quiz on lesson update

      // Clear previous chats and push initial prompt
      setChatHistory([
        {
          id: "welcome-chat-new",
          sender: "ai",
          text: `A new course syllabus has been updated: "${data.lesson.topic}". \n\nI have fully ingested the course files and generated a custom interactive practice quiz. Ask me any questions to begin your study guide!`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);

      setRecentActivity([
        `Instructor updated lecture focus: "${data.lesson.topic}"`,
        "AI synthesized new knowledge base and practice quiz questions",
      ]);

      // Auto-generate a new class code so the new lesson is bound to an active class
      await handleGenerateClassCode(undefined, data.lesson.topic);

      setTeacherView("setup");
    } catch (err) {
      console.error(err);
      setToast({
        message:
          "การสร้างฐานความรู้ล้มเหลวหรือใช้เวลานานเกินไป ระบบใช้หลักสูตรสำรองชั่วคราวแทน",
        type: "error",
      });
    } finally {
      setIsGeneratingLesson(false);
    }
  };

  // POST: Chat Message Query
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      sender: "student",
      text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setIsRespondingChat(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatHistory, userMsg],
          activeLessonContext: lesson,
          sessionId,
        }),
      });

      if (!res.ok) throw new Error("AI responding error.");
      const data = await res.json();

      setChatHistory((prev) => [
        ...prev,
        {
          id: "ai-msg-" + Date.now(),
          sender: "ai",
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);

      setRecentActivity((prev) => [
        `Asked AI tutor: "${text.length > 30 ? text.substring(0, 30) + "..." : text}"`,
        ...prev.slice(0, 4),
      ]);
    } catch (err) {
      console.error(err);
      setChatHistory((prev) => [
        ...prev,
        {
          id: "ai-error-" + Date.now(),
          sender: "ai",
          text: "Apologies, I encountered an issue connecting to the AI server. Please retry in a moment.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsRespondingChat(false);
    }
  };

  // POST: Submit Student Quiz
  const handleSubmitQuiz = async (answers: { [key: string]: number }) => {
    try {
      setIsSubmittingQuiz(true);
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          name: studentName,
          studentId: studentId,
          classCode: studentJoinedCode,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // Backend explicitly reports the save failed (e.g. Supabase error) —
        // do not treat this as a successful submission.
        setQuizSaveStatus("failed");
        alert(data.error || "บันทึกผลคะแนนไม่สำเร็จ กรุณาลองส่งอีกครั้ง");
        return;
      }

      setQuizAttempt(data);
      setQuizSaveStatus("saved");

      setRecentActivity((prev) => [
        `Completed Practice Quiz (Score: ${data.score}%)`,
        ...prev.slice(0, 4),
      ]);

      // Redirect student to feedback tab automatically
      setStudentView("feedback");
    } catch (err) {
      console.error(err);
      setQuizSaveStatus("failed");
      alert("Error submitting quiz.");
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  // POST: Student submits a course comment (optionally anonymous)
  const handleSubmitCourseFeedback = async (
    comment: string,
    isAnonymous: boolean,
  ): Promise<boolean> => {
    try {
      setIsSubmittingFeedback(true);
      const res = await fetch("/api/course-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classCode: studentJoinedCode,
          comment,
          isAnonymous,
          studentName: studentName,
          studentId: studentId,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit course comment.");

      setRecentActivity((prev) => [
        "Submitted a course comment",
        ...prev.slice(0, 4),
      ]);

      return true;
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการส่งความคิดเห็น กรุณาลองใหม่อีกครั้ง");
      return false;
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleRetakeQuiz = () => {
    setQuizAttempt(null);
    setStudentView("quiz");
    setRecentActivity((prev) => [
      "Restarted practice assessment unit",
      ...prev.slice(0, 4),
    ]);
  };

  const handleGenerateClassCode = async (customCode?: string, overrideTopic?: string) => {
    try {
      setIsGeneratingClassCode(true);
      const res = await fetch("/api/class/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customCode, topic: overrideTopic || lesson?.topic }),
      });
      if (!res.ok) throw new Error("Failed to generate code.");
      const data = await res.json();
      setClassCode(data.activeClassCode);
      setRecentActivity((prev) => [
        `Updated Class Access Code: "${data.activeClassCode}"`,
        ...prev.slice(0, 4),
      ]);
      // Refetch classes so the newly generated class appears in the dropdown in Analytics
      await fetchPastClasses();
    } catch (err) {
      console.error(err);
      alert("Error updating class code.");
    } finally {
      setIsGeneratingClassCode(false);
    }
  };

  if (role === "landing") {
    return <LandingPage onSelectRole={handleSelectRole} />;
  }

  // Intercept students who have not successfully entered a class code or are missing identity
  if (
    role === "student" &&
    (!studentJoinedCode || !studentName || !studentId)
  ) {
    return (
      <JoinClass
        onJoinSuccess={(code, studentInfo, newSessionId) => {
          if (
            studentId !== studentInfo.studentId ||
            studentJoinedCode !== code
          ) {
            setQuizAttempt(null);
            setQuizSaveStatus("idle");
            setChatHistory([]);
            setRecentActivity([]);
            setStudentView("dashboard");
          }
          setStudentJoinedCode(code);
          localStorage.setItem("aegis_joined_class_code", code);

          setStudentName(studentInfo.studentName);
          setStudentId(studentInfo.studentId);
          localStorage.setItem("aegis_student_name", studentInfo.studentName);
          localStorage.setItem("aegis_student_id", studentInfo.studentId);

          setSessionId(newSessionId);
          if (newSessionId !== null) {
            localStorage.setItem("aegis_session_id", String(newSessionId));
          } else {
            localStorage.removeItem("aegis_session_id");
          }
        }}
        onBackToLanding={() => setRole("landing")}
      />
    );
  }

  return (
    <div
      className="min-h-screen bg-slate-50 flex flex-col justify-between"
      id="full-app-root"
    >
      {/* Global Popup Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed top-20 right-6 z-[100] w-full max-w-sm"
          >
            <div
              className={`flex items-start gap-3 rounded-2xl border p-4 shadow-xl ${toast.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-red-50 border-red-200 text-red-800"
                }`}
            >
              <div
                className={`p-1.5 rounded-full shrink-0 ${toast.type === "success"
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-red-100 text-red-600"
                  }`}
              >
                {toast.type === "success" ? (
                  <CheckCircle className="w-4.5 h-4.5" />
                ) : (
                  <AlertCircle className="w-4.5 h-4.5" />
                )}
              </div>
              <p className="text-sm font-semibold leading-snug flex-1">
                {toast.message}
              </p>
              <button
                onClick={() => setToast(null)}
                className="shrink-0 opacity-60 hover:opacity-100 transition"
                aria-label="ปิดการแจ้งเตือน"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo & Course */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setRole("landing")}
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
              {lesson ? lesson.topic : "Loading Course..."}
            </div>
          </div>

          {/* Dynamic Action Buttons based on Role */}
          <div className="flex items-center gap-2">
            {role === "student" ? (
              <>
                <button
                  onClick={() => setStudentView("dashboard")}
                  className={`text-xs font-bold px-3.5 py-2 rounded-xl transition ${studentView === "dashboard"
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setStudentView("chat")}
                  className={`text-xs font-bold px-3.5 py-2 rounded-xl transition ${studentView === "chat"
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                  Chat Assistant
                </button>
                <button
                  onClick={() => setStudentView("quiz")}
                  className={`text-xs font-bold px-3.5 py-2 rounded-xl transition ${studentView === "quiz"
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                  Quiz Page
                </button>
                <button
                  onClick={() => setStudentView("feedback")}
                  className={`text-xs font-bold px-3.5 py-2 rounded-xl transition ${studentView === "feedback"
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                  Personalized Feedback
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setTeacherView("setup")}
                  className={`text-xs font-bold px-4 py-2 rounded-xl transition ${teacherView === "setup"
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                  Weekly Lesson Setup
                </button>
                <button
                  onClick={() => {
                    setTeacherView("analytics");
                    syncAnalytics();
                  }}
                  className={`text-xs font-bold px-4 py-2 rounded-xl transition ${teacherView === "analytics"
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                  Course Analytics
                </button>
                <button
                  onClick={() => {
                    setTeacherView("comments");
                    fetchCourseFeedback(viewedClassCode || classCode);
                  }}
                  className={`text-xs font-bold px-4 py-2 rounded-xl transition ${teacherView === "comments"
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                  Student Comments
                </button>
              </>
            )}

            {/* Switch role / logout button */}
            <div className="w-px h-6 bg-slate-200 mx-2 hidden sm:block" />
            <button
              onClick={() => {
                localStorage.removeItem("aegis_joined_class_code");
                localStorage.removeItem("aegis_student_name");
                localStorage.removeItem("aegis_student_id");
                localStorage.removeItem("aegis_student_view");
                localStorage.removeItem("aegis_teacher_view");

                setStudentJoinedCode(null);
                setStudentName("");
                setStudentId("");
                setStudentView("dashboard");
                setTeacherView("setup");

                setRole("landing");
              }}
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
            <p className="text-slate-400 text-sm font-semibold">
              Synchronizing university academic database...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-2xl max-w-lg mx-auto text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
            <h3 className="font-display font-bold text-lg">
              Server Connection Interrupted
            </h3>
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
            {role === "student" && (
              <div className="space-y-6">
                {studentView === "dashboard" && (
                  <StudentDashboard
                    lesson={lesson!}
                    quizAttempt={quizAttempt}
                    onNavigate={setStudentView}
                    recentActivity={recentActivity}
                    onSubmitCourseFeedback={handleSubmitCourseFeedback}
                    isSubmittingFeedback={isSubmittingFeedback}
                  />
                )}
                {studentView === "chat" && (
                  <AIChat
                    lesson={lesson!}
                    chatHistory={chatHistory}
                    onSendMessage={handleSendMessage}
                    isResponding={isRespondingChat}
                  />
                )}
                {studentView === "quiz" && (
                  <QuizPage
                    questions={questions}
                    onSubmitQuiz={handleSubmitQuiz}
                    isSubmitting={isSubmittingQuiz}
                  />
                )}
                {studentView === "feedback" && (
                  <PersonalizedFeedback
                    quizAttempt={quizAttempt}
                    questions={questions}
                    onNavigate={setStudentView}
                    onRetakeQuiz={handleRetakeQuiz}
                    saveStatus={quizSaveStatus}
                  />
                )}
              </div>
            )}

            {/* INSTRUCTOR EXPERIENCE */}
            {role === "teacher" && (
              <div className="space-y-6">
                {teacherView === "setup" && (
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
                {teacherView === "analytics" &&
                  (analytics ? (
                    <TeacherDashboard
                      analytics={analytics}
                      isGeneratingInsight={isGeneratingInsight}
                      apiKeySet={apiKeySet}
                      onRefreshInsight={() =>
                        syncAnalytics(true, viewedClassCode)
                      }
                      pastClasses={pastClasses}
                      viewedClassCode={viewedClassCode || classCode}
                      onSelectClass={(code) => syncAnalytics(false, code)}
                    />
                  ) : (
                    <div className="text-center py-10">
                      Loading analytics...
                    </div>
                  ))}
                {teacherView === "comments" && (
                  <StudentComments
                    feedbackList={courseFeedbackList}
                    isLoading={isLoadingFeedback}
                    onRefresh={() =>
                      fetchCourseFeedback(viewedClassCode || classCode)
                    }
                    pastClasses={pastClasses}
                    viewedClassCode={viewedClassCode || classCode}
                    onSelectClass={(code) => {
                      setViewedClassCode(code);
                      fetchCourseFeedback(code);
                    }}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-slate-400 text-xs font-medium">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2569 Aegis Academic AI ระบบผู้ช่วยการเรียนรู้ด้วย AI สำหรับมหาวิทยาลัย</p>
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5 text-emerald-600">
              <CheckCircle className="w-3.5 h-3.5" /> นโยบายวิชาการ
            </span>
            <span>•</span>
            <span className="text-slate-400">นโยบายความเป็นส่วนตัว</span>
          </div>
        </div>
      </footer>
    </div>
  );
}