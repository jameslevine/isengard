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
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import {
  useAuditHistory,
  useCreateRole,
  useDeleteRole,
  useRoles,
} from "../hooks/useRoles";
import { useNavigate, useParams } from "react-router-dom";

import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import Paper from "@mui/material/Paper";
import { useAccount } from "../hooks/useAccounts";
import { useFormik } from "formik";
import { useState } from "react";

const roleSchema = Yup.object({
  roleName: Yup.string()
    .matches(/^[a-zA-Z0-9-_]+$/, "Alphanumeric, hyphens, underscores only")
    .max(64)
    .required("Role name is required"),
  roleType: Yup.string()
    .oneOf(["CONSOLE", "APPLICATION", "DELEGATED"])
    .required(),
  description: Yup.string()
    .min(10)
    .max(500)
    .required("Description is required"),
  policyArns: Yup.string().required("At least one policy ARN is required"),
});

export const AccountDetail = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
  const { data: account, isLoading, error } = useAccount(accountId || "");
  const { data: rolesData, isLoading: rolesLoading } = useRoles(
    accountId || ""
  );
  const { data: auditData, isLoading: auditLoading } = useAuditHistory(
    accountId || ""
  );
  const createRoleMutation = useCreateRole(accountId || "");
  const deleteRoleMutation = useDeleteRole(accountId || "");
  const [tab, setTab] = useState(0);
  const [roleDialog, setRoleDialog] = useState(false);

  const formik = useFormik({
    initialValues: {
      roleName: "",
      roleType: "CONSOLE",
      description: "",
      policyArns: "arn:aws:iam::aws:policy/ReadOnlyAccess",
    },
    validationSchema: roleSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await createRoleMutation.mutateAsync({
          ...values,
          policyArns: values.policyArns.split(",").map((s) => s.trim()),
        });
        resetForm();
        setRoleDialog(false);
      } catch {
        // Error handled by mutation
      } finally {
        setSubmitting(false);
      }
    },
  });

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

  const roles = rolesData?.items || [];
  const auditLogs = auditData?.items || [];

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/accounts")}
        sx={{ mb: 2 }}
      >
        Back to Accounts
      </Button>

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

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Details" />
        <Tab label={`Roles (${roles.length})`} />
        <Tab label={`History (${auditLogs.length})`} />
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
                  label="Control Role"
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
                <DetailRow
                  label="Created"
                  value={new Date(account.createdAt).toLocaleString()}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Roles Tab */}
      {tab === 1 && (
        <Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setRoleDialog(true)}
            >
              Create Role
            </Button>
          </Box>
          {rolesLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : roles.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No roles created yet. Create a console or application role.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Role Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Timeout</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.roleId}>
                      <TableCell>
                        <Typography fontWeight={600}>
                          {role.roleName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={role.roleType}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell>{role.sessionTimeout}s</TableCell>
                      <TableCell>
                        <Chip
                          label={role.status}
                          size="small"
                          color="success"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => deleteRoleMutation.mutate(role.roleId)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* History Tab */}
      {tab === 2 && (
        <Box>
          {auditLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : auditLogs.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No audit history yet. Actions will be logged here.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Actor</TableCell>
                    <TableCell>Resource</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.auditId}>
                      <TableCell>
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip label={log.action} size="small" />
                      </TableCell>
                      <TableCell>{log.actorEmail || log.actorId}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {log.resourceType}/{log.resourceId}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Create Role Dialog */}
      <Dialog
        open={roleDialog}
        onClose={() => setRoleDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Role</DialogTitle>
        <DialogContent>
          <form id="role-form" onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              id="roleName"
              name="roleName"
              label="Role Name"
              value={formik.values.roleName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.roleName && Boolean(formik.errors.roleName)}
              helperText={formik.touched.roleName && formik.errors.roleName}
              sx={{ mt: 2, mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Role Type</InputLabel>
              <Select
                name="roleType"
                value={formik.values.roleType}
                label="Role Type"
                onChange={formik.handleChange}
              >
                <MenuItem value="CONSOLE">Console</MenuItem>
                <MenuItem value="APPLICATION">Application</MenuItem>
                <MenuItem value="DELEGATED">Delegated</MenuItem>
              </Select>
            </FormControl>
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
            <TextField
              fullWidth
              id="policyArns"
              name="policyArns"
              label="Policy ARNs (comma-separated)"
              value={formik.values.policyArns}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.policyArns && Boolean(formik.errors.policyArns)
              }
              helperText={formik.touched.policyArns && formik.errors.policyArns}
              sx={{ mb: 2 }}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialog(false)}>Cancel</Button>
          <Button
            type="submit"
            form="role-form"
            variant="contained"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Create Role"
            )}
          </Button>
        </DialogActions>
      </Dialog>
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
