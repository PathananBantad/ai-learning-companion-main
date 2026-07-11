import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, UploadCloud, BookOpen, AlertCircle, Sparkles, 
  Plus, Trash2, CheckCircle, HelpCircle, ArrowRight, RefreshCw,
  Copy, Check, Shuffle, Key, Users
} from 'lucide-react';
import { LessonData } from '../types';

interface TeacherPortalProps {
  lesson: LessonData;
  onGenerateKnowledgeBase: (topic: string, files: string[], manualPrompt: string) => Promise<void>;
  isGenerating: boolean;
  apiKeySet: boolean;
  classCode: string;
  onGenerateClassCode: (customCode?: string) => Promise<void>;
  isGeneratingClassCode?: boolean;
}

export default function TeacherPortal({ 
  lesson, 
  onGenerateKnowledgeBase, 
  isGenerating, 
  apiKeySet,
  classCode,
  onGenerateClassCode,
  isGeneratingClassCode = false
}: TeacherPortalProps) {
  const [topicInput, setTopicInput] = useState(lesson.topic);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>(lesson.uploadedFiles);
  const [manualPrompt, setManualPrompt] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Class Code UI State
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [customCode, setCustomCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSetCustomCode = async () => {
    if (!customCode.trim()) return;
    await onGenerateClassCode(customCode.trim());
    setIsEditingCode(false);
    setCustomCode('');
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles: string[] = [];
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        newFiles.push(e.dataTransfer.files[i].name);
      }
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newFiles: string[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        newFiles.push(e.target.files[i].name);
      }
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleGenerate = async () => {
    if (!topicInput.trim()) {
      setErrorMsg('กรุณาระบุหัวข้อหรือชื่อบทเรียน');
      return;
    }
    setErrorMsg(null);
    await onGenerateKnowledgeBase(topicInput, uploadedFiles, manualPrompt);
  };

  return (
    <div className="space-y-8" id="teacher-portal">
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">ตั้งค่าบทเรียนรายสัปดาห์</span>
          <h1 className="font-display font-bold text-3xl text-slate-900 mt-1">ซิงค์หลักสูตรและฐานความรู้รายวิชา</h1>
          <p className="text-slate-500 text-sm mt-1">ตั้งค่าบทเรียนที่ใช้งานอยู่ นำเข้าไฟล์ PDF หลักสูตร และสร้างสื่อการเรียนสำหรับนักศึกษา</p>
        </div>
        
        {!apiKeySet && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 max-w-sm flex items-start gap-2.5">
            <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">โหมดสาธิตแบบออฟไลน์</span>
              ไม่พบคีย์ Gemini การสร้างเนื้อหาจะใช้หลักสูตรแบบคงที่ กรุณาเพิ่ม `GEMINI_API_KEY` ในแผงข้อมูลลับเพื่อเปิดใช้งานการสร้างเนื้อหาด้วย AI แบบสด
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Side: Setup Controls */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card: Lesson Topic */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2">
              <span className="bg-brand-blue/10 text-brand-blue p-1.5 rounded-lg text-xs">01</span>
              กำหนดหัวข้อบทเรียน
            </h2>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">หัวข้อหรือชื่อการบรรยาย</label>
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="เช่น บทนำสู่การทำ Database Normalization (1NF, 2NF, 3NF)"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-sm transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">คำสั่งพิเศษสำหรับ AI (ไม่บังคับ)</label>
              <textarea
                value={manualPrompt}
                onChange={(e) => setManualPrompt(e.target.value)}
                placeholder="เช่น เน้นอธิบายเรื่อง idempotency โดยเฉพาะ และเพิ่มความเข้าใจผิดเกี่ยวกับการที่คำขอ GET มี payload"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-sm transition resize-none"
              />
            </div>
          </div>

          {/* Card: Upload PDF */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2">
              <span className="bg-brand-blue/10 text-brand-blue p-1.5 rounded-lg text-xs">02</span>
              อัปโหลดสื่อการสอน
            </h2>
            
            {/* Drag Zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition ${
                dragActive ? 'border-brand-blue bg-blue-50/30' : 'border-slate-200 hover:border-slate-300'
              }`}
              onClick={() => document.getElementById('file-upload-input')?.click()}
            >
              <UploadCloud className="w-10 h-10 text-slate-400 mb-3" />
              <p className="text-slate-700 text-sm font-semibold">ลากและวางไฟล์ PDF ของรายวิชาที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
              <p className="text-slate-400 text-xs mt-1">รองรับไฟล์ PDF, TXT หรือ markdown (สูงสุด 10MB)</p>
              <input
                id="file-upload-input"
                type="file"
                multiple
                accept=".pdf,.txt,.md"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* List of files */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold uppercase text-slate-400">เอกสารรายวิชาที่อัปโหลดแล้ว ({uploadedFiles.length})</label>
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-2">
                  {uploadedFiles.map((filename, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                      <div className="flex items-center gap-2 text-slate-700 font-medium truncate">
                        <FileText className="w-4 h-4 text-brand-blue" />
                        <span className="truncate">{filename}</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                        className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Trigger */}
          {errorMsg && (
            <div className="bg-red-50 text-red-700 text-xs font-semibold p-3.5 rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            id="generate-kb-btn"
            className="w-full bg-brand-blue text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-blue-500/10 hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed transition"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>กำลังสร้างหลักสูตรและแบบทดสอบอัจฉริยะ...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-white/90" />
                <span>สร้างฐานความรู้</span>
              </>
            )}
          </button>

        </div>

        {/* Right Side: Status Monitor & Preview */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card: Class Code and Active Session */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-brand-blue/10 text-brand-blue p-2 rounded-xl">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-sm">รหัสเข้าชั้นเรียน</h3>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">ด่านตรวจสอบสิทธิ์นักศึกษา</p>
                </div>
              </div>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200/50 uppercase flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> ซิงค์แบบสด
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4.5 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">รหัสที่ใช้งานอยู่</span>
              <div className="flex items-center gap-3">
                <span className="font-mono font-extrabold text-2xl tracking-widest text-slate-900 bg-white px-4 py-1.5 rounded-xl border border-slate-200/80 shadow-xs">
                  {classCode}
                </span>
                
                <button
                  onClick={handleCopyCode}
                  className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 p-2.5 rounded-xl transition shadow-xs active:scale-95"
                  title="คัดลอกรหัสชั้นเรียนไปยังคลิปบอร์ด"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
                นักศึกษาจะต้องกรอกรหัสนี้เพื่อเข้าถึงหลักสูตรเฉพาะและแบบทดสอบวินิจฉัยของคุณ
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              {isEditingCode ? (
                <div className="flex w-full gap-2">
                  <input
                    type="text"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    placeholder="กรอกรหัสที่กำหนดเอง"
                    maxLength={12}
                    className="flex-grow px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800 uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-brand-blue"
                  />
                  <button
                    onClick={handleSetCustomCode}
                    className="bg-brand-blue hover:bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition"
                  >
                    บันทึก
                  </button>
                  <button
                    onClick={() => { setIsEditingCode(false); setCustomCode(''); }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-3 py-2 rounded-xl transition"
                  >
                    ยกเลิก
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => onGenerateClassCode()}
                    disabled={isGeneratingClassCode}
                    className="flex-grow bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Shuffle className="w-3.5 h-3.5 text-slate-300" />
                    <span>สร้างรหัสใหม่</span>
                  </button>
                  <button
                    onClick={() => setIsEditingCode(true)}
                    className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold py-2.5 px-3.5 rounded-xl transition shadow-xs"
                  >
                    ปรับแต่งเอง
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Status Panel */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
            <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider">สถานะฐานความรู้</h3>
            
            <div className="space-y-4">
              
              {/* Ready State */}
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-xl ${lesson.knowledgeBaseStatus === 'ready' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase text-slate-400">สถานะฐานความรู้</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">
                    {isGenerating ? 'กำลังซิงค์ AI...' : 'พร้อมใช้งานและเผยแพร่แล้ว'}
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5">เข้าถึงได้โดยนักศึกษาระดับปริญญาตรีที่ลงทะเบียนแล้ว</p>
                </div>
              </div>

              {/* Files Loaded */}
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-xl ${uploadedFiles.length > 0 ? 'bg-blue-50 text-brand-blue' : 'bg-slate-100 text-slate-400'}`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase text-slate-400">ไฟล์ที่อัปโหลดแล้ว</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">
                    ไฟล์รายวิชา {uploadedFiles.length} ไฟล์
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5">ไฟล์ PDF หลักสูตรและสไลด์ถูกโหลดเป็นข้อมูลอ้างอิงต้นทาง</p>
                </div>
              </div>

              {/* AI Status */}
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-xl ${isGenerating ? 'bg-purple-50 text-brand-purple' : 'bg-slate-100 text-slate-400'}`}>
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase text-slate-400">สถานะ AI</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">
                    {isGenerating ? 'กำลังสร้างเนื้อหา' : 'สังเคราะห์หลักสูตรแล้ว'}
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {isGenerating 
                      ? 'กำลังสร้างสรุปการเรียนและพารามิเตอร์แบบทดสอบใหม่...'
                      : 'พร้อมตอบคำถามของนักศึกษาและสร้างคำตอบติวเข้มแบบไดนามิก'
                    }
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Quick Active Lesson View */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/20 blur-2xl rounded-full" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-blue/20 blur-2xl rounded-full" />

            <div className="relative space-y-3">
              <span className="bg-white/10 text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">การบรรยายที่กำลังใช้งาน</span>
              <h4 className="font-display font-bold text-xl leading-tight text-white">{lesson.topic}</h4>
              <p className="text-slate-300 text-xs leading-relaxed">{lesson.summary}</p>
              
              <div className="border-t border-white/10 pt-3 flex items-center justify-between text-xs text-slate-400">
                <span>ผลลัพธ์การเรียนรู้: {lesson.learningOutcomes.length}</span>
                <span>แนวคิดที่จับคู่แล้ว: {lesson.keyConcepts.length}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Preview Section of Generated Content */}
      <AnimatePresence mode="wait">
        {!isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid md:grid-cols-3 gap-6 pt-4"
          >
            {/* Column 1: Outcomes */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                ผลลัพธ์การเรียนรู้
              </h3>
              <ul className="space-y-3">
                {lesson.learningOutcomes.map((outcome, i) => (
                  <li key={i} className="text-slate-600 text-xs flex items-start gap-2.5 leading-relaxed font-medium">
                    <span className="text-slate-400 shrink-0 mt-0.5 font-bold">{i+1}.</span>
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Key Concepts */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-purple" />
                แนวคิดสำคัญ
              </h3>
              <div className="space-y-4">
                {lesson.keyConcepts.map((concept, i) => (
                  <div key={i} className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-800">{concept.title}</h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed">{concept.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Misconceptions */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                ความเข้าใจผิดที่พบบ่อย
              </h3>
              <div className="space-y-4">
                {lesson.commonMisconceptions.map((mis, i) => (
                  <div key={i} className="bg-amber-50/50 p-3 rounded-xl border border-amber-100 space-y-1">
                    <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      {mis.title}
                    </h4>
                    <p className="text-amber-800 text-[11px] leading-relaxed">{mis.explanation}</p>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
