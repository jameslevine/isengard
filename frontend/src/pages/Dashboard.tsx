import { Box, Card, CardContent, Chip, Grid, Typography } from "@mui/material";

import AccountTreeIcon from "@mui/icons-material/AccountTree";
import CloudIcon from "@mui/icons-material/Cloud";
import PeopleIcon from "@mui/icons-material/People";
import SecurityIcon from "@mui/icons-material/Security";

const SUMMARY_CARDS = [
  {
    title: "Accounts",
    value: "—",
    subtitle: "Registered AWS accounts",
    icon: <AccountTreeIcon sx={{ fontSize: 40 }} />,
    color: "#232f3e",
  },
  {
    title: "Console Access",
    value: "—",
    subtitle: "Available roles",
    icon: <CloudIcon sx={{ fontSize: 40 }} />,
    color: "#ff9900",
  },
  {
    title: "Violations",
    value: "—",
    subtitle: "Open security issues",
    icon: <SecurityIcon sx={{ fontSize: 40 }} />,
    color: "#d32f2f",
  },
  {
    title: "Users",
    value: "—",
    subtitle: "Team members",
    icon: <PeopleIcon sx={{ fontSize: 40 }} />,
    color: "#2e7d32",
  },
];

export const Dashboard = () => {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" sx={{ mb: 1 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Overview of your AWS account management
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {SUMMARY_CARDS.map((card) => (
          <Grid key={card.title} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                height: "100%",
                borderTop: `4px solid ${card.color}`,
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {card.title}
                    </Typography>
                    <Typography variant="h3" sx={{ fontSize: "2rem" }}>
                      {card.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {card.subtitle}
                    </Typography>
                  </Box>
                  <Box sx={{ color: card.color, opacity: 0.7 }}>
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Recent Activity
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: 4,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              No recent activity.{" "}
              <Chip
                label="Register an account"
                size="small"
                color="primary"
                variant="outlined"
                sx={{ ml: 1 }}
              />
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
