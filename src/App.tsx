import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/auth/AuthProvider";
import Sidebar from "./components/Sidebar";
import Filters from "./components/Filters";
import AuctionList from "./components/AuctionList";
import Header from "./components/Header";
import { ensureUserExists, getCategories } from "./api/ApiHelper";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  useMediaQuery,
} from "@mui/material";
import { useNotification } from "./components/NotificationsProvider";
import AuctionDetails from "./pages/AuctionDetails";
import UserProfile from "./pages/UserProfile";
import type { Category } from "./types/Category";
import AdminDashboard from "./pages/AdminDashboard";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#2d3e50" },
    secondary: { main: "#34495e" },
    background: { default: "#f6f7fb" },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
  },
});

const defaultFilters = {
  categoryId: "",
  minPrice: 0,
  maxPrice: 100000,
  status: { active: false, ended: false },
  sortBy: "",
  sortOrder: "asc",
  title: "",
};

const drawerWidth = 180;
const appBarHeight = 0;

function App() {
  const [refresh, setRefresh] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const { isAuthenticated, getAccessTokenSilently } = useAuth();
  const [searchTitle, setSearchTitle] = useState("");
  const notify = useNotification();

  useEffect(() => {
    const checkUser = async () => {
      if (isAuthenticated) {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          },
        });
        try {
          await ensureUserExists(token);
          notify("Welcome! Your profile is ready.", "success");
        } catch (err) {
          notify("User check/creation failed", "error");
          console.error("User check/creation failed", err);
        }
      }
    };
    checkUser();
  }, [isAuthenticated, getAccessTokenSilently]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          },
        });
        const cats = await getCategories(token);
        setCategories(
          cats.map((c: any) => ({
            id: c.id,
            name: c.name,
          }))
        );
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, [getAccessTokenSilently]);

  const handleDrawerToggle = () => setMobileOpen((open) => !open);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Header onMenuClick={handleDrawerToggle} onSearch={setSearchTitle} />
          <Box sx={{ display: "flex" }}>
            <Sidebar
              onAuctionCreated={() => setRefresh((r) => !r)}
              mobileOpen={mobileOpen}
              onCloseDrawer={handleDrawerToggle}
              isDesktop={isDesktop}
              drawerWidth={drawerWidth}
              appBarHeight={appBarHeight}
            />
            <Box
              component="main"
              sx={{
                flex: 1,
                minHeight: `calc(100vh - ${appBarHeight}px)`,
                bgcolor: "background.default",
                mt: `${appBarHeight}px`,
                ml: 0,
                transition: "margin-left 0.3s",
              }}
            >
              <Routes>
                <Route
                  path="/"
                  element={
                    <Box sx={{ display: "flex", gap: 4 }}>
                      <Box sx={{ minWidth: 260, maxWidth: 320 }}>
                        <Filters
                          categories={categories}
                          values={filters}
                          onChange={setFilters}
                        />
                      </Box>
                      <Box sx={{ flex: 1, mt: 4, mr: 4 }}>
                        <AuctionList
                          filters={{ ...filters, title: searchTitle }}
                        />
                      </Box>
                    </Box>
                  }
                />
                <Route
                  path="/auctions/:id"
                  element={
                    <Box
                      sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        p: 4,
                      }}
                    >
                      <AuctionDetails />
                    </Box>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <Box sx={{ flex: 1, p: 4 }}>
                      <UserProfile />
                    </Box>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <Box sx={{ flex: 1, p: 4 }}>
                      <AdminDashboard />
                    </Box>
                  }
                />
              </Routes>
            </Box>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
