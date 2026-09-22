import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getStoredAuth, setStoredAuth } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'

  useEffect(() => {
    async function initAuth() {
      const { token, user: storedUser } = getStoredAuth();
      if (token && storedUser) {
        setUser(storedUser);
        try {
          const meRes = await api.auth.getMe();
          if (meRes.user) {
            setUser(meRes.user);
            setStoredAuth(token, meRes.user);
          }
        } catch (e) {
          // If token expired, clear
          if (e.statusCode === 401) {
            setStoredAuth(null, null);
            setUser(null);
          }
        }
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    const loggedUser = res.data?.user;
    setUser(loggedUser);
    setAuthModalOpen(false);
    return loggedUser;
  };

  const register = async (name, email, password, role) => {
    await api.auth.register({ name, email, password, role });
    // Automatically log in after registration
    return login(email, password);
  };

  const logout = async () => {
    await api.auth.logout();
    setUser(null);
  };

  const openAuth = (mode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuth = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        role: user?.role || null,
        isOrganizer: user?.role === 'ORGANIZER' || user?.role === 'ADMIN',
        isAdmin: user?.role === 'ADMIN',
        login,
        register,
        logout,
        authModalOpen,
        authMode,
        openAuth,
        closeAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
