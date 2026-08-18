import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('campus_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const data = await api.getMe();
          setUser(data.user);
        } catch (err) {
          console.error("Session expired or invalid:", err);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    localStorage.setItem('campus_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const signup = async (email, password, otp) => {
    const data = await api.signup({ email, password, otp });
    localStorage.setItem('campus_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const onboardStudent = async (profileData) => {
    const res = await api.onboardStudent(profileData);
    // Refresh user state
    const refreshed = await api.getMe();
    setUser(refreshed.user);
    return res;
  };

  const onboardTeacher = async (profileData) => {
    const res = await api.onboardTeacher(profileData);
    // Refresh user state
    const refreshed = await api.getMe();
    setUser(refreshed.user);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('campus_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        onboardStudent,
        onboardTeacher,
        logout,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
