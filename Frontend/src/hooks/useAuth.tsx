import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient } from '../lib/api';

export interface User {
  id: string;
  email: string;
  displayName?: string;
}

type UserRole = 'admin' | 'editor' | 'viewer' | null;

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  // 1. Fixed fetchUserProfile
  const fetchUserProfile = async (currentToken: string) => {
    try {
      const response = await apiClient.getProfile(currentToken);
      setUser(response.user);
      setRole(response.role || 'viewer');
    } catch (error: unknown) {
      console.error("Failed to fetch user:", error);
      signOut();
    } finally {
      setLoading(false);
    }
  };

  // 2. Fixed signUp
  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const data = await apiClient.register(email, password, displayName || '', 'viewer');
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        setRole(data.role);
      }

      return { error: null };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      return { error: errorMessage };
    }
  };

  // 3. Fixed signIn
  const signIn = async (email: string, password: string) => {
    try {
      const data = await apiClient.login(email, password);
      
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setRole(data.role);

      return { error: null };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      return { error: errorMessage };
    }
  };

  // 4. Implement signOut
  const signOut = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setRole(null);
    setLoading(false);
  };

  // 5. Add useEffect to initialize auth state
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchUserProfile(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, role, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
