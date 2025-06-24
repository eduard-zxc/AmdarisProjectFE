import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Slider, FormGroup, FormControlLabel, Checkbox } from '@mui/material';

interface FiltersProps {
  categories: string[];
}

const Filters = ({ categories }: FiltersProps) => (
  <Box
    sx={{
      minWidth: 200,
      maxWidth: 220,
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
    <Typography variant="h6" sx={{ mb: 2 }}>Filters</Typography>
    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
      <InputLabel id="category-select-label">Category</InputLabel>
      <Select labelId="category-select-label" label="Category" defaultValue="">
        <MenuItem value="">All</MenuItem>
        {categories.map((cat, idx) => (
          <MenuItem key={idx} value={cat}>{cat}</MenuItem>
        ))}
      </Select>
    </FormControl>
    <Box sx={{ mb: 2 }}>
      <Typography gutterBottom>Price Range</Typography>
      <Slider min={0} max={1000} step={10} valueLabelDisplay="auto" />
    </Box>
    <FormGroup>
      <Typography>Status</Typography>
      <FormControlLabel control={<Checkbox />} label="Active" />
      <FormControlLabel control={<Checkbox />} label="Ended" />
    </FormGroup>
  </Box>
);

export default Filters;