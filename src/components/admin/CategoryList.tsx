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
  IconButton,
} from "@mui/material";
import { useAuth } from "../auth/AuthProvider";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

export default function CategoryList() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const { getAccessTokenSilently } = useAuth();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/categories`)
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        setLoading(false);
      });
  }, []);

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

  const handleEdit = (id: string, name: string) => {
    setEditId(id);
    setEditName(name);
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditName("");
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    const token = await getAccessTokenSilently();
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/categories/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, name: editName }),
      }
    );
    if (res.ok) {
      const updated = await res.json();
      setCategories(categories.map((c) => (c.id === id ? updated : c)));
      setEditId(null);
      setEditName("");
    }
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
              <TableCell>
                {editId === c.id ? (
                  <TextField
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    size="small"
                  />
                ) : (
                  c.name
                )}
              </TableCell>
              <TableCell>
                {editId === c.id ? (
                  <>
                    <IconButton
                      color="primary"
                      onClick={() => handleSaveEdit(c.id)}
                      size="small"
                    >
                      <SaveIcon />
                    </IconButton>
                    <IconButton
                      color="inherit"
                      onClick={handleCancelEdit}
                      size="small"
                    >
                      <CancelIcon />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(c.id, c.name)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <Button
                      color="error"
                      onClick={() => handleDelete(c.id)}
                      size="small"
                    >
                      Delete
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
