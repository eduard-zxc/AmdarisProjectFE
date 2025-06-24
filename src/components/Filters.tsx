import { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  InputBase,
  Toolbar,
} from '@mui/material';

const minPrice = 0;
const maxPrice = 100000;

function formatNumber(value: number) {
  return value.toLocaleString('en-US');
}

function parseNumber(value: string) {
  return Number(value.replace(/\D/g, '')) || 0;
}

interface FiltersProps {
  categories: string[];
}

const Filters = ({ categories }: FiltersProps) => {
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<{ active: boolean; ended: boolean }>({ active: false, ended: false });
  const [priceRange, setPriceRange] = useState<[number, number]>([minPrice, maxPrice]);

  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    setPriceRange(newValue as [number, number]);
  };

  const handleInputChange = (index: 0 | 1) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseNumber(e.target.value);
    let newRange: [number, number] = [...priceRange];
    if (index === 0) {
      value = Math.max(minPrice, Math.min(value, newRange[1]));
      newRange[0] = value;
    } else {
      value = Math.min(maxPrice, Math.max(value, newRange[0]));
      newRange[1] = value;
    }
    setPriceRange(newRange);
  };

  const handleCategoryChange = (event: any) => {
    setCategory(event.target.value);
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStatus({
      ...status,
      [event.target.name]: event.target.checked,
    });
  };

  return (
    <Box
      sx={{
        minWidth: 200,
        maxWidth: 300,
        bgcolor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        height: '100vh',
      }}
    >
      <Toolbar sx={{ minHeight: 64, p: 0 }} />
      <Typography variant="h6" sx={{ mb: 2 }}>
        Filters
      </Typography>
      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel id="category-select-label">Category</InputLabel>
        <Select
          labelId="category-select-label"
          label="Category"
          value={category}
          onChange={handleCategoryChange}
        >
          <MenuItem value="">All</MenuItem>
          {categories.map((cat, idx) => (
            <MenuItem key={idx} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box sx={{ mb: 2 }}>
        <Typography gutterBottom>Price Range</Typography>
        <Slider
          value={priceRange}
          onChange={handleSliderChange}
          valueLabelDisplay="auto"
          min={minPrice}
          max={maxPrice}
          step={1000}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <InputBase
            value={formatNumber(priceRange[0])}
            onChange={handleInputChange(0)}
            inputProps={{
              style: {
                textAlign: 'center',
                width: 80,
                borderRadius: 8,
                background: '#fafbfc',
                border: '1px solid #e0e0e0',
                padding: 8,
              },
              inputMode: 'numeric',
              pattern: '[0-9]*',
            }}
          />
          <Typography variant="h6" color="text.secondary" sx={{ mx: 1 }}>
            &ndash;
          </Typography>
          <InputBase
            value={formatNumber(priceRange[1])}
            onChange={handleInputChange(1)}
            inputProps={{
              style: {
                textAlign: 'center',
                width: 80,
                borderRadius: 8,
                background: '#fafbfc',
                border: '1px solid #e0e0e0',
                padding: 8,
              },
              inputMode: 'numeric',
              pattern: '[0-9]*',
            }}
          />
        </Box>
      </Box>
      <FormGroup>
        <Typography>Status</Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={status.active}
              onChange={handleStatusChange}
              name="active"
            />
          }
          label="Active"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={status.ended}
              onChange={handleStatusChange}
              name="ended"
            />
          }
          label="Ended"
        />
      </FormGroup>
    </Box>
  );
};

export default Filters;