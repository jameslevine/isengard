import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import AccountTreeIcon from "@mui/icons-material/AccountTree";
import AddIcon from "@mui/icons-material/Add";

export const Accounts = () => {
  // Placeholder - will be connected to API
  const accounts: {
    accountId: string;
    accountName: string;
    email: string;
    classification: string;
    accountType: string;
    status: string;
    controlRoleStatus: string;
  }[] = [];

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h2" sx={{ mb: 1 }}>
            Manage Accounts
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Register and manage your AWS accounts
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}>
          Register Account
        </Button>
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
            <AccountTreeIcon
              sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h3" sx={{ mb: 1 }}>
              No accounts registered
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Register your first AWS account to get started
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />}>
              Register Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Account Name</TableCell>
                <TableCell>Account ID</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Classification</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Control Role</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.map((account) => (
                <TableRow
                  key={account.accountId}
                  hover
                  sx={{ cursor: "pointer" }}
                >
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
                  <TableCell>{account.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={account.accountType}
                      size="small"
                      variant="outlined"
                    />
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
                    <Chip
                      label={account.status}
                      size="small"
                      color={
                        account.status === "ACTIVE" ? "success" : "warning"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={account.controlRoleStatus}
                      size="small"
                      color={
                        account.controlRoleStatus === "ACTIVE"
                          ? "success"
                          : account.controlRoleStatus === "PENDING"
                            ? "warning"
                            : "error"
                      }
                    />
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
