import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../auth/AuthProvider";

export default function UserList() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { getAccessTokenSilently } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      const token = await getAccessTokenSilently();
      const decodedToken: any = jwtDecode(token);
      const roles = decodedToken["https://online-auction-app.com/roles"];
      setIsAdmin(roles && roles.includes("admin"));

      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, [getAccessTokenSilently]);

  if (loading) return <CircularProgress />;
  if (!isAdmin) return <div>Access denied</div>;

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Email</TableCell>
          <TableCell>Username</TableCell>
          <TableCell>Role</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {users.map((u) => (
          <TableRow key={u.id}>
            <TableCell>{u.email}</TableCell>
            <TableCell>{u.username}</TableCell>
            <TableCell>{u.role}</TableCell>
            <TableCell>{u.isActive ? "Active" : "Banned"}</TableCell>
            <TableCell>
              <Button size="small" disabled={!u.isActive}>
                Ban
              </Button>
              <Button size="small" disabled={u.isActive}>
                Unban
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
