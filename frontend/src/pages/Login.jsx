import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Mail, Lock, LogIn, TrendingUp, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import financeIllustration from '../assets/finance_vector.png';

const Login = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!usernameOrEmail || !password) {
      setFormError('Please fill in all fields.');
      return;
    }
    const res = await login(usernameOrEmail, password);
    if (res.success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-brand-darkBg text-brand-textPrimary transition-colors duration-300">
      
      {/* Left Column: Premium Marketing & Vector Illustration Banner */}
      <div className="hidden md:flex md:w-1/2 lg:w-7/12 relative overflow-hidden bg-brand-darkBg/40 border-r border-brand-cardBorder flex-col justify-between p-12">
        {/* Glow Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-accent/15 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Top Header */}
        <div className="flex items-center gap-2.5 z-10">
          <div className="p-2 bg-brand-accent/10 border border-brand-accent/25 rounded-xl">
            <Sparkles className="w-6 h-6 text-brand-accent animate-pulse" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-brand-accent to-blue-400 bg-clip-text text-transparent tracking-tight">
            SpendWise
          </span>
        </div>

        {/* Center Illustration */}
        <div className="flex-1 flex flex-col items-center justify-center z-10 py-6">
          <div className="w-full max-w-sm lg:max-w-md xl:max-w-lg mb-8">
            <img 
              src={financeIllustration} 
              alt="SpendWise Finance Illustration" 
              className="w-full h-auto object-contain drop-shadow-[0_15px_35px_rgba(16,185,129,0.18)] animate-float"
            />
          </div>
          <div className="text-center max-w-md space-y-3 px-4">
            <h1 className="text-3xl font-extrabold tracking-tight leading-tight sm:text-4xl text-brand-textPrimary">
              Optimize Your <span className="text-brand-accent glow-text">Financial Future</span>
            </h1>
            <p className="text-sm text-brand-textSecondary leading-relaxed">
              Track category limits, manage monthly records, and unlock custom AI-generated saving tips scaled in Indian Rupees (₹).
            </p>
          </div>
        </div>

        {/* Bottom Feature Footer */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-brand-cardBorder/40 z-10">
          <div className="flex items-center gap-2 text-xs text-brand-textSecondary">
            <TrendingUp className="w-4 h-4 text-brand-accent shrink-0" />
            <span>Smart Trends</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-brand-textSecondary">
            <ShieldCheck className="w-4 h-4 text-brand-accent shrink-0" />
            <span>Secure Database</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-brand-textSecondary">
            <Sparkles className="w-4 h-4 text-brand-accent shrink-0" />
            <span>Gemini AI Engine</span>
          </div>
        </div>
      </div>

      {/* Right Column: Authentication Card Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16 relative">
        {/* Glow overlay for mobile backgrounds */}
        <div className="md:hidden absolute top-[-5%] right-[-5%] w-72 h-72 bg-brand-accent/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="md:hidden absolute bottom-[-5%] left-[-5%] w-72 h-72 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl relative">
          
          <div className="text-center mb-8">
            <div className="md:hidden inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 mb-3">
              <Sparkles className="w-6 h-6 text-brand-accent animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-brand-accent to-blue-400 bg-clip-text text-transparent md:text-3xl">
              Welcome back
            </h2>
            <p className="text-sm text-brand-textSecondary mt-2">
              Log in to your account to monitor budgets & trends.
            </p>
          </div>

          {/* Seeded Testing Accounts tips */}
          <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-brand-cardBorder text-xs text-brand-textSecondary space-y-1">
            <p className="font-semibold text-brand-textPrimary mb-1">💡 Seeded Testing Accounts:</p>
            <p>• <span className="font-semibold text-brand-accent">admin</span> / <span className="font-semibold text-brand-textPrimary">admin123</span> (Admin Role)</p>
            <p>• <span className="font-semibold text-brand-accent">user</span> / <span className="font-semibold text-brand-textPrimary">user123</span> (User Role - Full Access)</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {(formError || error) && (
              <div className="p-3.5 text-xs text-red-400 bg-red-950/30 border border-red-500/20 rounded-xl leading-normal">
                {formError || error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-2">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-textSecondary">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <input
                  type="text"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className="w-full pl-10.5 pr-4 py-2.5 rounded-xl glass-input text-sm"
                  placeholder="Enter username or email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-textSecondary">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10.5 pr-4 py-2.5 rounded-xl glass-input text-sm"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-brand-accent hover:bg-brand-accentHover text-white py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center glow-btn cursor-pointer"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <LogIn className="w-4.5 h-4.5 mr-2" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-brand-textSecondary">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-accent hover:underline font-semibold">
              Create account
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Login;
