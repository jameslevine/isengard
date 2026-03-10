import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Button } from "@mui/material";
import { useAccount } from "../hooks/useAccounts";
import { useState } from "react";

export const AccountDetail = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
  const { data: account, isLoading, error } = useAccount(accountId || "");
  const [tab, setTab] = useState(0);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !account) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/accounts")}
          sx={{ mb: 2 }}
        >
          Back to Accounts
        </Button>
        <Alert severity="error">Account not found or failed to load.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/accounts")}
        sx={{ mb: 2 }}
      >
        Back to Accounts
      </Button>

      {/* Account Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box>
              <Typography variant="h2" sx={{ mb: 0.5 }}>
                {account.accountName}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                fontFamily="monospace"
              >
                {account.accountId}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {account.email}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Chip
                label={account.accountType}
                size="small"
                variant="outlined"
              />
              <Chip
                label={account.classification}
                size="small"
                color={
                  account.classification === "PRODUCTION" ? "error" : "default"
                }
              />
              <Chip
                label={account.status}
                size="small"
                color={account.status === "ACTIVE" ? "success" : "warning"}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Details" />
        <Tab label="Roles" />
        <Tab label="History" />
      </Tabs>

      {/* Details Tab */}
      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h3" sx={{ mb: 2 }}>
                  Account Information
                </Typography>
                <DetailRow label="Account ID" value={account.accountId} mono />
                <DetailRow label="Name" value={account.accountName} />
                <DetailRow label="Email" value={account.email} />
                <DetailRow label="Description" value={account.description} />
                <DetailRow label="Type" value={account.accountType} />
                <DetailRow
                  label="Classification"
                  value={account.classification}
                />
                <DetailRow label="Status" value={account.status} />
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h3" sx={{ mb: 2 }}>
                  Security & Ownership
                </Typography>
                <DetailRow
                  label="Control Role Status"
                  value={account.controlRoleStatus}
                />
                <DetailRow
                  label="Primary Owner"
                  value={account.primaryOwnerId}
                  mono
                />
                <DetailRow
                  label="Secondary Owners"
                  value={
                    account.secondaryOwnerIds?.length
                      ? account.secondaryOwnerIds.join(", ")
                      : "None"
                  }
                />
                <DetailRow
                  label="Customer Data"
                  value={account.dataSensitivity?.customerData ? "Yes" : "No"}
                />
                <DetailRow
                  label="Customer Metadata"
                  value={
                    account.dataSensitivity?.customerMetadata ? "Yes" : "No"
                  }
                />
                <DetailRow
                  label="Business Data"
                  value={account.dataSensitivity?.businessData ? "Yes" : "No"}
                />
                <DetailRow label="Created" value={account.createdAt} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Roles Tab */}
      {tab === 1 && (
        <Card>
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 4,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              Role management UI coming soon. Roles API is available at:
            </Typography>
            <Typography variant="body2" fontFamily="monospace" sx={{ mt: 1 }}>
              GET /v1/accounts/{account.accountId}/roles
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* History Tab */}
      {tab === 2 && (
        <Card>
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 4,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              Audit history UI coming soon. History API is available at:
            </Typography>
            <Typography variant="body2" fontFamily="monospace" sx={{ mt: 1 }}>
              GET /v1/accounts/{account.accountId}/history
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

const DetailRow = ({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      py: 1,
      borderBottom: "1px solid",
      borderColor: "divider",
      "&:last-child": { borderBottom: "none" },
    }}
  >
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography
      variant="body2"
      fontWeight={500}
      fontFamily={mono ? "monospace" : "inherit"}
      sx={{ maxWidth: "60%", textAlign: "right", wordBreak: "break-all" }}
    >
      {value}
    </Typography>
  </Box>
);
