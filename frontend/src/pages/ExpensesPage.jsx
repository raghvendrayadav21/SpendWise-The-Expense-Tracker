import React, { useEffect, useState } from 'react';
import { Trash2, Edit3, Plus, Search, Filter, X } from 'lucide-react';
import api from '../services/api';

const CategoriesList = ['Food', 'Rent', 'Utilities', 'Entertainment', 'Travel', 'Shopping', 'Healthcare', 'Others'];

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('ADD'); // ADD or EDIT
  const [currentId, setCurrentId] = useState('');
  
  // Form states
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expenses');
      setExpenses(res.data || []);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleOpenAdd = () => {
    setModalMode('ADD');
    setAmount('');
    setCategory('Food');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp) => {
    setModalMode('EDIT');
    setCurrentId(exp.id);
    setAmount(exp.amount.toString());
    setCategory(exp.category);
    setDate(exp.date);
    setDescription(exp.description);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await api.delete(`/expenses/${id}`);
        setExpenses(expenses.filter(e => e.id !== id));
      } catch (err) {
        console.error("Error deleting expense:", err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!amount || !category || !date || !description) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    const amtFloat = parseFloat(amount);
    if (isNaN(amtFloat) || amtFloat <= 0) {
      setErrorMsg('Amount must be a positive number.');
      return;
    }

    const payload = {
      amount: amtFloat,
      category,
      date,
      description
    };

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

  // Filter and Search logic
  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(search.toLowerCase()) || 
                          e.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter ? e.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center flex-1 py-20">
        <span className="w-12 h-12 border-4 border-brand-accent/20 border-t-brand-accent rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-textPrimary">Transactions Journal</h1>
          <p className="text-brand-textSecondary text-sm mt-1">Log, view, and manage your daily expense logs.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center px-4 py-2.5 bg-brand-accent hover:bg-brand-accentHover text-white text-sm font-semibold rounded-xl transition-all duration-200 glow-btn"
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Expense
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-textSecondary">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-sm"
            placeholder="Search details or categories..."
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-textSecondary">
            <Filter className="w-4 h-4" />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-sm cursor-pointer bg-brand-darkBg"
          >
            <option value="">All Categories</option>
            {CategoriesList.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <p className="text-sm text-brand-textSecondary text-center py-12">
            No matching transactions found. Try resetting filters or log a new expense!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-brand-cardBorder bg-white/5 text-brand-textSecondary">
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Description</th>
                  <th className="px-6 py-4 font-semibold text-right">Amount</th>
                  <th className="px-6 py-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="border-b border-brand-cardBorder/50 hover:bg-white/5 transition-all">
                    <td className="px-6 py-4 font-mono">{exp.date}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-accent/10 text-brand-accent border border-brand-accent/20">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-brand-textSecondary">{exp.description}</td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-brand-accent">₹{exp.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleOpenEdit(exp)}
                          className="p-1.5 hover:bg-white/10 text-brand-textSecondary hover:text-brand-textPrimary rounded-lg transition"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(exp.id)}
                          className="p-1.5 hover:bg-red-500/10 text-brand-textSecondary hover:text-red-400 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Popup for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-brand-darkBg/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full glass-panel p-6 rounded-3xl relative animate-scaleUp">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1 rounded-lg text-brand-textSecondary hover:bg-white/10 hover:text-brand-textPrimary"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold mb-6 text-brand-textPrimary">
              {modalMode === 'ADD' ? 'Log New Transaction' : 'Edit Transaction'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 text-sm text-red-400 bg-red-950/30 border border-red-500/20 rounded-xl">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  placeholder="0.00"
                />
              </div>

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
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  placeholder="e.g. Weekly organic grocery"
                />
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 border border-brand-cardBorder hover:bg-white/5 rounded-xl text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-accent hover:bg-brand-accentHover text-white rounded-xl text-sm font-semibold transition glow-btn"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;
