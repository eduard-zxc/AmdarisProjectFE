import { useState } from 'react';
import AuctionList from './components/AuctionList';
import AuctionForm from './components/AuctionForm';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { AuthProvider } from './components/Auth/AuthProvider';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LogoutButton from './components/Auth/LogoutButton'; // <-- Import the logout button
import './App.css';

function App() {
  const [refresh, setRefresh] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <div>
          {/* Add navigation links */}
          <nav style={{ marginBottom: '1rem' }}>
            <Link to="/login" style={{ marginRight: '1rem' }}>Login</Link>
            <Link to="/register" style={{ marginRight: '1rem' }}>Register</Link>
            <LogoutButton /> {/* <-- Add the logout button here */}
          </nav>
          <h1>Online Auction</h1>
          <AuctionForm onCreated={() => setRefresh(r => !r)} />
          <AuctionList key={refresh ? 1 : 0} />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            {/* Add other routes here as needed */}
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;