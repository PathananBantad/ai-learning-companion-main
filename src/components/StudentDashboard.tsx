import React from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, GraduationCap, CheckCircle, ArrowRight, MessageSquare, 
  HelpCircle, BookOpen, Clock, RefreshCw 
} from 'lucide-react';
import { LessonData, QuizAttempt } from '../types';

interface StudentDashboardProps {
  lesson: LessonData;
  quizAttempt: QuizAttempt | null;
  onNavigate: (view: 'dashboard' | 'chat' | 'quiz' | 'feedback') => void;
  recentActivity: string[];
}

export default function StudentDashboard({ lesson, quizAttempt, onNavigate, recentActivity }: StudentDashboardProps) {
  // Compute progress based on whether quiz is taken and activities completed
  const quizScore = quizAttempt ? quizAttempt.score : 0;
  const progressPercent = quizAttempt ? 100 : 35;

  return (
    <div className="space-y-8 animate-fade-in" id="student-dashboard">
      
      {/* Welcome Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-blue/5 to-brand-purple/5 blur-3xl rounded-full -z-10" />
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1 bg-blue-50 text-brand-blue px-2.5 py-1 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> University Student Portal
          </div>
          <h1 className="font-display font-bold text-3xl text-slate-900">
            Welcome back to your Study Companion
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Your instructor has loaded this week's custom knowledge base. Ask questions, take personalized tests, and clarify misconceptions with instant feedback.
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shrink-0 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold text-lg">
            A+
          </div>
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase">Today's Progress</div>
            <div className="text-lg font-bold text-slate-800">{progressPercent}% Completed</div>
          </div>
        </div>
      </div>

      {/* Today's Lesson Topic card */}
      <div className="grid md:grid-cols-12 gap-8">
        
        {/* Lesson Overview */}
        <div className="md:col-span-8 bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Today's Lecture Focus</span>
            <h2 className="font-display font-bold text-2xl text-slate-900">{lesson.topic}</h2>
            <p className="text-slate-600 text-sm leading-relaxed">{lesson.summary}</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
              <span>Learning Objective Target</span>
              <span>{progressPercent}% Mastery</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-brand-blue h-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Quick learning outcomes list */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Learning outcomes</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {lesson.learningOutcomes.slice(0, 4).map((outcome, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{outcome}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Quiz Status Card */}
        <div className="md:col-span-4 bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/20 blur-2xl rounded-full" />
          
          <div className="space-y-4 relative">
            <span className="bg-white/10 text-slate-200 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Syllabus Quiz</span>
            <h3 className="font-display font-bold text-xl leading-snug">Test Your Knowledge</h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Take the AI-generated quiz to measure your understanding. Your scores automatically update the class dashboard.
            </p>
          </div>

          <div className="pt-6 relative">
            {quizAttempt ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Previous Score</span>
                  <span className={`font-bold ${quizScore >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>{quizScore}%</span>
                </div>
                <button
                  onClick={() => onNavigate('feedback')}
                  className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <span>View Breakdown Feedback</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('quiz')}
                id="start-practice-quiz-btn"
                className="w-full bg-brand-blue hover:bg-blue-600 text-white text-xs font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <span>Start Practice Quiz</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Three Large Action Cards */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Study Tools</h3>
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Action Card: Ask AI */}
          <div 
            onClick={() => onNavigate('chat')}
            className="group bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:border-brand-blue/40 hover:shadow-md cursor-pointer transition flex flex-col justify-between h-44"
          >
            <div className="space-y-2">
              <div className="bg-brand-blue/10 text-brand-blue w-10 h-10 rounded-xl flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-base text-slate-800">Ask AI Companion</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Clear up doubts, ask for dynamic analogies, and simplify hard terms.
              </p>
            </div>
            <div className="text-xs font-bold text-brand-blue flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Start Conversation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Action Card: Practice Quiz */}
          <div 
            onClick={() => onNavigate('quiz')}
            className="group bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:border-brand-blue/40 hover:shadow-md cursor-pointer transition flex flex-col justify-between h-44"
          >
            <div className="space-y-2">
              <div className="bg-emerald-50 text-emerald-600 w-10 h-10 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-base text-slate-800">Practice Quiz</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Take an interactive syllabus testing block to track misconceptions.
              </p>
            </div>
            <div className="text-xs font-bold text-brand-blue flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>{quizAttempt ? 'Retake Quiz' : 'Take Practice Quiz'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Action Card: Review Summary */}
          <div 
            onClick={() => onNavigate('chat')}
            className="group bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:border-brand-blue/40 hover:shadow-md cursor-pointer transition flex flex-col justify-between h-44"
          >
            <div className="space-y-2">
              <div className="bg-purple-50 text-brand-purple w-10 h-10 rounded-xl flex items-center justify-center group-hover:bg-brand-purple group-hover:text-white transition">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-base text-slate-800">Review Summary</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Read a consolidated overview of main course topics generated from the syllabus PDF.
              </p>
            </div>
            <div className="text-xs font-bold text-brand-blue flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Generate Summary</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          Recent Activity
        </h3>
        
        <div className="space-y-3.5">
          {recentActivity.length === 0 ? (
            <p className="text-slate-400 text-xs">No recent study sessions. Click "Start Practice Quiz" to begin!</p>
          ) : (
            recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 text-xs text-slate-600 border-b border-slate-50 pb-3 last:border-b-0 last:pb-0">
                <div className="w-2 h-2 rounded-full bg-brand-blue" />
                <span className="font-medium text-slate-800">{activity}</span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
