import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

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
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setRole(data.role || 'viewer');
      } else {
        signOut();
      }
    } catch (error: unknown) { // FIXED: Use unknown
      console.error("Failed to fetch user:", error);
      signOut();
    } finally {
      setLoading(false);
    }
  };

  // 2. Fixed signUp
  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed');

      if (data.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        setRole(data.role);
      }

      return { error: null };
    } catch (err: unknown) { // FIXED: Use unknown
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      return { error: errorMessage };
    }
  };

  // 3. Fixed signIn
  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setRole(data.role);

      return { error: null };
    } catch (err: unknown) { // FIXED: Use unknown
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

function signOut() {
    throw new Error('Function not implemented.');
  }
