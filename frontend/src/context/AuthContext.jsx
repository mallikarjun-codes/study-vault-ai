import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe } from '../services/authApi.js';

const TOKEN_KEY = 'sv_token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  // On mount — rehydrate user from stored token
  useEffect(() => {
    if (token) {
      getMe()
        .then(({ user }) => setUser(user))
        .catch(() => {
          // Token is invalid or expired — clear it
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const saveAuth = useCallback(({ user, token }) => {
    localStorage.setItem(TOKEN_KEY, token);
    setToken(token);
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, saveAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
