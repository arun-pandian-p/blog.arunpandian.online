import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (emailOrUsername: string, pass: string) => Promise<void>;
  register: (data: { email: string; username: string; fullName: string; password: string }) => Promise<void>;
  logout: () => void;
  updateUser: (u: User) => void;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  authModalOpen: boolean;
  authModalMode: 'login' | 'register';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const token = localStorage.getItem('apstories_token');
    if (token) {
      api.getCurrentUser()
        .then(u => setUser(u))
        .catch(() => {
          localStorage.removeItem('apstories_token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (emailOrUsername: string, pass: string) => {
    const res = await api.login(emailOrUsername, pass);
    localStorage.setItem('apstories_token', res.token);
    setUser(res.user);
    setAuthModalOpen(false);
  };

  const register = async (data: { email: string; username: string; fullName: string; password: string }) => {
    const res = await api.register(data);
    localStorage.setItem('apstories_token', res.token);
    setUser(res.user);
    setAuthModalOpen(false);
  };

  const logout = () => {
    localStorage.removeItem('apstories_token');
    setUser(null);
  };

  const updateUser = (u: User) => {
    setUser(u);
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        login,
        register,
        logout,
        updateUser,
        openAuthModal,
        closeAuthModal,
        authModalOpen,
        authModalMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

