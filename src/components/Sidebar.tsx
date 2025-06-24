import { Drawer, List, ListItem, ListItemText, ListItemButton, Avatar, Typography, Box, Divider, useMediaQuery, type Theme } from '@mui/material';

const drawerWidth = 180;

const SidebarContent = () => (
  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
      <Avatar alt="User" src="person.jpg" sx={{ width: 32, height: 32 }} />
      <Box>
        <Typography variant="body2">User:</Typography>
        <Typography variant="body2" fontWeight="bold">John Doe</Typography>
      </Box>
    </Box>
    <Divider sx={{ mb: 2 }} />
    <List>
      {['My Auctions', 'Create Auction', 'Bids', 'Categories', 'Profile', 'Settings', 'Logout'].map((text, idx) => (
        <ListItem key={text} disablePadding>
          <ListItemButton>
            <ListItemText primary={text} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
    {/* Optionally, place logout button at the bottom */}
    {/* <Box sx={{ mt: 'auto' }}><LogoutButton /></Box> */}
  </Box>
);

const Sidebar = ({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) => {
  const isDesktop = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));

  return (
    <Drawer
      variant={isDesktop ? "permanent" : "temporary"}
      open={isDesktop ? true : mobileOpen}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: 'secondary.main',
          color: 'white',
          top: isDesktop ? '64px' : 0,
          height: isDesktop ? 'calc(100vh - 64px)' : '100vh',
        },
      }}
    >
      <SidebarContent />
    </Drawer>
  );
};

export default Sidebar;