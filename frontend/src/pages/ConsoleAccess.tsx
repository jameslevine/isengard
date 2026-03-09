import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import CloudIcon from "@mui/icons-material/Cloud";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

export const ConsoleAccess = () => {
  // Placeholder - will be connected to API
  const accounts: {
    accountId: string;
    accountName: string;
    classification: string;
    roles: { roleId: string; roleName: string }[];
  }[] = [];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" sx={{ mb: 1 }}>
          Console Access
        </Typography>
        <Typography variant="body1" color="text.secondary">
          One-click federation to AWS Console
        </Typography>
      </Box>

      {accounts.length === 0 ? (
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
            <Button variant="contained" href="/accounts">
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
                <TableCell>Roles</TableCell>
                <TableCell align="right">Actions</TableCell>
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
                    {account.roles.map((role) => (
                      <Button
                        key={role.roleId}
                        variant="outlined"
                        size="small"
                        startIcon={<OpenInNewIcon />}
                        sx={{ mr: 1, mb: 0.5 }}
                      >
                        {role.roleName}
                      </Button>
                    ))}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Get temporary credentials">
                      <IconButton size="small">
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};
