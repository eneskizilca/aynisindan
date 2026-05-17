'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { authApi, AuthResponse, LoginPayload, RegisterPayload } from '@/services/api';

interface User {
  userId: string;
  fullName: string;
  email: string;
  role: 'CUSTOMER' | 'ARTISAN';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (data: LoginPayload) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('aynisindan_token');
    const savedUser = localStorage.getItem('aynisindan_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const saveAuth = useCallback((data: AuthResponse) => {
    const userObj: User = {
      userId: data.userId,
      fullName: data.fullName,
      email: data.email,
      role: data.role as 'CUSTOMER' | 'ARTISAN',
    };
    localStorage.setItem('aynisindan_token', data.token);
    localStorage.setItem('aynisindan_user', JSON.stringify(userObj));
    setToken(data.token);
    setUser(userObj);
  }, []);

  const login = useCallback(async (data: LoginPayload) => {
    const res = await authApi.login(data);
    saveAuth(res.data);
  }, [saveAuth]);

  const register = useCallback(async (data: RegisterPayload) => {
    const res = await authApi.register(data);
    saveAuth(res.data);
  }, [saveAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem('aynisindan_token');
    localStorage.removeItem('aynisindan_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, logout, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
