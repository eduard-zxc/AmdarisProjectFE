import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { ensureUserExists } from '../api/ApiHelper';

type UserContextType = {
  userId: string | null;
  loading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently({
            authorizationParams: {
              audience: import.meta.env.VITE_AUTH0_AUDIENCE,
            }
          });
          const user = await ensureUserExists(token);
          setUserId(user.id);
        } catch {
          setUserId(null);
        }
      } else {
        setUserId(null);
      }
      setLoading(false);
    };
    fetchUser();
  }, [isAuthenticated, getAccessTokenSilently]);

  return (
    <UserContext.Provider value={{ userId, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserId = () => {
  const ctx = useContext(UserContext);
  if (ctx === undefined) throw new Error('useUserId must be used within UserProvider');
  return ctx;
};