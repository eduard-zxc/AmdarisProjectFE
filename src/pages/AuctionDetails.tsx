import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAuctionById } from "../api/ApiHelper";
import { useAuth0 } from "@auth0/auth0-react";
import { CircularProgress, Box, Typography, Paper } from "@mui/material";
import PlaceBid from "../components/AuctionItem"; // or your PlaceBid component
import { useNotification } from "../components/NotificationsProvider";

export default function AuctionDetails() {
  const { id } = useParams();
  const [auction, setAuction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { getAccessTokenSilently } = useAuth0();
  const notify = useNotification();

  useEffect(() => {
    const fetchAuction = async () => {
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
    };
    fetchAuction();
  }, [id, getAccessTokenSilently, notify]);

  if (loading) return <CircularProgress />;
  if (!auction) return <Typography>Auction not found.</Typography>;

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 2, mt: 8 }}>
        <Typography variant="h4">{auction.title}</Typography>
        <Typography variant="subtitle1">{auction.description}</Typography>
        {/* Display images if available */}
        {auction.images &&
          auction.images.map((img: string, idx: number) => (
            <img
              key={idx}
              src={img}
              alt={`Auction ${idx}`}
              style={{ maxWidth: 300, margin: 8 }}
            />
          ))}
        <Typography variant="h6" mt={2}>
          Current Price: ${auction.startingPrice}
        </Typography>
        {/* PlaceBid component */}
        <PlaceBid auctionId={auction.id} currentPrice={auction.startingPrice} />
      </Paper>
      {/* Optionally: show bid history, auction details, etc. */}
    </Box>
  );
}
