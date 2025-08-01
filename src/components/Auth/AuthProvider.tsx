import { useAuth0 } from "@auth0/auth0-react";
import { createContext, useContext, type ReactNode } from "react";

export type AuthContextType = {
  isAuthenticated: boolean;
  loginWithRedirect: (options?: any) => void;
  logout: (options?: any) => void;
  user: any;
  getAccessTokenSilently: (...args: any[]) => Promise<string>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const {
    isAuthenticated,
    loginWithRedirect,
    logout,
    user,
    getAccessTokenSilently,
  } = useAuth0();

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loginWithRedirect,
        logout,
        user,
        getAccessTokenSilently,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
