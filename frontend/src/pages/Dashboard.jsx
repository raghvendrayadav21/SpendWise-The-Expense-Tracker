import React, { useEffect, useState, useRef } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';
import {
  IndianRupee,
  TrendingUp,
  Target,
  Zap,
  ArrowRight,
  PlusCircle,
  Sparkles,
  ReceiptText,
  ShoppingBag,
  Utensils,
  Home,
  Lightbulb,
  Car,
  Clapperboard,
  HeartPulse,
  PackageOpen,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';

const COLORS = ['#00D084', '#3B82F6', '#7C3AED', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];

const CATEGORY_ICONS = {
  Food: Utensils, Rent: Home, Utilities: Lightbulb,
  Entertainment: Clapperboard, Travel: Car, Shopping: ShoppingBag,
  Healthcare: HeartPulse, Others: PackageOpen,
};

// Animated counter hook
function useCountUp(target, duration = 1200, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start || target === 0) { setCount(target); return; }
    const startTime = performance.now();
    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// Skeleton card
const SkeletonCard = () => (
  <div className="glass-panel p-6 rounded-2xl space-y-3">
    <div className="skeleton h-3 w-28 rounded" />
    <div className="skeleton h-8 w-36 rounded" />
    <div className="skeleton h-2.5 w-20 rounded" />
  </div>
);

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.4, 0, 0.2, 1] } },
};

const Dashboard = () => {
  const { user, isPremium } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animateNumbers, setAnimateNumbers] = useState(false);
  const [summary, setSummary] = useState({ totalSpent: 0, totalBudget: 0, remainingBudget: 0, utilizationPercent: 0 });

  const animSpent = useCountUp(summary.totalSpent, 1100, animateNumbers);
  const animBudget = useCountUp(summary.totalBudget, 1100, animateNumbers);
  const animRemaining = useCountUp(summary.remainingBudget, 1100, animateNumbers);
  const animUtil = useCountUp(summary.utilizationPercent, 1100, animateNumbers);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [expRes, budRes] = await Promise.all([api.get('/expenses'), api.get('/budgets')]);
        const fetchedExpenses = expRes.data || [];
        const fetchedBudgets = budRes.data || [];
        setExpenses(fetchedExpenses);
        setBudgets(fetchedBudgets);

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const currentMonthExpenses = fetchedExpenses.filter(e => {
          const d = new Date(e.date);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const totalSpent = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
        const totalBudget = fetchedBudgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
        const remainingBudget = totalBudget - totalSpent;
        const utilizationPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

        setSummary({ totalSpent, totalBudget, remainingBudget: remainingBudget > 0 ? remainingBudget : 0, utilizationPercent });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
        setTimeout(() => setAnimateNumbers(true), 150);
      }
    };
    fetchDashboardData();
  }, []);

  const categoryDataMap = {};
  expenses.forEach(e => { categoryDataMap[e.category] = (categoryDataMap[e.category] || 0) + e.amount; });
  const pieData = Object.keys(categoryDataMap).map(cat => ({ name: cat, value: parseFloat(categoryDataMap[cat].toFixed(2)) }));
  const barData = budgets.map(b => {
    const spent = expenses.filter(e => e.category === b.category).reduce((sum, e) => sum + e.amount, 0);
    return { category: b.category, Limit: b.monthlyLimit, Spent: parseFloat(spent.toFixed(2)) };
  });

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: isLight ? '#FFFFFF' : '#0D1220',
      border: isLight ? '1px solid rgba(0,0,0,0.10)' : '1px solid rgba(255,255,255,0.08)',
      borderRadius: '14px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: '12px',
    },
    itemStyle: { color: isLight ? '#0F172A' : '#F1F5F9' },
    labelStyle: { color: isLight ? '#475569' : '#94A3B8', fontWeight: 600 },
  };

  const kpiCards = [
    {
      label: 'Total Spent (Month)', value: `₹${animSpent.toFixed(2)}`,
      icon: IndianRupee, iconBg: 'bg-brand-accent/12', iconColor: 'text-brand-accent',
      sub: <span className="flex items-center text-brand-accent"><TrendingUp className="w-3 h-3 mr-1" />Live tracking active</span>,
      border: 'border-brand-accent/15',
    },
    {
      label: 'Monthly Budget', value: `₹${animBudget.toFixed(2)}`,
      icon: Target, iconBg: 'bg-blue-500/12', iconColor: 'text-blue-400',
      sub: <span className="text-brand-textSecondary">across {budgets.length} categories</span>,
      border: 'border-blue-500/15',
    },
    {
      label: 'Remaining Budget', value: `₹${animRemaining.toFixed(2)}`,
      icon: Zap, iconBg: 'bg-violet-500/12', iconColor: 'text-violet-400',
      sub: <span className="text-brand-textSecondary">available this month</span>,
      border: 'border-violet-500/15',
    },
    {
      label: 'Budget Utilization', value: `${animUtil.toFixed(1)}%`,
      icon: ReceiptText, iconBg: summary.utilizationPercent > 100 ? 'bg-red-500/12' : 'bg-amber-500/12',
      iconColor: summary.utilizationPercent > 100 ? 'text-red-400' : 'text-amber-400',
      sub: (
        <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${summary.utilizationPercent > 100 ? 'bg-red-500' : summary.utilizationPercent >= 80 ? 'bg-amber-500' : 'bg-brand-accent'}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(summary.utilizationPercent, 100)}%` }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
          />
        </div>
      ),
      border: summary.utilizationPercent > 100 ? 'border-red-500/15' : 'border-amber-500/15',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2"><div className="skeleton h-8 w-52 rounded-lg" /><div className="skeleton h-4 w-72 rounded" /></div>
          <div className="skeleton h-10 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel rounded-2xl p-6"><div className="skeleton h-64 w-full rounded-xl" /></div>
          <div className="glass-panel rounded-2xl p-6"><div className="skeleton h-64 w-full rounded-xl" /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0"
      >
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-textPrimary">
            Financial Dashboard
          </h1>
          <p className="text-brand-textSecondary mt-1 text-sm">
            Hello, <span className="text-brand-accent font-semibold">{user?.username}</span> — here's your monthly snapshot.
          </p>
        </div>
        <Link
          to="/expenses"
          className="inline-flex items-center px-5 py-2.5 bg-brand-accent hover:bg-brand-accentHover text-white text-sm font-semibold rounded-xl transition-all duration-200 glow-btn"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Expense
        </Link>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label} variants={cardVariants}
              className={`glass-panel p-6 rounded-2xl relative overflow-hidden border ${card.border} glass-panel-hover`}
            >
              <div className="absolute top-3 right-3">
                <div className={`p-2.5 ${card.iconBg} rounded-xl`}>
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
              </div>
              <p className="text-xs font-semibold text-brand-textSecondary uppercase tracking-wider pr-12">{card.label}</p>
              <h3 className="text-2xl font-extrabold mt-2 font-mono text-brand-textPrimary">{card.value}</h3>
              <div className="text-xs mt-2">{card.sub}</div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Upgrade Banner */}
      {!isPremium() && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="gradient-border p-6 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-brand-accent/10 border border-brand-accent/20 rounded-xl">
              <Sparkles className="w-6 h-6 text-brand-accent" />
            </div>
            <div>
              <h4 className="text-base font-bold text-brand-textPrimary">Unlock AI Insights & Custom Exports</h4>
              <p className="text-xs text-brand-textSecondary mt-0.5">Get tailored savings plans and Excel/PDF statements with premium.</p>
            </div>
          </div>
          <Link to="/signup" className="flex-shrink-0 px-5 py-2 bg-brand-accent/15 hover:bg-brand-accent/25 border border-brand-accent/30 text-brand-accent text-xs font-bold rounded-xl transition-all duration-200">
            Upgrade Account →
          </Link>
        </motion.div>
      )}

      {/* Charts */}
      <motion.div
        variants={containerVariants} initial="hidden" animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <motion.div variants={cardVariants} className="glass-panel p-6 rounded-2xl">
          <h3 className="text-lg font-bold mb-1 text-brand-textPrimary">Category Allocation</h3>
          <p className="text-xs text-brand-textSecondary mb-5">All-time spending distribution by category</p>
          {pieData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-3 text-brand-textMuted">
              <ShoppingBag className="w-12 h-12 opacity-30" />
              <p className="text-sm">Log expenses to see distribution</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" labelLine={false} outerRadius={85} innerRadius={40} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip {...tooltipStyle} formatter={(val) => [`₹${val.toFixed(2)}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        <motion.div variants={cardVariants} className="glass-panel p-6 rounded-2xl">
          <h3 className="text-lg font-bold mb-1 text-brand-textPrimary">Budget vs Actual Spend</h3>
          <p className="text-xs text-brand-textSecondary mb-5">Category-wise budget utilization comparison</p>
          {barData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-3 text-brand-textMuted">
              <Target className="w-12 h-12 opacity-30" />
              <p className="text-sm">Set budgets to see comparison charts</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} barCategoryGap="30%">
                  <XAxis dataKey="category" stroke={isLight ? '#475569' : '#64748B'} fontSize={11} tick={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
                  <YAxis stroke={isLight ? '#475569' : '#64748B'} fontSize={11} tick={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
                  <Tooltip {...tooltipStyle} formatter={(val) => [`₹${val.toFixed(2)}`]} />
                  <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
                  <Bar dataKey="Limit" fill="#3B82F6" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="Spent" fill="#00D084" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }}
        className="glass-panel p-6 rounded-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-brand-textPrimary">Recent Transactions</h3>
            <p className="text-xs text-brand-textSecondary mt-0.5">Your last 5 logged expenses</p>
          </div>
          <Link to="/expenses" className="flex items-center text-brand-accent hover:text-brand-accentHover text-sm font-semibold transition">
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {expenses.length === 0 ? (
          <div className="py-12 flex flex-col items-center space-y-3 text-brand-textMuted">
            <ReceiptText className="w-14 h-14 opacity-25" />
            <p className="text-sm font-medium">No transactions yet</p>
            <Link to="/expenses" className="text-xs text-brand-accent hover:underline flex items-center">
              <PlusCircle className="w-3.5 h-3.5 mr-1" /> Log your first expense
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-brand-cardBorder text-brand-textSecondary text-xs font-semibold uppercase tracking-wider">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.slice(0, 5).map((exp, i) => {
                  const Icon = CATEGORY_ICONS[exp.category] || PackageOpen;
                  return (
                    <motion.tr key={exp.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07, duration: 0.3 }}
                      className="border-b border-brand-cardBorder/40 hover:bg-white/[0.03] transition-all"
                    >
                      <td className="py-4 font-mono text-brand-textSecondary text-xs">{exp.date}</td>
                      <td className="py-4">
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-accent/10 text-brand-accent border border-brand-accent/20">
                          <Icon className="w-3 h-3" />
                          <span>{exp.category}</span>
                        </span>
                      </td>
                      <td className="py-4 text-brand-textSecondary">{exp.description}</td>
                      <td className="py-4 text-right font-mono font-bold text-brand-accent">₹{exp.amount.toFixed(2)}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
