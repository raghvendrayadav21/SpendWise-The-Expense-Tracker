import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSpreadsheet, FileText, Calendar, AlertCircle, Download,
  CheckCircle2, Loader2, FileDown, Table2
} from 'lucide-react';
import api from '../services/api';

const ReportsPage = () => {
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loadingType, setLoadingType] = useState(null); // 'EXCEL' | 'PDF' | null
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const triggerDownload = async (type) => {
    setErrorMsg(''); setSuccessMsg('');
    if (!startDate || !endDate) { setErrorMsg('Please select both start and end dates.'); return; }
    if (new Date(startDate) > new Date(endDate)) { setErrorMsg('Start date cannot be after end date.'); return; }

    setLoadingType(type);
    try {
      const endpoint = type === 'EXCEL' ? '/reports/excel' : '/reports/pdf';
      const fileExtension = type === 'EXCEL' ? 'xlsx' : 'pdf';
      const mimeType = type === 'EXCEL'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf';

      const res = await api.get(`${endpoint}?startDate=${startDate}&endDate=${endDate}`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SpendWise_Report_${startDate}_to_${endDate}.${fileExtension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setSuccessMsg(`${type === 'EXCEL' ? 'Excel spreadsheet' : 'PDF statement'} downloaded successfully!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg('Download failed. Please ensure your account is active and try again.');
    } finally {
      setLoadingType(null);
    }
  };

  const reportFormats = [
    {
      type: 'EXCEL',
      label: 'Excel Spreadsheet',
      icon: FileSpreadsheet,
      gradient: 'from-emerald-600 to-green-700',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]',
      hoverGlow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]',
      description: 'Formatted cells, auto-sum formulas, category grouping',
    },
    {
      type: 'PDF',
      label: 'PDF Statement',
      icon: FileText,
      gradient: 'from-blue-600 to-indigo-700',
      glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
      hoverGlow: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]',
      description: 'Clean invoice layout, page headings, total highlights',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-textPrimary">Statement Reports</h1>
        <p className="text-brand-textSecondary text-sm mt-1">Export your transaction history as Excel or PDF for bookkeeping.</p>
      </motion.div>

      <div className="max-w-2xl space-y-6">
        {/* Date Picker Panel */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.4 }}
          className="glass-panel p-6 rounded-2xl space-y-5"
        >
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-brand-accent/10 rounded-xl border border-brand-accent/20">
              <Calendar className="w-5 h-5 text-brand-accent" />
            </div>
            <div>
              <h3 className="text-base font-bold">Select Billing Period</h3>
              <p className="text-xs text-brand-textSecondary mt-0.5">Choose the date range for your report</p>
            </div>
          </div>

          <AnimatePresence>
            {errorMsg && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="p-3 text-sm text-red-400 bg-red-950/30 border border-red-500/20 rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{errorMsg}</span>
              </motion.div>
            )}
            {successMsg && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="p-3 text-sm text-brand-accent bg-brand-accent/5 border border-brand-accent/20 rounded-xl flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" /><span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Start Date', value: startDate, setter: setStartDate },
              { label: 'End Date', value: endDate, setter: setEndDate },
            ].map(({ label, value, setter }) => (
              <div key={label}>
                <label className="block text-[11px] font-semibold text-brand-textSecondary uppercase tracking-wider mb-1.5">{label}</label>
                <input type="date" value={value} onChange={e => setter(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" />
              </div>
            ))}
          </div>

          {/* Download Buttons */}
          <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportFormats.map(({ type, label, icon: Icon, gradient, glow, hoverGlow, description }) => (
              <motion.button key={type} whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                onClick={() => triggerDownload(type)}
                disabled={!!loadingType}
                className={`flex flex-col items-start p-4 bg-gradient-to-br ${gradient} text-white rounded-xl text-sm font-semibold transition-all duration-200 ${glow} ${hoverGlow} disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-left`}
              >
                <div className="flex items-center w-full mb-2">
                  {loadingType === type ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Icon className="w-5 h-5 mr-2" />
                  )}
                  <span className="font-bold">{label}</span>
                  {loadingType !== type && <Download className="w-4 h-4 ml-auto opacity-70" />}
                </div>
                <p className="text-xs font-normal opacity-80">{description}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Info Cards */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="glass-panel p-5 rounded-xl border border-emerald-500/15 space-y-2">
            <h5 className="font-bold text-brand-textPrimary flex items-center text-sm">
              <Table2 className="w-4 h-4 text-emerald-400 mr-1.5" /> Excel Export Schema
            </h5>
            <p className="text-xs text-brand-textSecondary leading-relaxed">Formatted categories, descriptions, dates, and auto SUM formulas at the footer.</p>
          </div>
          <div className="glass-panel p-5 rounded-xl border border-blue-500/15 space-y-2">
            <h5 className="font-bold text-brand-textPrimary flex items-center text-sm">
              <FileDown className="w-4 h-4 text-blue-400 mr-1.5" /> PDF Invoice Styling
            </h5>
            <p className="text-xs text-brand-textSecondary leading-relaxed">Clean invoice layout with page headings, selected range summaries, and total spending highlights.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportsPage;
