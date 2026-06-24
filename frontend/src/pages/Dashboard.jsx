import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { 
  IndianRupee, 
  TrendingUp, 
  Calendar, 
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];

const Dashboard = () => {
  const { user, isPremium } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalSpent: 0,
    totalBudget: 0,
    remainingBudget: 0,
    utilizationPercent: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [expRes, budRes] = await Promise.all([
          api.get('/expenses'),
          api.get('/budgets')
        ]);
        
        const fetchedExpenses = expRes.data || [];
        const fetchedBudgets = budRes.data || [];
        
        setExpenses(fetchedExpenses);
        setBudgets(fetchedBudgets);

        // Filter current month expenses
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

        setSummary({
          totalSpent,
          totalBudget,
          remainingBudget: remainingBudget > 0 ? remainingBudget : 0,
          utilizationPercent
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compile Category Breakdown for Pie Chart
  const categoryDataMap = {};
  expenses.forEach(e => {
    categoryDataMap[e.category] = (categoryDataMap[e.category] || 0) + e.amount;
  });
  const pieData = Object.keys(categoryDataMap).map(cat => ({
    name: cat,
    value: parseFloat(categoryDataMap[cat].toFixed(2))
  }));

  // Compile Budget vs Spent comparison for Bar Chart
  const barData = budgets.map(b => {
    const spent = expenses
      .filter(e => e.category === b.category)
      .reduce((sum, e) => sum + e.amount, 0);
    return {
      category: b.category,
      Limit: b.monthlyLimit,
      Spent: parseFloat(spent.toFixed(2))
    };
  });

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center flex-1 py-20">
        <span className="w-12 h-12 border-4 border-brand-accent/20 border-t-brand-accent rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Dashboard</h1>
          <p className="text-brand-textSecondary mt-1">
            Hello, <span className="text-brand-textPrimary font-semibold">{user?.username}</span>! Here is your current monthly overview.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/expenses"
            className="flex items-center px-4 py-2.5 bg-brand-accent hover:bg-brand-accentHover text-white text-sm font-semibold rounded-xl transition-all duration-200 glow-btn"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Expense
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Spent */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <IndianRupee className="w-16 h-16 text-brand-accent" />
          </div>
          <p className="text-xs font-semibold text-brand-textSecondary uppercase tracking-wider">Total Spent (Month)</p>
          <h3 className="text-2xl font-bold mt-2 font-mono">₹{summary.totalSpent.toFixed(2)}</h3>
          <p className="text-xs text-brand-accent mt-2 flex items-center">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            Live tracking active
          </p>
        </div>

        {/* KPI 2: Budget */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Calendar className="w-16 h-16 text-blue-400" />
          </div>
          <p className="text-xs font-semibold text-brand-textSecondary uppercase tracking-wider">Monthly Budget</p>
          <h3 className="text-2xl font-bold mt-2 font-mono">₹{summary.totalBudget.toFixed(2)}</h3>
          <p className="text-xs text-brand-textSecondary mt-2">
            across {budgets.length} categories
          </p>
        </div>

        {/* KPI 3: Remaining */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <IndianRupee className="w-16 h-16 text-emerald-400" />
          </div>
          <p className="text-xs font-semibold text-brand-textSecondary uppercase tracking-wider">Remaining Budget</p>
          <h3 className="text-2xl font-bold mt-2 font-mono">₹{summary.remainingBudget.toFixed(2)}</h3>
          <p className="text-xs text-brand-textSecondary mt-2">
            unallocated funds this month
          </p>
        </div>

        {/* KPI 4: Utilization */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <AlertTriangle className="w-16 h-16 text-amber-400" />
          </div>
          <p className="text-xs font-semibold text-brand-textSecondary uppercase tracking-wider">Budget Utilization</p>
          <h3 className="text-2xl font-bold mt-2 font-mono">{summary.utilizationPercent.toFixed(1)}%</h3>
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className={`h-full rounded-full ${summary.utilizationPercent > 100 ? 'bg-red-500' : 'bg-brand-accent'}`}
              style={{ width: `${Math.min(summary.utilizationPercent, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Upgrades Notification Banner if Basic */}
      {!isPremium() && (
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-brand-accent flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-brand-accent/10 border border-brand-accent/20 rounded-xl">
              <Sparkles className="w-6 h-6 text-brand-accent" />
            </div>
            <div>
              <h4 className="text-base font-bold">Unlock AI Insights & Custom Exports</h4>
              <p className="text-xs text-brand-textSecondary mt-0.5">Upgrade to Premium to get tailored savings plans and Excel/PDF statements.</p>
            </div>
          </div>
          <Link
            to="/signup" // Signup can upgrade roles, or we simulate upgrading
            className="px-5 py-2 bg-brand-accent/20 hover:bg-brand-accent/30 border border-brand-accent/30 text-brand-accent text-xs font-bold rounded-xl transition-all duration-200"
          >
            Upgrade Account
          </Link>
        </div>
      )}

      {/* Charts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown (Pie Chart) */}
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-lg font-bold mb-6">Category Allocation</h3>
          {pieData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-brand-textSecondary text-sm">
              Log transactions to see category distribution charts.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isLight ? '#FFFFFF' : '#0B0F19', 
                      border: isLight ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.08)', 
                      borderRadius: '12px' 
                    }}
                    itemStyle={{ color: isLight ? '#111827' : '#F3F4F6' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Budget vs Spent (Bar Chart) */}
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-lg font-bold mb-6">Budget Limit vs actual Spend</h3>
          {barData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-brand-textSecondary text-sm">
              Set budgets to see comparison charts.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="category" stroke={isLight ? '#4B5563' : '#9CA3AF'} fontSize={12} />
                  <YAxis stroke={isLight ? '#4B5563' : '#9CA3AF'} fontSize={12} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: isLight ? '#FFFFFF' : '#0B0F19', 
                      border: isLight ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.08)', 
                      borderRadius: '12px' 
                    }}
                    labelStyle={{ color: isLight ? '#4B5563' : '#9CA3AF' }}
                    itemStyle={{ color: isLight ? '#111827' : '#F3F4F6' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Bar dataKey="Limit" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Spent" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Recent Transactions</h3>
          <Link to="/expenses" className="text-brand-accent hover:underline text-sm font-semibold flex items-center">
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {expenses.length === 0 ? (
          <p className="text-sm text-brand-textSecondary text-center py-6">
            No expenses logged yet. Click "Add Expense" to log your first transaction!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-brand-cardBorder text-brand-textSecondary">
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.slice(0, 5).map((exp) => (
                  <tr key={exp.id} className="border-b border-brand-cardBorder/50 hover:bg-white/5 transition-all">
                    <td className="py-4 font-mono">{exp.date}</td>
                    <td className="py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-accent/10 text-brand-accent border border-brand-accent/20">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-4 text-brand-textSecondary">{exp.description}</td>
                    <td className="py-4 text-right font-mono font-bold text-brand-accent">₹{exp.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
