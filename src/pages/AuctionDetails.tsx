import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { getAuctionById } from "../api/ApiHelper";
import { useAuth0 } from "@auth0/auth0-react";
import { useUserId } from "../components/UserContext";
import {
  CircularProgress,
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Divider,
  Button,
  TextField,
} from "@mui/material";
import { useNotification } from "../components/NotificationsProvider";
import GavelIcon from "@mui/icons-material/Gavel";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { useBidHub } from "../api/useBidHub";

export default function AuctionDetails() {
  const { id } = useParams();
  const [auction, setAuction] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const notify = useNotification();
  const [bidAmount, setBidAmount] = useState<number | null>(null);
  const [bidLoading, setBidLoading] = useState(false);
  const { userId, loading: userLoading } = useUserId();

  const fetchAuction = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      });
      const data = await getAuctionById(id as string, token);
      setAuction(data);
      setBids(data.bids || []);
    } catch {
      notify("Failed to load auction", "error");
    } finally {
      setLoading(false);
    }
  }, [id, getAccessTokenSilently, notify]);

  const auctionId = id ?? "";
  const { placeBid: placeBidSignalR } = useBidHub(auctionId, (bid) => {
    setBids((prev) => [bid, ...prev]);
    notify(`New bid placed: $${bid.amount}`, "info");
    if (bidAmount && bid.amount > bidAmount) {
      setBidAmount(bid.amount);
    }
  });

  useEffect(() => {
    fetchAuction();
  }, [fetchAuction]);

  if (loading) return <CircularProgress />;
  if (!auction) return <Typography>Auction not found.</Typography>;

  const highestBid =
    bids.length > 0 ? Math.max(...bids.map((b: any) => b.amount)) : null;
  const currentPrice = highestBid ?? auction.startingPrice;

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      notify("You must be logged in to place a bid.", "error");
      return;
    }
    if (userLoading || !userId) {
      notify(
        "User info not loaded yet. Please try again in a moment.",
        "error"
      );
      return;
    }
    if (!bidAmount || bidAmount <= currentPrice) {
      notify("Bid must be higher than current price.", "warning");
      return;
    }
    setBidLoading(true);
    try {
      placeBidSignalR(bidAmount, userId);
      setBidAmount(null);
      notify("Bid placed!", "success");
    } catch (err: any) {
      notify(err?.message || "Failed to place bid", "error");
    } finally {
      setBidLoading(false);
    }
  };

  const now = Date.now();
  const start = new Date(auction.startTime).getTime();
  const end = new Date(auction.endTime).getTime();
  const isEnded = now >= end;
  const isStartingSoon = now < start;

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 6 }}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
        {auction.images && auction.images.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <img
              src={auction.images[0]}
              alt={auction.title}
              style={{
                width: "100%",
                maxHeight: 320,
                objectFit: "cover",
                borderRadius: 12,
              }}
            />
          </Box>
        )}
        {/* Title and Status */}
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {auction.title}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <Chip
            label={isEnded ? "Ended" : isStartingSoon ? "Soon" : "Live"}
            color={isEnded ? "error" : isStartingSoon ? "warning" : "success"}
            size="small"
            icon={<FiberManualRecordIcon sx={{ fontSize: 12 }} />}
          />
        </Stack>
        {/* Description */}
        <Typography variant="body1" color="text.secondary" mb={2}>
          {auction.description}
        </Typography>
        {/* Current/Final Bid */}
        <Box
          sx={{
            bgcolor: isEnded ? "#ffebee" : "#e8f5e9",
            borderRadius: 2,
            p: 2,
            mb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <GavelIcon color={isEnded ? "error" : "success"} fontSize="medium" />
          <Typography
            variant="subtitle1"
            color={isEnded ? "error.main" : "success.main"}
            fontWeight="bold"
          >
            {isEnded ? "Final Bid:" : "Current Bid:"}
          </Typography>
          <Typography
            variant="h5"
            color={isEnded ? "error.main" : "success.main"}
            fontWeight="bold"
          >
            ${currentPrice.toLocaleString()}
          </Typography>
        </Box>
        {/* Auction Info */}
        <Stack direction="row" spacing={4} mb={2} justifyContent="center">
          <Typography variant="body2">
            <strong>Start:</strong>{" "}
            {new Date(auction.startTime).toLocaleString()}
          </Typography>
          <Typography variant="body2">
            <strong>End:</strong> {new Date(auction.endTime).toLocaleString()}
          </Typography>
        </Stack>
        <Divider sx={{ my: 2 }} />
        {/* Real-time Place Bid */}
        {!isEnded ? (
          <Box
            component="form"
            onSubmit={handleBid}
            sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}
          >
            <TextField
              label="Your Bid"
              type="number"
              value={bidAmount ?? ""}
              onChange={(e) => setBidAmount(Number(e.target.value))}
              inputProps={{ min: currentPrice + 1, step: 1 }}
              required
              size="small"
              disabled={bidLoading}
            />
            <Button type="submit" variant="contained" disabled={bidLoading}>
              {bidLoading ? "Placing..." : "Place Bid"}
            </Button>
          </Box>
        ) : (
          <Typography color="error" fontWeight="bold" sx={{ mb: 2 }}>
            Bidding is closed. Auction has ended.
          </Typography>
        )}
        {/* Bid History */}
        {bids.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Bid History
            </Typography>
            <Box sx={{ maxHeight: 200, overflowY: "auto" }}>
              {bids
                .sort((a: any, b: any) => b.amount - a.amount)
                .map((bid: any, idx: number) => (
                  <Typography key={idx} variant="body2">
                    ${bid.amount.toLocaleString()} &mdash;{" "}
                    {bid.placedAt
                      ? new Date(bid.placedAt).toLocaleString()
                      : "now"}
                  </Typography>
                ))}
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}
