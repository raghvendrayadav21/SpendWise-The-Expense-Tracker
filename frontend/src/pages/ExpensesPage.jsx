import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2, Edit3, Plus, Search, Filter, X, ReceiptText,
  Utensils, Home, Lightbulb, Clapperboard, Car, ShoppingBag, HeartPulse, PackageOpen,
  IndianRupee
} from 'lucide-react';
import api from '../services/api';

const CategoriesList = ['Food', 'Rent', 'Utilities', 'Entertainment', 'Travel', 'Shopping', 'Healthcare', 'Others'];

const CATEGORY_META = {
  Food:          { icon: Utensils,     color: 'bg-orange-500/15 text-orange-400 border-orange-500/25' },
  Rent:          { icon: Home,         color: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
  Utilities:     { icon: Lightbulb,    color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25' },
  Entertainment: { icon: Clapperboard, color: 'bg-pink-500/15 text-pink-400 border-pink-500/25' },
  Travel:        { icon: Car,          color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25' },
  Shopping:      { icon: ShoppingBag,  color: 'bg-purple-500/15 text-purple-400 border-purple-500/25' },
  Healthcare:    { icon: HeartPulse,   color: 'bg-red-500/15 text-red-400 border-red-500/25' },
  Others:        { icon: PackageOpen,  color: 'bg-slate-500/15 text-slate-400 border-slate-500/25' },
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const rowVariants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, x: 12, height: 0, transition: { duration: 0.25 } },
};

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('ADD');
  const [currentId, setCurrentId] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expenses');
      setExpenses(res.data || []);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, []);

  const handleOpenAdd = () => {
    setModalMode('ADD'); setAmount(''); setCategory('Food');
    setDate(new Date().toISOString().split('T')[0]); setDescription(''); setErrorMsg('');
    setIsModalOpen(true);
  };
  const handleOpenEdit = (exp) => {
    setModalMode('EDIT'); setCurrentId(exp.id); setAmount(exp.amount.toString());
    setCategory(exp.category); setDate(exp.date); setDescription(exp.description);
    setErrorMsg(''); setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(prev => prev.filter(e => e.id !== id));
      setDeleteConfirmId(null);
    } catch (err) { console.error('Error deleting expense:', err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setErrorMsg('');
    if (!amount || !category || !date || !description) { setErrorMsg('Please fill in all fields.'); return; }
    const amtFloat = parseFloat(amount);
    if (isNaN(amtFloat) || amtFloat <= 0) { setErrorMsg('Amount must be a positive number.'); return; }
    const payload = { amount: amtFloat, category, date, description };
    try {
      if (modalMode === 'ADD') {
        const res = await api.post('/expenses', payload);
        setExpenses([res.data, ...expenses]);
      } else {
        const res = await api.put(`/expenses/${currentId}`, payload);
        setExpenses(expenses.map(e => e.id === currentId ? res.data : e));
      }
      setIsModalOpen(false);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save transaction.');
    }
  };

  const filteredExpenses = expenses.filter(e => {
    const matchSearch = e.description.toLowerCase().includes(search.toLowerCase()) ||
                        e.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter ? e.category === categoryFilter : true;
    return matchSearch && matchCat;
  });

  const totalFiltered = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2"><div className="skeleton h-8 w-56 rounded-lg" /><div className="skeleton h-4 w-64 rounded" /></div>
          <div className="skeleton h-10 w-32 rounded-xl" />
        </div>
        <div className="glass-panel rounded-2xl overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-6 py-5 border-b border-brand-cardBorder/40 flex items-center space-x-4">
              <div className="skeleton h-4 w-24 rounded" />
              <div className="skeleton h-6 w-20 rounded-full" />
              <div className="skeleton h-4 flex-1 rounded" />
              <div className="skeleton h-4 w-20 rounded ml-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-textPrimary">Transactions Journal</h1>
          <p className="text-brand-textSecondary text-sm mt-1">Log, view, and manage your daily expense records.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={handleOpenAdd}
          className="flex items-center px-5 py-2.5 bg-brand-accent hover:bg-brand-accentHover text-white text-sm font-semibold rounded-xl transition-colors duration-200 glow-btn"
        >
          <Plus className="w-4 h-4 mr-2" /> Log Expense
        </motion.button>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.35 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-textSecondary pointer-events-none" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm" placeholder="Search by description or category…" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-textSecondary pointer-events-none" />
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm cursor-pointer appearance-none"
          >
            <option value="">All Categories</option>
            {CategoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </motion.div>

      {/* Summary bar */}
      {filteredExpenses.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="flex items-center justify-between px-5 py-3 rounded-xl bg-white/[0.03] border border-brand-cardBorder text-xs text-brand-textSecondary"
        >
          <span>{filteredExpenses.length} transaction{filteredExpenses.length !== 1 ? 's' : ''} found</span>
          <span className="font-mono font-bold text-brand-accent">Total: ₹{totalFiltered.toFixed(2)}</span>
        </motion.div>
      )}

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.4 }}
        className="glass-panel rounded-2xl overflow-hidden"
      >
        {filteredExpenses.length === 0 ? (
          <div className="py-16 flex flex-col items-center space-y-3 text-brand-textMuted">
            <ReceiptText className="w-14 h-14 opacity-20" />
            <p className="text-sm font-medium">No matching transactions found</p>
            <p className="text-xs text-brand-textSecondary">Try resetting filters or log a new expense</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-brand-cardBorder bg-white/[0.025] text-brand-textSecondary text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <AnimatePresence mode="popLayout">
                <motion.tbody variants={containerVariants} initial="hidden" animate="show">
                  {filteredExpenses.map((exp) => {
                    const meta = CATEGORY_META[exp.category] || CATEGORY_META['Others'];
                    const Icon = meta.icon;
                    return (
                      <motion.tr key={exp.id} variants={rowVariants} layout exit="exit"
                        className="border-b border-brand-cardBorder/40 hover:bg-white/[0.03] transition-colors"
                      >
                        <td className="px-6 py-4 font-mono text-xs text-brand-textSecondary">{exp.date}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.color}`}>
                            <Icon className="w-3 h-3" />
                            <span>{exp.category}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-brand-textSecondary">{exp.description}</td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-brand-accent">₹{exp.amount.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center space-x-1.5">
                            {deleteConfirmId === exp.id ? (
                              <>
                                <button onClick={() => handleDelete(exp.id)}
                                  className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/35 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold transition">
                                  Confirm
                                </button>
                                <button onClick={() => setDeleteConfirmId(null)}
                                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-brand-textSecondary border border-brand-cardBorder rounded-lg text-xs transition">
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <motion.button whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
                                  onClick={() => handleOpenEdit(exp)}
                                  className="p-1.5 hover:bg-blue-500/10 text-brand-textSecondary hover:text-blue-400 rounded-lg transition" title="Edit">
                                  <Edit3 className="w-4 h-4" />
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
                                  onClick={() => setDeleteConfirmId(exp.id)}
                                  className="p-1.5 hover:bg-red-500/10 text-brand-textSecondary hover:text-red-400 rounded-lg transition" title="Delete">
                                  <Trash2 className="w-4 h-4" />
                                </motion.button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </motion.tbody>
              </AnimatePresence>
            </table>
          </div>
        )}
      </motion.div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 12 }}
              transition={{ type: 'spring', damping: 26, stiffness: 310 }}
              className="max-w-md w-full glass-panel p-7 rounded-3xl relative"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-accent via-blue-500 to-violet-500 rounded-t-3xl opacity-60" />

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-brand-textPrimary">
                    {modalMode === 'ADD' ? 'Log New Transaction' : 'Edit Transaction'}
                  </h3>
                  <p className="text-xs text-brand-textSecondary mt-0.5">
                    {modalMode === 'ADD' ? 'Record a new expense entry' : 'Modify the selected record'}
                  </p>
                </div>
                <button onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-xl text-brand-textSecondary hover:text-brand-textPrimary transition cursor-pointer">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence>
                  {errorMsg && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="p-3 text-xs text-red-400 bg-red-950/30 border border-red-500/20 rounded-xl">
                      {errorMsg}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-brand-textSecondary uppercase tracking-wider mb-1.5">Amount (₹)</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-textSecondary pointer-events-none" />
                      <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm font-mono" placeholder="0.00" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-brand-textSecondary uppercase tracking-wider mb-1.5">Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm cursor-pointer">
                      {CategoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-brand-textSecondary uppercase tracking-wider mb-1.5">Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-brand-textSecondary uppercase tracking-wider mb-1.5">Description</label>
                    <input type="text" value={description} onChange={e => setDescription(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" placeholder="e.g. Weekly organic grocery run" />
                  </div>
                </div>

                <div className="flex space-x-3 mt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 border border-brand-cardBorder hover:bg-white/5 rounded-xl text-sm font-semibold transition cursor-pointer text-brand-textSecondary">
                    Cancel
                  </button>
                  <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="flex-1 py-2.5 bg-brand-accent hover:bg-brand-accentHover text-white rounded-xl text-sm font-semibold transition glow-btn cursor-pointer">
                    {modalMode === 'ADD' ? 'Save Transaction' : 'Update Transaction'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExpensesPage;
