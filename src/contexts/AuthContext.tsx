'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { GraphQLClient } from '@/lib/graphql-client';
import { getMe } from '@/graphql/queries';
import { AuthBridge } from '@/lib/auth-bridge';

export interface UserProfile {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profileImage?: string;
  userType?: string;
  hasProperties?: boolean;
  whatsappNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  occupation?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  nationalIdLast4?: string;
  address?: string;
  region?: string;
  district?: string;
  ward?: string;
  street?: string;
  city?: string;
  accountStatus?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: { email: string; password: string; firstName: string; lastName: string; phoneNumber: string }) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendVerificationCode: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  async function initializeAuth() {
    try {
      const hasSession = await AuthBridge.hasSession();

      if (hasSession) {
        const stored = localStorage.getItem('user');
        if (stored) {
          setUser(JSON.parse(stored));
          setIsLoading(false);
        }
        // Always refresh from backend to ensure data is current
        await refreshUser();
      } else {
        setIsLoading(false);
      }
    } catch {
      localStorage.removeItem('user');
      setIsLoading(false);
    }
  }

  async function refreshUser() {
    try {
      const data = await GraphQLClient.executeAuthenticated<{ getMe: UserProfile }>(getMe);
      if (data.getMe) {
        setUser(data.getMe);
        localStorage.setItem('user', JSON.stringify(data.getMe));
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    const profile = await AuthBridge.signIn(email, password);
    setUser(profile);
    localStorage.setItem('user', JSON.stringify(profile));
  }

  async function signUp(input: { email: string; password: string; firstName: string; lastName: string; phoneNumber: string }) {
    await AuthBridge.signUp(input);
    // After signup, user needs to verify email
  }

  async function signInWithGoogle() {
    await AuthBridge.signInWithGoogle();
  }

  async function verifyEmail(email: string, code: string) {
    await AuthBridge.verifyEmail(email, code);
  }

  async function resendVerificationCode(email: string) {
    await AuthBridge.resendVerificationCode(email);
  }

  async function forgotPassword(email: string) {
    await AuthBridge.forgotPassword(email);
  }

  async function resetPassword(email: string, code: string, newPassword: string) {
    await AuthBridge.resetPassword(email, code, newPassword);
  }

  function signOut() {
    AuthBridge.signOut();
    setUser(null);
    localStorage.removeItem('user');
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        refreshUser,
        signIn,
        signUp,
        signInWithGoogle,
        verifyEmail,
        resendVerificationCode,
        forgotPassword,
        resetPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    if (typeof window === 'undefined') {
      return {
        user: null,
        isAuthenticated: false,
        isLoading: true,
        refreshUser: async () => {},
        signIn: async () => {},
        signUp: async () => {},
        signInWithGoogle: async () => {},
        verifyEmail: async () => {},
        resendVerificationCode: async () => {},
        forgotPassword: async () => {},
        resetPassword: async () => {},
        signOut: () => {},
      } as AuthContextType;
    }
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
