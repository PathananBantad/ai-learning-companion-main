import React from 'react';
import { motion } from 'motion/react';
import { GraduationCap, BookOpen, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';

interface LandingPageProps {
  onSelectRole: (role: 'student' | 'teacher') => void;
}

export default function LandingPage({ onSelectRole }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between" id="landing-page">
      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-brand-blue/10 p-2 rounded-xl text-brand-blue">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-slate-900">
            Aegis Academic
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
          <span>University Portal</span>
          <span className="text-slate-300">|</span>
          <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> AI Engine Online
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full px-6 py-12 md:py-20 grid md:grid-cols-12 gap-12 items-center flex-grow">
        {/* Left Column: Copy & Actions */}
        <div className="md:col-span-6 flex flex-col justify-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-1.5 bg-brand-blue/10 text-brand-blue px-3 py-1 rounded-full text-xs font-medium tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" /> Next-Gen AI Learning
            </div>
            
            <h1 className="font-display font-bold text-5xl md:text-6xl tracking-tight text-slate-900 leading-[1.1]">
              AI Learning <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">
                Companion
              </span>
            </h1>

            <p className="text-lg text-slate-600 max-w-lg leading-relaxed font-sans font-medium">
              Helping Students Learn Better.<br />
              Helping Teachers Teach Smarter.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button
              onClick={() => onSelectRole('teacher')}
              id="continue-teacher-btn"
              className="flex-1 bg-slate-900 text-white hover:bg-slate-800 transition-all font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 active:scale-[0.98]"
            >
              <GraduationCap className="w-5 h-5" />
              <span>Continue as Teacher</span>
              <ArrowRight className="w-4 h-4 ml-1 opacity-70" />
            </button>

            <button
              onClick={() => onSelectRole('student')}
              id="continue-student-btn"
              className="flex-1 bg-white text-slate-900 hover:bg-slate-50 border border-slate-200 transition-all font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              <BookOpen className="w-5 h-5 text-brand-blue" />
              <span>Continue as Student</span>
              <ArrowRight className="w-4 h-4 ml-1 opacity-70 text-slate-400" />
            </button>
          </motion.div>

          {/* Quick Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-4 text-xs font-semibold text-slate-500"
          >
            <div>
              <span className="block text-slate-900 text-sm font-bold mb-1">Knowledge Sync</span>
              Upload PDFs and generate custom interactive lessons instantly.
            </div>
            <div>
              <span className="block text-slate-900 text-sm font-bold mb-1">Personalized Feedbacks</span>
              Instant smart evaluation of strength, weakness, and misconceptions.
            </div>
          </motion.div>
        </div>

        {/* Right Column: Illustration Mockup */}
        <div className="md:col-span-6 flex justify-center items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative w-full aspect-video md:aspect-[4/3] rounded-3xl overflow-hidden bg-white shadow-2xl shadow-slate-200 border border-slate-100 flex items-center justify-center p-2"
          >
            <img
              src="/src/assets/images/ai_learning_illustration_1783089221326.jpg"
              alt="AI Learning Companion Dashboard"
              className="w-full h-full object-cover rounded-2xl"
              referrerPolicy="no-referrer"
            />
            {/* Soft decorative floaters */}
            <div className="absolute top-6 left-6 bg-white/95 backdrop-blur shadow-lg rounded-2xl p-3 border border-slate-100/50 flex items-center gap-2.5 animate-bounce [animation-duration:6s]">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-slate-700">Student Progress: 82%</span>
            </div>
            <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur shadow-lg rounded-2xl p-3 border border-slate-100/50 flex items-center gap-2.5 animate-bounce [animation-duration:8s]">
              <Sparkles className="w-4 h-4 text-brand-purple" />
              <span className="text-xs font-bold text-slate-700">AI Tutor: Active</span>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-medium">
        <p>© 2026 Aegis Academic AI. Designed for university instructors and undergraduate courses.</p>
        <div className="flex gap-4 mt-2 sm:mt-0">
          <a href="#terms" className="hover:text-slate-600 transition">Academic Policy</a>
          <span>•</span>
          <a href="#privacy" className="hover:text-slate-600 transition">Data Privacy</a>
        </div>
      </footer>
    </div>
  );
}
