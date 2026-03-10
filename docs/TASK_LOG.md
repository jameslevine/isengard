# Isengard — Task Log

## 🔵 Current Task

- **Task**: MVP feature implementation — Phase 1 nearing completion
- **Started**: 2026-03-09
- **Context**: Building the Isengard AWS Account Management Platform. All core APIs deployed, frontend connected to live API, 8 pages built.
- **Progress**: 19 commits, 21 AWS resources, 8 backend tests, 8 frontend pages, all deployed and live.

## ✅ Completed Tasks

| Date       | Task                         | Notes                                                     |
| ---------- | ---------------------------- | --------------------------------------------------------- |
| 2026-03-09 | Requirements & planning      | Analyzed Isengard docs, defined 3-phase roadmap           |
| 2026-03-09 | Documentation (6 files)      | ROADMAP, ARCHITECTURE, API_SCHEMA, TOOLS, TASK, DECISIONS |
| 2026-03-09 | Git + GitHub + quality tools | Husky, commitlint, lint-staged, Prettier, cfn-lint        |
| 2026-03-09 | Backend scaffold             | Express + TS + serverless-http, middleware, types         |
| 2026-03-09 | Infrastructure templates     | 7 DynamoDB tables, Cognito, API Gateway + Lambda          |
| 2026-03-09 | Frontend scaffold            | React 18 + Vite + TS + MUI + Zustand + TanStack Query     |
| 2026-03-09 | Account registration API     | Joi models, DynamoDB adapter, controller, route           |
| 2026-03-09 | Federation API               | Two-hop STS AssumeRole, console URL, temp creds           |
| 2026-03-09 | Role management API          | CRUD adapter, controller, route, Joi model                |
| 2026-03-09 | Audit logging API            | Adapter, controller, route for account/user history       |
| 2026-03-09 | AWS deployment               | SAM deploy, 21 resources, API + frontend live             |
| 2026-03-09 | Frontend auth pages          | Login, Register, Forgot Password with Cognito             |
| 2026-03-09 | Dashboard connected to API   | Real account counts, account list with status chips       |
| 2026-03-09 | Accounts page with register  | Register Account dialog with Formik + Yup validation      |
| 2026-03-09 | S3 + CloudFront deployment   | Frontend hosted on CloudFront with OAC                    |
| 2026-03-09 | Cognito self-signup fix      | Enabled AllowAdminCreateUserOnly: false                   |
| 2026-03-10 | Console Access page          | Federation + temp credentials with copy-to-clipboard      |
| 2026-03-10 | Account Detail page          | Details, Roles, History tabs with full account info       |
| 2026-03-10 | ROADMAP updated              | 8/10 P0 features complete or in progress                  |

## 🔴 Blocked / Pending

- None currently

## ⏭️ Next Up

1. Role management UI in Account Detail page
2. Audit history UI in Account Detail page
3. Account grouping API + UI
4. Security violation detection
5. More backend tests (accounts, roles controllers)
6. Frontend tests with React Testing Library
7. Search functionality
