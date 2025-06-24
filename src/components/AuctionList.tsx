import { useEffect, useState } from 'react';
import { getAuctions, deleteAuction } from '../api/ApiHelper';
import type { Auction } from '../types/Auction';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Box, Typography, List, ListItem, ListItemText, IconButton, CircularProgress, Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export default function AuctionList() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  useEffect(() => {
    const fetchAuctions = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      });
      const data = await getAuctions(token);
      setAuctions(data.items || []);
      setLoading(false);
    };
    fetchAuctions();
  }, [getAccessTokenSilently, isAuthenticated]);

  const handleDelete = async (id: string) => {
    if (!isAuthenticated) {
      alert('You must be logged in to delete an auction.');
      return;
    }
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      },
    });
    await deleteAuction(id, token);
    setAuctions(auctions.filter(a => a.id !== id));
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h6" mb={2}>Auctions</Typography>
      <List>
        {auctions.map(a => (
          <Paper key={a.id} sx={{ mb: 2, p: 2 }}>
            <ListItem
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(a.id)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={<strong>{a.title}</strong>}
                secondary={`${a.description} ($${a.startingPrice})`}
              />
            </ListItem>
          </Paper>
        ))}
      </List>
    </Box>
  );
}