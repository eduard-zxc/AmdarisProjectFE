import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './components/Auth/AuthProvider';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Sidebar from './components/Sidebar';
import Filters from './components/Filters';
import AuctionList from './components/AuctionList';
import Header from './components/Header';
import { getCategories } from './api/ApiHelper';
import { ThemeProvider, createTheme, CssBaseline, Box, useMediaQuery } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2d3e50' },
    secondary: { main: '#34495e' },
    background: { default: '#f6f7fb' },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

const drawerWidth = 180;
const appBarHeight = 0;

function App() {
  const [refresh, setRefresh] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await getCategories('');
        setCategories(cats.map((c: any) => c.name));
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const handleDrawerToggle = () => setMobileOpen((open) => !open);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Header onMenuClick={handleDrawerToggle} />
          <Box sx={{ display: 'flex' }}>
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
                display: 'flex',
                minHeight: `calc(100vh - ${appBarHeight}px)`,
                bgcolor: 'background.default',
                mt: `${appBarHeight}px`,
                ml: 0,
                transition: 'margin-left 0.3s',
              }}
            >
              <Filters categories={categories} />
              <Box sx={{ flex: 1, p: 4 }}>
                <AuctionList key={refresh ? 1 : 0} />
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                </Routes>
              </Box>
            </Box>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;