import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load profile if token exists on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          // Format user payload consistent with login
          setUser({
            id: res.data.id,
            username: res.data.username,
            email: res.data.email,
            roles: res.data.roles || [],
            profileUpdated: res.data.profileUpdated || false,
          });
        } catch (err) {
          console.error("Session initialization failed:", err);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (usernameOrEmail, password) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { usernameOrEmail, password });
      const { token, id, username, email, roles, profileUpdated } = res.data;
      
      localStorage.setItem('token', token);
      setUser({ id, username, email, roles, profileUpdated: profileUpdated || false });
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const signup = async (username, email, password, selectedRole) => {
    setError(null);
    setLoading(true);
    try {
      // Map roles from simple selector to backend format
      const roles = selectedRole ? [selectedRole] : ['ROLE_NORMAL'];
      await api.post('/auth/signup', { username, email, password, roles });
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Signup failed. Please try again.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const updateProfile = async (username, email, password) => {
    try {
      const res = await api.put('/auth/profile', { username, email, password });
      const { token, id, username: newUsername, email: newEmail, roles, profileUpdated: newProfileUpdated } = res.data;
      
      localStorage.setItem('token', token);
      setUser({ id, username: newUsername, email: newEmail, roles, profileUpdated: newProfileUpdated || false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Profile update failed. Please try again.';
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  const hasRole = (role) => {
    return user?.roles?.includes(role) || false;
  };

  const isPremium = () => {
    return hasRole('ROLE_NORMAL') || hasRole('ROLE_PREMIUM') || hasRole('ROLE_ADMIN');
  };

  const isAdmin = () => {
    return hasRole('ROLE_ADMIN');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        signup,
        updateProfile,
        logout,
        hasRole,
        isPremium,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
