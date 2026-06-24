import React, { useState } from 'react';
import { FileSpreadsheet, FileText, Calendar, AlertCircle, Download } from 'lucide-react';
import api from '../services/api';

const ReportsPage = () => {
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const triggerDownload = async (type) => {
    setErrorMsg('');
    if (!startDate || !endDate) {
      setErrorMsg('Please select both start and end dates.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setErrorMsg('Start date cannot be after end date.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = type === 'EXCEL' ? '/reports/excel' : '/reports/pdf';
      const fileExtension = type === 'EXCEL' ? 'xlsx' : 'pdf';
      const mimeType = type === 'EXCEL' 
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        : 'application/pdf';

      const res = await api.get(`${endpoint}?startDate=${startDate}&endDate=${endDate}`, {
        responseType: 'blob'
      });

      // Create local URL for download
      const blob = new Blob([res.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ExpenseReport_${startDate}_to_${endDate}.${fileExtension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to download report. Make sure your Premium subscription is active.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-brand-textPrimary">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-brand-textPrimary">Statement Reports</h1>
        <p className="text-brand-textSecondary text-sm mt-1">Export transaction histories to Excel or PDF for bookkeeping.</p>
      </div>

      <div className="max-w-2xl grid grid-cols-1 gap-6">
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <h3 className="text-lg font-bold flex items-center">
            <Calendar className="w-5 h-5 text-brand-accent mr-2" />
            Select Billing Period
          </h3>

          {errorMsg && (
            <div className="p-3 text-sm text-red-400 bg-red-950/30 border border-red-500/20 rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          <div className="border-t border-brand-cardBorder/50 pt-6 flex flex-col md:flex-row gap-4">
            {/* Excel Download button */}
            <button
              onClick={() => triggerDownload('EXCEL')}
              disabled={loading}
              className="flex-1 flex items-center justify-center px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-50 cursor-pointer"
            >
              <FileSpreadsheet className="w-5 h-5 mr-2" />
              Download Excel Spreadsheet
            </button>

            {/* PDF Download button */}
            <button
              onClick={() => triggerDownload('PDF')}
              disabled={loading}
              className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition shadow-[0_0_15px_rgba(37,99,235,0.2)] disabled:opacity-50 cursor-pointer"
            >
              <FileText className="w-5 h-5 mr-2" />
              Download PDF Statement
            </button>
          </div>
        </div>

        {/* Informational Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-panel p-5 rounded-xl text-xs text-brand-textSecondary space-y-2">
            <h5 className="font-bold text-brand-textPrimary flex items-center text-sm">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400 mr-1.5" />
              Excel Export Schema
            </h5>
            <p>Includes formatted categories, description strings, calendar dates, and an embedded automated `SUM` arithmetic cell formulas at the footer.</p>
          </div>
          <div className="glass-panel p-5 rounded-xl text-xs text-brand-textSecondary space-y-2">
            <h5 className="font-bold text-brand-textPrimary flex items-center text-sm">
              <FileText className="w-4 h-4 text-blue-400 mr-1.5" />
              PDF Invoice Styling
            </h5>
            <p>Prints out a clean invoice layout with page headings, selected range summaries, structured table alignments, and total spending highlights.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
