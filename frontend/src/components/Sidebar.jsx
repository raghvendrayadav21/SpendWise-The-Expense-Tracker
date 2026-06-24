import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
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
  Moon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Sidebar = () => {
  const { user, logout, updateProfile, isPremium, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Profile update modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateUsername, setUpdateUsername] = useState('');
  const [updateEmail, setUpdateEmail] = useState('');
  const [updatePassword, setUpdatePassword] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, roleCheck: () => true },
    { to: '/expenses', label: 'Expenses', icon: IndianRupee, roleCheck: () => true },
    { to: '/budgets', label: 'Budgets', icon: PiggyBank, roleCheck: () => true },
    { to: '/insights', label: 'AI Analytics', icon: Sparkles, roleCheck: () => isAdmin() || user?.profileUpdated },
    { to: '/reports', label: 'Reports', icon: FileSpreadsheet, roleCheck: () => true },
    { to: '/admin', label: 'Admin Panel', icon: ShieldAlert, roleCheck: () => isAdmin() },
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

  return (
    <>
      <aside className="w-64 glass-panel border-r border-brand-cardBorder h-screen flex flex-col fixed left-0 top-0 z-30">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-brand-cardBorder">
          <Sparkles className="w-6 h-6 text-brand-accent mr-2 animate-pulse" />
          <span className="text-xl font-bold bg-gradient-to-r from-brand-accent to-blue-400 bg-clip-text text-transparent">
            SpendWise
          </span>
        </div>

        {/* User Card */}
        {user && (
          <div className="p-4 border-b border-brand-cardBorder bg-white/5 mx-4 my-4 rounded-xl flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center border border-brand-accent/30">
              <UserIcon className="w-5 h-5 text-brand-accent" />
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold truncate">{user.username}</h4>
              <div className="flex items-center space-x-1">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-accent/10 text-brand-accent border border-brand-accent/20">
                  {isAdmin() ? 'Admin' : (user?.profileUpdated ? 'Advanced' : 'User')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {links.map((link) => {
            if (!link.roleCheck()) return null;
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => `
                  flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-brand-accent text-white font-semibold shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                    : 'text-brand-textSecondary hover:bg-white/5 hover:text-brand-textPrimary'
                  }
                `}
              >
                <Icon className="w-5 h-5 mr-3" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer / Update Account / Theme Toggle / Logout */}
        <div className="p-4 border-t border-brand-cardBorder space-y-2">
          
          {!user?.profileUpdated && (
            <button
              onClick={handleOpenModal}
              className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-brand-textSecondary hover:bg-white/5 hover:text-brand-textPrimary rounded-xl transition-all duration-200 cursor-pointer"
            >
              <UserIcon className="w-5 h-5 mr-3 text-brand-accent" />
              <span>Update Account</span>
            </button>
          )}

          <button
            onClick={toggleTheme}
            className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-brand-textSecondary hover:bg-white/5 hover:text-brand-textPrimary rounded-xl transition-all duration-200 cursor-pointer"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-5 h-5 mr-3 text-amber-400" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-5 h-5 mr-3 text-blue-400" />
                <span>Dark Mode</span>
              </>
            )}
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Account Update Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl space-y-5 relative overflow-hidden animate-fadeIn text-brand-textPrimary">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-accent/5 rounded-full blur-2xl"></div>
            
            <div className="flex items-center justify-between pb-3 border-b border-brand-cardBorder">
              <h3 className="text-lg font-bold">Update Account Info</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-brand-textSecondary hover:text-brand-textPrimary transition text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {modalError && (
                <div className="p-3 text-xs text-red-400 bg-red-950/30 border border-red-500/20 rounded-xl leading-normal">
                  {modalError}
                </div>
              )}
              {modalSuccess && (
                <div className="p-3 text-xs text-green-400 bg-green-950/30 border border-green-500/20 rounded-xl leading-normal">
                  {modalSuccess}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={updateUsername}
                  onChange={(e) => setUpdateUsername(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={updateEmail}
                  onChange={(e) => setUpdateEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-2">
                  New Password (Optional)
                </label>
                <input
                  type="password"
                  value={updatePassword}
                  onChange={(e) => setUpdatePassword(e.target.value)}
                  placeholder="Leave blank to keep unchanged"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-brand-cardBorder text-brand-textSecondary hover:bg-white/5 text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex-1 py-2.5 bg-brand-accent hover:bg-brand-accentHover text-white rounded-xl text-sm font-semibold transition glow-btn flex items-center justify-center cursor-pointer"
                >
                  {modalLoading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
