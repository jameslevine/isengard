import * as Yup from "yup";

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
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useAccounts, useRegisterAccount } from "../hooks/useAccounts";

import AccountTreeIcon from "@mui/icons-material/AccountTree";
import AddIcon from "@mui/icons-material/Add";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const registerSchema = Yup.object({
  accountId: Yup.string()
    .length(12, "Must be exactly 12 digits")
    .matches(/^\d+$/, "Must contain only digits")
    .required("Account ID is required"),
  accountName: Yup.string().min(3).max(128).required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  description: Yup.string()
    .min(20, "At least 20 characters")
    .max(500)
    .required("Description is required"),
  accountType: Yup.string()
    .oneOf(["PERSONAL", "SERVICE"])
    .required("Type is required"),
  classification: Yup.string()
    .oneOf(["PRODUCTION", "NON_PRODUCTION"])
    .required("Classification is required"),
});

export const Accounts = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useAccounts();
  const registerMutation = useRegisterAccount();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterClassification, setFilterClassification] = useState("ALL");

  const allAccounts = data?.items || [];
  const accounts = allAccounts.filter((a) => {
    const matchesSearch =
      !search ||
      a.accountName.toLowerCase().includes(search.toLowerCase()) ||
      a.accountId.includes(search) ||
      a.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filterClassification === "ALL" ||
      a.classification === filterClassification;
    return matchesSearch && matchesFilter;
  });

  const formik = useFormik({
    initialValues: {
      accountId: "",
      accountName: "",
      email: "",
      description: "",
      accountType: "PERSONAL",
      classification: "NON_PRODUCTION",
    },
    validationSchema: registerSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setRegisterError(null);
      try {
        await registerMutation.mutateAsync({
          ...values,
          dataSensitivity: {
            customerData: false,
            customerMetadata: false,
            businessData: false,
          },
        });
        setRegisterSuccess(
          `Account ${values.accountId} registered successfully!`
        );
        resetForm();
        setTimeout(() => {
          setDialogOpen(false);
          setRegisterSuccess(null);
        }, 2000);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to register account";
        setRegisterError(message);
      } finally {
        setSubmitting(false);
      }
    },
  });

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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Register Account
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load accounts. Please try again.
        </Alert>
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
            <AccountTreeIcon
              sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h3" sx={{ mb: 1 }}>
              No accounts registered
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Register your first AWS account to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
            >
              Register Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Search and Filter Bar */}
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              size="small"
              placeholder="Search by name, ID, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flexGrow: 1 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Classification</InputLabel>
              <Select
                value={filterClassification}
                label="Classification"
                onChange={(e) => setFilterClassification(e.target.value)}
              >
                <MenuItem value="ALL">All</MenuItem>
                <MenuItem value="PRODUCTION">Production</MenuItem>
                <MenuItem value="NON_PRODUCTION">Non-Production</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {accounts.length} of {allAccounts.length} accounts
          </Typography>
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
                </TableRow>
              </TableHead>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow
                    key={account.accountId}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => navigate(`/accounts/${account.accountId}`)}
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Register Account Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Register AWS Account</DialogTitle>
        <DialogContent>
          {registerError && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
              {registerError}
            </Alert>
          )}
          {registerSuccess && (
            <Alert severity="success" sx={{ mb: 2, mt: 1 }}>
              {registerSuccess}
            </Alert>
          )}
          <form id="register-form" onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              id="accountId"
              name="accountId"
              label="AWS Account ID"
              placeholder="123456789012"
              value={formik.values.accountId}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.accountId && Boolean(formik.errors.accountId)
              }
              helperText={formik.touched.accountId && formik.errors.accountId}
              sx={{ mt: 2, mb: 2 }}
            />
            <TextField
              fullWidth
              id="accountName"
              name="accountName"
              label="Account Name"
              value={formik.values.accountName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.accountName && Boolean(formik.errors.accountName)
              }
              helperText={
                formik.touched.accountName && formik.errors.accountName
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Account Email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              id="description"
              name="description"
              label="Description"
              multiline
              rows={2}
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.description && Boolean(formik.errors.description)
              }
              helperText={
                formik.touched.description && formik.errors.description
              }
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Account Type</InputLabel>
              <Select
                id="accountType"
                name="accountType"
                value={formik.values.accountType}
                label="Account Type"
                onChange={formik.handleChange}
              >
                <MenuItem value="PERSONAL">Personal</MenuItem>
                <MenuItem value="SERVICE">Service</MenuItem>
              </Select>
            </FormControl>
            <FormControl component="fieldset">
              <Typography variant="body2" sx={{ mb: 1 }}>
                Classification
              </Typography>
              <RadioGroup
                name="classification"
                value={formik.values.classification}
                onChange={formik.handleChange}
                row
              >
                <FormControlLabel
                  value="NON_PRODUCTION"
                  control={<Radio />}
                  label="Non-Production"
                />
                <FormControlLabel
                  value="PRODUCTION"
                  control={<Radio />}
                  label="Production"
                />
              </RadioGroup>
            </FormControl>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            type="submit"
            form="register-form"
            variant="contained"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Register"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
