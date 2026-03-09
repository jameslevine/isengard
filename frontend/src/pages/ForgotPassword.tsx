import * as Yup from "yup";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { confirmForgotPassword, forgotPassword } from "../services/auth";

import { ROUTES } from "../constants/routes";
import { useFormik } from "formik";
import { useState } from "react";

const emailSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
});

const resetSchema = Yup.object({
  code: Yup.string()
    .length(6, "Code must be 6 digits")
    .required("Verification code is required"),
  newPassword: Yup.string()
    .min(12, "Password must be at least 12 characters")
    .matches(/[a-z]/, "Must contain a lowercase letter")
    .matches(/[A-Z]/, "Must contain an uppercase letter")
    .matches(/[0-9]/, "Must contain a number")
    .matches(/[^a-zA-Z0-9]/, "Must contain a special character")
    .required("New password is required"),
});

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const emailFormik = useFormik({
    initialValues: { email: "" },
    validationSchema: emailSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError(null);
      try {
        await forgotPassword(values.email);
        setResetEmail(values.email);
        setShowReset(true);
        setSuccess("Verification code sent to your email.");
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to send reset code.";
        setError(message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const resetFormik = useFormik({
    initialValues: { code: "", newPassword: "" },
    validationSchema: resetSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError(null);
      try {
        await confirmForgotPassword(
          resetEmail,
          values.code,
          values.newPassword
        );
        setSuccess("Password reset! You can now sign in.");
        setTimeout(() => navigate(ROUTES.LOGIN), 2000);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Password reset failed.";
        setError(message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        bgcolor: "background.default",
        p: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{ p: 4, maxWidth: 440, width: "100%", borderRadius: 2 }}
      >
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h1"
            sx={{ color: "primary.main", fontSize: "1.75rem" }}
          >
            {showReset ? "Reset Password" : "Forgot Password"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {showReset
              ? "Enter the code and your new password"
              : "Enter your email to receive a reset code"}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {!showReset ? (
          <form onSubmit={emailFormik.handleSubmit}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email"
              type="email"
              value={emailFormik.values.email}
              onChange={emailFormik.handleChange}
              onBlur={emailFormik.handleBlur}
              error={
                emailFormik.touched.email && Boolean(emailFormik.errors.email)
              }
              helperText={emailFormik.touched.email && emailFormik.errors.email}
              sx={{ mb: 3 }}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={emailFormik.isSubmitting}
            >
              {emailFormik.isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Send Reset Code"
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={resetFormik.handleSubmit}>
            <TextField
              fullWidth
              id="code"
              name="code"
              label="Verification Code"
              value={resetFormik.values.code}
              onChange={resetFormik.handleChange}
              onBlur={resetFormik.handleBlur}
              error={
                resetFormik.touched.code && Boolean(resetFormik.errors.code)
              }
              helperText={resetFormik.touched.code && resetFormik.errors.code}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              id="newPassword"
              name="newPassword"
              label="New Password"
              type="password"
              value={resetFormik.values.newPassword}
              onChange={resetFormik.handleChange}
              onBlur={resetFormik.handleBlur}
              error={
                resetFormik.touched.newPassword &&
                Boolean(resetFormik.errors.newPassword)
              }
              helperText={
                resetFormik.touched.newPassword &&
                resetFormik.errors.newPassword
              }
              sx={{ mb: 3 }}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={resetFormik.isSubmitting}
            >
              {resetFormik.isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        )}

        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Link component={RouterLink} to={ROUTES.LOGIN} variant="body2">
            Back to sign in
          </Link>
        </Box>
      </Paper>
    </Box>
  );
};
