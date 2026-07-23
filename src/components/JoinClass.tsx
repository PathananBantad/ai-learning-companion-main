import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Sparkles, ArrowRight, ArrowLeft, Key, HelpCircle, CheckCircle2, AlertCircle } from 'lucide-react';

interface JoinClassProps {
  onJoinSuccess: (classCode: string, studentInfo: { studentId: string; studentName: string }) => void;
  onBackToLanding: () => void;
}

export default function JoinClass({ onJoinSuccess, onBackToLanding }: JoinClassProps) {
  const [code, setCode] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [classInfo, setClassInfo] = useState<{ topic?: string } | null>(null);

  // Quick verify handler
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setErrorMsg('กรุณากรอกชื่อ-นามสกุลของคุณ');
      return;
    }
    if (!studentId.trim()) {
      setErrorMsg('กรุณากรอกรหัสนักศึกษา');
      return;
    }
    if (!code.trim()) {
      setErrorMsg('กรุณากรอกรหัสเข้าชั้นเรียน');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/class/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          studentId: studentId.trim(),
          name: studentName.trim()
        })
      });

      if (!res.ok) {
        throw new Error('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
      }

      const data = await res.json();
      if (data.success) {
        onJoinSuccess(code.trim().toUpperCase(), {
          studentId: studentId.trim(),
          studentName: studentName.trim()
        });
      } else {
        setErrorMsg('รหัสชั้นเรียนไม่ถูกต้อง กรุณาตรวจสอบกับอาจารย์ผู้สอน');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between" id="join-class-screen">
      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <button
          onClick={onBackToLanding}
          className="flex items-center gap-2 group text-left"
        >
          <div className="bg-slate-100 group-hover:bg-slate-200 p-2 rounded-xl text-slate-600 transition">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <div>
            <span className="font-display font-bold text-sm tracking-tight text-slate-800 block leading-tight">
              กลับหน้าหลัก
            </span>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <div className="bg-brand-blue/10 p-1.5 rounded-lg text-brand-blue">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ระบบเชื่อมต่อชั้นเรียน</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto w-full px-6 py-12 flex-grow flex flex-col justify-center">
        
        {/* Card wrapper */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl space-y-6"
        >
          {/* Top visual circle */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
              <Key className="w-8 h-8" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center space-y-1.5">
            <h1 className="font-display font-extrabold text-2xl text-slate-900 tracking-tight">เข้าร่วมชั้นเรียน</h1>
            <p className="text-slate-500 text-xs font-medium max-w-xs mx-auto leading-relaxed">
            กรอกรหัสชั้นเรียนที่อาจารย์สร้างขึ้น เพื่อเข้าเรียน เข้าถึงเครื่องมือ AI และทำแบบทดสอบของบทเรียนนี้
            </p>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label htmlFor="student-name-input" className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">
                ชื่อ-นามสกุล
              </label>
              <input
                id="student-name-input"
                type="text"
                placeholder="เช่น สมชาย ใจดี"
                value={studentName}
                onChange={(e) => {
                  setStudentName(e.target.value);
                  setErrorMsg(null);
                }}
                autoFocus
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition"
              />
            </div>

            <div>
              <label htmlFor="student-id-input" className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">
                รหัสนักศึกษา
              </label>
              <input
                id="student-id-input"
                type="text"
                placeholder="เช่น 6512345678"
                value={studentId}
                onChange={(e) => {
                  setStudentId(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition"
              />
            </div>

            <div>
              <label htmlFor="class-code-input" className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">
                รหัสชั้นเรียน
              </label>
              <div className="relative">
                <input
                  id="class-code-input"
                  type="text"
                  placeholder="ตัวอย่าง: AEG-5921 หรือ AEGIS101"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setErrorMsg(null);
                  }}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-center font-mono font-bold text-lg text-slate-800 placeholder:font-sans placeholder:text-sm placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-brand-blue/50 uppercase tracking-widest transition"
                />
              </div>
            </div>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-100 text-red-700 text-xs font-semibold p-3.5 rounded-xl flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full bg-brand-blue hover:bg-blue-600 text-white font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/15 transition-all duration-150 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>กำลังตรวจสอบรหัส...</span>
                </>
              ) : (
                <>
                  <span>ยืนยันและเข้าสู่บทเรียน</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Info/Help footer inside card */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-xs text-slate-500 leading-relaxed flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-700 block mb-0.5">ยังไม่มีรหัสชั้นเรียน?</span>
              อาจารย์สามารถสร้างชั้นเรียนและสร้างรหัสได้จากระบบผู้สอน <strong className="text-slate-800">ระบบผู้สอน</strong> กรุณาติดต่ออาจารย์เพื่อขอรหัสของบทเรียนที่กำลังเปิดสอน
            </div>
          </div>

        </motion.div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-6 text-center text-slate-400 text-xs font-medium">
        <p>© 2569 ระบบผู้ช่วยการเรียนรู้ด้วย AI สำหรับนักศึกษา</p>
      </footer>
    </div>
  );
}
