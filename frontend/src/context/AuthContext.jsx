import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await authAPI.profile();
      setUser(data);
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('access_token',  data.tokens.access);
    localStorage.setItem('refresh_token', data.tokens.refresh);
    setUser(data.user);
    return data;
  };

  const register = async (formData) => {
    const { data } = await authAPI.register(formData);
    localStorage.setItem('access_token',  data.tokens.access);
    localStorage.setItem('refresh_token', data.tokens.refresh);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await authAPI.logout({ refresh: localStorage.getItem('refresh_token') });
    } catch {}
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
