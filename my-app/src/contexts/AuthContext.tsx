'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials, SignupData, AuthResponse } from '../types/index';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  signup: (data: SignupData) => Promise<AuthResponse>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 AuthContext - checkAuth started');
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('authToken');
        
        console.log('🔍 AuthContext - storedUser exists:', !!storedUser);
        console.log('🔍 AuthContext - storedToken exists:', !!storedToken);
        
        if (storedUser && storedToken) {
          const user = JSON.parse(storedUser);
          console.log('🔍 AuthContext - Restoring user session:', user);
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          console.log('🔍 AuthContext - No existing session found');
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
        
        // Seed demo accounts after auth check (non-blocking)
        console.log('🔍 AuthContext - Starting demo account seeding...');
        seedDemoAccounts().catch(err => console.error('Demo account seeding error:', err));
        
      } catch (error) {
        console.error('🔍 AuthContext - Error checking authentication:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    // Call checkAuth function
    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      if (data.success && data.user) {
        // Generate a simple token for demo purposes
        const token = `token_${Date.now()}_${Math.random()}`;
        
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('authToken', token);
        
        setAuthState({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
        });

        return { success: true, user: data.user, token };
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error: 'An unexpected error occurred during login',
      };
    }
  };

  const signup = async (data: SignupData): Promise<AuthResponse> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (result.success && result.user) {
        // Generate a simple token for demo purposes
        const token = `token_${Date.now()}_${Math.random()}`;
        
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('authToken', token);
        
        setAuthState({
          user: result.user,
          isAuthenticated: true,
          isLoading: false,
        });

        return { success: true, user: result.user, token };
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: result.error || 'Signup failed' };
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error: 'An unexpected error occurred during registration',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const updateUser = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    setAuthState(prev => ({
      ...prev,
      user,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for using auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}





// Seed demo accounts for testing
async function seedDemoAccounts() {
  try {
    console.log('Seeding demo accounts via API...');
    
    // Demo accounts data
    const demoAccounts = [
      {
        name: 'Demo Teacher',
        email: 'teacher@demo.com',
        password: 'password123',
        role: 'teacher',
        institution: 'Demo High School',
        subject: 'Mathematics'
      },
      {
        name: 'Demo Student',
        email: 'student@demo.com',
        password: 'password123',
        role: 'student',
        grade: '10th Grade',
        studentId: 'STU001'
      }
    ];
    
    // Try to create each demo account (will fail silently if already exists)
    for (const account of demoAccounts) {
      try {
        await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(account),
        });
        console.log(`Demo ${account.role} account created/verified`);
      } catch (error) {
        // Account might already exist, which is fine
        console.log(`Demo ${account.role} account might already exist`);
      }
    }
  } catch (error) {
    console.error('Error seeding demo accounts:', error);
  }
}