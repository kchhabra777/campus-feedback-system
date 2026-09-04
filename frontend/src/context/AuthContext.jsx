import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react';
import { api, setTokenProvider } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { isLoaded: isClerkLoaded, isSignedIn, user: clerkUser } = useUser();
  const { getToken } = useClerkAuth();
  const clerk = useClerk();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('campus_token') || null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  // Fail-safe timeout: never allow Clerk or network lag to hang on loading screen for > 2.5s
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Set the token provider so every API request gets the latest Clerk JWT
  useEffect(() => {
    setTokenProvider(async () => {
      if (isSignedIn && getToken) {
        return await getToken();
      }
      return localStorage.getItem('campus_token');
    });
  }, [isSignedIn, getToken]);

  // Sync Clerk User with our Backend
  useEffect(() => {
    const syncUser = async () => {
      if (isSignedIn && clerkUser) {
        const email = clerkUser.primaryEmailAddress?.emailAddress?.trim().toLowerCase();

        // Strict University Domain Guard
        if (email && !email.endsWith('@thapar.edu')) {
          setAuthError(`Access Denied: "${email}" is not an authorized @thapar.edu address. Only official Thapar University accounts are permitted.`);
          setUser(null);
          setToken(null);
          localStorage.removeItem('campus_token');
          if (clerk) {
            try {
              await clerk.signOut();
            } catch (e) {
              console.warn("Clerk signout notice:", e);
            }
          }
          setLoading(false);
          return;
        }

        try {
          if (email) {
            setAuthError('');
            const data = await api.syncClerkUser({
              email,
              fullName: clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
              clerkId: clerkUser.id
            });
            setUser(data.user);
            if (data.token) {
              localStorage.setItem('campus_token', data.token);
              setToken(data.token);
            }
          }
        } catch (err) {
          console.error("Failed to sync Clerk user with backend:", err);
          setAuthError(err.message || "Failed to initialize university profile.");
          if (clerk) {
            try {
              await clerk.signOut();
            } catch (e) {}
          }
        }
      } else if (!isSignedIn && isClerkLoaded) {
        // Fallback to local token check if exists
        const localToken = localStorage.getItem('campus_token');
        if (localToken) {
          try {
            const data = await api.getMe();
            setUser(data.user);
          } catch (e) {
            logout();
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    };

    if (isClerkLoaded) {
      syncUser();
    }
  }, [isClerkLoaded, isSignedIn, clerkUser]);

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
    const refreshed = await api.getMe();
    setUser(refreshed.user);
    return res;
  };

  const onboardTeacher = async (profileData) => {
    const res = await api.onboardTeacher(profileData);
    const refreshed = await api.getMe();
    setUser(refreshed.user);
    return res;
  };

  const logout = async () => {
    localStorage.removeItem('campus_token');
    setToken(null);
    setUser(null);
    setAuthError('');
    if (isSignedIn && clerk) {
      try {
        await clerk.signOut();
      } catch (e) {
        console.warn("Clerk signout notice:", e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading: loading,
        authError,
        setAuthError,
        login,
        signup,
        onboardStudent,
        onboardTeacher,
        logout,
        setUser,
        isSignedIn,
        clerkUser
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
