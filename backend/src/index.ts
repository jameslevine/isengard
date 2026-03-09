import { router as accountsRouter } from "./routes/accounts";
import { router as auditRouter } from "./routes/audit";
import { cognitoAuthMiddleware } from "./middleware/cognito-auth";
import cors from "cors";
import { errorHandler } from "./middleware/error-handler";
import express from "express";
import { router as federationRouter } from "./routes/federation";
import { router as healthRouter } from "./routes/health";
import { router as rolesRouter } from "./routes/roles";
import serverless from "serverless-http";

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Amz-Date",
      "X-Api-Key",
      "X-Amz-Security-Token",
    ],
    maxAge: 300,
  })
);

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  next();
});

app.use(express.json());

// Health check (no auth required)
app.use("/v1/health", healthRouter);

// All routes below require authentication
app.use(cognitoAuthMiddleware);

// Authenticated routes
app.use("/v1/accounts", accountsRouter);
app.use("/v1/accounts", federationRouter);
app.use("/v1/accounts", rolesRouter);
app.use("/v1/accounts", auditRouter);

// Routes will be added here as they are implemented:
// app.use("/v1/groups", groupsRouter);
// app.use("/v1/users", usersRouter);
// app.use("/v1/violations", violationsRouter);
// app.use("/v1/policy-templates", policyTemplatesRouter);
// app.use("/v1/dashboard", dashboardRouter);

app.use(errorHandler);

export const handler = serverless(app);

// Local development server
if (process.env.NODE_ENV === "development") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Isengard API running on http://localhost:${PORT}`);
  });
}
