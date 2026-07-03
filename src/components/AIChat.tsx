import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Sparkles, MessageSquare, BookOpen, HelpCircle, 
  Lightbulb, RefreshCw, GraduationCap, ArrowRight, User 
} from 'lucide-react';
import { ChatMessage, LessonData } from '../types';

interface AIChatProps {
  lesson: LessonData;
  chatHistory: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isResponding: boolean;
}

export default function AIChat({ lesson, chatHistory, onSendMessage, isResponding }: AIChatProps) {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    { label: 'Explain Again', text: 'Can you explain the main concepts of this lesson in simple terms?', icon: RefreshCw },
    { label: 'Give Example', text: 'Can you give me a real-world scenario illustrating the primary misconception in today\'s topic?', icon: Lightbulb },
    { label: 'Summarize Lesson', text: 'Provide a concise, bullet-pointed summary of this week\'s lesson outcomes.', icon: BookOpen },
    { label: 'Quiz Me', text: 'Ask me a quick multiple-choice question to test my understanding of the material!', icon: HelpCircle }
  ];

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isResponding) return;
    setInputText('');
    await onSendMessage(textToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputText);
    }
  };

  // Scroll to bottom on history update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isResponding]);

  return (
    <div className="grid lg:grid-cols-12 gap-8 h-[calc(100vh-12rem)] min-h-[450px]" id="ai-chat">
      
      {/* Left Column: Suggested Prompts */}
      <div className="lg:col-span-3 flex flex-col justify-between space-y-4">
        <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm h-full flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-5 h-5 text-brand-blue shrink-0" />
              <h3 className="font-display font-bold text-sm text-slate-800">Suggested Prompts</h3>
            </div>
            
            <p className="text-xs text-slate-400">Click any prompt to instantly query your tailored AI tutor.</p>
            
            <div className="space-y-2.5">
              {suggestedPrompts.map((p, idx) => {
                const IconComponent = p.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSend(p.text)}
                    disabled={isResponding}
                    className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-brand-blue/30 hover:bg-slate-50 text-xs transition flex items-center gap-3 font-semibold text-slate-700 disabled:opacity-50 disabled:pointer-events-none group"
                  >
                    <div className="bg-slate-100 group-hover:bg-brand-blue/10 group-hover:text-brand-blue p-2 rounded-lg text-slate-500 shrink-0 transition">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <span className="block text-slate-800 text-[11px] font-bold">{p.label}</span>
                      <span className="block text-slate-400 text-[10px] font-normal truncate">{p.text}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed font-medium">
            <span className="block font-bold text-slate-700 mb-1">Knowledge Context</span>
            Active Course Material:<br />
            <span className="font-bold text-brand-blue truncate block">{lesson.topic}</span>
          </div>
        </div>
      </div>

      {/* Center Column: Conversation View */}
      <div className="lg:col-span-9 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between h-full overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-brand-blue text-white p-2 rounded-xl shadow-md shadow-blue-500/10">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Aegis AI Copilot</h3>
              <p className="text-[10px] text-slate-400 font-medium">Expert University Tutoring Agent</p>
            </div>
          </div>
          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Active Context</span>
        </div>

        {/* Message Panel */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4">
          <AnimatePresence initial={false}>
            {chatHistory.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 max-w-[85%] ${isAi ? '' : 'ml-auto flex-row-reverse'}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                    isAi ? 'bg-brand-blue text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isAi ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  {/* Bubble */}
                  <div className={`rounded-2xl p-4 text-xs leading-relaxed space-y-2 border ${
                    isAi 
                      ? 'bg-slate-50 text-slate-800 border-slate-100 rounded-tl-none' 
                      : 'bg-brand-blue text-white border-brand-blue rounded-tr-none'
                  }`}>
                    <div className="whitespace-pre-line font-medium">{msg.text}</div>
                    <div className={`text-[9px] text-right ${isAi ? 'text-slate-400' : 'text-blue-100'}`}>
                      {msg.timestamp}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {isResponding && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4 max-w-[80%]"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-blue text-white shrink-0 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="rounded-2xl p-4 text-xs bg-slate-50 border border-slate-100 text-slate-400 rounded-tl-none flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                  </div>
                  <span>AI Companion is thinking...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100">
          <div className="relative flex items-center bg-slate-50 border border-slate-200 focus-within:ring-2 focus-within:ring-brand-blue/30 focus-within:border-brand-blue rounded-2xl transition overflow-hidden">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about the active lesson..."
              rows={1}
              className="w-full pl-4 pr-12 py-3.5 bg-transparent border-0 text-xs text-slate-800 focus:outline-none focus:ring-0 resize-none max-h-24 font-medium"
            />
            <button
              onClick={() => handleSend(inputText)}
              disabled={isResponding || !inputText.trim()}
              className="absolute right-2 bg-brand-blue text-white hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed p-2 rounded-xl transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="text-[10px] text-slate-400 text-center mt-2 font-medium">
            Press Enter to submit. Press Shift+Enter for new line.
          </div>
        </div>

      </div>

    </div>
  );
}
