import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AccountDetail } from "./pages/AccountDetail";
import { Accounts } from "./pages/Accounts";
import { AppLayout } from "./layouts/AppLayout";
import { ConsoleAccess } from "./pages/ConsoleAccess";
import { CssBaseline } from "@mui/material";
import { Dashboard } from "./pages/Dashboard";
import { ForgotPassword } from "./pages/ForgotPassword";
import { Login } from "./pages/Login";
import { QueryClientProvider } from "@tanstack/react-query";
import { ROUTES } from "./constants/routes";
import { Register } from "./pages/Register";
import { ThemeProvider } from "@mui/material/styles";
import { queryClient } from "./hooks/useQueryConfig";
import { theme } from "./styles/theme";
import { useStore } from "./store";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path={ROUTES.LOGIN} element={<Login />} />
            <Route path={ROUTES.REGISTER} element={<Register />} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />

            {/* Protected routes with layout */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
              <Route path={ROUTES.CONSOLE_ACCESS} element={<ConsoleAccess />} />
              <Route path={ROUTES.ACCOUNTS} element={<Accounts />} />
              <Route path={ROUTES.ACCOUNT_DETAIL} element={<AccountDetail />} />
            </Route>

            {/* Catch-all redirect */}
            <Route
              path="*"
              element={<Navigate to={ROUTES.DASHBOARD} replace />}
            />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
