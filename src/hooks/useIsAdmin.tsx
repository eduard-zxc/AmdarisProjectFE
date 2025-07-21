import { useAuth } from "../components/auth/AuthProvider";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";

export function useIsAdmin() {
  const { user, getAccessTokenSilently } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      const token = await getAccessTokenSilently();
      const decoded: any = jwtDecode(token);
      const roles = decoded["https://online-auction-app.com/roles"];
      setIsAdmin(roles && roles.includes("admin"));
    };
    checkAdmin();
  }, [user, getAccessTokenSilently]);

  return isAdmin;
}
