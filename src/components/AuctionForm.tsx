import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { createAuction, getCategories } from '../api/ApiHelper';
import { Box, TextField, Button, MenuItem, Typography, CircularProgress } from '@mui/material';

type AuctionFormProps = {
  onCreated: () => void;
};

const AuctionForm = ({ onCreated }: AuctionFormProps) => {
  const { getAccessTokenSilently, isAuthenticated, user } = useAuth0();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        }
      });
      const cats = await getCategories(token);
      setCategories(cats);
    };
    fetchCategories();
  }, [getAccessTokenSilently]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('You must be logged in to create an auction.');
      return;
    }
    setLoading(true);
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        }
      });

      if (!user?.sub) {
        alert('User ID is missing.');
        setLoading(false);
        return;
      }
      await createAuction(
        {
          title,
          description,
          startingPrice: Number(startingPrice),
          categoryId,
          userId: user?.sub,
        },
        token
      );
      setTitle('');
      setDescription('');
      setStartingPrice('');
      setCategoryId('');
      onCreated();
    } catch (err) {
      alert('Failed to create auction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} mb={4} sx={{ maxWidth: 400 }}>
      <Typography variant="h6" mb={2}>Create Auction</Typography>
      <TextField
        label="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
        fullWidth
        margin="normal"
      />
      <TextField
        label="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        required
        fullWidth
        margin="normal"
      />
      <TextField
        label="Starting Price"
        type="number"
        value={startingPrice}
        onChange={e => setStartingPrice(e.target.value)}
        required
        fullWidth
        margin="normal"
        inputProps={{ min: 0 }}
      />
      <TextField
        select
        label="Category"
        value={categoryId}
        onChange={e => setCategoryId(e.target.value)}
        required
        fullWidth
        margin="normal"
      >
        <MenuItem value="">Select Category</MenuItem>
        {categories.map(cat => (
          <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
        ))}
      </TextField>
      <Box mt={2}>
        <Button type="submit" variant="contained" color="primary" disabled={loading} fullWidth>
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Create'}
        </Button>
      </Box>
    </Box>
  );
};

export default AuctionForm;