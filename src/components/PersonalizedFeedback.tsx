import React from 'react';
import { motion } from 'motion/react';
import { 
  Award, CheckCircle, AlertTriangle, Compass, Check, ArrowRight, 
  HelpCircle, Sparkles, BookOpen, RotateCcw, MessageSquare, AlertCircle 
} from 'lucide-react';
import { QuizAttempt, QuizQuestion } from '../types';

interface PersonalizedFeedbackProps {
  quizAttempt: QuizAttempt | null;
  questions: QuizQuestion[];
  onNavigate: (view: 'dashboard' | 'chat' | 'quiz' | 'feedback') => void;
  onRetakeQuiz: () => void;
}

export default function PersonalizedFeedback({ quizAttempt, questions, onNavigate, onRetakeQuiz }: PersonalizedFeedbackProps) {
  
  if (!quizAttempt) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm text-center py-16 space-y-5" id="feedback-page">
        <Award className="w-12 h-12 text-brand-blue mx-auto animate-bounce" />
        <h3 className="font-display font-bold text-xl text-slate-800">No Assessment Feedback Found</h3>
        <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
          Take the active lesson quiz first to generate a personalized strength & weakness profile and correct your misconceptions.
        </p>
        <button
          onClick={() => onNavigate('quiz')}
          className="bg-brand-blue hover:bg-blue-600 text-white text-xs font-bold py-3 px-6 rounded-xl transition shadow-lg shadow-blue-500/10 inline-flex items-center gap-2"
        >
          <span>Take Quiz Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const { score, strengths, weaknesses, misconceptionsTriggered, recommendations } = quizAttempt;

  // Grade classification
  let gradeLetter = 'F';
  let gradeColor = 'text-red-500 bg-red-50 border-red-200';
  let gradeFeedback = 'Requires thorough revision. Let\'s review your weaknesses with our AI companion.';

  if (score >= 90) {
    gradeLetter = 'A';
    gradeColor = 'text-emerald-600 bg-emerald-50 border-emerald-100';
    gradeFeedback = 'Magnificent! You have shown a deep, conceptual understanding of this material.';
  } else if (score >= 80) {
    gradeLetter = 'B';
    gradeColor = 'text-blue-600 bg-blue-50 border-blue-100';
    gradeFeedback = 'Great job! You have grasped the main objectives. A little more revision will make it perfect.';
  } else if (score >= 70) {
    gradeLetter = 'C';
    gradeColor = 'text-amber-600 bg-amber-50 border-amber-100';
    gradeFeedback = 'Passed. Some crucial concepts (such as statelessness or idempotency) still require attention.';
  } else if (score >= 50) {
    gradeLetter = 'D';
    gradeColor = 'text-orange-600 bg-orange-50 border-orange-100';
    gradeFeedback = 'Passed with reservations. Several core concepts were missed.';
  }

  return (
    <div className="space-y-8 animate-fade-in" id="feedback-page">
      
      {/* Upper Grid: Score Card & Overall Grade feedback */}
      <div className="grid md:grid-cols-12 gap-8">
        
        {/* Score & Grade Display */}
        <div className="md:col-span-5 bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Diagnostic Score</span>
          
          <div className="relative flex items-center justify-center">
            {/* grade circle */}
            <div className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center font-display ${gradeColor}`}>
              <span className="text-4xl font-extrabold leading-none">{gradeLetter}</span>
              <span className="text-xs font-bold mt-1">{score}% Score</span>
            </div>
          </div>

          <div className="space-y-1 max-w-xs">
            <h4 className="font-display font-bold text-slate-800 text-sm">Feedback Grade Summary</h4>
            <p className="text-slate-500 text-xs leading-relaxed">{gradeFeedback}</p>
          </div>
        </div>

        {/* Learning Progress Tracking */}
        <div className="md:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Personal Study Progress</span>
            <h3 className="font-display font-bold text-xl text-slate-900">Current Unit Milestones</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Based on your quiz results, we have plotted your active progress. Completing recommended AI chats completes the learning loop.
            </p>
          </div>

          {/* Progress Indicators */}
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span className="text-slate-700">Theoretical Knowledge Mastery</span>
                <span className="text-brand-blue font-bold">{score}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-brand-blue h-full transition-all duration-500" style={{ width: `${score}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span className="text-slate-700">Analogy & Misconception Review</span>
                <span className="text-brand-purple font-bold">
                  {misconceptionsTriggered.length === 0 ? '100%' : '50%'}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-brand-purple h-full transition-all duration-500" 
                  style={{ width: misconceptionsTriggered.length === 0 ? '100%' : '50%' }} 
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 flex gap-4">
            <button
              onClick={onRetakeQuiz}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 transition"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span>Retake Quiz</span>
            </button>
            <button
              onClick={() => onNavigate('chat')}
              className="flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:text-blue-700 transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Clarify with AI</span>
            </button>
          </div>

        </div>

      </div>

      {/* Strengths & Weaknesses Split Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Strengths Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            Your Strengths
          </h3>
          <p className="text-slate-500 text-xs">Concepts you have thoroughly understood in this week's assessment:</p>
          
          <div className="space-y-3">
            {strengths.map((str, idx) => (
              <div key={idx} className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100/50 flex items-start gap-3">
                <Check className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-900">{str}</h4>
                  <p className="text-emerald-800/80 text-[11px] mt-0.5">Mastered. You demonstrated solid critical reasoning in related questions.</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weaknesses & Misconceptions Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
            Concepts to Improve
          </h3>
          <p className="text-slate-500 text-xs">Areas where you experienced difficulties or held minor misconceptions:</p>

          <div className="space-y-3">
            {weaknesses.length === 0 ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-xl font-medium">
                No weaknesses detected! You nailed every concept.
              </div>
            ) : (
              weaknesses.map((weak, idx) => (
                <div key={idx} className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-100 flex items-start gap-3">
                  <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900">{weak}</h4>
                    <p className="text-amber-800/80 text-[11px] mt-0.5">Review this concept using the AI Tutor sidebar prompts.</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Triggered Misconceptions Banner (if any) */}
      {misconceptionsTriggered.length > 0 && (
        <div className="bg-red-50/60 rounded-2xl p-6 border border-red-200 text-red-900 space-y-3">
          <h4 className="font-display font-bold text-sm flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            Alert: Misconceptions Triggered
          </h4>
          <p className="text-xs text-red-800 leading-relaxed">
            Your choices triggered a common academic misconception. Our system detected that you associate the following:
          </p>
          <div className="space-y-2">
            {misconceptionsTriggered.map((mis, idx) => (
              <div key={idx} className="bg-white/80 p-3 rounded-xl text-xs font-semibold text-red-900 flex items-center gap-2.5 shadow-sm border border-red-100">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                {mis}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations & Action list */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-purple shrink-0" />
          AI Recommendations for Next Action
        </h3>
        
        <div className="space-y-4">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="flex gap-4 items-start">
              <div className="w-6 h-6 rounded-full bg-brand-purple/10 text-brand-purple flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <p className="text-slate-600 text-xs leading-relaxed font-medium mt-1">{rec}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
