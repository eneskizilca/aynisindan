import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { authApi, AuthResponse, LoginPayload, RegisterPayload } from '../services/api';

export interface User {
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
    async function loadAuthData() {
      try {
        const savedToken = await SecureStore.getItemAsync('aynisindan_token');
        const savedUser = await SecureStore.getItemAsync('aynisindan_user');
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Failed to load auth credentials', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadAuthData();
  }, []);

  const saveAuth = useCallback(async (data: AuthResponse) => {
    const userObj: User = {
      userId: data.userId,
      fullName: data.fullName,
      email: data.email,
      role: data.role as 'CUSTOMER' | 'ARTISAN',
    };
    try {
      await SecureStore.setItemAsync('aynisindan_token', data.token);
      await SecureStore.setItemAsync('aynisindan_user', JSON.stringify(userObj));
      setToken(data.token);
      setUser(userObj);
    } catch (error) {
      console.error('Failed to save auth credentials', error);
      throw error;
    }
  }, []);

  const login = useCallback(
    async (data: LoginPayload) => {
      const res = await authApi.login(data);
      await saveAuth(res.data);
    },
    [saveAuth]
  );

  const register = useCallback(
    async (data: RegisterPayload) => {
      const res = await authApi.register(data);
      await saveAuth(res.data);
    },
    [saveAuth]
  );

  const logout = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync('aynisindan_token');
      await SecureStore.deleteItemAsync('aynisindan_user');
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Failed to remove auth credentials', error);
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      token,
      isLoading,
      login,
      register,
      logout,
      isAuthenticated: !!token,
    }),
    [user, token, isLoading, login, register, logout]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
