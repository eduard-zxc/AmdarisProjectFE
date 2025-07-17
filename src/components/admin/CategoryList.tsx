import { useEffect, useState } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Button,
  TextField,
  Box,
} from "@mui/material";
import { useAuth } from "../auth/AuthProvider";

export default function CategoryList() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState("");
  const { getAccessTokenSilently } = useAuth();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/categories`)
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        setLoading(false);
      });
  }, []);

  // Create category
  const handleCreate = async () => {
    if (!newCategory.trim()) return;
    const token = await getAccessTokenSilently();
    const res = await fetch(`${import.meta.env.VITE_API_URL}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newCategory }),
    });
    if (res.ok) {
      const created = await res.json();
      setCategories([...categories, created]);
      setNewCategory("");
    }
  };

  // Delete category
  const handleDelete = async (id: string) => {
    const token = await getAccessTokenSilently();
    await fetch(`${import.meta.env.VITE_API_URL}/categories/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setCategories(categories.filter((c) => c.id !== id));
  };

  if (loading) return <CircularProgress />;

  return (
    <>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="New Category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          size="small"
        />
        <Button variant="contained" onClick={handleCreate}>
          Create
        </Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {categories.map((c) => (
            <TableRow key={c.id}>
              <TableCell>{c.name}</TableCell>
              <TableCell>
                <Button
                  color="error"
                  onClick={() => handleDelete(c.id)}
                  size="small"
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
