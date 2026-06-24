import React, { useEffect, useRef, useState } from 'react';
import { 
  Sparkles, 
  Target, 
  BrainCircuit, 
  AlertTriangle, 
  CheckCircle,
  Send
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

  // Auto-scroll to bottom whenever a new message arrives or AI is typing
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

    // Add user message to history
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

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center flex-1 py-20">
        <span className="w-12 h-12 border-4 border-brand-accent/20 border-t-brand-accent rounded-full animate-spin"></span>
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

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-bold tracking-tight text-brand-textPrimary">AI Savings Analytics</h1>
            <span className="text-[10px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded bg-brand-accent/20 text-brand-accent border border-brand-accent/30 animate-pulse">
              Groq Llama 3.3 Active
            </span>
          </div>
          <p className="text-brand-textSecondary text-sm mt-1">Ask our artificial intelligence any query about your spending behavior or custom budgets.</p>
        </div>
        <p className="text-xs text-brand-textSecondary font-mono bg-white/5 px-3 py-1.5 rounded-lg border border-brand-cardBorder">
          Last Synced: {generatedAt}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Summary Metrics & Warnings */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-5">
              <BrainCircuit className="w-32 h-32 text-brand-accent" />
            </div>

            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Target className="w-5 h-5 text-brand-accent mr-2" />
              Budget Health
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-brand-textSecondary mb-1">
                  <span>Aggregate Utilization</span>
                  <span>{totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(0) : 0}%</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${totalSpent > totalBudget ? 'bg-red-500' : 'bg-brand-accent'}`}
                    style={{ width: `${Math.min(totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-white/5 p-3 rounded-xl border border-brand-cardBorder">
                  <span className="text-[10px] text-brand-textSecondary uppercase font-semibold">Total Spent</span>
                  <p className="text-lg font-bold font-mono text-brand-accent mt-0.5">₹{totalSpent.toFixed(2)}</p>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-brand-cardBorder">
                  <span className="text-[10px] text-brand-textSecondary uppercase font-semibold">Total Limit</span>
                  <p className="text-lg font-bold font-mono text-blue-400 mt-0.5">₹{totalBudget.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mini Category status table */}
          <div className="glass-panel p-5 rounded-2xl">
            <h4 className="text-sm font-bold mb-3">Category Audits</h4>
            <div className="space-y-3.5">
              {budgetStatuses?.map((status, index) => {
                const isOver = status.spent > status.limit;
                return (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="text-brand-textSecondary">{status.category}</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-brand-textPrimary">₹{status.spent.toFixed(0)} / ₹{status.limit.toFixed(0)}</span>
                      {isOver ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5 text-brand-accent" />
                      )}
                    </div>
                  </div>
                );
              })}
              {budgetStatuses?.length === 0 && (
                <p className="text-xs text-brand-textSecondary italic">No category budgets defined yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Chat Container */}
        <div className="lg:col-span-2 flex flex-col h-[600px] glass-panel rounded-2xl relative overflow-hidden border border-brand-cardBorder">
          {/* Header */}
          <div className="p-4 border-b border-brand-cardBorder bg-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-brand-accent animate-pulse" />
              <div>
                <h3 className="text-sm font-bold text-brand-textPrimary">SpendWise AI Advisor</h3>
                <p className="text-[10px] text-brand-textSecondary">Ask anything about your expenses</p>
              </div>
            </div>
            <button
              onClick={() => setChatHistory([
                {
                  sender: 'ai',
                  text: 'Hello! I am <strong>SpendWise AI</strong>, your personal financial advisor. Ask me anything about your expenses, budgets, or savings — in <strong>any language</strong> you prefer!<br/><br/>Examples:<br/><ul><li><em>Where was my highest spending this month?</em></li><li><em>How can I control my expenses?</em></li><li><em>Kaha jyada kharch hua?</em> (Hindi/Hinglish also works!)</li></ul>'
                }
              ])}
              className="text-xs px-2.5 py-1 rounded bg-white/5 border border-brand-cardBorder hover:bg-white/10 text-brand-textSecondary hover:text-brand-textPrimary transition cursor-pointer"
            >
              Clear Chat
            </button>
          </div>

          {/* Chat Feed */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 flex flex-col">
            {chatHistory.map((msg, index) => {
              const isAi = msg.sender === 'ai';
              return (
                <div 
                  key={index}
                  className={`flex flex-col max-w-[85%] ${isAi ? 'self-start items-start' : 'self-end items-end'}`}
                >
                  <span className="text-[9px] uppercase font-semibold text-brand-textSecondary tracking-wider mb-1 px-1">
                    {isAi ? 'SpendWise AI' : 'You'}
                  </span>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    isAi 
                      ? 'glass-panel text-brand-textSecondary border border-brand-cardBorder rounded-tl-none ai-insights-content' 
                      : 'bg-brand-accent text-white rounded-tr-none shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  }`}>
                    {isAi ? (
                      <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                    ) : (
                      <p>{msg.text}</p>
                    )}
                  </div>
                </div>
              );
            })}

            {chatLoading && (
              <div className="self-start flex flex-col items-start max-w-[85%]">
                <span className="text-[9px] uppercase font-semibold text-brand-textSecondary tracking-wider mb-1 px-1">
                  SpendWise AI
                </span>
                <div className="glass-panel p-4 rounded-2xl text-sm border border-brand-cardBorder rounded-tl-none flex items-center space-x-3">
                  <span className="w-4 h-4 border-2 border-brand-accent/20 border-t-brand-accent rounded-full animate-spin"></span>
                  <span className="text-brand-textSecondary animate-pulse">Thinking...</span>
                </div>
              </div>
            )}
            {/* Invisible anchor — always scrolled into view on new messages */}
            <div ref={chatBottomRef} />
          </div>

          {/* Suggestion drawer */}
          <div className="px-5 py-2.5 bg-white/5 border-t border-brand-cardBorder/50 flex flex-wrap gap-2 items-center">
            <span className="text-[10px] text-brand-textSecondary font-semibold uppercase tracking-wider">Suggestions:</span>
            <button
              onClick={() => handleSendQuestion('Where was my highest spending this month?')}
              disabled={chatLoading}
              className="text-xs px-3 py-1 rounded-full bg-white/5 border border-brand-cardBorder text-brand-textSecondary hover:border-brand-accent/30 hover:text-brand-textPrimary transition cursor-pointer"
            >
              Where was my highest spending?
            </button>
            <button
              onClick={() => handleSendQuestion('How can I control my expenses?')}
              disabled={chatLoading}
              className="text-xs px-3 py-1 rounded-full bg-white/5 border border-brand-cardBorder text-brand-textSecondary hover:border-brand-accent/30 hover:text-brand-textPrimary transition cursor-pointer"
            >
              How can I control my expenses?
            </button>
            <button
              onClick={() => handleSendQuestion('Give me a savings plan for this month.')}
              disabled={chatLoading}
              className="text-xs px-3 py-1 rounded-full bg-white/5 border border-brand-cardBorder text-brand-textSecondary hover:border-brand-accent/30 hover:text-brand-textPrimary transition cursor-pointer"
            >
              Savings plan for this month?
            </button>
          </div>

          {/* Input Area */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuestion();
            }}
            className="p-4 border-t border-brand-cardBorder bg-white/5 flex items-center gap-2"
          >
            <input
              type="text"
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              placeholder="Ask SpendWise about your expenses..."
              className="flex-1 glass-input px-4 py-3 rounded-xl text-sm"
              disabled={chatLoading}
            />
            <button
              type="submit"
              disabled={chatLoading || !userQuestion.trim()}
              className="p-3 bg-brand-accent hover:bg-brand-accentHover text-white rounded-xl transition glow-btn shrink-0 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AiInsightsPage;
