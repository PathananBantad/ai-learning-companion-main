import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, GraduationCap, CheckCircle, ArrowRight, MessageSquare, 
  HelpCircle, BookOpen, Clock, RefreshCw, PenSquare, EyeOff, Send
} from 'lucide-react';
import { LessonData, QuizAttempt } from '../types';

interface StudentDashboardProps {
  lesson: LessonData;
  quizAttempt: QuizAttempt | null;
  onNavigate: (view: 'dashboard' | 'chat' | 'quiz' | 'feedback') => void;
  recentActivity: string[];
  onSubmitCourseFeedback: (comment: string, isAnonymous: boolean) => Promise<boolean>;
  isSubmittingFeedback: boolean;
}

export default function StudentDashboard({ lesson, quizAttempt, onNavigate, recentActivity, onSubmitCourseFeedback, isSubmittingFeedback }: StudentDashboardProps) {
  // Compute progress based on whether quiz is taken and activities completed
  const quizScore = quizAttempt ? quizAttempt.score : 0;
  const progressPercent = quizAttempt ? 100 : 35;

  // Course comment form state
  const [commentText, setCommentText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    const success = await onSubmitCourseFeedback(commentText.trim(), isAnonymous);
    if (success) {
      setCommentText('');
      setIsAnonymous(false);
      setFeedbackSent(true);
      setTimeout(() => setFeedbackSent(false), 3000);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" id="student-dashboard">
      
      {/* Welcome Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-blue/5 to-brand-purple/5 blur-3xl rounded-full -z-10" />
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1 bg-blue-50 text-brand-blue px-2.5 py-1 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> พอร์ทัลนักศึกษามหาวิทยาลัย
          </div>
          <h1 className="font-display font-bold text-3xl text-slate-900">
            ยินดีต้อนรับกลับสู่ผู้ช่วยการเรียนของคุณ
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            ผู้สอนของคุณได้โหลดฐานความรู้เฉพาะของสัปดาห์นี้แล้ว ถามคำถาม ทำแบบทดสอบเฉพาะบุคคล และแก้ไขความเข้าใจผิดด้วยผลตอบรับทันที
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shrink-0 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold text-lg">
            A+
          </div>
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase">ความคืบหน้าวันนี้</div>
            <div className="text-lg font-bold text-slate-800">เสร็จสมบูรณ์ {progressPercent}%</div>
          </div>
        </div>
      </div>

      {/* Today's Lesson Topic card */}
      <div className="grid md:grid-cols-12 gap-8">
        
        {/* Lesson Overview */}
        <div className="md:col-span-8 bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">จุดเน้นการบรรยายวันนี้</span>
            <h2 className="font-display font-bold text-2xl text-slate-900">{lesson.topic}</h2>
            <p className="text-slate-600 text-sm leading-relaxed">{lesson.summary}</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
              <span>เป้าหมายผลลัพธ์การเรียนรู้</span>
              <span>เชี่ยวชาญ {progressPercent}%</span>
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
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">ผลลัพธ์การเรียนรู้ที่สำคัญ</h3>
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
            <span className="bg-white/10 text-slate-200 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">แบบทดสอบตามหลักสูตร</span>
            <h3 className="font-display font-bold text-xl leading-snug">ทดสอบความรู้ของคุณ</h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              ทำแบบทดสอบที่สร้างโดย AI เพื่อวัดความเข้าใจของคุณ คะแนนของคุณจะอัปเดตแดชบอร์ดของชั้นเรียนโดยอัตโนมัติ
            </p>
          </div>

          <div className="pt-6 relative">
            {quizAttempt ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">คะแนนครั้งก่อน</span>
                  <span className={`font-bold ${quizScore >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>{quizScore}%</span>
                </div>
                <button
                  onClick={() => onNavigate('feedback')}
                  className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <span>ดูรายละเอียดผลตอบรับ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('quiz')}
                id="start-practice-quiz-btn"
                className="w-full bg-brand-blue hover:bg-blue-600 text-white text-xs font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <span>เริ่มทำแบบทดสอบฝึกหัด</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Three Large Action Cards */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">เครื่องมือการเรียน</h3>
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
              <h4 className="font-display font-bold text-base text-slate-800">ถามผู้ช่วย AI</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                ไขข้อสงสัย ขอตัวอย่างเปรียบเทียบ และทำความเข้าใจศัพท์ยากให้ง่ายขึ้น
              </p>
            </div>
            <div className="text-xs font-bold text-brand-blue flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>เริ่มการสนทนา</span>
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
              <h4 className="font-display font-bold text-base text-slate-800">แบบทดสอบฝึกหัด</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                ทำแบบทดสอบเชิงโต้ตอบตามหลักสูตรเพื่อติดตามความเข้าใจผิด
              </p>
            </div>
            <div className="text-xs font-bold text-brand-blue flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>{quizAttempt ? 'ทำแบบทดสอบอีกครั้ง' : 'ทำแบบทดสอบฝึกหัด'}</span>
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
              <h4 className="font-display font-bold text-base text-slate-800">สรุปทบทวน</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                อ่านภาพรวมสรุปหัวข้อหลักของรายวิชาที่สร้างจากไฟล์ PDF หลักสูตร
              </p>
            </div>
            <div className="text-xs font-bold text-brand-blue flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>สร้างสรุป</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          กิจกรรมล่าสุด
        </h3>
        
        <div className="space-y-3.5">
          {recentActivity.length === 0 ? (
            <p className="text-slate-400 text-xs">ยังไม่มีกิจกรรมการเรียนล่าสุด คลิก "เริ่มทำแบบทดสอบฝึกหัด" เพื่อเริ่มต้น!</p>
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

      {/* Course Comment Box */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4" id="course-comment-box">
        <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <PenSquare className="w-4 h-4 text-slate-400" />
          แสดงความคิดเห็นเกี่ยวกับรายวิชา
        </h3>
        <p className="text-slate-500 text-xs -mt-2">ความคิดเห็นของคุณจะถูกส่งให้ผู้สอนเห็นเพื่อนำไปปรับปรุงการเรียนการสอน</p>

        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="เช่น อยากให้อธิบายหัวข้อนี้ช้าลงอีกนิด หรือ ชอบตัวอย่างในคาบเรียนนี้มาก..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-sm transition resize-none"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue/50"
            />
            <EyeOff className="w-3.5 h-3.5 text-slate-400" />
            <span>โพสต์แบบไม่ระบุตัวตน (นิรนาม)</span>
          </label>

          <div className="flex items-center gap-3">
            {feedbackSent && (
              <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> ส่งความคิดเห็นแล้ว
              </span>
            )}
            <button
              onClick={handleSubmitComment}
              disabled={!commentText.trim() || isSubmittingFeedback}
              className="bg-brand-blue hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              {isSubmittingFeedback ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>ส่งความคิดเห็น</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
