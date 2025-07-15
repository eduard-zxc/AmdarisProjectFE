import { useState, useEffect } from "react";
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
  Button,
} from "@mui/material";
import type { Category } from "../types/Category";

const minPrice = 0;
const maxPrice = 100000;

function formatNumber(value: number) {
  return value.toLocaleString("en-US");
}

function parseNumber(value: string) {
  return Number(value.replace(/\D/g, "")) || 0;
}

interface FiltersProps {
  categories: Category[];
  values?: {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: { active: boolean; ended: boolean };
    sortBy?: string;
    sortOrder?: string;
    title?: string;
  };
  onChange?: (filters: any) => void;
}

const sortOptions = [
  { value: "", label: "Default" },
  { value: "StartingPrice", label: "Price" },
  { value: "EndTime", label: "End Time" },
  { value: "StartTime", label: "Start Time" },
];

const orderOptions = [
  { value: "asc", label: "Ascending" },
  { value: "desc", label: "Descending" },
];

const Filters = ({ categories, values, onChange }: FiltersProps) => {
  const [category, setCategory] = useState(values?.categoryId ?? "");
  const [status, setStatus] = useState<{ active: boolean; ended: boolean }>(
    values?.status ?? { active: false, ended: false }
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([
    values?.minPrice ?? minPrice,
    values?.maxPrice ?? maxPrice,
  ]);
  const [sortBy, setSortBy] = useState(values?.sortBy ?? "");
  const [sortOrder, setSortOrder] = useState(values?.sortOrder ?? "asc");

  useEffect(() => {
    if (onChange) {
      onChange({
        categoryId: category,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        status,
        sortBy: sortBy === "" ? null : sortBy,
        sortOrder,
      });
    }
  }, [category, priceRange, status, sortBy, sortOrder, onChange]);

  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    setPriceRange(newValue as [number, number]);
  };

  const handleInputChange =
    (index: 0 | 1) => (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSortByChange = (event: any) => {
    setSortBy(event.target.value);
  };

  const handleSortOrderChange = (event: any) => {
    setSortOrder(event.target.value);
  };

  const handleReset = () => {
    setCategory("");
    setStatus({ active: false, ended: false });
    setPriceRange([minPrice, maxPrice]);
    setSortBy("");
    setSortOrder("asc");
    if (onChange) {
      onChange({
        categoryId: "",
        minPrice,
        maxPrice,
        status: { active: false, ended: false },
        sortBy: null,
        sortOrder: "asc",
      });
    }
  };

  return (
    <Box
      sx={{
        minWidth: 200,
        maxWidth: 300,
        bgcolor: "background.paper",
        borderRight: 1,
        borderColor: "divider",
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        height: "100vh",
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
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name}
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
          <InputBase
            value={formatNumber(priceRange[0])}
            onChange={handleInputChange(0)}
            inputProps={{
              style: {
                textAlign: "center",
                width: 80,
                borderRadius: 8,
                background: "#fafbfc",
                border: "1px solid #e0e0e0",
                padding: 8,
              },
              inputMode: "numeric",
              pattern: "[0-9]*",
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
                textAlign: "center",
                width: 80,
                borderRadius: 8,
                background: "#fafbfc",
                border: "1px solid #e0e0e0",
                padding: 8,
              },
              inputMode: "numeric",
              pattern: "[0-9]*",
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
      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel id="sort-by-label">Sort By</InputLabel>
        <Select
          labelId="sort-by-label"
          label="Sort By"
          value={sortBy}
          onChange={handleSortByChange}
        >
          {sortOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel id="sort-order-label">Order</InputLabel>
        <Select
          labelId="sort-order-label"
          label="Order"
          value={sortOrder}
          onChange={handleSortOrderChange}
        >
          {orderOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button variant="outlined" color="secondary" onClick={handleReset}>
        Reset
      </Button>
    </Box>
  );
};

export default Filters;
