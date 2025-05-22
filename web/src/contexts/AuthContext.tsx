import { createContext, ReactNode, useContext, useState, useEffect, useCallback, FC } from 'react';
import { authService, type LoginData, type RegisterData } from '../services/auth.service';

export interface User {
  email: string;
  role: 'ADMIN' | 'TRAINER' | 'PARTICIPANT';
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login(data: LoginData): Promise<void>;
  register(data: RegisterData): Promise<void>;
  logout(): void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (data: LoginData) => {
    setError(null);
    console.log('🔄 Próba logowania:', data.email, data.password);
    const { token } = await authService.login(data);
    authService.setToken(token);
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('🔑 Zalogowano jako:', payload.email, 'rola:', payload.role);
    setUser({ email: payload.email, role: payload.role });
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setError(null);
    // Rejestracja użytkownika, bez automatycznego logowania
    await authService.register(data);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ email: payload.email, role: payload.role });
      } catch {
        authService.logout();
      }
    }
    setLoading(false);
  }, []);

  const isAuthenticated = !!user;
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}; 