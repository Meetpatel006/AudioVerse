'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          
          // If we're on the sign-in page but already authenticated, redirect to the 'from' URL or default
          if (window.location.pathname === '/sign-in' || window.location.pathname === '/sign-up') {
            const url = new URL(window.location.href);
            const from = url.searchParams.get('from');
            // Only redirect if we have a valid 'from' URL that's not the sign-in page
            if (from && from !== '/sign-in' && from !== '/sign-up') {
              window.location.href = from;
            } else {
              window.location.href = '/speech-synthesis/text-to-speech';
            }
          }
        } else {
          setUser(null);
          
          // If we're on a protected route, redirect to sign-in with return URL
          const currentPath = window.location.pathname;
          if (currentPath.startsWith('/speech-synthesis') || 
              currentPath.startsWith('/sound-effects') ||
              currentPath.startsWith('/(protected)')) {
            const returnUrl = encodeURIComponent(currentPath);
            window.location.href = `/sign-in?from=${returnUrl}`;
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Important for cookies to be sent
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Fetch user data after successful login
      const userResponse = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const userData = await userResponse.json();
      setUser(userData.user);
      
      // Get the 'from' query parameter from the URL
      const url = new URL(window.location.href);
      const from = url.searchParams.get('from');
      
      // Use window.location.href for immediate navigation
      window.location.href = from || '/speech-synthesis/text-to-speech';
      
      return userData.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, confirmPassword: password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Auto-login after registration
      await login(email, password);
      
      // The login function will handle the redirection
      return data.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include',
      });
      
      // Clear the user state
      setUser(null);
      
      // Force a full page reload to clear any cached data
      window.location.href = '/sign-in';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, we should still try to redirect to sign-in
      window.location.href = '/sign-in';
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
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
