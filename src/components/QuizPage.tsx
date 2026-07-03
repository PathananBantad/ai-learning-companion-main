import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HelpCircle, ChevronLeft, ChevronRight, Check, AlertCircle, 
  Award, RefreshCw, Star, Compass, CheckCircle 
} from 'lucide-react';
import { QuizQuestion } from '../types';

interface QuizPageProps {
  questions: QuizQuestion[];
  onSubmitQuiz: (answers: { [key: string]: number }) => Promise<void>;
  isSubmitting: boolean;
}

export default function QuizPage({ questions, onSubmitQuiz, isSubmitting }: QuizPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm text-center py-16 space-y-4" id="quiz-page">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="font-display font-bold text-xl text-slate-800">No active quiz questions generated</h3>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">
          Please ask the instructor to upload a syllabus PDF or enter a custom topic inside the Weekly Lesson Setup to generate interactive testing parameters.
        </p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const percentComplete = Math.round((answeredCount / totalQuestions) * 100);

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionIndex
    }));
    setErrorMsg(null);
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate if all questions are answered
    if (answeredCount < totalQuestions) {
      setErrorMsg(`You have answered ${answeredCount} of ${totalQuestions} questions. Please provide answers for all questions before submitting.`);
      return;
    }
    setErrorMsg(null);
    await onSubmitQuiz(selectedAnswers);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8" id="quiz-page">
      
      {/* Progress Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3.5">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-brand-blue" />
            <span>Syllabus Diagnostic Test</span>
          </div>
          <span>{answeredCount} of {totalQuestions} answered</span>
        </div>

        {/* Question Nodes indicators */}
        <div className="flex gap-2">
          {questions.map((q, idx) => {
            const isSelected = idx === currentIndex;
            const isAnswered = selectedAnswers[q.id] !== undefined;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`flex-grow h-2 rounded-full transition-all duration-300 ${
                  isSelected 
                    ? 'bg-brand-blue ring-2 ring-blue-100' 
                    : isAnswered 
                      ? 'bg-emerald-400' 
                      : 'bg-slate-100'
                }`}
                title={`Go to Question ${idx + 1}`}
              />
            );
          })}
        </div>
      </div>

      {/* Main Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-6"
        >
          {/* Question Tag */}
          <div className="flex justify-between items-center border-b border-slate-50 pb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span className="bg-slate-50 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-100">
              Concept: {currentQuestion.conceptMatched}
            </span>
          </div>

          {/* Question Text */}
          <h3 className="font-display font-semibold text-lg md:text-xl text-slate-800 leading-snug">
            {currentQuestion.question}
          </h3>

          {/* Option Grid */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedAnswers[currentQuestion.id] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  className={`w-full text-left p-4.5 rounded-xl border text-xs font-medium transition flex items-center justify-between group relative overflow-hidden ${
                    isSelected 
                      ? 'border-brand-blue bg-blue-50/20 text-slate-800 ring-2 ring-blue-100 font-bold' 
                      : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Option Alphabet Indicator */}
                    <div className={`w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center transition-colors ${
                      isSelected 
                        ? 'bg-brand-blue text-white' 
                        : 'bg-white border border-slate-200 text-slate-500'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span>{option}</span>
                  </div>

                  {isSelected && (
                    <div className="bg-brand-blue text-white p-1 rounded-full shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex flex-col gap-4">
        
        {errorMsg && (
          <div className="bg-amber-50 text-amber-800 text-xs font-semibold p-4 rounded-xl border border-amber-200 flex items-start gap-2.5">
            <AlertCircle className="w-4.5 h-4.5 shrink-0 text-amber-600 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 disabled:opacity-40 disabled:pointer-events-none transition bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentIndex === totalQuestions - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              id="submit-quiz-btn"
              className="bg-brand-blue text-white hover:bg-blue-600 font-bold text-xs py-3 px-6 rounded-xl transition flex items-center gap-2 shadow-lg shadow-blue-500/15 disabled:bg-blue-400"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Submitting Diagnostics...</span>
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  <span>Submit Quiz</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition rounded-xl px-5 py-2.5 shadow-md"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
