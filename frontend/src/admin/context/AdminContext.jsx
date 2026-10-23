import React, { createContext, useContext, useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';

const AdminContext = createContext();

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
};

const SESSION_KEY = 'rw_admin_session';
const TOKEN_KEY   = 'rw_admin_token';

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function loadToken() {
  return sessionStorage.getItem(TOKEN_KEY) || null;
}

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin]   = useState(() => loadSession());
  const [token, setToken]   = useState(() => loadToken());
  const [loginError, setLoginError]   = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const isAuthenticated = Boolean(admin && token);

  // ── Authenticated fetch helper ──────────────────────────────────────────
  // Use this for all /api/admin/* calls so the JWT is always attached.
  const authFetch = useCallback(async (url, options = {}) => {
    const currentToken = sessionStorage.getItem(TOKEN_KEY);
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        Authorization: currentToken ? `Bearer ${currentToken}` : '',
      },
    });
  }, []);

  // ── Login ───────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(data.admin));
        sessionStorage.setItem(TOKEN_KEY,   data.token);
        setAdmin(data.admin);
        setToken(data.token);
        return true;
      } else {
        setLoginError(data.message || 'Invalid credentials.');
        return false;
      }
    } catch {
      setLoginError('Unable to reach server. Please try again.');
      return false;
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  // ── Logout ──────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    setAdmin(null);
    setToken(null);
    setLoginError('');
  }, []);

  return (
    <AdminContext.Provider
      value={{
        admin,
        token,
        isAuthenticated,
        login,
        logout,
        authFetch,
        loginError,
        setLoginError,
        isLoggingIn,
      }}
    >
      {children ?? <Outlet />}
    </AdminContext.Provider>
  );
};
