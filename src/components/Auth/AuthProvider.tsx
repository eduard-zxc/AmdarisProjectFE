import { useAuth0 } from '@auth0/auth0-react';
import { createContext, useContext, type ReactNode } from 'react';

type AuthContextType = {
  isAuthenticated: boolean;
  loginWithRedirect: (opts?: any) => void;
  logout: () => void;
  user: any;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

  return (
    <AuthContext.Provider value={{ isAuthenticated, loginWithRedirect, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};