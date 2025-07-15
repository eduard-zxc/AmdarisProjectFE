import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CardActions from "@mui/material/CardActions";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Toolbar from "@mui/material/Toolbar";
import Grid from "@mui/material/Grid";
import DeleteIcon from "@mui/icons-material/Delete";
import { getAuctions, deleteAuction } from "../api/ApiHelper";
import type { Auction } from "../types/Auction";
import { useAuth0 } from "@auth0/auth0-react";
import noImage from "../assets/react.svg";
import { useNotification } from "./NotificationsProvider";
import { Link as RouterLink } from "react-router-dom";
import GavelIcon from "@mui/icons-material/Gavel";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

function Countdown({
  startTime,
  endTime,
}: {
  startTime: string;
  endTime: string;
}) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  if (now < start) {
    const left = getTimeLeft(start, now);
    return <span>Starts in {formatTime(left)}</span>;
  }
  if (now >= end) {
    return <span>Ended</span>;
  }
  const left = getTimeLeft(end, now);
  return <span>Ends in {formatTime(left)}</span>;
}

function getTimeLeft(end: number, now: number) {
  const total = end - now;
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / 1000 / 60 / 60) % 24);
  const days = Math.floor(total / 1000 / 60 / 60 / 24);
  return { total, days, hours, minutes, seconds };
}

function formatTime(left: {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}) {
  return `${left.days > 0 ? left.days + "d " : ""}${left.hours
    .toString()
    .padStart(2, "0")}:${left.minutes
    .toString()
    .padStart(2, "0")}:${left.seconds.toString().padStart(2, "0")}`;
}

interface AuctionListProps {
  filters: {
    categoryId: string;
    minPrice: number;
    maxPrice: number;
    status: { active: boolean; ended: boolean };
    sortBy: string;
    sortOrder: string;
    title: string;
  };
}

export default function AuctionList({ filters }: AuctionListProps) {
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
      setLoading(true);
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          },
        });
        const data = await getAuctions(token, filters);
        setAuctions(data.items || []);
      } catch {
        notify("Failed to load auctions", "error");
      }
      setLoading(false);
    };
    fetchAuctions();
  }, [getAccessTokenSilently, isAuthenticated, filters, notify]);

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
    <Box sx={{ flex: 1, p: 2 }}>
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
            const imgUrl = a.images[0].url;
            if (imgUrl.startsWith("http")) {
              image = imgUrl;
            } else {
              const baseUrl = import.meta.env.VITE_BLOB_BASE_URL;
              const container = import.meta.env.VITE_BLOB_CONTAINER_NAME;
              const sasToken = import.meta.env.VITE_BLOB_SAS_TOKEN;
              image = `${baseUrl}/${container}/${imgUrl}`;
              if (sasToken) {
                image += image.includes("?") ? `&${sasToken}` : `?${sasToken}`;
              }
            }
          }

          const now = Date.now();
          const start = new Date(a.startTime).getTime();
          const end = new Date(a.endTime).getTime();
          const isEnded = now >= end;
          const isStartingSoon = now < start;

          return (
            <Grid key={a.id}>
              <Box
                component={RouterLink}
                to={`/auctions/${a.id}`}
                sx={{ textDecoration: "none", color: "inherit" }}
              >
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 280,
                    maxWidth: 280,
                    width: "100%",
                    cursor: "pointer",
                  }}
                >
                  <CardMedia
                    component="img"
                    height="180"
                    image={image}
                    alt={a.title}
                    onError={(e) => {
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
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      mb={1}
                    >
                      <Chip
                        label={
                          isEnded ? "Ended" : isStartingSoon ? "Soon" : "Live"
                        }
                        size="small"
                        color={
                          isEnded
                            ? "error"
                            : isStartingSoon
                            ? "warning"
                            : "success"
                        }
                        icon={<FiberManualRecordIcon sx={{ fontSize: 12 }} />}
                      />
                      <Box
                        ml={1}
                        fontSize={14}
                        color={
                          isEnded
                            ? "error.main"
                            : isStartingSoon
                            ? "warning.main"
                            : "text.secondary"
                        }
                      >
                        <Countdown
                          startTime={a.startTime}
                          endTime={a.endTime}
                        />
                      </Box>
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
                        bgcolor: isEnded ? "#ffebee" : "#e8f5e9",
                        borderRadius: 2,
                        p: 1,
                        mt: 2,
                        mb: 1,
                        justifyContent: "center",
                      }}
                    >
                      <GavelIcon
                        color={isEnded ? "error" : "success"}
                        fontSize="small"
                      />
                      <Typography
                        variant="subtitle2"
                        color={isEnded ? "error.main" : "success.main"}
                        fontWeight="bold"
                      >
                        {isEnded ? "Final Bid:" : "Current Bid:"}
                      </Typography>
                      <Typography
                        variant="h6"
                        color={isEnded ? "error.main" : "success.main"}
                        fontWeight="bold"
                        sx={{ ml: 1 }}
                      >
                        ${currentPrice.toLocaleString()}
                      </Typography>
                    </Stack>
                  </CardContent>
                  <CardActions sx={{ justifyContent: "flex-end" }}>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(a.id);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
