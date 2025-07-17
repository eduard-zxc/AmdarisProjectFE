import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Tabs,
  Tab,
} from "@mui/material";
import { useAuth } from "../components/auth/AuthProvider";
import {
  getMyBids,
  getMyWonAuctions,
  getMySellingHistory,
  ensureUserExists,
} from "../api/ApiHelper";
import { useNotification } from "../components/NotificationsProvider";

export default function UserProfile() {
  const { isAuthenticated, getAccessTokenSilently, user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [wonAuctions, setWonAuctions] = useState<any[]>([]);
  const [sellingHistory, setSellingHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const notify = useNotification();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          },
        });
        const userProfile = await ensureUserExists(token);
        setProfile(userProfile);

        const [bidsData, wonData, sellingData] = await Promise.all([
          getMyBids(token),
          getMyWonAuctions(token),
          getMySellingHistory(token),
        ]);
        setBids(bidsData);
        setWonAuctions(wonData);
        setSellingHistory(sellingData);
      } catch (err: any) {
        notify("Failed to load profile data", "error");
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) fetchProfile();
  }, [isAuthenticated, getAccessTokenSilently, notify]);

  if (loading) return <CircularProgress />;
  if (!profile) return <Typography>User profile not found.</Typography>;

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 6 }}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Avatar src={user?.picture} sx={{ width: 56, height: 56 }} />
          <Box>
            <Typography variant="h5">{profile.userName}</Typography>
            <Typography color="text.secondary">{profile.email}</Typography>
            <Typography color="text.secondary">
              {profile.firstName} {profile.lastName}
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="My Bids" />
          <Tab label="Won Auctions" />
          <Tab label="Selling History" />
        </Tabs>
        {tab === 0 && (
          <List>
            {bids.length === 0 ? (
              <Typography>No bids found.</Typography>
            ) : (
              bids.map((bid: any, idx: number) => (
                <ListItem key={idx}>
                  <ListItemText
                    primary={`$${bid.amount}`}
                    secondary={`Auction: ${
                      bid.auctionTitle
                    } | Placed: ${new Date(bid.placedAt).toLocaleString()}`}
                  />
                </ListItem>
              ))
            )}
          </List>
        )}
        {tab === 1 && (
          <List>
            {wonAuctions.length === 0 ? (
              <Typography>No won auctions.</Typography>
            ) : (
              wonAuctions.map((auction: any, idx: number) => (
                <ListItem key={idx}>
                  <ListItemText
                    primary={auction.title}
                    secondary={`Ended: ${new Date(
                      auction.endTime
                    ).toLocaleString()}`}
                  />
                </ListItem>
              ))
            )}
          </List>
        )}
        {tab === 2 && (
          <List>
            {sellingHistory.length === 0 ? (
              <Typography>No selling history.</Typography>
            ) : (
              sellingHistory.map((auction: any, idx: number) => (
                <ListItem key={idx}>
                  <ListItemText
                    primary={auction.title}
                    secondary={`Started: ${new Date(
                      auction.startTime
                    ).toLocaleString()} | Ended: ${new Date(
                      auction.endTime
                    ).toLocaleString()}`}
                  />
                </ListItem>
              ))
            )}
          </List>
        )}
      </Paper>
    </Box>
  );
}
