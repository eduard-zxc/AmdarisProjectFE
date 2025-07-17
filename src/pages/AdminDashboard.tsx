import React, { useState } from "react";
import { Box, Paper, Typography, Tabs, Tab } from "@mui/material";
import UserList from "../components/admin/UserList";
import AuctionList from "../components/admin/AuctionList";
import CategoryList from "../components/admin/CategoryList";

const AdminDashboard: React.FC = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: 6 }}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h4" mb={2}>
          Admin Dashboard
        </Typography>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Users" />
          <Tab label="Auctions" />
          <Tab label="Categories" />
        </Tabs>
        {tab === 0 && <UserList />}
        {tab === 1 && <AuctionList />}
        {tab === 2 && <CategoryList />}
      </Paper>
    </Box>
  );
};

export default AdminDashboard;
