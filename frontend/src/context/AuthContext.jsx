import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('erp_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('erp_token');
      const savedUser = localStorage.getItem('erp_user');

      if (savedToken && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
          // Verify with backend
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('erp_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Failed to verify token:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Standard email/password login
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token, user } = res.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('erp_token', token);
        localStorage.setItem('erp_user', JSON.stringify(user));
        return { success: true, user };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
        return { success: false, message: 'Cannot connect to server. Please make sure the backend is running on port 5000.' };
      }
      return {
        success: false,
        message: err.response?.data?.message || 'Invalid email or password.',
      };
    }
  };

  // Register new account (supports any email including @gmail.com)
  const register = async (name, email, password, role) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      if (res.data.success) {
        const { token, user } = res.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('erp_token', token);
        localStorage.setItem('erp_user', JSON.stringify(user));
        return { success: true, user };
      }
      return { success: false, message: res.data.message || 'Registration failed' };
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
        return { success: false, message: 'Cannot connect to server. Make sure the backend is running: cd backend && npm run dev' };
      }
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to create account. Please try again.',
      };
    }
  };

  // Gmail / Google sign-in (auto-creates account on first use)
  const googleAuth = async (email, name, role) => {
    try {
      const res = await api.post('/auth/google', { email, name, role });
      if (res.data.success) {
        const { token, user } = res.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('erp_token', token);
        localStorage.setItem('erp_user', JSON.stringify(user));
        return { success: true, user };
      }
      return { success: false, message: res.data.message || 'Gmail sign-in failed' };
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
        return { success: false, message: 'Cannot connect to server. Make sure the backend is running.' };
      }
      return {
        success: false,
        message: err.response?.data?.message || 'Gmail sign-in failed. Please try again.',
      };
    }
  };

  // Quick demo logins for evaluation
  const quickLogin = async (roleType) => {
    const credentials = {
      admin: { email: 'admin@erp.edu', password: 'admin123' },
      faculty: { email: 'faculty.cs@erp.edu', password: 'faculty123' },
      student_good: { email: 'student1@erp.edu', password: 'student123' },
      student_low: { email: 'student2@erp.edu', password: 'student123' },
      hod: { email: 'hod.cs@erp.edu', password: 'hod123' },
      exam: { email: 'exam@erp.edu', password: 'exam123' },
      gmail_admin: { email: 'mohingoyal45@gmail.com', password: 'admin123' },
    };

    const creds = credentials[roleType] || credentials.admin;
    return await login(creds.email, creds.password);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        permissions: user?.permissions || [],
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        googleAuth,
        quickLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
