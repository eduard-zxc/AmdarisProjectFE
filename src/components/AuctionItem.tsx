import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNotification } from './NotificationsProvider';
import { placeBid } from '../api/ApiHelper';
import { Button, TextField, Box } from '@mui/material';
import { useUserId } from './UserContext';

type PlaceBidProps = {
  auctionId: string;
  currentPrice: number;
  minIncrement?: number;
  onBidPlaced?: () => void; // callback to refresh auction/bids
};

const PlaceBid: React.FC<PlaceBidProps> = ({
  auctionId,
  currentPrice,
  minIncrement = 1,
  onBidPlaced,
}) => {
  const [amount, setAmount] = useState(currentPrice + minIncrement);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const notify = useNotification();
  const { userId, loading: userLoading } = useUserId();

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      notify('You must be logged in to place a bid.', 'error');
      return;
    }
    if (userLoading || !userId) {
      notify('User info not loaded yet. Please try again in a moment.', 'error');
      return;
    }
    if (amount <= currentPrice) {
      notify('Bid must be higher than current price.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      });
      await placeBid({
        auctionId: auctionId,
        amount: amount,
        userId: userId
      }, token);
      notify('Bid placed successfully!', 'success');
      if (onBidPlaced) onBidPlaced();
    } catch (err: any) {
      notify(err?.message || 'Failed to place bid', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleBid} sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
      <TextField
        label="Your Bid"
        type="number"
        value={amount}
        onChange={e => setAmount(Number(e.target.value))}
        inputProps={{ min: currentPrice + minIncrement, step: 1 }}
        required
        size="small"
      />
      <Button type="submit" variant="contained" disabled={loading || userLoading || !userId}>
        {loading ? 'Placing...' : 'Place Bid'}
      </Button>
    </Box>
  );
};

export default PlaceBid;