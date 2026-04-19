"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { loginAction } from "./actions/auth";

// ─── Auth Context ─────────────────────────────────────────────────────────────

interface AuthContextType {
  isAuthenticated: boolean;
  user: { id: string; name: string; email: string; role?: string } | null;
  login: (id: string, name: string, email: string, role?: string) => void;
  updateUser: (data: { name: string; email: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  // ── Auth state ──
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    role?: string;
  } | null>(null);

  // Persistence logic
  useEffect(() => {
    const syncSession = async () => {
      // 1. Check local storage first for speed
      const storedUser = localStorage.getItem("srmall_user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          setIsAuthenticated(true);
        } catch (e) {
          localStorage.removeItem("srmall_user");
        }
      }

      // 2. Check Supabase for social logins or session recovery
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.email) {
        // If we have a Supabase session but no local user, or different user
        if (!user || user.email !== session.user.email) {
           // Verify with our database to get the correct role
           const res = await loginAction({ 
             email: session.user.email, 
             password: "OAUTH_LOGIN_BYPASS" 
           });
           
           if (res.success && res.data) {
             const userData = {
               id: res.data.id,
               name: res.data.name,
               email: res.data.email,
               role: res.data.role
             };
             setUser(userData);
             setIsAuthenticated(true);
             localStorage.setItem("srmall_user", JSON.stringify(userData));
           }
        }
      }

      // 3. Listen for auth changes (login/logout)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user?.email) {
           const res = await loginAction({ 
             email: session.user.email, 
             password: "OAUTH_LOGIN_BYPASS" 
           });
           if (res.success && res.data) {
             login(res.data.id, res.data.name, res.data.email, res.data.role);
           }
        } else if (event === 'SIGNED_OUT') {
           logout();
        }
      });

      return () => subscription.unsubscribe();
    };

    syncSession();
  }, []);

  const login = (id: string, name: string, email: string, role?: string) => {
    const userData = { id, name, email, role };
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem("srmall_user", JSON.stringify(userData));
  };

  const updateUser = (data: { name: string; email: string }) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem("srmall_user", JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("srmall_user");
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, updateUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useTheme = () => ({ theme: "light", toggleTheme: () => {} });

// Keep AuthProvider alias for backwards-compatibility with any existing imports
export const AuthProvider = AppProviders;
