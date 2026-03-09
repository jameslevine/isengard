# Isengard — Tools & Technology

## Language & Runtime

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 20 LTS | Backend runtime |
| **TypeScript** | 5.x | Type safety across frontend and backend |
| **React** | 18.x | Frontend UI framework |

---

## Frontend

| Technology | Version | Justification |
|------------|---------|---------------|
| **React** | 18.x | Industry standard, large ecosystem, team familiarity |
| **TypeScript** | 5.x | Type safety, better DX, catch errors at compile time |
| **Vite** | 5.x | Fast build tool, HMR, ESM-native |
| **MUI (Material UI)** | 5.x | Comprehensive component library, theming, accessibility |
| **Emotion** | 11.x | CSS-in-JS styling via `@emotion/styled`, MUI's default |
| **Zustand** | 4.x | Lightweight state management, no boilerplate |
| **TanStack Query** | 5.x | Server state management, caching, background refetching |
| **Formik** | 2.x | Form state management, validation integration |
| **Yup** | 1.x | Schema-based form validation |
| **react-i18next** | 13.x | Internationalization (English, Spanish, RTL) |
| **React Router** | 6.x | Client-side routing |
| **dayjs** | 1.x | Date utility (lightweight, immutable) |

### Frontend Dev Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Linting (Airbnb + TypeScript config) |
| **Prettier** | Code formatting |
| **Husky** | Git hooks (pre-commit, pre-push) |
| **commitlint** | Conventional commit message enforcement |
| **Jest** | Unit testing |
| **React Testing Library** | Component testing |
| **Cypress** | End-to-end testing |

---

## Backend

| Technology | Version | Justification |
|------------|---------|---------------|
| **Node.js** | 20 LTS | Lambda runtime support, JavaScript ecosystem |
| **Express** | 4.x | Minimal, flexible HTTP framework |
| **TypeScript** | 5.x | Type safety for API contracts and business logic |
| **Joi** | 17.x | Request validation (body, params, query) |
| **serverless-http** | 3.x | Wraps Express for Lambda compatibility |
| **AWS SDK v3** | 3.x | Modular AWS service clients (STS, IAM, CloudFormation, DynamoDB, Organizations) |
| **uuid** | 9.x | UUID generation for resource IDs |
| **dayjs** | 1.x | Date utility |
| **cors** | 2.x | CORS middleware |
| **aws-jwt-verify** | 4.x | Cognito JWT token verification |

### Backend Dev Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Linting |
| **Prettier** | Code formatting |
| **Jest** | Unit and integration testing |
| **ts-node** | TypeScript execution for development |
| **nodemon** | Auto-restart during development |

---

## Infrastructure / AWS Services

### Core Services

| Service | Purpose |
|---------|---------|
| **AWS Lambda** | Backend compute (Express monolith) |
| **API Gateway (REST)** | API routing, throttling, Cognito authorizer |
| **Amazon DynamoDB** | Primary database (7 tables) |
| **Amazon Cognito** | User authentication and JWT issuance |
| **Amazon S3** | Frontend static hosting |
| **Amazon CloudFront** | CDN with OAC for S3 |
| **AWS CloudWatch** | Logging, metrics, alarms |

### AWS Integration Services

| Service | Purpose |
|---------|---------|
| **AWS STS** | Cross-account AssumeRole for federation |
| **AWS CloudFormation (StackSets)** | Automatic control role deployment |
| **AWS IAM** | Role and policy management in customer accounts |
| **AWS Organizations** | Account discovery and hierarchy |
| **AWS CloudTrail** | Federation activity correlation |

### Infrastructure as Code

| Tool | Version | Purpose |
|------|---------|---------|
| **AWS SAM CLI** | Latest | Build, test, deploy serverless applications |
| **CloudFormation (YAML)** | N/A | Infrastructure definition (nested stacks) |
| **cfn-lint** | Latest | CloudFormation template linting |
| **cfn_nag** | Latest | CloudFormation security scanning |

### Infrastructure Structure

```
infrastructure/
├── main.yaml              → Root stack (orchestrates nested stacks)
├── api.yaml               → API Gateway + Lambda
├── cognito.yaml           → Cognito User Pool
├── dynamodb.yaml          → All 7 DynamoDB tables
├── s3-cloudfront.yaml     → S3 bucket + CloudFront distribution
├── monitoring.yaml        → CloudWatch dashboards, alarms
└── iam.yaml               → IAM roles for Lambda functions
```

---

## CI/CD

| Tool | Purpose |
|------|---------|
| **GitHub Actions** | CI/CD pipeline |
| **SAM CLI** | Infrastructure deployment |
| **aws s3 sync** | Frontend deployment to S3 |
| **CloudFront invalidation** | Cache busting post-deploy |

### Pipeline Stages

1. **Lint** — ESLint, Prettier, cfn-lint, cfn_nag
2. **Test** — Jest (unit/integration), Cypress (E2E)
3. **Build** — TypeScript compilation, Vite build
4. **Deploy Infrastructure** — `sam deploy`
5. **Deploy Frontend** — `aws s3 sync` + CloudFront invalidation

---

## External Services / APIs

| Service | Purpose | Auth Method |
|---------|---------|-------------|
| AWS STS | Federation tokens | IAM role (Lambda execution role) |
| AWS CloudFormation | StackSet management | IAM role |
| AWS IAM | Role/policy CRUD | Cross-account AssumeRole |
| AWS Organizations | Account listing | IAM role |
| AWS signin.aws.amazon.com/federation | Console federation URL | Temporary credentials |

---

## Environment Setup

### Prerequisites

- Node.js 20 LTS
- npm or yarn
- AWS CLI v2 configured with appropriate credentials
- SAM CLI installed
- Git

### Local Development

```bash
# Clone the repository
git clone <repo-url>
cd isengard

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Start backend (local Express server)
cd backend && npm run dev

# Start frontend (Vite dev server)
cd frontend && npm run dev

# Run tests
cd backend && npm test
cd frontend && npm test

# Lint
npm run lint

# Deploy infrastructure
cd infrastructure && sam build && sam deploy --guided

# Deploy frontend
cd frontend && npm run build
aws s3 sync dist/ s3://<bucket-name> --delete
aws cloudfront create-invalidation --distribution-id <dist-id> --paths "/*"
```

### Environment Variables

#### Backend (.env)
```
COGNITO_USER_POOL_ID=
COGNITO_CLIENT_ID=
COGNITO_REGION=
ACCOUNTS_TABLE=
ROLES_TABLE=
USERS_TABLE=
GROUPS_TABLE=
AUDIT_LOG_TABLE=
POLICY_TEMPLATES_TABLE=
VIOLATIONS_TABLE=
ISENGARD_PLATFORM_ACCOUNT_ID=
CONTROL_ROLE_STACKSET_NAME=
```

#### Frontend (.env)
```
VITE_API_URL=
VITE_COGNITO_USER_POOL_ID=
VITE_COGNITO_CLIENT_ID=
VITE_COGNITO_REGION=
```

---

## Monitoring & Observability

| Tool | Purpose |
|------|---------|
| **CloudWatch Logs** | Lambda function logs, API Gateway access logs |
| **CloudWatch Metrics** | Custom metrics (federation count, errors, latency) |
| **CloudWatch Alarms** | Alert on error rates, latency thresholds |
| **CloudWatch Dashboards** | Operational overview |
| **X-Ray** (Phase 2) | Distributed tracing |

---

## Security Tools

| Tool | Purpose |
|------|---------|
| **npm audit** | Dependency vulnerability scanning |
| **cfn_nag** | CloudFormation security scanning |
| **Cognito** | Authentication, password policies, MFA |
| **API Gateway** | Rate limiting, throttling |
| **CloudFront + WAF** (Phase 2) | DDoS protection, request filtering |
