import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { User } from '../types';
import { authApi } from '../api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    isAdmin: false,
    loading: true,
  });

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      loading: false,
    });
  }, []);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }
    try {
      const user = await authApi.me();
      localStorage.setItem('user', JSON.stringify(user));
      setState({
        user,
        token,
        isAuthenticated: true,
        isAdmin: user.rol === 'admin',
        loading: false,
      });
    } catch {
      // Solo hacer logout si el servidor respondió con 401 (token inválido/expirado)
      // No hacer logout si es error de red (servidor caído, CORS, etc.)
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login({ email, password });
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      setState({
        user: res.user,
        token: res.token,
        isAuthenticated: true,
        isAdmin: res.user.rol === 'admin',
        loading: false,
      });
    },
    []
  );

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <AuthContext.Provider
      value={{ ...state, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}