import { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../lib/api.js';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'viewer' | 'editor' | 'admin';
  organizationId?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role?: 'viewer' | 'editor' | 'admin') => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => void;
  isAdmin: boolean;
  isEditor: boolean;
  isViewer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
      loadProfile(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const loadProfile = async (authToken: string) => {
    try {
      const profile = await apiClient.getProfile(authToken);
      setUser(profile);
    } catch (error) {
      console.error('Error loading profile:', error);
      localStorage.removeItem('auth_token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'viewer' | 'editor' | 'admin' = 'viewer') => {
    try {
      const { token: newToken, user: newUser } = await apiClient.register(email, password, fullName, role);
      localStorage.setItem('auth_token', newToken);
      setToken(newToken);
      setUser(newUser);
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Registration failed') };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { token: newToken, user: newUser } = await apiClient.login(email, password);
      localStorage.setItem('auth_token', newToken);
      setToken(newToken);
      setUser(newUser);
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Login failed') };
    }
  };

  const signOut = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';
  const isEditor = user?.role === 'editor' || isAdmin;
  const isViewer = user?.role === 'viewer' || isEditor;

  const value = {
    user,
    token,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin,
    isEditor,
    isViewer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
