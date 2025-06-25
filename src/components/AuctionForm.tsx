import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { createAuction, getCategories } from '../api/ApiHelper';
import { Box, TextField, Button, MenuItem, Typography, CircularProgress } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

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

  // Start and End time states
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

  // Validation state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          }
        });
        const cats = await getCategories(token);
        setCategories(cats);
      } catch (err) {
        setCategories([]);
      }
    };
    fetchCategories();
  }, [getAccessTokenSilently]);

  // Validation logic
  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    else if (title.length > 100) newErrors.title = 'Title cannot exceed 100 characters';

    if (!description.trim()) newErrors.description = 'Description is required';
    else if (description.length > 500) newErrors.description = 'Description cannot exceed 500 characters';

    if (!startingPrice) newErrors.startingPrice = 'Starting price is required';
    else if (isNaN(Number(startingPrice)) || Number(startingPrice) <= 0)
      newErrors.startingPrice = 'Starting price must be greater than 0';

    if (!categoryId) newErrors.categoryId = 'Category is required';

    if (!startTime) newErrors.startTime = 'Start time is required';
    if (!endTime) newErrors.endTime = 'End time is required';
    else if (startTime && endTime && endTime <= startTime)
      newErrors.endTime = 'End time must be after start time';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
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
          userId: user.sub,
          startTime: startTime!.toISOString(),
          endTime: endTime!.toISOString(),
        },
        token
      );
      setTitle('');
      setDescription('');
      setStartingPrice('');
      setCategoryId('');
      setStartTime(null);
      setEndTime(null);
      setErrors({});
      onCreated();
    } catch (err) {
      alert('Failed to create auction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit} mb={4} sx={{ maxWidth: 400 }}>
        <Typography variant="h6" mb={2}>Create Auction</Typography>
        <TextField
          label="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          fullWidth
          margin="normal"
          error={!!errors.title}
          helperText={errors.title}
          inputProps={{ maxLength: 100 }}
        />
        <TextField
          label="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
          fullWidth
          margin="normal"
          error={!!errors.description}
          helperText={errors.description}
          inputProps={{ maxLength: 500 }}
        />
        <TextField
          label="Starting Price"
          type="number"
          value={startingPrice}
          onChange={e => setStartingPrice(e.target.value)}
          onInput={e => {
            const input = e.target as HTMLInputElement;
            input.value = input.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
          }}
          required
          fullWidth
          margin="normal"
          inputProps={{ min: 0.01, step: 0.01 }}
          error={!!errors.startingPrice}
          helperText={errors.startingPrice}
        />
        <DateTimePicker
          label="Start Time"
          value={startTime}
          onChange={setStartTime}
          slotProps={{
            textField: {
              required: true,
              fullWidth: true,
              margin: 'normal',
              error: !!errors.startTime,
              helperText: errors.startTime,
            }
          }}
        />
        <DateTimePicker
          label="End Time"
          value={endTime}
          onChange={setEndTime}
          slotProps={{
            textField: {
              required: true,
              fullWidth: true,
              margin: 'normal',
              error: !!errors.endTime,
              helperText: errors.endTime,
            }
          }}
        />
        <TextField
          select
          label="Category"
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          required
          fullWidth
          margin="normal"
          error={!!errors.categoryId}
          helperText={errors.categoryId}
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
    </LocalizationProvider>
  );
};

export default AuctionForm;