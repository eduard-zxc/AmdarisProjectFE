import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { getAuctionById } from "../api/ApiHelper";
import { useAuth0 } from "@auth0/auth0-react";
import {
  CircularProgress,
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Divider,
} from "@mui/material";
import PlaceBid from "../components/AuctionItem";
import { useNotification } from "../components/NotificationsProvider";
import GavelIcon from "@mui/icons-material/Gavel";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

export default function AuctionDetails() {
  const { id } = useParams();
  const [auction, setAuction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { getAccessTokenSilently } = useAuth0();
  const notify = useNotification();

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
    } catch {
      notify("Failed to load auction", "error");
    } finally {
      setLoading(false);
    }
  }, [id, getAccessTokenSilently, notify]);

  useEffect(() => {
    fetchAuction();
  }, [fetchAuction]);

  if (loading) return <CircularProgress />;
  if (!auction) return <Typography>Auction not found.</Typography>;

  // Calculate current price: highest bid or starting price
  const highestBid =
    auction.bids && auction.bids.length > 0
      ? Math.max(...auction.bids.map((b: any) => b.amount))
      : null;
  const currentPrice = highestBid ?? auction.startingPrice;

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 6 }}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
        {/* Auction Image */}
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
            label="Live"
            color="success"
            size="small"
            icon={<FiberManualRecordIcon sx={{ fontSize: 12 }} />}
          />
          {/* Add more chips if you want, e.g. category */}
        </Stack>

        {/* Description */}
        <Typography variant="body1" color="text.secondary" mb={2}>
          {auction.description}
        </Typography>

        {/* Current Bid */}
        <Box
          sx={{
            bgcolor: "#e8f5e9",
            borderRadius: 2,
            p: 2,
            mb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <GavelIcon color="success" fontSize="medium" />
          <Typography
            variant="subtitle1"
            color="success.main"
            fontWeight="bold"
          >
            Current Bid:
          </Typography>
          <Typography variant="h5" color="success.main" fontWeight="bold">
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

        {/* Place Bid */}
        <PlaceBid
          auctionId={auction.id}
          currentPrice={currentPrice}
          onBidPlaced={fetchAuction}
        />

        {/* Optional: Bid History */}
        {auction.bids && auction.bids.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Bid History
            </Typography>
            <Box sx={{ maxHeight: 200, overflowY: "auto" }}>
              {auction.bids
                .sort((a: any, b: any) => b.amount - a.amount)
                .map((bid: any, idx: number) => (
                  <Typography key={idx} variant="body2">
                    ${bid.amount.toLocaleString()} &mdash;{" "}
                    {new Date(bid.placedAt).toLocaleString()}
                  </Typography>
                ))}
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}
