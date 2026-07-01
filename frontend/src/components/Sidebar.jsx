import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  IndianRupee,
  PiggyBank,
  FileSpreadsheet,
  Sparkles,
  ShieldAlert,
  LogOut,
  User as UserIcon,
  Sun,
  Moon,
  Settings,
  X,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Sidebar = () => {
  const { user, logout, updateProfile, isPremium, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateUsername, setUpdateUsername] = useState('');
  const [updateEmail, setUpdateEmail] = useState('');
  const [updatePassword, setUpdatePassword] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, roleCheck: () => true, color: 'text-brand-accent' },
    { to: '/expenses', label: 'Expenses', icon: IndianRupee, roleCheck: () => true, color: 'text-blue-400' },
    { to: '/budgets', label: 'Budgets', icon: PiggyBank, roleCheck: () => true, color: 'text-violet-400' },
    { to: '/insights', label: 'AI Analytics', icon: Sparkles, roleCheck: () => isAdmin() || user?.profileUpdated, color: 'text-amber-400' },
    { to: '/reports', label: 'Reports', icon: FileSpreadsheet, roleCheck: () => true, color: 'text-emerald-400' },
    { to: '/admin', label: 'Admin Panel', icon: ShieldAlert, roleCheck: () => isAdmin(), color: 'text-red-400' },
  ];

  const handleOpenModal = () => {
    setUpdateUsername(user?.username || '');
    setUpdateEmail(user?.email || '');
    setUpdatePassword('');
    setModalError('');
    setModalSuccess('');
    setIsModalOpen(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');
    setModalLoading(true);

    if (!updateUsername.trim() || !updateEmail.trim()) {
      setModalError('Username and Email cannot be empty.');
      setModalLoading(false);
      return;
    }

    const res = await updateProfile(updateUsername.trim(), updateEmail.trim(), updatePassword);
    setModalLoading(false);
    if (res.success) {
      setModalSuccess('Account updated successfully!');
      setUpdatePassword('');
      setTimeout(() => {
        setIsModalOpen(false);
        setModalSuccess('');
      }, 1500);
    } else {
      setModalError(res.message || 'Failed to update account.');
    }
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : 'U';

  const roleBadge = isAdmin()
    ? { label: 'Admin', cls: 'bg-red-500/15 text-red-400 border-red-500/25' }
    : isPremium()
    ? { label: 'Premium', cls: 'bg-violet-500/15 text-violet-400 border-violet-500/25' }
    : { label: 'User', cls: 'bg-brand-accent/10 text-brand-accent border-brand-accent/20' };

  return (
    <>
      <aside className="w-64 glass-panel border-r border-brand-cardBorder h-screen flex flex-col fixed left-0 top-0 z-30">

        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 border-b border-brand-cardBorder">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-accent to-emerald-600 flex items-center justify-center shadow-lg shadow-brand-accent/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-brand-accent via-emerald-300 to-blue-400 bg-clip-text text-transparent">
              SpendWise
            </span>
          </div>
        </div>

        {/* User Card */}
        {user && (
          <div className="px-4 pt-4 pb-2">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-brand-cardBorder flex items-center space-x-3">
              {/* Gradient Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-accent/80 to-blue-500/70 flex items-center justify-center shadow-md">
                  <span className="text-sm font-bold text-white font-mono">{initials}</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-brand-accent rounded-full border-2 border-brand-darkBg"></div>
              </div>
              <div className="overflow-hidden flex-1 min-w-0">
                <h4 className="text-sm font-semibold truncate text-brand-textPrimary">{user.username}</h4>
                <span className={`inline-block mt-0.5 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${roleBadge.cls}`}>
                  {roleBadge.label}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {links.map((link) => {
            if (!link.roleCheck()) return null;
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `group relative flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-gradient-to-r from-brand-accent/20 to-brand-accent/5 text-brand-textPrimary border border-brand-accent/20 shadow-[0_0_20px_rgba(0,208,132,0.12)]'
                    : 'text-brand-textSecondary hover:bg-white/[0.05] hover:text-brand-textPrimary'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand-accent rounded-r-full" />
                    )}
                    <Icon className={`w-4.5 h-4.5 mr-3 flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-brand-accent' : link.color + ' opacity-60 group-hover:opacity-100'}`} />
                    <span className="flex-1">{link.label}</span>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-brand-accent opacity-60" />}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-brand-cardBorder space-y-1">
          {!user?.profileUpdated && (
            <button
              onClick={handleOpenModal}
              className="w-full flex items-center px-3.5 py-2.5 text-sm font-medium text-amber-400 hover:bg-amber-500/10 rounded-xl transition-all duration-200 cursor-pointer group"
            >
              <Settings className="w-4.5 h-4.5 mr-3 group-hover:rotate-45 transition-transform duration-300" />
              <span>Complete Profile</span>
              <span className="ml-auto w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
            </button>
          )}

          {user?.profileUpdated && (
            <button
              onClick={handleOpenModal}
              className="w-full flex items-center px-3.5 py-2.5 text-sm font-medium text-brand-textSecondary hover:bg-white/5 hover:text-brand-textPrimary rounded-xl transition-all duration-200 cursor-pointer group"
            >
              <Settings className="w-4.5 h-4.5 mr-3 group-hover:rotate-45 transition-transform duration-300" />
              <span>Account Settings</span>
            </button>
          )}

          <button
            onClick={toggleTheme}
            className="w-full flex items-center px-3.5 py-2.5 text-sm font-medium text-brand-textSecondary hover:bg-white/5 hover:text-brand-textPrimary rounded-xl transition-all duration-200 cursor-pointer"
          >
            {theme === 'dark' ? (
              <><Sun className="w-4.5 h-4.5 mr-3 text-amber-400" /><span>Light Mode</span></>
            ) : (
              <><Moon className="w-4.5 h-4.5 mr-3 text-blue-400" /><span>Dark Mode</span></>
            )}
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center px-3.5 py-2.5 text-sm font-medium text-brand-textSecondary hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all duration-200 cursor-pointer group"
          >
            <LogOut className="w-4.5 h-4.5 mr-3 group-hover:-translate-x-0.5 transition-transform duration-200" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Profile Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 12 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md glass-panel p-7 rounded-3xl relative overflow-hidden text-brand-textPrimary"
              onClick={e => e.stopPropagation()}
            >
              {/* Background glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/6 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between pb-4 border-b border-brand-cardBorder mb-5">
                <div>
                  <h3 className="text-lg font-bold">Account Settings</h3>
                  <p className="text-xs text-brand-textSecondary mt-0.5">Update your profile information</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-xl text-brand-textSecondary hover:text-brand-textPrimary transition cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <AnimatePresence>
                  {modalError && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="p-3 text-xs text-red-400 bg-red-950/30 border border-red-500/20 rounded-xl">
                      {modalError}
                    </motion.div>
                  )}
                  {modalSuccess && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="p-3 text-xs text-brand-accent bg-brand-accent/5 border border-brand-accent/20 rounded-xl flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>{modalSuccess}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {[
                  { label: 'Username', type: 'text', value: updateUsername, setter: setUpdateUsername, placeholder: 'Your username' },
                  { label: 'Email Address', type: 'email', value: updateEmail, setter: setUpdateEmail, placeholder: 'your@email.com' },
                  { label: 'New Password (Optional)', type: 'password', value: updatePassword, setter: setUpdatePassword, placeholder: 'Leave blank to keep unchanged' },
                ].map((field, i) => (
                  <motion.div key={field.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <label className="block text-[11px] font-semibold text-brand-textSecondary uppercase tracking-wider mb-1.5">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      value={field.value}
                      onChange={(e) => field.setter(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                      placeholder={field.placeholder}
                      required={field.type !== 'password'}
                    />
                  </motion.div>
                ))}

                <div className="flex items-center space-x-3 pt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-brand-cardBorder text-brand-textSecondary hover:bg-white/5 text-sm font-semibold transition cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" disabled={modalLoading}
                    className="flex-1 py-2.5 bg-brand-accent hover:bg-brand-accentHover text-white rounded-xl text-sm font-semibold transition glow-btn flex items-center justify-center cursor-pointer disabled:opacity-60">
                    {modalLoading ? (
                      <span className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
