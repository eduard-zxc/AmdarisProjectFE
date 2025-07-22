import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { getAuctionById, updateAuction } from "../api/ApiHelper";
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
  CardMedia,
} from "@mui/material";
import { useNotification } from "../components/NotificationsProvider";
import GavelIcon from "@mui/icons-material/Gavel";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { useBidHub } from "../api/useBidHub";
import noImage from "../assets/react.svg";
import { useAuth } from "../components/auth/AuthProvider";
import { useIsAdmin } from "../hooks/useIsAdmin";

export default function AuctionDetails() {
  const { id } = useParams();
  const [auction, setAuction] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { getAccessTokenSilently, isAuthenticated } = useAuth();
  const notify = useNotification();
  const [bidAmount, setBidAmount] = useState<number | null>(null);
  const [bidLoading, setBidLoading] = useState(false);
  const { userId, loading: userLoading } = useUserId();

  // Admin edit state
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);

  const isAdmin = useIsAdmin();

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

  const now = new Date();
  const start = new Date(auction.startTime);
  const end = new Date(auction.endTime);

  const isEnded = now > end;
  const isStartingSoon = now < start;

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
      setBids((prev) => [
        { amount: bidAmount, userId, placedAt: new Date().toISOString() },
        ...prev,
      ]);
      setBidAmount(null);
    } catch (err: any) {
      notify(err.message || "Failed to place bid", "error");
      console.error("Bid error:", err);
    } finally {
      setBidLoading(false);
    }
  };

  // Image logic
  let image = noImage;
  if (auction.images && auction.images.length > 0) {
    const imgObj = auction.images[0];
    const imgUrl = typeof imgObj === "string" ? imgObj : imgObj.url;
    if (imgUrl && imgUrl.startsWith("http")) {
      image = imgUrl;
    } else if (imgUrl) {
      const baseUrl = import.meta.env.VITE_BLOB_BASE_URL;
      const container = import.meta.env.VITE_BLOB_CONTAINER_NAME;
      const sasToken = import.meta.env.VITE_BLOB_SAS_TOKEN;
      image = `${baseUrl}/${container}/${imgUrl}`;
      if (sasToken) {
        image += image.includes("?") ? `&${sasToken}` : `?${sasToken}`;
      }
    }
  }

  const handleEditClick = () => {
    setEditData({
      title: auction.title,
      description: auction.description,
    });
    setEditMode(true);
  };

  const handleEditChange = (field: string, value: any) => {
    setEditData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditSave = async () => {
    setEditLoading(true);
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      });
      const payload: any = {
        title: editData.title,
        description: editData.description,
      };
      await updateAuction(auction.id, payload, token);
      await fetchAuction();
      notify("Auction updated!", "success");
    } catch (err: any) {
      notify("Failed to update auction", "error");
    } finally {
      setEditLoading(false);
      setEditMode(false);
    }
  };

  return (
    <Box sx={{ width: 600, mx: "auto", mt: 6 }}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
        {/* Title, Edit Button */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {editMode ? (
            <TextField
              label="Title"
              value={editData.title}
              onChange={(e) => handleEditChange("title", e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
          ) : (
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {auction.title}
            </Typography>
          )}
          {isAdmin && !editMode && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              sx={{ ml: 2 }}
              onClick={handleEditClick}
            >
              Edit
            </Button>
          )}
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <Chip
            label={isEnded ? "Ended" : isStartingSoon ? "Soon" : "Live"}
            color={isEnded ? "error" : isStartingSoon ? "warning" : "success"}
            size="small"
            icon={<FiberManualRecordIcon sx={{ fontSize: 12 }} />}
          />
        </Stack>
        {/* Image */}
        <CardMedia
          component="img"
          height="500"
          image={image}
          alt={auction.title}
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            if (target.src !== noImage) {
              target.src = noImage;
            }
          }}
          sx={{
            objectFit: "cover",
            background: "#f5f5f5",
            minHeight: 180,
            borderRadius: 2,
            mb: 3,
          }}
        />
        {/* Description */}
        {editMode ? (
          <TextField
            label="Description"
            value={editData.description}
            onChange={(e) => handleEditChange("description", e.target.value)}
            fullWidth
            multiline
            sx={{ mb: 2 }}
          />
        ) : (
          <Typography variant="body1" color="text.secondary" mb={2}>
            {auction.description}
          </Typography>
        )}
        {/* Edit Save/Cancel */}
        {editMode && (
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleEditSave}
              disabled={editLoading}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={() => setEditMode(false)}
              disabled={editLoading}
            >
              Cancel
            </Button>
          </Box>
        )}
        <Divider sx={{ my: 2 }} />
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
        {/* Real-time Place Bid */}
        {!isEnded && !editMode ? (
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
        ) : !editMode ? (
          <Typography color="error" fontWeight="bold" sx={{ mb: 2 }}>
            Bidding is closed. Auction has ended.
          </Typography>
        ) : null}
        {/* Bid History */}
        {bids.length > 0 && !editMode && (
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
