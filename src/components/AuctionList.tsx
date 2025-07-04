import { useEffect, useState } from "react";
import noImage from "../assets/react.svg";
import { getAuctions, deleteAuction } from "../api/ApiHelper";
import type { Auction } from "../types/Auction";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Chip,
  Stack,
  Button,
  CircularProgress,
  Toolbar,
} from "@mui/material";
import { Grid } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNotification } from "./NotificationsProvider";
import { Link as RouterLink } from "react-router-dom";
import GavelIcon from "@mui/icons-material/Gavel";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

export default function AuctionList() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const notify = useNotification();

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
      notify("You must be logged in to delete an auction.", "error");
      return;
    }
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      });
      await deleteAuction(id, token);
      setAuctions(auctions.filter((a) => a.id !== id));
      notify("Auction deleted successfully!", "success");
    } catch (err) {
      notify("Failed to delete auction", "error");
    }
  };

  if (loading) return <CircularProgress />;
  return (
    <Box>
      <Toolbar sx={{ minHeight: 64, p: 0 }} />
      <Typography variant="h6" mb={2}>
        Auctions
      </Typography>
      <Grid container spacing={3} alignItems="stretch">
        {auctions.map((a) => {
          const highestBid =
            a.bids && a.bids.length > 0
              ? Math.max(...a.bids.map((b: any) => b.amount))
              : null;
          const currentPrice = highestBid ?? a.startingPrice;

          let image = noImage;
          if (a.images && a.images.length > 0 && a.images[0].url) {
            image = a.images[0].url; // Use the full SAS URL from backend
          }

          // For debugging: log the image URL
          // Remove/comment this after debugging
          // eslint-disable-next-line no-console
          console.log("Auction image URL:", image);

          return (
            <Grid key={a.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  minWidth: 280,
                  maxWidth: 340,
                  width: "100%",
                }}
              >
                <CardMedia
                  component="img"
                  height="180"
                  image={image}
                  alt={a.title}
                  onError={(e) => {
                    // fallback to noImage if loading fails
                    if (e.currentTarget.src !== noImage) {
                      e.currentTarget.src = noImage;
                    }
                  }}
                  sx={{
                    objectFit: "cover",
                    background: "#f5f5f5",
                    minHeight: 180,
                  }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {a.title}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <Chip
                      label="Live"
                      size="small"
                      color="success"
                      icon={<FiberManualRecordIcon sx={{ fontSize: 12 }} />}
                    />
                  </Stack>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {a.description}
                  </Typography>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                      bgcolor: "#e8f5e9",
                      borderRadius: 2,
                      p: 1,
                      mt: 2,
                      mb: 1,
                      justifyContent: "center",
                    }}
                  >
                    <GavelIcon color="success" fontSize="small" />
                    <Typography
                      variant="subtitle2"
                      color="success.main"
                      fontWeight="bold"
                    >
                      Current Bid:
                    </Typography>
                    <Typography
                      variant="h6"
                      color="success.main"
                      fontWeight="bold"
                      sx={{ ml: 1 }}
                    >
                      ${currentPrice.toLocaleString()}
                    </Typography>
                  </Stack>
                </CardContent>
                <CardActions sx={{ justifyContent: "space-between" }}>
                  <Button
                    component={RouterLink}
                    to={`/auctions/${a.id}`}
                    size="small"
                    color="primary"
                  >
                    View
                  </Button>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDelete(a.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
