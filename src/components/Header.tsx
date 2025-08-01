import {
  AppBar,
  Toolbar,
  Box,
  InputBase,
  Button,
  IconButton,
  useMediaQuery,
  type Theme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";

const Header = ({
  onMenuClick,
  onSearch,
}: {
  onMenuClick: () => void;
  onSearch: (value: string) => void;
}) => {
  const isDesktop = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));
  const navigate = useNavigate();
  const { isAuthenticated, logout, loginWithRedirect } = useAuth();

  return (
    <AppBar
      position="fixed"
      color="primary"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {!isDesktop && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={onMenuClick}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Button
            color="inherit"
            onClick={() => navigate("/")}
            sx={{
              textTransform: "none",
              fontWeight: "bold",
              fontSize: "1.1rem",
            }}
          >
            Auction Dashboard
          </Button>
        </Box>
        <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
          <InputBase
            placeholder="Search auctions..."
            onChange={(e) => onSearch(e.target.value)}
            sx={{
              bgcolor: "rgba(255,255,255,0.15)",
              px: 2,
              py: 0.5,
              borderRadius: 1,
              color: "inherit",
              width: { xs: "120px", sm: "200px", md: "300px", lg: "400px" },
              transition: "width 0.3s",
            }}
            inputProps={{ "aria-label": "search" }}
          />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {!isAuthenticated ? (
            <>
              <Button
                color="inherit"
                onClick={() => loginWithRedirect()}
                sx={{ textTransform: "none" }}
              >
                LOGIN/ REGISTER
              </Button>
            </>
          ) : (
            <Button
              color="inherit"
              onClick={() => logout({ returnTo: window.location.origin })}
              sx={{ textTransform: "none" }}
            >
              LOGOUT
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
