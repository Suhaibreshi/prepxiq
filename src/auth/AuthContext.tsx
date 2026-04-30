'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  phone: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem('prepxiq_token');
    const phone = sessionStorage.getItem('prepxiq_phone');
    if (token && phone) {
      setUser({ token, phone });
    }
  }, []);

  const setUserWithStorage = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      sessionStorage.setItem('prepxiq_token', newUser.token);
      sessionStorage.setItem('prepxiq_phone', newUser.phone);
    } else {
      sessionStorage.removeItem('prepxiq_token');
      sessionStorage.removeItem('prepxiq_phone');
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser: setUserWithStorage, isAuthenticated: !!user }}>
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