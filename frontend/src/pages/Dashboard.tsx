import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";

import AccountTreeIcon from "@mui/icons-material/AccountTree";
import CloudIcon from "@mui/icons-material/Cloud";
import PeopleIcon from "@mui/icons-material/People";
import SecurityIcon from "@mui/icons-material/Security";
import { useAccounts } from "../hooks/useAccounts";
import { useNavigate } from "react-router-dom";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useAccounts();

  const accounts = data?.items || [];
  const totalAccounts = accounts.length;
  const productionCount = accounts.filter(
    (a) => a.classification === "PRODUCTION"
  ).length;

  const summaryCards = [
    {
      title: "Accounts",
      value: isLoading ? "..." : String(totalAccounts),
      subtitle: "Registered AWS accounts",
      icon: <AccountTreeIcon sx={{ fontSize: 40 }} />,
      color: "#232f3e",
    },
    {
      title: "Production",
      value: isLoading ? "..." : String(productionCount),
      subtitle: "Production accounts",
      icon: <CloudIcon sx={{ fontSize: 40 }} />,
      color: "#ff9900",
    },
    {
      title: "Violations",
      value: "0",
      subtitle: "Open security issues",
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      color: "#d32f2f",
    },
    {
      title: "Non-Production",
      value: isLoading ? "..." : String(totalAccounts - productionCount),
      subtitle: "Non-production accounts",
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: "#2e7d32",
    },
  ];

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

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {summaryCards.map((card) => (
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
                Registered Accounts
              </Typography>
              {accounts.length === 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    py: 4,
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    No accounts registered yet.{" "}
                    <Chip
                      label="Register an account"
                      size="small"
                      color="primary"
                      variant="outlined"
                      clickable
                      onClick={() => navigate("/accounts")}
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {accounts.map((account) => (
                    <Box
                      key={account.accountId}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        py: 1.5,
                        px: 1,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        "&:last-child": { borderBottom: "none" },
                        cursor: "pointer",
                        "&:hover": { bgcolor: "action.hover" },
                        borderRadius: 1,
                      }}
                      onClick={() => navigate(`/accounts/${account.accountId}`)}
                    >
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          {account.accountName}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontFamily="monospace"
                        >
                          {account.accountId}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          alignItems: "center",
                        }}
                      >
                        <Chip
                          label={account.classification}
                          size="small"
                          color={
                            account.classification === "PRODUCTION"
                              ? "error"
                              : "default"
                          }
                        />
                        <Chip
                          label={account.status}
                          size="small"
                          color={
                            account.status === "ACTIVE" ? "success" : "warning"
                          }
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};
