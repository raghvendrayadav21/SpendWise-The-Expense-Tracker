import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, User, Mail, Lock, Shield, UserPlus, TrendingUp, ShieldCheck, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import financeIllustration from '../assets/finance_vector.png';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ROLE_NORMAL');
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const { signup, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    if (!username || !email || !password) {
      setFormError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    const res = await signup(username, email, password, role);
    if (res.success) {
      setSuccessMsg('Account registered successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.08,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-brand-darkBg text-brand-textPrimary transition-colors duration-300 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-brand-accent/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-500/8 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-violet-500/5 rounded-full blur-[160px] pointer-events-none"></div>

      {/* Left Column: Premium Marketing & Vector Illustration Banner */}
      <div className="hidden md:flex md:w-1/2 lg:w-7/12 relative bg-white/[0.01] border-r border-brand-cardBorder flex-col justify-between p-12 z-10">
        
        {/* Top Header */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-accent to-emerald-600 flex items-center justify-center shadow-lg shadow-brand-accent/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold bg-gradient-to-r from-brand-accent via-emerald-300 to-blue-400 bg-clip-text text-transparent tracking-tight">
            SpendWise
          </span>
        </motion.div>

        {/* Center Illustration & Copy */}
        <div className="flex-1 flex flex-col items-center justify-center py-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, type: 'spring', damping: 20 }}
            className="w-full max-w-sm lg:max-w-md xl:max-w-lg mb-8"
          >
            <img 
              src={financeIllustration} 
              alt="SpendWise Finance Illustration" 
              className="w-full h-auto object-contain drop-shadow-[0_20px_45px_rgba(0,208,132,0.22)] animate-float"
            />
          </motion.div>
          <div className="text-center max-w-md space-y-4 px-4">
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-3xl font-extrabold tracking-tight leading-tight sm:text-4xl text-brand-textPrimary font-sans"
            >
              Begin Your <span className="text-brand-accent glow-text bg-gradient-to-r from-brand-accent to-emerald-400 bg-clip-text text-transparent">Saving Journey</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-sm text-brand-textSecondary leading-relaxed"
            >
              Create an account to start tracking category-level details, setting limits, and receiving AI audits scaled in Indian Rupees (₹).
            </motion.p>
          </div>
        </div>

        {/* Bottom Feature Footer */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="grid grid-cols-3 gap-6 pt-6 border-t border-brand-cardBorder/40"
        >
          {[
            { icon: TrendingUp, label: 'Smart Trends' },
            { icon: ShieldCheck, label: 'Secure Database' },
            { icon: Sparkles, label: 'Gemini AI Engine' }
          ].map((feat, idx) => {
            const FeatIcon = feat.icon;
            return (
              <div key={idx} className="flex items-center gap-2 text-xs text-brand-textSecondary font-medium">
                <div className="p-1 bg-brand-accent/10 border border-brand-accent/15 rounded-lg">
                  <FeatIcon className="w-3.5 h-3.5 text-brand-accent" />
                </div>
                <span>{feat.label}</span>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Right Column: Authentication Card Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl relative overflow-hidden"
        >
          {/* Subtle gradient bar at top */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-accent via-emerald-400 to-blue-500 opacity-60" />
          <div className="absolute top-0 right-0 w-28 h-28 bg-brand-accent/5 rounded-full blur-2xl pointer-events-none"></div>

          <div className="text-center mb-6">
            <div className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-brand-accent/10 border border-brand-accent/25 mb-4 shadow-sm shadow-brand-accent/10 animate-pulse">
              <Sparkles className="w-5 h-5 text-brand-accent" />
            </div>
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-brand-accent via-emerald-300 to-blue-400 bg-clip-text text-transparent md:text-3xl tracking-tight">
              Create Account
            </h2>
            <p className="text-xs text-brand-textSecondary mt-2">
              Sign up today and get total control of your expenses
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {(formError || error) && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 text-xs text-red-400 bg-red-950/30 border border-red-500/20 rounded-xl leading-normal flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError || error}</span>
                </motion.div>
              )}
              {successMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 text-xs text-brand-accent bg-brand-accent/5 border border-brand-accent/20 rounded-xl leading-normal flex items-start gap-2 animate-pulse"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
              <motion.div variants={itemVariants}>
                <label className="block text-[11px] font-semibold text-brand-textSecondary uppercase tracking-wider mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-textSecondary pointer-events-none" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                    placeholder="Enter username"
                    required
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-[11px] font-semibold text-brand-textSecondary uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-textSecondary pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                    placeholder="Enter email"
                    required
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-[11px] font-semibold text-brand-textSecondary uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-textSecondary pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                    placeholder="Min 6 characters"
                    required
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-[11px] font-semibold text-brand-textSecondary uppercase tracking-wider mb-2">
                  Initial Membership (For Testing)
                </label>
                <div className="relative">
                  <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-textSecondary pointer-events-none" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 rounded-xl glass-input text-sm appearance-none cursor-pointer"
                  >
                    <option value="ROLE_NORMAL">User (Basic)</option>
                    <option value="ROLE_PREMIUM">Premium User</option>
                    <option value="ROLE_ADMIN">Administrator</option>
                  </select>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-accent hover:bg-brand-accentHover text-white py-2.5 rounded-xl font-bold text-sm transition-colors duration-200 flex items-center justify-center glow-btn cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <UserPlus className="w-4.5 h-4.5 mr-2" />
                      Sign Up
                    </>
                  )}
                </motion.button>
              </motion.div>
            </motion.div>
          </form>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-5 text-center text-xs text-brand-textSecondary"
          >
            Already have an account?{' '}
            <Link to="/login" className="text-brand-accent hover:underline font-bold transition-all duration-200">
              Sign In <ArrowRight className="inline w-3 h-3 ml-0.5" />
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
