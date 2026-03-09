import { Box, Typography } from "@mui/material";

export const Dashboard = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h1">Dashboard</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Welcome to Isengard — AWS Account Management Platform
      </Typography>
    </Box>
  );
};
