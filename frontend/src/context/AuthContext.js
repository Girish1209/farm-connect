import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const profileRes = await api.get('/users/profile');
      const fullUser = profileRes.data;
      setUser(fullUser);
      localStorage.setItem('user', JSON.stringify(fullUser));
    } catch (err) {
      console.error('Profile load failed:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      localStorage.setItem('token', res.data.token);
      await loadUser();
    } catch (err) {
      throw err;
    }
  };

  const register = async (data) => {
    try {
      const res = await authAPI.register(data);
      return res;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};