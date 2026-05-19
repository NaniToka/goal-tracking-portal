import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, setTokens, clearTokens, getStoredRefreshToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await authAPI.getMe();
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch {
      const refreshToken = getStoredRefreshToken();
      if (refreshToken) {
        try {
          const { data } = await authAPI.refresh(refreshToken);
          setTokens(data.accessToken || data.token, data.refreshToken);
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
          setLoading(false);
          return;
        } catch {
          // fall through to clear
        }
      }
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const { data } = await authAPI.login(email, password);
    const accessToken = data.accessToken || data.token;
    setTokens(accessToken, data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    const refreshToken = getStoredRefreshToken();
    try {
      if (localStorage.getItem('token')) {
        await authAPI.logout(refreshToken);
      }
    } catch {
      // clear client state even if API fails
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated, login, logout, loadUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
