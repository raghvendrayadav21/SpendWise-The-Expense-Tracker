import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, PiggyBank, AlertTriangle, CheckCircle2,
  TrendingDown, Utensils, Home, Lightbulb, Clapperboard, Car, ShoppingBag, HeartPulse, PackageOpen
} from 'lucide-react';
import api from '../services/api';

const CategoriesList = ['Food', 'Rent', 'Utilities', 'Entertainment', 'Travel', 'Shopping', 'Healthcare', 'Others'];

const CATEGORY_META = {
  Food:          { icon: Utensils,     color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  Rent:          { icon: Home,         color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20' },
  Utilities:     { icon: Lightbulb,    color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  Entertainment: { icon: Clapperboard, color: 'text-pink-400',   bg: 'bg-pink-500/10',   border: 'border-pink-500/20' },
  Travel:        { icon: Car,          color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20' },
  Shopping:      { icon: ShoppingBag,  color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  Healthcare:    { icon: HeartPulse,   color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20' },
  Others:        { icon: PackageOpen,  color: 'text-slate-400',  bg: 'bg-slate-500/10',  border: 'border-slate-500/20' },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: i => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.38, ease: [0.4, 0, 0.2, 1] } }),
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.22 } },
};

const BudgetsPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('Food');
  const [limit, setLimit] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [animateBars, setAnimateBars] = useState(false);

  const fetchData = async () => {
    try {
      const [budRes, expRes] = await Promise.all([api.get('/budgets'), api.get('/expenses')]);
      setBudgets(budRes.data || []);
      setExpenses(expRes.data || []);
    } catch (err) {
      console.error('Error fetching budget data:', err);
    } finally {
      setLoading(false);
      setTimeout(() => setAnimateBars(true), 300);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setErrorMsg(''); setSuccessMsg('');
    if (!limit) { setErrorMsg('Please enter a budget limit.'); return; }
    const limitFloat = parseFloat(limit);
    if (isNaN(limitFloat) || limitFloat <= 0) { setErrorMsg('Limit must be a positive number.'); return; }
    try {
      const res = await api.post('/budgets', { category, monthlyLimit: limitFloat });
      const exists = budgets.some(b => b.category === category);
      if (exists) {
        setBudgets(budgets.map(b => b.category === category ? res.data : b));
        setSuccessMsg(`Updated ${category} budget successfully!`);
      } else {
        setBudgets([...budgets, res.data]);
        setSuccessMsg(`Created ${category} budget successfully!`);
      }
      setLimit('');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) { setErrorMsg('Failed to set budget. Please try again.'); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/budgets/${id}`);
      setBudgets(prev => prev.filter(b => b.id !== id));
      setDeleteConfirmId(null);
    } catch (err) { console.error('Error deleting budget:', err); }
  };

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const categorySpendMap = {};
  currentExpenses.forEach(e => { categorySpendMap[e.category] = (categorySpendMap[e.category] || 0) + e.amount; });

  const totalBudget = budgets.reduce((s, b) => s + b.monthlyLimit, 0);
  const totalSpent = budgets.reduce((s, b) => s + (categorySpendMap[b.category] || 0), 0);
  const overBudgetCount = budgets.filter(b => (categorySpendMap[b.category] || 0) > b.monthlyLimit).length;

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2"><div className="skeleton h-8 w-52 rounded-lg" /><div className="skeleton h-4 w-64 rounded" /></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-10 w-full rounded-xl" />)}
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => <div key={i} className="glass-panel p-5 rounded-2xl h-40 skeleton" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-textPrimary">Category Budgets</h1>
        <p className="text-brand-textSecondary text-sm mt-1">Set spending limits and track real-time category performance.</p>
      </motion.div>

      {/* Summary Stats */}
      {budgets.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4"
        >
          {[
            { label: 'Total Budget', val: `₹${totalBudget.toFixed(0)}`, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
            { label: 'Total Spent', val: `₹${totalSpent.toFixed(0)}`, color: 'text-brand-accent', bg: 'bg-brand-accent/10 border-brand-accent/20' },
            { label: 'Over Limit', val: `${overBudgetCount} categor${overBudgetCount === 1 ? 'y' : 'ies'}`, color: overBudgetCount > 0 ? 'text-red-400' : 'text-brand-accent', bg: overBudgetCount > 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-brand-accent/10 border-brand-accent/20' },
          ].map(s => (
            <div key={s.label} className={`glass-panel rounded-xl p-4 border ${s.bg}`}>
              <p className="text-xs text-brand-textSecondary font-medium">{s.label}</p>
              <p className={`text-xl font-extrabold font-mono mt-1 ${s.color}`}>{s.val}</p>
            </div>
          ))}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Set Budget Form */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
          className="glass-panel p-6 rounded-2xl h-fit"
        >
          <div className="flex items-center space-x-2.5 mb-6">
            <div className="p-2 bg-brand-accent/10 rounded-xl border border-brand-accent/20">
              <PiggyBank className="w-5 h-5 text-brand-accent" />
            </div>
            <h3 className="text-lg font-bold">Set Category Limit</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {errorMsg && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="p-3 text-xs text-red-400 bg-red-950/30 border border-red-500/20 rounded-xl">{errorMsg}</motion.div>
              )}
              {successMsg && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="p-3 text-xs text-brand-accent bg-brand-accent/5 border border-brand-accent/20 rounded-xl flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" /><span>{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-[11px] font-semibold text-brand-textSecondary uppercase tracking-wider mb-1.5">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm cursor-pointer">
                {CategoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-brand-textSecondary uppercase tracking-wider mb-1.5">Monthly Limit (₹)</label>
              <input type="number" value={limit} onChange={e => setLimit(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm font-mono" placeholder="e.g. 5000" />
            </div>

            <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="w-full py-2.5 bg-brand-accent hover:bg-brand-accentHover text-white rounded-xl text-sm font-semibold transition glow-btn flex items-center justify-center cursor-pointer">
              <Plus className="w-4 h-4 mr-2" /> Save Budget Limit
            </motion.button>
          </form>
        </motion.div>

        {/* Budget Cards */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-brand-textPrimary">Budget Performance</h3>

          {budgets.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="glass-panel p-12 rounded-2xl flex flex-col items-center space-y-3 text-brand-textMuted">
              <PiggyBank className="w-14 h-14 opacity-20" />
              <p className="text-sm font-medium">No budget limits set yet</p>
              <p className="text-xs text-brand-textSecondary">Use the form to establish category boundaries</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AnimatePresence>
                {budgets.map((b, i) => {
                  const spent = categorySpendMap[b.category] || 0;
                  const percent = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
                  const isOver = spent > b.monthlyLimit;
                  const isWarning = percent >= 80 && percent <= 100;
                  const meta = CATEGORY_META[b.category] || CATEGORY_META['Others'];
                  const Icon = meta.icon;
                  const progressColor = isOver ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-brand-accent';
                  const glowColor = isOver ? 'shadow-[0_0_12px_rgba(239,68,68,0.4)]' : isWarning ? 'shadow-[0_0_12px_rgba(245,158,11,0.4)]' : 'shadow-[0_0_12px_rgba(0,208,132,0.35)]';

                  return (
                    <motion.div key={b.id} custom={i} variants={cardVariants} initial="hidden" animate="show" exit="exit" layout
                      className={`glass-panel p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between border ${isOver ? 'border-red-500/20' : isWarning ? 'border-amber-500/20' : 'border-brand-cardBorder'} glass-panel-hover`}
                    >
                      {/* Top — Category + Delete */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className={`p-2 rounded-xl ${meta.bg} border ${meta.border}`}>
                            <Icon className={`w-4 h-4 ${meta.color}`} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-brand-textPrimary">{b.category}</h4>
                            <span className="text-[10px] text-brand-textSecondary font-mono">Limit: ₹{b.monthlyLimit.toFixed(0)}</span>
                          </div>
                        </div>
                        {deleteConfirmId === b.id ? (
                          <div className="flex space-x-1">
                            <button onClick={() => handleDelete(b.id)}
                              className="px-2 py-1 bg-red-500/20 hover:bg-red-500/35 text-red-400 border border-red-500/30 rounded-lg text-[10px] font-bold transition">
                              Confirm
                            </button>
                            <button onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 bg-white/5 hover:bg-white/10 text-brand-textSecondary border border-brand-cardBorder rounded-lg text-[10px] transition">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirmId(b.id)}
                            className="p-1.5 text-brand-textSecondary hover:text-red-400 hover:bg-white/5 rounded-lg transition">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Amount display */}
                      <div className="mt-4 flex items-baseline justify-between">
                        <span className="text-2xl font-extrabold font-mono text-brand-textPrimary">₹{spent.toFixed(0)}</span>
                        <span className="text-xs text-brand-textSecondary">of ₹{b.monthlyLimit.toFixed(0)}</span>
                      </div>

                      {/* Animated Progress bar */}
                      <div className="w-full bg-white/10 h-2 rounded-full mt-3 overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${progressColor} ${glowColor}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(percent, 100)}%` }}
                          transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1], delay: i * 0.08 + 0.2 }}
                        />
                      </div>

                      {/* Status */}
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-1.5">
                          {isOver ? (
                            <><AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                              <span className="text-red-400 font-semibold">Exceeded ₹{(spent - b.monthlyLimit).toFixed(0)}</span></>
                          ) : isWarning ? (
                            <><AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                              <span className="text-amber-400 font-semibold">Near Limit</span></>
                          ) : (
                            <><CheckCircle2 className="w-3.5 h-3.5 text-brand-accent" />
                              <span className="text-brand-accent font-semibold">Under Budget</span></>
                          )}
                        </div>
                        <span className={`font-mono font-bold ${isOver ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-brand-textSecondary'}`}>
                          {percent.toFixed(0)}%
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetsPage;
