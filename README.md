# Isengard

> AWS Account Management SaaS Platform — Manage, govern, and securely access multiple AWS accounts

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.x-61dafb)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933)](https://nodejs.org/)

---

## 🎯 Overview

**Isengard** is a SaaS platform for managing multiple AWS accounts with enterprise-grade governance, security, and access control. Inspired by AWS's internal account management system, Isengard provides teams with powerful capabilities for secure federation, role management, ownership governance, and security violation detection.

### The Problem

Teams managing multiple AWS accounts lack a unified tool for secure federation, governance, and access control. They resort to manual IAM management, shared credentials, or expensive third-party tools that don't provide the depth of control needed.

### The Solution

Isengard provides:
- 🔐 **Secure Federation**: One-click, passwordless access to any AWS account via temporary credentials
- 📊 **Account Governance**: Full lifecycle management with classification, ownership, and compliance tracking
- 🚀 **Zero Manual Setup**: Automatic control role deployment when onboarding accounts
- 📝 **Audit Everything**: Complete history of all federations, role changes, and account modifications
- 🛡️ **Security First**: Detect and flag violations (unmanaged IAM users, root access keys, public S3 buckets)

---

## 🏗️ Architecture

Isengard is built as a modern serverless application on AWS:

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│  React SPA (S3 + CloudFront)│
└──────────┬──────────────────┘
           │
           ▼
    ┌──────────────┐
    │   Cognito    │ ◄──── Authentication
    └──────────────┘
           │
           ▼
┌─────────────────────────┐
│  API Gateway + Lambda   │ ◄──── Express Backend
└──────┬──────────────────┘
       │
       ├──► DynamoDB (7 Tables)
       │
       └──► AWS Services:
            • STS (AssumeRole)
            • IAM
            • CloudFormation
            • Organizations
            • CloudTrail
```

**Tech Stack:**
- **Frontend**: React 18, TypeScript, Vite, MUI, Zustand, TanStack Query
- **Backend**: Node.js 20, Express, TypeScript, AWS SDK v3
- **Infrastructure**: AWS Lambda, API Gateway, DynamoDB, Cognito, S3, CloudFront
- **IaC**: AWS SAM, CloudFormation

📖 [Full Architecture Documentation](docs/ARCHITECTURE.md)

---

## ✨ Features

### MVP (Phase 1) - In Progress

#### Core Features ✅
- **User Authentication**: Cognito-based signup/login/verify/forgot password
- **Account Registry**: Register AWS accounts with metadata, classification, and ownership
- **Federation/Console Access**: One-click federation to AWS Console via STS AssumeRole
- **Temporary Credentials**: Get CLI/SDK credentials for any account/role
- **Role Management**: Create and manage console roles and application roles with policy attachments
- **Account Classification**: Production vs Non-Production, data sensitivity levels
- **Ownership Management**: Primary/secondary owners, team/group-based ownership
- **Account Grouping**: Organize accounts into folders/hierarchies
- **Audit History**: Complete log of all actions (federations, role changes, modifications)

#### Governance & Security ✅
- **Security Violations**: Detect unmanaged IAM users, root access keys, public S3 buckets
- **Dashboard**: Overview of all accounts, recent activity, violations summary
- **Search**: Find accounts by name, ID, email with classification filters
- **Account Details**: Comprehensive view/edit page with Details, Roles, and History tabs

### Planned Features

Phase 2 includes IAM user management, credential rotation, policy templates, account creation via Organizations API, approval workflows, and CLI tool.

📖 [Full Roadmap](docs/ROADMAP.md)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20 LTS
- **AWS Account** with appropriate permissions
- **AWS CLI** configured
- **AWS SAM CLI** installed ([installation guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jameslevine/isengard.git
   cd isengard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Backend:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your AWS Cognito and DynamoDB details
   ```

   Frontend:
   ```bash
   cd frontend
   cp .env.example .env
   # Edit .env with your API Gateway URL and Cognito User Pool details
   ```

4. **Deploy infrastructure**
   ```bash
   # Deploy DynamoDB tables, Cognito User Pool, etc.
   sam build
   sam deploy --guided
   ```

5. **Run locally**

   Backend (Lambda local):
   ```bash
   cd backend
   npm run dev
   ```

   Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:3000`

---

## 📚 Documentation

- [Architecture](docs/ARCHITECTURE.md) — System design, components, data flow
- [Roadmap](docs/ROADMAP.md) — Feature list, milestones, completed tasks
- [API Schema](docs/API_SCHEMA.md) — REST API endpoints and contracts
- [Tools & Tech](docs/TOOLS_AND_TECH.md) — Technology stack and tooling decisions
- [Decisions](docs/DECISIONS.md) — Architecture Decision Records (ADRs)
- [Task Log](docs/TASK_LOG.md) — Development progress tracker

---

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test

# Run E2E tests (Cypress)
cd frontend
npm run test:e2e
```

---

## 🛠️ Development

### Code Quality

This project uses:
- **ESLint** + **Prettier** for code style
- **Husky** for git hooks (pre-commit lint, pre-push tests)
- **commitlint** for conventional commit messages
- **TypeScript** strict mode

### Conventional Commits

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation changes
- `refactor:` — Code refactoring
- `test:` — Adding or updating tests
- `chore:` — Tooling, dependencies, build process

### Project Structure

```
isengard/
├── backend/              # Express Lambda backend
│   ├── src/
│   │   ├── adapters/    # DynamoDB operations
│   │   ├── controllers/ # Route handlers
│   │   ├── middleware/  # Express middleware
│   │   ├── models/      # Joi schemas
│   │   ├── routes/      # Express routes
│   │   └── types/       # TypeScript types
│   └── tests/           # Backend tests
├── frontend/            # React SPA
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── features/    # Domain-specific modules
│   │   ├── hooks/       # Custom React hooks
│   │   ├── pages/       # Route-level components
│   │   ├── services/    # API client (TanStack Query)
│   │   └── store/       # Zustand state management
│   └── tests/           # Frontend tests
├── infrastructure/      # CloudFormation templates
├── docs/                # Documentation
└── template.yaml        # SAM template
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes using conventional commits
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Inspired by AWS's internal Isengard system
- Built with the AWS Serverless Application Model (SAM)
- Uses the excellent MUI component library

---

## 📧 Contact

**James Levine**
- GitHub: [@jameslevine](https://github.com/jameslevine)

---

## 🎯 Target Users

- **DevOps/Platform Engineering Teams** managing multi-account AWS environments
- **Managed Service Providers (MSPs)** managing client AWS accounts
- **Startups and Enterprises** with AWS Organizations needing governance tooling

---

**Note:** This is an educational/portfolio project demonstrating SaaS architecture, AWS integration, and enterprise governance patterns. It is not affiliated with or endorsed by Amazon Web Services.
