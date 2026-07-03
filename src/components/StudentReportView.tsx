import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, Calendar, Award, Compass, AlertCircle, Sparkles, 
  BookOpen, HelpCircle, Lightbulb, BarChart2, TrendingUp, CheckCircle2,
  Activity, Clock, ChevronRight, FileText, Target, Brain, User, 
  MapPin, Milestone, CornerDownRight, MessageSquare, Flame, RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  Radar, AreaChart, Area, Cell
} from 'recharts';
import { StudentAnalytics } from '../types';

interface StudentInsight {
  understandingLevel: string;
  misconceptions: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  nextActivities: string[];
}

interface StudentReportViewProps {
  student: StudentAnalytics;
  onBack: () => void;
}

export default function StudentReportView({ student, onBack }: StudentReportViewProps) {
  const [insight, setInsight] = React.useState<StudentInsight | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchInsight = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/student-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student })
      });
      if (!res.ok) throw new Error('Failed to generate AI insights.');
      const data = await res.json();
      setInsight(data);
    } catch (err: any) {
      console.error('Error fetching student insight:', err);
      setError(err.message || 'Failed to communicate with AI model.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchInsight();
  }, [student.id]);
  
  // Custom mock data to enrich the Individual Student Report with realistic details
  const overallStatus = student.quizScore >= 90 ? 'Excellent Mastery' : student.quizScore >= 75 ? 'Consistent Progress' : 'Needs Intervention';
  const overallStatusColor = student.quizScore >= 90 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : student.quizScore >= 75 ? 'text-blue-700 bg-blue-50 border-blue-200' : 'text-rose-700 bg-rose-50 border-rose-200';

  // Academic activity timeline representation
  const timelineActivities = [
    {
      time: 'Today, 08:30 AM',
      type: 'quiz',
      title: 'Completed Web Concepts Assessment',
      desc: `Scored ${student.quizScore}% on final attempts. Recorded core competencies.`,
      icon: Award,
      color: 'bg-blue-50 text-brand-blue border-blue-100'
    },
    {
      time: 'Yesterday, 04:15 PM',
      type: 'chat',
      title: 'Consulted AI Learning Companion',
      desc: 'Asked 3 clarifying questions regarding REST design patterns and cookie statelessness.',
      icon: MessageSquare,
      color: 'bg-purple-50 text-brand-purple border-purple-100'
    },
    {
      time: '2 days ago, 11:10 AM',
      type: 'study',
      title: 'Reviewed Syllabus Lecture Notes',
      desc: 'Downloaded active lesson slides and code reference sheets.',
      icon: BookOpen,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100'
    },
    {
      time: '3 days ago, 02:40 PM',
      type: 'system',
      title: 'Registered to the Class',
      desc: 'Synchronized with Active Course Group.',
      icon: CheckCircle2,
      color: 'bg-slate-50 text-slate-500 border-slate-200'
    }
  ];

  // Specific Student FAQs asked or flagged
  const studentFAQs = [
    {
      q: 'Why are standard GET routes considered safe if query params can be logged?',
      a: 'GET requests are "safe" in an HTTP context because they do not modify backend server state. Transport-layer visibility is a separate network security scope solved by TLS/HTTPS, not route semantics.'
    },
    {
      q: 'How does JWT avoid storing session records in the database?',
      a: 'JWT is self-contained. The client holds the signature-verified state. The server only validates the cryptographic signature upon reception without database read operations.'
    }
  ];

  // Learning Path Steps
  const learningPathSteps = [
    {
      title: 'Fortify Core REST Semantics',
      status: 'completed',
      desc: 'Understand HTTP response statuses and stateless REST APIs.'
    },
    {
      title: 'Secure Header Configuration',
      status: student.quizScore >= 75 ? 'completed' : 'active',
      desc: 'Verify CORS, origin policies, and standard HTTPS handshakes.'
    },
    {
      title: 'Enterprise Idempotency Guardrails',
      status: student.quizScore >= 90 ? 'completed' : 'active',
      desc: 'Configure PUT vs POST database mutation protocols to block duplicate records.'
    },
    {
      title: 'Next Gen Federated API Design',
      status: 'locked',
      desc: 'Implement highly scalable GraphQL resolvers and subscription systems.'
    }
  ];

  // Quiz history trend data
  const quizHistory = [
    { attempt: 'Mock Unit 1', score: 60, progress: 40 },
    { attempt: 'Practice Run 2', score: Math.round(student.quizScore * 0.85), progress: 65 },
    { attempt: 'Diagnostic Quiz', score: student.quizScore, progress: student.learningProgress }
  ];

  return (
    <div className="space-y-8 animate-fade-in" id="student-report-page">
      
      {/* Premium Sub-Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center justify-center bg-white hover:bg-slate-100 border border-slate-200 p-2.5 rounded-2xl transition shadow-xs active:scale-95"
            title="Return to Student list"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Student Profile Report</span>
            <h1 className="font-display font-bold text-2xl text-slate-900 mt-1">Individual Diagnostics</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${overallStatusColor}`}>
            <Activity className="w-3.5 h-3.5" />
            <span>{overallStatus}</span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-400 text-xs font-semibold">Active Unit Sync</span>
        </div>
      </div>

      {/* Hero card: Student Information & Learning Summary */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm grid md:grid-cols-12 gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-blue/5 blur-3xl rounded-full" />
        
        {/* Left column: Student metadata */}
        <div className="md:col-span-5 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-display font-extrabold text-2xl shadow-md">
              {student.name.split(' ').map(n => n[0]).join('')}
            </div>
            
            <div>
              <h2 className="font-display font-extrabold text-2xl text-slate-900 tracking-tight">{student.name}</h2>
              <p className="text-slate-500 text-xs font-mono mt-1">Student Identifier: {student.id}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-600 font-medium">
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Academic Status</span>
              <span className="text-slate-800 font-bold">Undergraduate Student</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Engagement Streak</span>
              <span className="text-amber-600 font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> 5 Days
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Last Sync</span>
              <span className="text-slate-800">{student.lastActivity}</span>
            </div>
          </div>
        </div>

        {/* Right column: Learning Summary & AI generated report summary */}
        <div className="md:col-span-7 bg-slate-50/50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="bg-brand-purple/10 text-brand-purple p-1.5 rounded-lg">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-display font-bold text-slate-800 text-sm">Instructor Copilot Report Summary</h3>
            </div>
            
            <p className="text-slate-700 text-xs leading-relaxed font-semibold">
              "{student.aiFeedbackSummary}"
            </p>
          </div>

          <div className="bg-white border border-slate-200/60 p-4 rounded-xl space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recommended Syllabus Path</span>
            <div className="text-xs font-semibold text-slate-700 flex items-center gap-2">
              <Milestone className="w-4 h-4 text-brand-blue" />
              <span>Prioritize: <strong className="text-slate-900">{student.recommendedTopics[0]}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Personalized Diagnostic Insight Section */}
      <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-3xl p-6 md:p-8 border border-purple-100 shadow-sm space-y-6 relative overflow-hidden" id="student-ai-insights-section">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/5 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-blue/5 blur-3xl rounded-full" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-brand-purple text-white p-2.5 rounded-2xl shadow-sm animate-pulse">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                Personalized AI Learning Insight & Advisor
              </h3>
              <p className="text-xs text-slate-500 mt-1">Real-time deep cognitive evaluation powered by Google Gemini API.</p>
            </div>
          </div>

          <button
            onClick={fetchInsight}
            disabled={loading}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-brand-purple/40 transition duration-150 active:scale-95 disabled:opacity-50"
            title="Refresh Diagnostic Analysis"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand-purple ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Analyzing...' : 'Recalculate'}</span>
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 relative z-10">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-4 border-brand-purple/25 animate-ping" />
              <div className="absolute inset-0 rounded-full border-4 border-t-brand-purple border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            </div>
            <span className="text-xs font-semibold text-slate-500 animate-pulse">Synthesizing learning history with Gemini model...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-xs text-rose-700 relative z-10">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold">Error compiling report</p>
              <p className="mt-0.5">{error}</p>
            </div>
            <button 
              onClick={fetchInsight}
              className="ml-auto bg-rose-100 hover:bg-rose-200 px-3 py-1.5 rounded-xl font-bold transition"
            >
              Retry
            </button>
          </div>
        ) : insight ? (
          <div className="grid md:grid-cols-12 gap-6 relative z-10 animate-fade-in">
            
            {/* Column 1: Understanding Level & Misconceptions */}
            <div className="md:col-span-4 space-y-4">
              {/* Current Understanding Level */}
              <div className="bg-white border border-slate-100 p-5 rounded-2xl space-y-2.5 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-brand-purple" /> Understanding Level
                </span>
                <p className="text-slate-800 text-xs font-semibold leading-relaxed">
                  {insight.understandingLevel}
                </p>
              </div>

              {/* Main Misconceptions */}
              <div className="bg-amber-50/45 border border-amber-100 p-5 rounded-2xl space-y-3 shadow-xs">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Key Misconceptions
                </span>
                <ul className="space-y-2">
                  {insight.misconceptions && insight.misconceptions.map((mis, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-xs text-amber-900 font-semibold leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>{mis}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Column 2: Strengths & Weaknesses */}
            <div className="md:col-span-4 space-y-4">
              {/* Learning Strengths */}
              <div className="bg-white border border-slate-100 p-5 rounded-2xl space-y-3 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Core Learning Strengths
                </span>
                <ul className="space-y-2.5">
                  {insight.strengths && insight.strengths.map((st, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs text-slate-700 font-semibold leading-relaxed">
                      <div className="bg-emerald-50 text-emerald-600 p-0.5 rounded-md shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Learning Weaknesses */}
              <div className="bg-white border border-slate-100 p-5 rounded-2xl space-y-3 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-rose-500" /> Focus Learning Gaps
                </span>
                <ul className="space-y-2.5">
                  {insight.weaknesses && insight.weaknesses.map((wk, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs text-slate-700 font-semibold leading-relaxed">
                      <div className="bg-rose-50 text-rose-600 p-0.5 rounded-md shrink-0 mt-0.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                      </div>
                      <span>{wk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Column 3: Recommendations & Next Activities */}
            <div className="md:col-span-4 space-y-4">
              {/* Personalized Recommendations */}
              <div className="bg-white border border-slate-100 p-5 rounded-2xl space-y-3 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-brand-blue" /> Actionable Tips
                </span>
                <ul className="space-y-3">
                  {insight.recommendations && insight.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-xs text-slate-700 font-semibold leading-relaxed">
                      <div className="bg-blue-50 text-brand-blue p-1 rounded-full shrink-0 mt-0.5">
                        <ChevronRight className="w-3 h-3" />
                      </div>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suggested Next Learning Activities */}
              <div className="bg-purple-950 text-purple-100 p-5 rounded-2xl space-y-3 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-purple/20 blur-xl rounded-full" />
                <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-brand-purple" /> Suggested Next Activities
                </span>
                <ul className="space-y-3">
                  {insight.nextActivities && insight.nextActivities.map((act, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-xs font-medium leading-relaxed">
                      <div className="bg-purple-800 text-brand-purple p-0.5 rounded-full shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        ) : null}
      </div>

      {/* Progress Charts & Performance Indexes */}
      <div className="grid md:grid-cols-12 gap-8">
        
        {/* Radar/Bar Chart: Learning Outcome Achievement */}
        <div className="md:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-slate-400" />
              Learning Outcome Achievement
            </h3>
            <span className="text-[10px] text-slate-400 font-bold">4 Active Objectives</span>
          </div>

          <div className="w-full h-64 text-xs font-semibold">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={student.learningOutcomeAchievement} margin={{ left: -20, right: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#64748b' }} tickLine={false} />
                <YAxis tick={{ fill: '#64748b' }} tickLine={false} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                />
                <Bar dataKey="score" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                  {student.learningOutcomeAchievement.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#a855f7'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area Chart: Quiz Progress History */}
        <div className="md:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-400" />
              Progress & Quiz History Trend
            </h3>
            <p className="text-slate-500 text-[11px] mt-1">Comparing quiz scoring and curriculum completeness over time.</p>
          </div>

          <div className="w-full h-48 text-xs font-semibold">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={quizHistory} margin={{ left: -20, right: 10 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="attempt" tick={{ fill: '#64748b' }} tickLine={false} />
                <YAxis tick={{ fill: '#64748b' }} tickLine={false} />
                <Tooltip />
                <Area type="monotone" name="Quiz Score" dataKey="score" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorScore)" />
                <Area type="monotone" name="Completeness" dataKey="progress" stroke="#a855f7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProgress)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-50 pt-3">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-500 rounded-full inline-block" /> Quiz Score</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-purple-500 rounded-full inline-block" /> Completeness</span>
          </div>
        </div>

      </div>

      {/* Strengths, Weaknesses, and Systemic Misconceptions */}
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Strengths Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            Verified Strengths
          </h3>
          <p className="text-slate-500 text-xs">Concepts fully mastered based on active assessment results:</p>
          
          <div className="space-y-3">
            {student.strengths.map((str, idx) => (
              <div key={idx} className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100/50 flex items-start gap-3">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-900">{str}</h4>
                  <p className="text-emerald-800/80 text-[10px] mt-0.5">High comprehension index. No correction required.</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Target Gaps (Weaknesses) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            Knowledge Gaps
          </h3>
          <p className="text-slate-500 text-xs">Concepts needing active review or targeted teacher intervention:</p>

          <div className="space-y-3">
            {student.weaknesses[0] === "None" || student.weaknesses.length === 0 ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-xl font-medium border border-emerald-100">
                Excellent. No remaining knowledge gaps detected.
              </div>
            ) : (
              student.weaknesses.map((weak, idx) => (
                <div key={idx} className="bg-rose-50/50 p-3.5 rounded-xl border border-rose-100 flex items-start gap-3">
                  <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-900">{weak}</h4>
                    <p className="text-rose-800/80 text-[10px] mt-0.5">Recommended focus area for this student's learning module.</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Systemic Misconceptions Triggered */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
            Misconceptions Triggered
          </h3>
          <p className="text-slate-500 text-xs">Common misconceptions flagged by diagnostic choices:</p>

          <div className="space-y-3">
            {student.commonMisconceptions[0] === "None" || student.commonMisconceptions.length === 0 ? (
              <div className="p-4 bg-slate-50 text-slate-500 text-xs rounded-xl font-medium border border-slate-100">
                All clear. Student has not triggered standard misconceptions.
              </div>
            ) : (
              student.commonMisconceptions.map((mis, idx) => (
                <div key={idx} className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200 flex items-start gap-3">
                  <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900">{mis}</h4>
                    <p className="text-amber-800/80 text-[10px] mt-0.5">Review dynamic feedback during lecture discussions.</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Frequently Asked Questions during dynamic AI chat session */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-brand-purple shrink-0" />
          Flagged Dynamic Chat Queries
        </h3>
        <p className="text-slate-500 text-xs">Questions this student submitted to the AI Study Assistant for conceptual clarity:</p>

        <div className="grid md:grid-cols-2 gap-6 pt-2">
          {studentFAQs.map((faq, idx) => (
            <div key={idx} className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <span className="bg-brand-purple/10 text-brand-purple font-extrabold text-[10px] px-2 py-0.5 rounded uppercase shrink-0 mt-0.5">Q</span>
                <p className="text-xs font-bold text-slate-800 leading-snug">{faq.q}</p>
              </div>
              <div className="flex items-start gap-2.5 pt-2.5 border-t border-slate-100">
                <span className="bg-brand-blue/10 text-brand-blue font-extrabold text-[10px] px-2 py-0.5 rounded uppercase shrink-0 mt-0.5">A</span>
                <p className="text-slate-600 text-xs leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Recommended Learning Path & Recommended Topics */}
      <div className="grid md:grid-cols-12 gap-8">
        
        {/* Recommended Learning Path */}
        <div className="md:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Milestone className="w-5 h-5 text-brand-blue shrink-0" />
            Recommended Adaptive Learning Path
          </h3>
          <p className="text-slate-500 text-xs">AI-plotted milestone steps dynamically configured based on individual gaps:</p>

          <div className="space-y-4 pt-2">
            {learningPathSteps.map((step, idx) => {
              const isActive = step.status === 'active';
              const isDone = step.status === 'completed';
              
              let borderClass = 'border-slate-100 bg-white';
              let badgeClass = 'bg-slate-100 text-slate-400';
              let badgeText = 'Locked';

              if (isActive) {
                borderClass = 'border-brand-blue bg-blue-50/20';
                badgeClass = 'bg-brand-blue text-white';
                badgeText = 'Active Focus';
              } else if (isDone) {
                borderClass = 'border-slate-200 bg-white opacity-85';
                badgeClass = 'bg-emerald-500 text-white';
                badgeText = 'Completed';
              }

              return (
                <div key={idx} className={`border p-4 rounded-2xl flex items-start justify-between gap-4 transition ${borderClass}`}>
                  <div className="flex gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${isDone ? 'bg-emerald-100 text-emerald-800' : isActive ? 'bg-blue-100 text-brand-blue' : 'bg-slate-100 text-slate-500'}`}>
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        {step.title}
                      </h4>
                      <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${badgeClass}`}>
                    {badgeText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommended Topics to Review side-panel */}
        <div className="md:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Brain className="w-5 h-5 text-brand-purple shrink-0" />
              Topics to Review
            </h3>
            <p className="text-slate-500 text-xs">Curated key concepts targeted for revision prior to future unit exams:</p>

            <div className="space-y-2 pt-1">
              {student.recommendedTopics.map((topic, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl flex items-start gap-2.5">
                  <div className="bg-brand-purple/10 text-brand-purple p-0.5 rounded-full shrink-0 mt-0.5">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">{topic}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recommended Material</span>
            <span className="text-xs font-extrabold text-slate-800 mt-1 block">Lecture 03 Supplementary Code</span>
          </div>
        </div>

      </div>

      {/* Timeline of Student Learning Activities */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-5 h-5 text-slate-400 shrink-0" />
          Timeline of Student Activities
        </h3>
        <p className="text-slate-500 text-xs">A comprehensive history of this student's interactions within the active class:</p>

        <div className="relative border-l border-slate-100 ml-4 pl-6 space-y-6 pt-2">
          {timelineActivities.map((act, idx) => {
            const Icon = act.icon;
            return (
              <div key={idx} className="relative">
                {/* Visual marker dot */}
                <div className="absolute -left-[35px] top-1.5 w-4 h-4 rounded-full border-2 border-white bg-slate-300 ring-4 ring-slate-50 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
                
                <div className="space-y-1 bg-slate-50/40 hover:bg-slate-50 p-4 rounded-2xl border border-slate-100/50 transition duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`p-1 rounded-md border text-[11px] ${act.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-xs font-bold text-slate-950">{act.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {act.time}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs pl-8 leading-relaxed font-semibold">{act.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
