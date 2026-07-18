import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import {
  TrendingUp, Users, Award, AlertCircle, Sparkles, BookOpen,
  HelpCircle, Lightbulb, Compass, BarChart2, RefreshCw,
  Search, Eye, X, ChevronRight, CheckCircle2, Calendar,
  Activity, Brain, FileText, Target, Zap
} from 'lucide-react';
import { AnalyticsData, StudentAnalytics } from '../types';
import StudentReportView from './StudentReportView';

interface TeacherDashboardProps {
  analytics: AnalyticsData;
  isGeneratingInsight: boolean;
  apiKeySet: boolean;
  onRefreshInsight?: () => void;
  pastClasses?: { class_code: string, class_name: string, created_at: string }[];
  viewedClassCode?: string;
  onSelectClass?: (code: string) => void;
}


export default function TeacherDashboard({ analytics, isGeneratingInsight, apiKeySet, onRefreshInsight, pastClasses, viewedClassCode, onSelectClass }: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'students'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentAnalytics | null>(null);

  if (selectedStudent) {
    return (
      <StudentReportView
        student={selectedStudent}
        onBack={() => setSelectedStudent(null)}
      />
    );
  }


  // Color palette constants for charts
  const COLORS = ['#3b82f6', '#a855f7', '#10b981', '#f59e0b', '#ef4444'];

  const commonMisconceptions = analytics?.commonMisconceptions ?? [];
  const outcomeAchievement = analytics?.outcomeAchievement ?? [];
  const weeklyTrend = analytics?.weeklyTrend ?? [];
  const students = analytics?.students ?? [];

  // format data for the Pie Chart (Misconceptions triggered)
  const pieData = commonMisconceptions.map((item, idx) => ({
    name: item.topic,
    value: item.count || (18 - idx * 6),
  }));

  return (
    <div className="space-y-8 animate-fade-in" id="teacher-dashboard">

      {/* Upper Headers */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">แดชบอร์ดผู้สอน</span>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-1">
            <h1 className="font-display font-bold text-3xl text-slate-900">สรุปผลการวิเคราะห์ชั้นเรียน</h1>

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
          <p className="text-slate-500 text-sm mt-1">ติดตามผลการเรียนของนักศึกษา วิเคราะห์แนวโน้ม และตรวจสอบความเข้าใจที่คลาดเคลื่อน</p>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3">
          <Users className="w-5 h-5 text-slate-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">จำนวนนักศึกษาที่ส่งแบบทดสอบ</div>
            <div className="text-base font-extrabold text-slate-800">{analytics.studentSubmissionsCount} คน</div>
          </div>
        </div>
      </div>

      {/* Premium Tab Selector */}
      <div className="flex border-b border-slate-200 gap-2" id="teacher-dashboard-tabs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-6 py-3.5 border-b-2 font-display font-bold text-sm transition-all duration-200 ${activeTab === 'overview'
            ? 'border-brand-blue text-brand-blue bg-blue-50/10'
            : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
            }`}
          id="tab-class-overview"
        >
          <BarChart2 className="w-4 h-4" />
          <span>ภาพรวมชั้นเรียน</span>
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-6 py-3.5 border-b-2 font-display font-bold text-sm transition-all duration-200 ${activeTab === 'students'
            ? 'border-brand-blue text-brand-blue bg-blue-50/10'
            : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
            }`}
          id="tab-individual-students"
        >
          <Users className="w-4 h-4" />
          <span>นักศึกษารายบุคคล</span>
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          {/* Analytics Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Card: Average Score */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-2 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">คะแนนเฉลี่ย</span>
                <div className="bg-blue-50 text-brand-blue p-1.5 rounded-lg">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-slate-800">{analytics.averageScore}%</div>
                <span className="text-[10px] text-slate-400 font-semibold mt-1 block">จากคะแนนเต็ม 100</span>
              </div>
            </div>

            {/* Card: Learning Outcome Achievement */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-2 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">ความเชี่ยวชาญตามผลลัพธ์</span>
                <div className="bg-purple-50 text-brand-purple p-1.5 rounded-lg">
                  <Compass className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-slate-800">
                  {outcomeAchievement.length > 0
                    ? Math.round(outcomeAchievement.reduce((acc, c) => acc + c.score, 0) / analytics.outcomeAchievement.length)
                    : 0
                  }%
                </div>
                <span className="text-[10px] text-slate-400 font-semibold mt-1 block">ดัชนีความเข้าใจของชั้นเรียน</span>
              </div>
            </div>

            {/* Card: Most Incorrect Topic */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-2 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">จุดบกพร่องแนวคิดสำคัญ</span>
                <div className="bg-red-50 text-red-500 p-1.5 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-base font-extrabold text-slate-800 truncate" title={analytics.mostIncorrectTopic}>
                  {analytics.mostIncorrectTopic}
                </div>
                <span className="text-[10px] text-red-500 font-semibold mt-1 block">ต้องทบทวนในการบรรยายครั้งถัดไป</span>
              </div>
            </div>

            {/* Card: Active Misconceptions Count */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-2 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">ความเข้าใจผิดที่บันทึกไว้</span>
                <div className="bg-amber-50 text-amber-500 p-1.5 rounded-lg">
                  <Lightbulb className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-slate-800">
                  {commonMisconceptions.reduce((acc, val) => acc + (val.count || 0), 0)}
                </div>
                <span className="text-[10px] text-slate-400 font-semibold mt-1 block">นักศึกษาที่ถูกระบุเป็นกลุ่มเป้าหมาย</span>
              </div>
            </div>

          </div>

          {/* AI Recommendation Insights Card */}
          <div className="bg-white rounded-3xl p-6 border border-brand-purple/20 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/5 blur-2xl rounded-full" />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-brand-purple/10 text-brand-purple p-2 rounded-xl">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-slate-800 text-sm">ข้อมูลเชิงลึกจากผู้ช่วยอาจารย์ (AI)</h3>
                    <p className="text-[10px] text-slate-400 font-semibold">ที่ปรึกษาด้านวิชาการ Gemini</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onRefreshInsight && (
                    <button
                      onClick={onRefreshInsight}
                      disabled={isGeneratingInsight}
                      className="bg-brand-purple/10 hover:bg-brand-purple/20 text-brand-purple text-xs font-bold py-1.5 px-3 rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
                      title="สร้างคำแนะนำ AI ใหม่"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingInsight ? 'animate-spin' : ''}`} />
                      <span>สร้างใหม่</span>
                    </button>
                  )}
                  {!apiKeySet && (
                    <span className="bg-amber-50 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded border border-amber-200 uppercase">
                      ข้อมูลตัวอย่าง (Demo)
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-4.5 rounded-2xl">
                {isGeneratingInsight ? (
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                    <RefreshCw className="w-4 h-4 animate-spin text-brand-purple" />
                    <span>กำลังสร้างคำแนะนำหลักสูตรเฉพาะบุคคล...</span>
                  </div>
                ) : (
                  <p className="text-slate-700 text-xs leading-relaxed font-semibold">
                    "{analytics.aiInsight}"
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Charts section using Recharts */}
          <div className="grid lg:grid-cols-12 gap-8">

            {/* Bar Chart: Learning Outcome Achievement */}
            <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-slate-400" />
                ดัชนีความสำเร็จตามผลลัพธ์การเรียนรู้
              </h3>

              <div className="w-full h-64 text-xs font-semibold">
                {analytics.outcomeAchievement.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400">ยังไม่มีการส่งแบบทดสอบ</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.outcomeAchievement} margin={{ left: -20, right: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fill: '#64748b' }} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b' }} tickLine={false} unit="%" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                        cursor={{ fill: '#f8fafc' }}
                      />
                      <Bar dataKey="score" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                        {outcomeAchievement.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#a855f7'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Pie Chart: Common Misconceptions Ratio */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
              <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-slate-400" />
                ความเข้าใจผิดที่พบบ่อย
              </h3>

              <div className="w-full h-48 text-xs font-semibold relative flex items-center justify-center">
                {pieData.length === 0 ? (
                  <div className="text-slate-400">ไม่มีข้อมูล</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Pie Legends */}
              <div className="space-y-2.5 pt-4 border-t border-slate-50 text-[10px] font-semibold text-slate-500">
                {pieData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate max-w-[80%]">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="truncate text-slate-700" title={item.name}>{item.name}</span>
                    </div>
                    <span className="font-extrabold text-slate-900 shrink-0">{item.value} คน</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Line Chart: Weekly Engagement & Performance Trend */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-400" />
              แนวโน้มการมีส่วนร่วมและผลการเรียนรายสัปดาห์
            </h3>

            <div className="w-full h-64 text-xs font-semibold">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrend} margin={{ left: -20, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: '#64748b' }} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b' }} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Line
                    name="คะแนนเฉลี่ย (%)"
                    type="monotone"
                    dataKey="averageScore"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    name="นักศึกษาที่ใช้งานอยู่"
                    type="monotone"
                    dataKey="activeStudents"
                    stroke="#a855f7"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="space-y-8 animate-fade-in">
          {/* Student Performance Section */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6" id="student-performance-section">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-blue" />
                  การวิเคราะห์ผลการเรียนและความก้าวหน้าของนักศึกษา
                </h3>
                <p className="text-xs text-slate-500 mt-1">ติดตามผลแบบทดสอบ ช่องว่างการเรียนรู้ และการแทรกแซงของ AI สำหรับนักศึกษารายบุคคล</p>
              </div>

              {/* Search bar */}
              <div className="relative w-full sm:w-72">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </span>
                <input
                  type="text"
                  placeholder="ค้นหาด้วยรหัส ชื่อ จุดแข็ง..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition bg-slate-50/50 text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Search Results Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="py-3.5 px-4">รหัส/ชื่อนักศึกษา</th>
                    <th className="py-3.5 px-4 text-center">คะแนนแบบทดสอบ</th>
                    <th className="py-3.5 px-4">ความก้าวหน้าในการเรียน</th>
                    <th className="py-3.5 px-4 hidden md:table-cell">จุดแข็ง</th>
                    <th className="py-3.5 px-4 hidden lg:table-cell">จุดบกพร่องที่พบบ่อย</th>
                    <th className="py-3.5 px-4">กิจกรรมล่าสุด</th>
                    <th className="py-3.5 px-4 text-right">รายละเอียด</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {(() => {
                    const studentList = students || [];

                    const filtered = studentList.filter(student =>
                      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      student.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      student.strengths.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
                      student.weaknesses.some(w => w.toLowerCase().includes(searchQuery.toLowerCase()))
                    );

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-slate-400 font-medium">
                            ไม่พบข้อมูลนักศึกษาที่ตรงกับคำค้นหาของคุณ
                          </td>
                        </tr>
                      );
                    }

                    return filtered.map((student) => {
                      const scoreColor = student.quizScore >= 85
                        ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                        : student.quizScore >= 70
                          ? 'text-blue-600 bg-blue-50 border-blue-100'
                          : 'text-rose-600 bg-rose-50 border-rose-100';

                      return (
                        <tr key={student.student_id} className="hover:bg-slate-50/50 transition">
                          {/* ID / Name */}
                          <td className="py-4 px-4">
                            <div className="font-semibold text-slate-800">{student.name}</div>
                            <div className="font-mono text-[10px] text-slate-400 mt-0.5">{student.student_id}</div>
                          </td>
                          {/* Quiz Score */}
                          <td className="py-4 px-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${scoreColor}`}>
                              {student.quizScore}%
                            </span>
                          </td>
                          {/* Learning Progress */}
                          <td className="py-4 px-4">
                            <div className="w-full max-w-[120px] space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                                <span>{student.learningProgress}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-brand-blue rounded-full transition-all duration-500"
                                  style={{ width: `${student.learningProgress}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          {/* Strengths */}
                          <td className="py-4 px-4 hidden md:table-cell">
                            <div className="flex flex-wrap gap-1 max-w-[160px]">
                              {student.strengths[0] === "None" ? (
                                <span className="text-slate-400 italic text-[10px]">ไม่มี</span>
                              ) : (
                                student.strengths.slice(0, 1).map((s, idx) => (
                                  <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-md truncate max-w-full">
                                    {s}
                                  </span>
                                ))
                              )}
                              {student.strengths.length > 1 && (
                                <span className="text-[9px] text-slate-400 font-bold self-center">อีก {student.strengths.length - 1} รายการ</span>
                              )}
                            </div>
                          </td>
                          {/* Weaknesses / Common Gaps */}
                          <td className="py-4 px-4 hidden lg:table-cell">
                            <div className="flex flex-wrap gap-1 max-w-[160px]">
                              {student.weaknesses[0] === "None" || student.weaknesses.length === 0 ? (
                                <span className="text-emerald-600 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-md">ไม่พบปัญหา</span>
                              ) : (
                                student.weaknesses.slice(0, 1).map((w, idx) => (
                                  <span key={idx} className="bg-rose-50 text-rose-600 text-[10px] font-semibold px-2 py-0.5 rounded-md truncate max-w-full">
                                    {w}
                                  </span>
                                ))
                              )}
                              {student.weaknesses.length > 1 && student.weaknesses[0] !== "None" && (
                                <span className="text-[9px] text-slate-400 font-bold self-center">อีก {student.weaknesses.length - 1} รายการ</span>
                              )}
                            </div>
                          </td>
                          {/* Last Activity */}
                          <td className="py-4 px-4 text-slate-500 text-[11px] font-medium whitespace-nowrap">
                            {student.lastActivity}
                          </td>
                          {/* Details Trigger */}
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => setSelectedStudent(student)}
                              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-brand-blue text-white hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition duration-150"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>ดูรายละเอียด</span>
                            </button>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Student Diagnostic details */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col relative"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center font-display text-sm">
                    {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-display font-extrabold text-slate-800 text-base">{selectedStudent.name}</h4>
                    <span className="font-mono text-xs text-slate-400 block mt-0.5">รหัสนักศึกษา: {selectedStudent.student_id}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">

                {/* Score & Progress Grid Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Quiz Score Card */}
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ผลคะแนนแบบทดสอบ</span>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-extrabold text-slate-900">{selectedStudent.quizScore}%</span>
                      <span className="text-xs text-slate-400 font-semibold">/ 100</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">ผลลัพธ์แบบทดสอบตามหลักสูตร</span>
                  </div>

                  {/* Learning Progress Card */}
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ความก้าวหน้าโดยรวม</span>
                    <div className="mt-2 space-y-1">
                      <div className="text-xl font-extrabold text-slate-800">เสร็จสมบูรณ์ {selectedStudent.learningProgress}%</div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-blue rounded-full"
                          style={{ width: `${selectedStudent.learningProgress}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">ดัชนีหลักสูตรรายวิชา</span>
                  </div>

                  {/* Last Activity Card */}
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">กิจกรรมล่าสุด</span>
                    <div className="flex items-center gap-1.5 mt-2 text-slate-800">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-semibold text-xs leading-snug">{selectedStudent.lastActivity}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">ติดตามการมีส่วนร่วมแบบเรียลไทม์</span>
                  </div>
                </div>

                {/* Section: Learning Outcome Achievement */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-brand-blue shrink-0" />
                    <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">ผลสัมฤทธิ์ตามผลลัพธ์การเรียนรู้</h5>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3.5">
                    {selectedStudent.learningOutcomeAchievement.map((outcome, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span className="truncate max-w-[85%]">{outcome.name}</span>
                          <span className="font-extrabold">{outcome.score}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${outcome.score >= 85 ? 'bg-emerald-500' : outcome.score >= 65 ? 'bg-blue-500' : 'bg-rose-500'}`}
                            style={{ width: `${outcome.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strengths, Weaknesses, and Misconceptions Profile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="bg-white border border-slate-200/60 p-4 rounded-2xl space-y-2.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> จุดแข็งที่ยืนยันแล้ว
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedStudent.strengths.map((s, idx) => (
                        <span key={idx} className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-100">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Weaknesses / Knowledge Gaps */}
                  <div className="bg-white border border-slate-200/60 p-4 rounded-2xl space-y-2.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-rose-500 shrink-0" /> ช่องว่างความรู้เป้าหมาย
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedStudent.weaknesses.map((w, idx) => (
                        <span key={idx} className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${w === "None" ? 'bg-slate-50 text-slate-500 border-slate-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Common Misconceptions panel */}
                {selectedStudent.commonMisconceptions && selectedStudent.commonMisconceptions.length > 0 && (
                  <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-4.5 space-y-2">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" /> ความเข้าใจผิดเชิงระบบที่พบ
                    </span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {selectedStudent.commonMisconceptions.map((m, idx) => (
                        <span key={idx} className={`text-xs font-bold px-2.5 py-1 rounded-lg ${m === "None" ? 'bg-slate-100 text-slate-500' : 'bg-amber-50 text-amber-800 border border-amber-200/50'}`}>
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI-Generated Feedback Card */}
                <div className="bg-brand-purple/5 border border-brand-purple/20 rounded-2xl p-5 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-brand-purple/10 blur-xl rounded-full" />
                  <div className="flex items-center gap-1.5 relative">
                    <Sparkles className="w-4 h-4 text-brand-purple shrink-0 animate-pulse" />
                    <span className="text-[10px] font-bold text-brand-purple uppercase tracking-wider">สรุปผลตอบรับจาก AI</span>
                  </div>
                  <p className="text-slate-700 text-xs leading-relaxed font-semibold relative">
                    "{selectedStudent.aiFeedbackSummary}"
                  </p>
                </div>

                {/* หัวข้อที่แนะนำให้ทบทวน */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-brand-blue shrink-0" /> หัวข้อที่แนะนำให้ทบทวน
                  </span>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                    <ul className="space-y-2 text-xs font-semibold text-slate-700">
                      {selectedStudent.recommendedTopics.map((topic, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className="bg-brand-blue/10 text-brand-blue p-0.5 rounded-full shrink-0 mt-0.5">
                            <ChevronRight className="w-3 h-3" />
                          </div>
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
