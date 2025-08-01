import { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Avatar,
  Typography,
  Box,
  Divider,
  Dialog,
  Toolbar,
} from "@mui/material";
import AuctionForm from "./AuctionForm";
import { useAuth } from "./auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useIsAdmin } from "../hooks/useIsAdmin";

export interface SidebarProps {
  onAuctionCreated: () => void;
  mobileOpen: boolean;
  onCloseDrawer: () => void;
  isDesktop: boolean;
  drawerWidth: number;
  appBarHeight: number;
}

const Sidebar = ({
  onAuctionCreated,
  mobileOpen,
  onCloseDrawer,
  isDesktop,
  drawerWidth,
  appBarHeight,
}: SidebarProps) => {
  const [openDialog, setOpenDialog] = useState(false);
  const { user, isAuthenticated, loginWithRedirect } = useAuth();
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();

  const handleOpenDialog = () => {
    if (!isAuthenticated) {
      loginWithRedirect();
      return;
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const menuItems = [
    { text: "My Auctions" },
    isAdmin
      ? { text: "Admin Dashboard", onClick: () => navigate("/admin") }
      : null,
    { text: "Categories" },
    isAuthenticated
      ? { text: "My Profile", onClick: () => navigate("/profile") }
      : null,
    { text: "Settings" },
  ].filter(Boolean) as { text: string; onClick?: () => void }[];

  const drawerContent = (
    <Box
      sx={{ height: "100%", display: "flex", flexDirection: "column", p: 2 }}
    >
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <Avatar
          alt={user?.email || "User"}
          src={user?.picture}
          sx={{ width: 32, height: 32 }}
        />
        <Box>
          <Typography variant="body2">User:</Typography>
          <Typography variant="body2" fontWeight="bold">
            {user?.email || "Unknown"}
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleOpenDialog}>
            <ListItemText primary="Create Auction" />
          </ListItemButton>
        </ListItem>
        {menuItems.map(({ text, onClick }) => (
          <ListItem key={text} disablePadding>
            <ListItemButton onClick={onClick}>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <Drawer
        variant={isDesktop ? "permanent" : "temporary"}
        open={isDesktop ? true : mobileOpen}
        onClose={onCloseDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: "secondary.main",
            color: "white",
            top: isDesktop ? `${appBarHeight}px` : 0,
            height: isDesktop ? `calc(100vh - ${appBarHeight}px)` : "100vh",
          },
        }}
      >
        <Toolbar sx={{ minHeight: `${appBarHeight}px` }} /> {drawerContent}
      </Drawer>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ p: 3 }}>
          <AuctionForm
            onCreated={() => {
              handleCloseDialog();
              onAuctionCreated();
            }}
          />
        </Box>
      </Dialog>
    </>
  );
};

export default Sidebar;
