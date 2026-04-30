import React, { createContext, useContext, useEffect, useState } from 'react';

type AuthContextType = {
  isAuthenticated: boolean;
  token: string | null;
  phone: string | null;
  loginWithToken: (token: string, phone?: string) => void;
  logout: () => void;
  sendOtp: (phone: string, channel: 'whatsapp' | 'sms') => Promise<{ ok: boolean; message?: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ ok: boolean; token?: string; message?: string }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
  const [phone, setPhone] = useState<string | null>(() => localStorage.getItem('auth_phone'));

  useEffect(() => {
    if (token) localStorage.setItem('auth_token', token);
    else localStorage.removeItem('auth_token');
  }, [token]);

  useEffect(() => {
    if (phone) localStorage.setItem('auth_phone', phone);
    else localStorage.removeItem('auth_phone');
  }, [phone]);

  function loginWithToken(tkn: string, ph?: string) {
    setToken(tkn);
    if (ph) setPhone(ph);
  }

  function logout() {
    setToken(null);
    setPhone(null);
  }

  async function sendOtp(phoneNumber: string, channel: 'whatsapp' | 'sms'): Promise<{ ok: boolean; message?: string }> {
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, channel }),
      });
      const data = await res.json();
      if (res.ok) {
        return { ok: true, message: data.message };
      }
      return { ok: false, message: data.message || 'Failed to send OTP' };
    } catch {
      return { ok: false, message: 'Network error. Please try again.' };
    }
  }

  async function verifyOtp(phoneNumber: string, otp: string): Promise<{ ok: boolean; token?: string; message?: string }> {
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, otp }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        loginWithToken(data.token, phoneNumber);
        return { ok: true, token: data.token };
      }
      return { ok: false, message: data.message || 'Invalid OTP' };
    } catch {
      return { ok: false, message: 'Network error. Please try again.' };
    }
  }

  const value: AuthContextType = {
    isAuthenticated: !!token,
    token,
    phone,
    loginWithToken,
    logout,
    sendOtp,
    verifyOtp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;