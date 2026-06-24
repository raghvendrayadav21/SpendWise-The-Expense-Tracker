import React, { useEffect, useState } from 'react';
import { ShieldAlert, Users, Database, IndianRupee, Terminal, RefreshCw, AlertCircle } from 'lucide-react';
import api from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [refreshing, setRefreshing] = useState(false);

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
    fetchAdminData();
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

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-textPrimary flex items-center">
            <ShieldAlert className="w-8 h-8 text-brand-accent mr-2" />
            Administrative Portal
          </h1>
          <p className="text-brand-textSecondary text-sm mt-1">Platform management, database telemetry, and security log monitor.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center px-4 py-2 bg-white/5 hover:bg-white/10 border border-brand-cardBorder hover:text-brand-textPrimary rounded-xl text-xs font-semibold transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Stats
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4 relative overflow-hidden">
          <div className="p-3.5 bg-brand-accent/10 rounded-xl border border-brand-accent/20">
            <Users className="w-6 h-6 text-brand-accent" />
          </div>
          <div>
            <p className="text-xs font-semibold text-brand-textSecondary uppercase tracking-wider">Total Active Users</p>
            <h3 className="text-2xl font-bold mt-1 font-mono">{stats?.totalUsers || 0}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4 relative overflow-hidden">
          <div className="p-3.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <Database className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-brand-textSecondary uppercase tracking-wider">Transactions Logged</p>
            <h3 className="text-2xl font-bold mt-1 font-mono">{stats?.totalExpensesCount || 0}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4 relative overflow-hidden">
          <div className="p-3.5 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <IndianRupee className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-brand-textSecondary uppercase tracking-wider">Total Volume Outflow</p>
            <h3 className="text-2xl font-bold mt-1 font-mono">₹{(stats?.totalExpensesAmount || 0).toFixed(2)}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Users Roster Table */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-lg font-bold text-brand-textPrimary">Registered Accounts</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-brand-cardBorder text-brand-textSecondary">
                  <th className="pb-3 font-semibold">Username</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Membership Level</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isAdminUser = u.roles.includes('ROLE_ADMIN');
                  const isUpdatedUser = u.profileUpdated;
                  return (
                    <tr key={u.id} className="border-b border-brand-cardBorder/50 hover:bg-white/5 transition">
                      <td className="py-3.5 font-semibold text-brand-textPrimary">{u.username}</td>
                      <td className="py-3.5 text-brand-textSecondary font-mono">{u.email}</td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[9px] ${
                          isAdminUser 
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                            : isUpdatedUser
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : 'bg-brand-accent/10 text-brand-accent border border-brand-accent/20'
                        }`}>
                          {isAdminUser ? 'Admin' : (isUpdatedUser ? 'Advanced' : 'User')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live System Console Logs */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-[380px]">
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
