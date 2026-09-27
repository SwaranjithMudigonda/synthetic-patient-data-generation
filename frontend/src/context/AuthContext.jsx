import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  supabase, 
  sendOtp as authSendOtp, 
  verifyOtp as authVerifyOtp, 
  signOut as authSignOut, 
  signOutGlobal as authSignOutGlobal,
  getSession,
  getSessionMetadata,
  enrollMfaTotp,
  verifyMfaChallenge,
  listMfaFactors,
  unenrollMfa
} from '../services/authService';

const AuthContext = createContext(null);

function sanitizeUser(rawUser) {
  if (!rawUser) return null;
  return {
    ...rawUser,
    email: String(rawUser.email || '').replace(/[<>"'&]/g, ''),
    user_metadata: {
      ...(rawUser.user_metadata || {}),
      full_name: String(rawUser.user_metadata?.full_name || '').replace(/[<>"'&]/g, '')
    }
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionMeta, setSessionMeta] = useState(null);

  const refreshSessionData = async (currSession) => {
    setSession(currSession);
    setUser(sanitizeUser(currSession?.user));
    if (currSession) {
      const meta = await getSessionMetadata();
      setSessionMeta(meta);
    } else {
      setSessionMeta(null);
    }
  };

  useEffect(() => {
    // Check active session on startup
    getSession().then((currSession) => {
      refreshSessionData(currSession);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      refreshSessionData(newSession);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const sendOtp = async (email, options) => {
    return await authSendOtp(email, options);
  };

  const verifyOtp = async (email, token) => {
    const res = await authVerifyOtp(email, token);
    if (res.success && res.data?.session) {
      await refreshSessionData(res.data.session);
    }
    return res;
  };

  const signOut = async () => {
    await authSignOut();
    setSession(null);
    setUser(null);
    setSessionMeta(null);
  };

  const signOutGlobal = async () => {
    await authSignOutGlobal();
    setSession(null);
    setUser(null);
    setSessionMeta(null);
  };

  const value = {
    session,
    user,
    sessionMeta,
    loading,
    isAuthenticated: !!user,
    sendOtp,
    verifyOtp,
    signOut,
    signOutGlobal,
    enrollMfaTotp,
    verifyMfaChallenge,
    listMfaFactors,
    unenrollMfa
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
