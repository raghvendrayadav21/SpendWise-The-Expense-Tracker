import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit3, PiggyBank, AlertTriangle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const CategoriesList = ['Food', 'Rent', 'Utilities', 'Entertainment', 'Travel', 'Shopping', 'Healthcare', 'Others'];

const BudgetsPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [category, setCategory] = useState('Food');
  const [limit, setLimit] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = async () => {
    try {
      const [budRes, expRes] = await Promise.all([
        api.get('/budgets'),
        api.get('/expenses')
      ]);
      setBudgets(budRes.data || []);
      setExpenses(expRes.data || []);
    } catch (err) {
      console.error("Error fetching budget data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!limit) {
      setErrorMsg('Please enter a budget limit.');
      return;
    }

    const limitFloat = parseFloat(limit);
    if (isNaN(limitFloat) || limitFloat <= 0) {
      setErrorMsg('Limit must be a positive number.');
      return;
    }

    try {
      const res = await api.post('/budgets', {
        category,
        monthlyLimit: limitFloat
      });

      // Update state
      const exists = budgets.some(b => b.category === category);
      if (exists) {
        setBudgets(budgets.map(b => b.category === category ? res.data : b));
        setSuccessMsg(`Updated ${category} budget successfully!`);
      } else {
        setBudgets([...budgets, res.data]);
        setSuccessMsg(`Created ${category} budget successfully!`);
      }

      setLimit('');
    } catch (err) {
      setErrorMsg('Failed to set budget. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this budget limit?")) {
      try {
        await api.delete(`/budgets/${id}`);
        setBudgets(budgets.filter(b => b.id !== id));
        setSuccessMsg('Budget deleted successfully.');
      } catch (err) {
        console.error("Error deleting budget:", err);
      }
    }
  };

  // Compile calculations: Group current month expenses by category
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const categorySpendMap = {};
  currentExpenses.forEach(e => {
    categorySpendMap[e.category] = (categorySpendMap[e.category] || 0) + e.amount;
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-brand-textPrimary">Category Budgets</h1>
        <p className="text-brand-textSecondary text-sm mt-1">Define limits and track real-time category spending limits.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Set Budget Form */}
        <div className="glass-panel p-6 rounded-2xl h-fit">
          <div className="flex items-center space-x-2 mb-6">
            <PiggyBank className="w-6 h-6 text-brand-accent" />
            <h3 className="text-lg font-bold">Set Category Limit</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 text-sm text-red-400 bg-red-950/30 border border-red-500/20 rounded-xl">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-3 text-sm text-green-400 bg-green-950/30 border border-green-500/20 rounded-xl">
                {successMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm cursor-pointer bg-brand-darkBg"
              >
                {CategoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-2">
                Monthly Limit (₹)
              </label>
              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                placeholder="e.g. 500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-brand-accent hover:bg-brand-accentHover text-white rounded-xl text-sm font-semibold transition glow-btn flex items-center justify-center cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" />
              Save Budget
            </button>
          </form>
        </div>

        {/* Budgets Progress List */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold">Budgets Performance</h3>

          {budgets.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl text-center text-brand-textSecondary text-sm">
              No budget limits set. Use the form to establish category boundaries.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {budgets.map((b) => {
                const spent = categorySpendMap[b.category] || 0;
                const percent = (spent / b.monthlyLimit) * 100;
                const isOver = spent > b.monthlyLimit;
                const isWarning = percent >= 80 && percent <= 100;

                return (
                  <div key={b.id} className="glass-panel p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between">
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-base font-bold text-brand-textPrimary">{b.category}</h4>
                          <span className="text-[10px] text-brand-textSecondary uppercase tracking-wider font-mono">
                            Limit: ₹{b.monthlyLimit.toFixed(2)}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="p-1 text-brand-textSecondary hover:text-red-400 hover:bg-white/5 rounded-lg transition"
                          title="Delete Limit"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Spend details */}
                      <div className="mt-4 flex items-baseline justify-between">
                        <span className="text-2xl font-bold font-mono text-brand-textPrimary">
                          ₹{spent.toFixed(2)}
                        </span>
                        <span className="text-xs text-brand-textSecondary">spent</span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-white/10 h-2 rounded-full mt-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isOver 
                              ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' 
                              : isWarning 
                                ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' 
                                : 'bg-brand-accent shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                          }`}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Progress feedback label */}
                    <div className="mt-4 pt-3 border-t border-brand-cardBorder/50 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1.5">
                        {isOver ? (
                          <>
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                            <span className="text-red-400 font-semibold">Exceeded by ₹{(spent - b.monthlyLimit).toFixed(2)}</span>
                          </>
                        ) : isWarning ? (
                          <>
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                            <span className="text-amber-400 font-semibold">Warning: Near Limit</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-brand-accent" />
                            <span className="text-brand-accent font-semibold">Under Budget</span>
                          </>
                        )}
                      </div>
                      <span className="font-mono text-brand-textSecondary">{percent.toFixed(0)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetsPage;
