'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// ─── Auth Context ─────────────────────────────────────────────────────────────

interface AuthContextType {
  isAuthenticated: boolean;
  user: { id: string; name: string; email: string; role?: string } | null;
  login: (id: string, name: string, email: string, role?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  // ── Auth state ──
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ id: string; name: string; email: string; role?: string } | null>(null);

  // Persistence logic
  useEffect(() => {
    const storedUser = localStorage.getItem('srmall_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem('srmall_user');
      }
    }
  }, []);

  const login = (id: string, name: string, email: string, role?: string) => {
    const userData = { id, name, email, role };
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem('srmall_user', JSON.stringify(userData));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('srmall_user');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useTheme = () => ({ theme: 'light', toggleTheme: () => { } });

// Keep AuthProvider alias for backwards-compatibility with any existing imports
export const AuthProvider = AppProviders;
