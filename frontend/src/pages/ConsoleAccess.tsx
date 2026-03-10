import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import CloudIcon from "@mui/icons-material/Cloud";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { apiClient } from "../services/apiClient";
import { useAccounts } from "../hooks/useAccounts";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface CredentialsResponse {
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string;
    expiration: string;
  };
  accountId: string;
  roleName: string;
  environment: {
    bash: string;
    powershell: string;
  };
}

export const ConsoleAccess = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useAccounts();
  const [credsDialog, setCredsDialog] = useState(false);
  const [credentials, setCredentials] = useState<CredentialsResponse | null>(
    null
  );
  const [credsLoading, setCredsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const accounts = data?.items || [];

  const handleFederate = async (accountId: string, roleName: string) => {
    try {
      setError(null);
      const result = await apiClient.post<{ federationUrl: string }>(
        `/accounts/${accountId}/roles/${roleName}/federate`
      );
      window.open(result.federationUrl, "_blank");
    } catch (err) {
      setError(
        `Federation failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  };

  const handleGetCredentials = async (accountId: string, roleName: string) => {
    setCredsLoading(true);
    setError(null);
    try {
      const result = await apiClient.post<CredentialsResponse>(
        `/accounts/${accountId}/roles/${roleName}/credentials`
      );
      setCredentials(result);
      setCredsDialog(true);
    } catch (err) {
      setError(
        `Failed to get credentials: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setCredsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSnackbar("Copied to clipboard!");
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" sx={{ mb: 1 }}>
          Console Access
        </Typography>
        <Typography variant="body1" color="text.secondary">
          One-click federation to AWS Console or get temporary credentials
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : accounts.length === 0 ? (
        <Card>
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 6,
            }}
          >
            <CloudIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h3" sx={{ mb: 1 }}>
              No accounts registered
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Register an AWS account to start federating
            </Typography>
            <Button variant="contained" onClick={() => navigate("/accounts")}>
              Register Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Account</TableCell>
                <TableCell>Account ID</TableCell>
                <TableCell>Classification</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.accountId}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {account.accountName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {account.accountId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={account.classification}
                      size="small"
                      color={
                        account.classification === "PRODUCTION"
                          ? "error"
                          : "default"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<OpenInNewIcon />}
                      onClick={() => handleFederate(account.accountId, "Admin")}
                      sx={{ mr: 1 }}
                    >
                      Console
                    </Button>
                    <Tooltip title="Get temporary credentials">
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleGetCredentials(account.accountId, "Admin")
                        }
                        disabled={credsLoading}
                      >
                        {credsLoading ? (
                          <CircularProgress size={18} />
                        ) : (
                          <ContentCopyIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Credentials Dialog */}
      <Dialog
        open={credsDialog}
        onClose={() => setCredsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Temporary Credentials — {credentials?.accountId} /{" "}
          {credentials?.roleName}
        </DialogTitle>
        <DialogContent>
          {credentials && (
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Expires: {credentials.credentials.expiration}
              </Typography>

              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Bash / Zsh
              </Typography>
              <Box sx={{ position: "relative" }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={credentials.environment.bash}
                  slotProps={{ input: { readOnly: true } }}
                  sx={{
                    "& .MuiInputBase-input": {
                      fontFamily: "monospace",
                      fontSize: "0.85rem",
                    },
                  }}
                />
                <IconButton
                  size="small"
                  sx={{ position: "absolute", top: 8, right: 8 }}
                  onClick={() => copyToClipboard(credentials.environment.bash)}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Box>

              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                PowerShell
              </Typography>
              <Box sx={{ position: "relative" }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={credentials.environment.powershell}
                  slotProps={{ input: { readOnly: true } }}
                  sx={{
                    "& .MuiInputBase-input": {
                      fontFamily: "monospace",
                      fontSize: "0.85rem",
                    },
                  }}
                />
                <IconButton
                  size="small"
                  sx={{ position: "absolute", top: 8, right: 8 }}
                  onClick={() =>
                    copyToClipboard(credentials.environment.powershell)
                  }
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCredsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={2000}
        onClose={() => setSnackbar(null)}
        message={snackbar}
      />
    </Box>
  );
};
