import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { authService, SessionData } from '../services/auth/authService';

export interface AuthContextType {
  user: SessionData['user'];
  session: SessionData['session'];
  family: SessionData['family'];
  familyRole: SessionData['familyRole'];
  isLoading: boolean;
  signIn: typeof authService.signIn;
  signOut: typeof authService.signOut;
  resetPassword: typeof authService.resetPassword;
  registerParent: typeof authService.registerParent;
  createFamily: typeof authService.createFamily;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const response = await authService.getCurrentSession();
        if (response.success && response.data) {
          setSessionData(response.data);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange((session) => {
      setSessionData(session);
      setIsLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const contextValue: AuthContextType = {
    user: sessionData?.user || null,
    session: sessionData?.session || null,
    family: sessionData?.family || null,
    familyRole: sessionData?.familyRole || null,
    isLoading,
    signIn: authService.signIn.bind(authService),
    signOut: authService.signOut.bind(authService),
    resetPassword: authService.resetPassword.bind(authService),
    registerParent: authService.registerParent.bind(authService),
    createFamily: authService.createFamily.bind(authService),
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
