import React from 'react';
import { motion } from 'motion/react';
import {
  MessageSquareText, RefreshCw, UserCircle2, EyeOff, Clock, Inbox
} from 'lucide-react';
import { CourseFeedback } from '../types';

interface StudentCommentsProps {
  feedbackList: CourseFeedback[];
  isLoading: boolean;
  onRefresh: () => void;
  pastClasses?: { class_code: string, class_name: string, created_at: string }[];
  viewedClassCode?: string;
  onSelectClass?: (code: string) => void;
}

export default function StudentComments({
  feedbackList,
  isLoading,
  onRefresh,
  pastClasses,
  viewedClassCode,
  onSelectClass
}: StudentCommentsProps) {

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString('th-TH', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" id="student-comments">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">ความคิดเห็นจากนักศึกษา</span>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-1">
            <h1 className="font-display font-bold text-3xl text-slate-900">รวมความคิดเห็นเกี่ยวกับรายวิชา</h1>

            {pastClasses && pastClasses.length > 0 && onSelectClass && (
              <select
                value={viewedClassCode || ''}
                onChange={(e) => onSelectClass(e.target.value)}
                className="bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl focus:ring-brand-blue focus:border-brand-blue block p-2.5 shadow-sm min-w-[200px]"
              >
                {pastClasses.map(c => (
                  <option key={c.class_code} value={c.class_code}>
                    {c.class_code} - {c.class_name} ({new Date(c.created_at).toLocaleDateString()})
                  </option>
                ))}
              </select>
            )}
          </div>
          <p className="text-slate-500 text-sm mt-1">อ่านความคิดเห็นและข้อเสนอแนะจากนักศึกษาเพื่อนำไปปรับปรุงการเรียนการสอน</p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition flex items-center gap-2 shadow-sm shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>รีเฟรช</span>
        </button>
      </div>

      {/* Summary card */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3 w-fit">
        <MessageSquareText className="w-5 h-5 text-slate-400 shrink-0" />
        <div>
          <div className="text-[10px] text-slate-400 font-bold uppercase">จำนวนความคิดเห็นทั้งหมด</div>
          <div className="text-base font-extrabold text-slate-800">{feedbackList.length} รายการ</div>
        </div>
      </div>

      {/* Comments list */}
      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-brand-blue" />
          <p className="text-slate-400 text-sm font-semibold">กำลังโหลดความคิดเห็น...</p>
        </div>
      ) : feedbackList.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-sm flex flex-col items-center justify-center text-center gap-3">
          <div className="bg-slate-50 text-slate-300 p-4 rounded-2xl">
            <Inbox className="w-8 h-8" />
          </div>
          <h3 className="font-display font-bold text-base text-slate-700">ยังไม่มีความคิดเห็นจากนักศึกษา</h3>
          <p className="text-slate-400 text-xs max-w-sm">เมื่อนักศึกษาส่งความคิดเห็นเกี่ยวกับรายวิชา ความคิดเห็นเหล่านั้นจะปรากฏที่นี่</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {feedbackList.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.03, 0.3) }}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <p className="text-slate-700 text-sm leading-relaxed">{item.comment}</p>

              <div className="flex items-center justify-between pt-3 border-t border-slate-50 text-xs">
                <div className="flex items-center gap-1.5 font-semibold">
                  {item.is_anonymous || !item.student_name ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-500">ไม่ประสงค์ออกนาม</span>
                    </>
                  ) : (
                    <>
                      <UserCircle2 className="w-3.5 h-3.5 text-brand-blue" />
                      <span className="text-slate-700">{item.student_name}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(item.created_at)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

    </div>
  );
}
