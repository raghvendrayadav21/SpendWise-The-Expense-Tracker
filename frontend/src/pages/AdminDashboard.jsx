import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Users, Terminal, RefreshCw, AlertCircle, Trash2, UserCheck, UserX, Shield } from 'lucide-react';
import api from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleteMsg, setDeleteMsg] = useState('');

  const fetchAdminData = async () => {
    setErrorMsg('');
    try {
      const [statsRes, usersRes, logsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/logs')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data || []);
      setLogs(logsRes.data || []);
    } catch (err) {
      console.error(err);
      setErrorMsg('Unauthorized. Administrative credentials are required.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setDeleteMsg('');
    fetchAdminData();
  };

  const handleDeleteConfirm = (userId) => {
    setConfirmDeleteId(userId);
  };

  const handleDeleteCancel = () => {
    setConfirmDeleteId(null);
  };

  const handleDeleteUser = async (userId) => {
    setDeletingId(userId);
    setDeleteMsg('');
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
      setDeleteMsg('✅ User and all associated data deleted successfully.');
      setConfirmDeleteId(null);
    } catch (err) {
      setDeleteMsg('❌ Failed to delete user: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center flex-1 py-20">
        <span className="w-12 h-12 border-4 border-brand-accent/20 border-t-brand-accent rounded-full animate-spin"></span>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="glass-panel p-8 rounded-2xl max-w-lg mx-auto text-center space-y-4 py-12 mt-10">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <h3 className="text-xl font-bold text-brand-textPrimary">Access Denied</h3>
        <p className="text-sm text-brand-textSecondary">{errorMsg}</p>
      </div>
    );
  }

  const totalUsers = stats?.totalUsers || 0;
  const adminCount = users.filter(u => u.roles?.includes('ROLE_ADMIN')).length;
  const regularCount = totalUsers - adminCount;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-textPrimary flex items-center">
            <ShieldAlert className="w-8 h-8 text-brand-accent mr-2" />
            Administrative Portal
          </h1>
          <p className="text-brand-textSecondary text-sm mt-1">
            User management panel — transaction details are hidden for user privacy.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center px-4 py-2 bg-white/5 hover:bg-white/10 border border-brand-cardBorder hover:text-brand-textPrimary rounded-xl text-xs font-semibold transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial="hidden" animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }}
      >
        {[
          { label: 'Total Active Users', val: totalUsers, icon: Users, bg: 'bg-brand-accent/10', border: 'border-brand-accent/20', color: 'text-brand-accent' },
          { label: 'Regular Users', val: regularCount, icon: UserCheck, bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', color: 'text-emerald-400' },
          { label: 'Administrators', val: adminCount, icon: Shield, bg: 'bg-red-500/10', border: 'border-red-500/20', color: 'text-red-400' },
        ].map(({ label, val, icon: Icon, bg, border, color }) => (
          <motion.div key={label} variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
            className="glass-panel p-6 rounded-2xl flex items-center space-x-4 glass-panel-hover"
          >
            <div className={`p-3.5 ${bg} rounded-xl border ${border}`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
              <p className="text-xs font-semibold text-brand-textSecondary uppercase tracking-wider">{label}</p>
              <h3 className="text-2xl font-extrabold mt-1 font-mono">{val}</h3>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Delete feedback message */}
      {deleteMsg && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium border ${
          deleteMsg.startsWith('✅')
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {deleteMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Users Management Table */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-brand-textPrimary flex items-center">
              <Users className="w-5 h-5 text-brand-accent mr-2" />
              Registered Accounts
            </h3>
            <span className="text-[10px] bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20 px-2 py-0.5 rounded">
              🔒 PRIVACY MODE
            </span>
          </div>

          {/* Privacy Notice */}
          <div className="flex items-start space-x-2 bg-blue-500/5 border border-blue-500/20 rounded-xl p-3">
            <Shield className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-blue-300/80 leading-relaxed">
              Transaction details are hidden to protect user privacy. Only account info is visible to administrators.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-brand-cardBorder text-brand-textSecondary">
                  <th className="pb-3 font-semibold">Username</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isAdminUser = u.roles?.includes('ROLE_ADMIN');
                  const isPremium = u.roles?.includes('ROLE_PREMIUM') && !isAdminUser;
                  const isConfirming = confirmDeleteId === u.id;
                  const isDeleting = deletingId === u.id;

                  return (
                    <tr key={u.id} className="border-b border-brand-cardBorder/50 hover:bg-white/5 transition">
                      <td className="py-3.5 font-semibold text-brand-textPrimary">
                        <div className="flex items-center space-x-1.5">
                          {isAdminUser && <ShieldAlert className="w-3 h-3 text-red-400 flex-shrink-0" />}
                          <span>{u.username}</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-brand-textSecondary font-mono text-[10px]">{u.email}</td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[9px] ${
                          isAdminUser
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : isPremium
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : 'bg-brand-accent/10 text-brand-accent border border-brand-accent/20'
                        }`}>
                          {isAdminUser ? 'Admin' : isPremium ? 'Premium' : 'User'}
                        </span>
                      </td>
                      <td className="py-3.5 text-center">
                        {isAdminUser ? (
                          <span className="text-[10px] text-brand-textSecondary italic">Protected</span>
                        ) : isConfirming ? (
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              disabled={isDeleting}
                              className="px-2 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/30 rounded-lg text-[10px] font-bold transition"
                            >
                              {isDeleting ? '...' : 'Confirm'}
                            </button>
                            <button
                              onClick={handleDeleteCancel}
                              className="px-2 py-1 bg-white/5 hover:bg-white/10 text-brand-textSecondary border border-brand-cardBorder rounded-lg text-[10px] font-bold transition"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleDeleteConfirm(u.id)}
                            className="inline-flex items-center space-x-1 px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-[10px] font-semibold transition"
                            title="Delete user"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-brand-textSecondary text-xs">
                      <UserX className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live System Console Logs */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-[480px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center">
              <Terminal className="w-5 h-5 text-brand-accent mr-2" />
              Security & Scheduler Console
            </h3>
            <span className="text-[10px] bg-red-500/10 text-red-400 font-bold border border-red-500/20 px-2 py-0.5 rounded animate-pulse">
              LIVE MONITORED
            </span>
          </div>

          <div className="flex-1 bg-black/60 border border-brand-cardBorder rounded-xl p-4 overflow-y-auto font-mono text-xs text-brand-accent space-y-2 scrollbar-thin">
            {logs.map((log, index) => {
              const isInfo = log.includes("[INFO]");
              const isWarn = log.includes("[WARN]");
              return (
                <div key={index} className="leading-relaxed">
                  <span className={isInfo ? 'text-emerald-400' : isWarn ? 'text-amber-400' : 'text-brand-accent'}>
                    {log}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
