import { Box, Typography } from "@mui/material";

export const Login = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        p: 3,
      }}
    >
      <Typography variant="h1" sx={{ mb: 2 }}>
        Isengard
      </Typography>
      <Typography variant="body1" color="text.secondary">
        AWS Account Management Platform
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
        Login page — Coming soon
      </Typography>
    </Box>
  );
};
