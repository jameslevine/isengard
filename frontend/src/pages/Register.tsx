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
import { confirmSignUp, signUp } from "../services/auth";

import { ROUTES } from "../constants/routes";
import { useFormik } from "formik";
import { useState } from "react";

const signUpSchema = Yup.object({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(12, "Password must be at least 12 characters")
    .matches(/[a-z]/, "Must contain a lowercase letter")
    .matches(/[A-Z]/, "Must contain an uppercase letter")
    .matches(/[0-9]/, "Must contain a number")
    .matches(/[^a-zA-Z0-9]/, "Must contain a special character")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

const verifySchema = Yup.object({
  code: Yup.string()
    .length(6, "Verification code must be 6 digits")
    .required("Verification code is required"),
});

export const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const signUpFormik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: signUpSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError(null);
      try {
        await signUp({
          email: values.email,
          password: values.password,
          firstName: values.firstName,
          lastName: values.lastName,
        });
        setRegisteredEmail(values.email);
        setShowVerification(true);
        setSuccess(
          "Account created! Check your email for a verification code."
        );
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Registration failed.";
        setError(message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const verifyFormik = useFormik({
    initialValues: { code: "" },
    validationSchema: verifySchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError(null);
      try {
        await confirmSignUp(registeredEmail, values.code);
        setSuccess("Email verified! You can now sign in.");
        setTimeout(() => navigate(ROUTES.LOGIN), 2000);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Verification failed.";
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
            {showVerification ? "Verify Email" : "Create Account"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {showVerification
              ? "Enter the verification code sent to your email"
              : "Sign up for Isengard"}
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

        {!showVerification ? (
          <form onSubmit={signUpFormik.handleSubmit}>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                id="firstName"
                name="firstName"
                label="First Name"
                value={signUpFormik.values.firstName}
                onChange={signUpFormik.handleChange}
                onBlur={signUpFormik.handleBlur}
                error={
                  signUpFormik.touched.firstName &&
                  Boolean(signUpFormik.errors.firstName)
                }
                helperText={
                  signUpFormik.touched.firstName &&
                  signUpFormik.errors.firstName
                }
              />
              <TextField
                fullWidth
                id="lastName"
                name="lastName"
                label="Last Name"
                value={signUpFormik.values.lastName}
                onChange={signUpFormik.handleChange}
                onBlur={signUpFormik.handleBlur}
                error={
                  signUpFormik.touched.lastName &&
                  Boolean(signUpFormik.errors.lastName)
                }
                helperText={
                  signUpFormik.touched.lastName && signUpFormik.errors.lastName
                }
              />
            </Box>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email"
              type="email"
              value={signUpFormik.values.email}
              onChange={signUpFormik.handleChange}
              onBlur={signUpFormik.handleBlur}
              error={
                signUpFormik.touched.email && Boolean(signUpFormik.errors.email)
              }
              helperText={
                signUpFormik.touched.email && signUpFormik.errors.email
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              id="password"
              name="password"
              label="Password"
              type="password"
              value={signUpFormik.values.password}
              onChange={signUpFormik.handleChange}
              onBlur={signUpFormik.handleBlur}
              error={
                signUpFormik.touched.password &&
                Boolean(signUpFormik.errors.password)
              }
              helperText={
                signUpFormik.touched.password && signUpFormik.errors.password
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              value={signUpFormik.values.confirmPassword}
              onChange={signUpFormik.handleChange}
              onBlur={signUpFormik.handleBlur}
              error={
                signUpFormik.touched.confirmPassword &&
                Boolean(signUpFormik.errors.confirmPassword)
              }
              helperText={
                signUpFormik.touched.confirmPassword &&
                signUpFormik.errors.confirmPassword
              }
              sx={{ mb: 3 }}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={signUpFormik.isSubmitting}
            >
              {signUpFormik.isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={verifyFormik.handleSubmit}>
            <TextField
              fullWidth
              id="code"
              name="code"
              label="Verification Code"
              value={verifyFormik.values.code}
              onChange={verifyFormik.handleChange}
              onBlur={verifyFormik.handleBlur}
              error={
                verifyFormik.touched.code && Boolean(verifyFormik.errors.code)
              }
              helperText={verifyFormik.touched.code && verifyFormik.errors.code}
              sx={{ mb: 3 }}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={verifyFormik.isSubmitting}
            >
              {verifyFormik.isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Verify Email"
              )}
            </Button>
          </form>
        )}

        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{" "}
            <Link component={RouterLink} to={ROUTES.LOGIN}>
              Sign in
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
