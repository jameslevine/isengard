import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#232f3e",
      light: "#37475a",
      dark: "#131921",
    },
    secondary: {
      main: "#ff9900",
      light: "#ffac31",
      dark: "#e88b00",
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
    error: {
      main: "#d32f2f",
    },
    warning: {
      main: "#ff9900",
    },
    success: {
      main: "#2e7d32",
    },
    info: {
      main: "#0288d1",
    },
  },
  typography: {
    fontFamily: '"Amazon Ember", "Helvetica Neue", Roboto, Arial, sans-serif',
    h1: {
      fontSize: "2rem",
      fontWeight: 700,
    },
    h2: {
      fontSize: "1.5rem",
      fontWeight: 600,
    },
    h3: {
      fontSize: "1.25rem",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#232f3e",
        },
      },
    },
  },
});
