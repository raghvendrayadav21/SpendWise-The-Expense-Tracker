import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Target,
  BrainCircuit,
  AlertTriangle,
  CheckCircle2,
  Send,
  Trash2,
  Calendar,
  ChevronRight,
  TrendingDown,
  Info
} from 'lucide-react';
import api from '../services/api';

const AiInsightsPage = () => {
  const [insightsData, setInsightsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Chat Q&A States
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am <strong>SpendWise AI</strong>, your personal financial advisor. Ask me anything about your expenses, budgets, or savings — in <strong>any language</strong> you prefer!<br/><br/>Examples:<br/><ul><li><em>Where was my highest spending this month?</em></li><li><em>How can I control my expenses?</em></li><li><em>Kaha jyada kharch hua?</em> (Hindi/Hinglish also works!)</li></ul>'
    }
  ]);
  const [userQuestion, setUserQuestion] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, chatLoading]);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await api.get('/ai/insights');
        setInsightsData(res.data);
      } catch (err) {
        console.error(err);
        setErrorMsg('Failed to load AI insights. Verify your server configuration or connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  const handleSendQuestion = async (questionText) => {
    const query = questionText || userQuestion;
    if (!query.trim()) return;

    const newUserMessage = { sender: 'user', text: query };
    setChatHistory(prev => [...prev, newUserMessage]);
    setUserQuestion('');
    setChatLoading(true);

    try {
      const res = await api.post('/ai/query', { question: query });
      const newAiMessage = { sender: 'ai', text: res.data.answer };
      setChatHistory(prev => [...prev, newAiMessage]);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to fetch AI answer. Check backend logs.';
      const newAiErrorMessage = { sender: 'ai', text: `<span class="text-red-400">Error: ${errMsg}</span>` };
      setChatHistory(prev => [...prev, newAiErrorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const clearChat = () => {
    setChatHistory([
      {
        sender: 'ai',
        text: 'Hello! I am <strong>SpendWise AI</strong>, your personal financial advisor. Ask me anything about your expenses, budgets, or savings — in <strong>any language</strong> you prefer!<br/><br/>Examples:<br/><ul><li><em>Where was my highest spending this month?</em></li><li><em>How can I control my expenses?</em></li><li><em>Kaha jyada kharch hua?</em> (Hindi/Hinglish also works!)</li></ul>'
      }
    ]);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2"><div className="skeleton h-8 w-52 rounded-lg" /><div className="skeleton h-4 w-72 rounded" /></div>
          <div className="skeleton h-10 w-44 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl h-56 skeleton" />
            <div className="glass-panel p-5 rounded-2xl h-64 skeleton" />
          </div>
          <div className="lg:col-span-2 glass-panel rounded-2xl h-[560px] skeleton" />
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="glass-panel p-8 rounded-2xl max-w-lg mx-auto text-center space-y-4 py-12 mt-10">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
        <h3 className="text-xl font-bold text-brand-textPrimary">Access Denied</h3>
        <p className="text-sm text-brand-textSecondary">{errorMsg}</p>
      </div>
    );
  }

  const { totalSpent, totalBudget, budgetStatuses, insights, generatedAt } = insightsData || {};
  const healthPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const isOverBudget = totalSpent > totalBudget;

  const chatSuggestions = [
    { label: 'Highest spending?', query: 'Where was my highest spending this month?' },
    { label: 'How to control expenses?', query: 'How can I control my expenses?' },
    { label: 'Savings plan?', query: 'Give me a savings plan for this month.' }
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0"
      >
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-brand-textPrimary flex items-center">
              AI Analytics
            </h1>
            <span className="text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-1 rounded-full bg-brand-accentSoft text-brand-accent border border-brand-accent/20 animate-pulse-ring">
              Groq Llama 3.3 Active
            </span>
          </div>
          <p className="text-brand-textSecondary text-sm mt-1">Ask our artificial intelligence any query about your spending behavior or custom budgets.</p>
        </div>
        <p className="text-xs text-brand-textSecondary font-mono bg-white/[0.03] px-3.5 py-2 rounded-xl border border-brand-cardBorder self-start">
          Last Synced: {generatedAt}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Summary Metrics & Warnings */}
        <div className="space-y-6">
          
          {/* Budget Health Panel */}
          <motion.div 
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="glass-panel p-6 rounded-2xl relative overflow-hidden border border-brand-cardBorder"
          >
            <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
              <BrainCircuit className="w-32 h-32 text-brand-accent" />
            </div>

            <h3 className="text-base font-bold mb-4 flex items-center text-brand-textPrimary">
              <Target className="w-5 h-5 text-brand-accent mr-2" />
              Budget Health
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-brand-textSecondary mb-1.5 font-medium">
                  <span>Aggregate Utilization</span>
                  <span className="font-mono font-bold text-brand-textPrimary">{healthPercent.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full rounded-full ${isOverBudget ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]' : 'bg-brand-accent shadow-[0_0_10px_rgba(0,208,132,0.35)]'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(healthPercent, 100)}%` }}
                    transition={{ duration: 1.1, ease: 'easeOut' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white/[0.025] p-3 rounded-xl border border-brand-cardBorder">
                  <span className="text-[10px] text-brand-textSecondary uppercase font-bold tracking-wider">Total Spent</span>
                  <p className="text-lg font-extrabold font-mono text-brand-accent mt-0.5">₹{totalSpent.toFixed(0)}</p>
                </div>
                <div className="bg-white/[0.025] p-3 rounded-xl border border-brand-cardBorder">
                  <span className="text-[10px] text-brand-textSecondary uppercase font-bold tracking-wider">Total Limit</span>
                  <p className="text-lg font-extrabold font-mono text-blue-400 mt-0.5">₹{totalBudget.toFixed(0)}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Mini Category status table */}
          <motion.div 
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.18, duration: 0.4 }}
            className="glass-panel p-5 rounded-2xl border border-brand-cardBorder"
          >
            <h4 className="text-sm font-bold mb-4 flex items-center justify-between text-brand-textPrimary">
              <span>Category Audits</span>
              <Info className="w-3.5 h-3.5 text-brand-textSecondary opacity-60" />
            </h4>
            
            <div className="space-y-3.5">
              {budgetStatuses?.map((status, index) => {
                const isOver = status.spent > status.limit;
                return (
                  <div key={index} className="flex items-center justify-between text-xs border-b border-brand-cardBorder/30 pb-2 last:border-b-0 last:pb-0">
                    <span className="text-brand-textSecondary font-medium">{status.category}</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-brand-textPrimary font-semibold">₹{status.spent.toFixed(0)} / ₹{status.limit.toFixed(0)}</span>
                      {isOver ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
              {budgetStatuses?.length === 0 && (
                <p className="text-xs text-brand-textSecondary italic py-2">No category budgets defined yet.</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Side: Chat Container */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.45 }}
          className="lg:col-span-2 flex flex-col h-[600px] glass-panel rounded-2xl relative overflow-hidden border border-brand-cardBorder"
        >
          {/* Chat Header */}
          <div className="p-4 border-b border-brand-cardBorder bg-white/[0.02] flex items-center justify-between z-10">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 bg-brand-accentSoft rounded-lg border border-brand-accent/15">
                <Sparkles className="w-4.5 h-4.5 text-brand-accent animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-brand-textPrimary">SpendWise AI Advisor</h3>
                <p className="text-[10px] text-brand-textSecondary">Powered by Llama 3.3 API</p>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="inline-flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-xl bg-white/5 border border-brand-cardBorder hover:bg-white/10 text-brand-textSecondary hover:text-brand-textPrimary transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Chat</span>
            </button>
          </div>

          {/* Chat Feed */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 flex flex-col scrollbar-thin">
            <AnimatePresence>
              {chatHistory.map((msg, index) => {
                const isAi = msg.sender === 'ai';
                return (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`flex flex-col max-w-[85%] ${isAi ? 'self-start items-start' : 'self-end items-end'}`}
                  >
                    <span className="text-[9px] uppercase font-bold text-brand-textSecondary tracking-wider mb-1 px-1 opacity-70">
                      {isAi ? 'Advisor' : 'You'}
                    </span>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      isAi 
                        ? 'glass-panel text-brand-textSecondary border border-brand-cardBorder rounded-tl-none ai-insights-content font-medium' 
                        : 'bg-brand-accent text-white rounded-tr-none shadow-[0_4px_15px_rgba(0,208,132,0.18)] font-semibold'
                    }`}>
                      {isAi ? (
                        <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                      ) : (
                        <p className="m-0">{msg.text}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {chatLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="self-start flex flex-col items-start max-w-[85%]"
                >
                  <span className="text-[9px] uppercase font-bold text-brand-textSecondary tracking-wider mb-1 px-1">
                    Advisor
                  </span>
                  <div className="glass-panel p-4 rounded-2xl text-sm border border-brand-cardBorder rounded-tl-none flex items-center space-x-3">
                    <span className="w-4 h-4 border-2 border-brand-accent/20 border-t-brand-accent rounded-full animate-spin"></span>
                    <span className="text-brand-textSecondary animate-pulse font-medium">Thinking...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatBottomRef} />
          </div>

          {/* Suggestion drawer */}
          <div className="px-4 py-2.5 bg-white/5 border-t border-brand-cardBorder/50 flex flex-wrap gap-2 items-center z-10">
            <span className="text-[9px] text-brand-textSecondary font-bold uppercase tracking-wider">Quick Prompts:</span>
            {chatSuggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSendQuestion(s.query)}
                disabled={chatLoading}
                className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-brand-cardBorder text-brand-textSecondary hover:border-brand-accent/35 hover:text-brand-textPrimary transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuestion();
            }}
            className="p-4 border-t border-brand-cardBorder bg-white/5 flex items-center gap-2 z-10"
          >
            <input
              type="text"
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              placeholder="Ask SpendWise about your expenses..."
              className="flex-1 glass-input px-4 py-3 rounded-xl text-sm"
              disabled={chatLoading}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={chatLoading || !userQuestion.trim()}
              className="p-3.5 bg-brand-accent hover:bg-brand-accentHover text-white rounded-xl transition glow-btn shrink-0 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4.5 h-4.5" />
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AiInsightsPage;
