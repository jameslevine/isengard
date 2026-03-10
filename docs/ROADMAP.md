# Isengard — Project Roadmap

## Project Overview

Isengard is a SaaS platform for managing multiple AWS accounts with enterprise-grade governance, security, and access control. Inspired by AWS's internal account management system, Isengard provides non-AWS employees with the same powerful capabilities: one-click console federation, role management, account classification, ownership governance, security violation detection, and audit logging.

**Problem**: Teams managing multiple AWS accounts lack a unified tool for secure federation, governance, and access control. They resort to manual IAM management, shared credentials, or expensive third-party tools that don't provide the depth of control needed.

**Target Users**:

- DevOps/Platform engineering teams managing multi-account AWS environments
- Managed Service Providers (MSPs) managing client AWS accounts
- Startups and enterprises with AWS Organizations needing governance tooling

## Goals & Success Criteria

- **Secure Federation**: One-click, passwordless access to any registered AWS account via temporary credentials
- **Account Governance**: Full lifecycle management with classification, ownership, and compliance tracking
- **Zero Manual Setup**: Automatic control role deployment when onboarding accounts
- **Audit Everything**: Complete history of all federations, role changes, and account modifications
- **Security First**: Detect and flag violations (unmanaged IAM users, root access keys, public S3 buckets, etc.)

---

## Phase 1: MVP 🟡 In Progress

**Timeline Estimate**: 8-10 weeks

### P0 Features (Must Have)

| #   | Feature                      | Status         | Description                                                                             |
| --- | ---------------------------- | -------------- | --------------------------------------------------------------------------------------- |
| 1   | User Authentication          | 🟢 Complete    | Cognito-based signup/login/verify/forgot password                                       |
| 2   | Account Registry             | 🟢 Complete    | Register existing AWS accounts with metadata (name, email, description, classification) |
| 3   | Automatic Account Onboarding | 🔴 Not Started | Auto-deploy control role via CloudFormation StackSets on account registration           |
| 4   | Federation / Console Access  | 🟢 Complete    | One-click federation to AWS Console via STS AssumeRole                                  |
| 5   | Temporary Credentials        | 🟢 Complete    | Get CLI/SDK credentials (access key, secret key, session token) for any account/role    |
| 6   | Role Management              | 🟢 Complete    | Create/manage console roles and application roles with policy attachments               |
| 7   | Account Classification       | 🟢 Complete    | Production vs Non-Production, data sensitivity classification                           |
| 8   | Ownership Management         | 🟢 Complete    | Primary/secondary owners, team/group-based ownership                                    |
| 9   | Account Grouping             | 🔴 Not Started | Organize accounts into folders/hierarchies                                              |
| 10  | Audit History                | 🟢 Complete    | Log all actions (federations, role changes, account modifications)                      |

### P1 Features (Should Have)

| #   | Feature              | Status         | Description                                                                   |
| --- | -------------------- | -------------- | ----------------------------------------------------------------------------- |
| 11  | Security Violations  | 🔴 Not Started | Detect and flag security issues (unmanaged IAM users, root access keys, etc.) |
| 12  | Dashboard            | 🟢 Complete    | Overview of all accounts, recent activity, violations summary                 |
| 13  | Search               | 🟢 Complete    | Search accounts by name, ID, email with classification filter                 |
| 14  | Account Details View | 🟢 Complete    | Comprehensive view/edit page per account with Details, Roles, History tabs    |

---

## Phase 2: Enhanced Features

**Timeline Estimate**: 6-8 weeks after MVP

| #   | Feature                    | Priority | Description                                                                  |
| --- | -------------------------- | -------- | ---------------------------------------------------------------------------- |
| 15  | IAM User Management        | P1       | Create, import, manage IAM users per account                                 |
| 16  | Credential Rotation        | P1       | Automatic rotation of IAM user access keys                                   |
| 17  | Policy Template Library    | P1       | Reusable policy templates synced across accounts                             |
| 18  | Account Creation           | P1       | Create new AWS accounts via Organizations API                                |
| 19  | Root Credential Management | P1       | Go passwordless, root access request workflows                               |
| 20  | Approval Workflows         | P2       | Contingent authorization for production account access                       |
| 21  | CLI Tool (`isengardcli`)   | P2       | Command-line tool for federation, credential retrieval, account management   |
| 22  | Linked Account Management  | P2       | Manage child accounts under Organizations management accounts                |
| 23  | Account Suspension         | P2       | Suspend/unsuspend accounts with approval workflows                           |
| 24  | Notifications              | P2       | Email/Slack notifications for violations, ownership changes, access requests |

---

## Phase 3: Platform & Scale

**Timeline Estimate**: 8-12 weeks after Phase 2

| #   | Feature                    | Priority | Description                                                     |
| --- | -------------------------- | -------- | --------------------------------------------------------------- |
| 25  | Self-Hosted Option         | P2       | CloudFormation/Terraform templates for self-hosted deployment   |
| 26  | Trusted Services Framework | P2       | Allow third-party services to manage accounts via platform APIs |
| 27  | Advanced Analytics         | P2       | Cost tracking, usage patterns, security posture scoring         |
| 28  | SSO Integration            | P2       | SAML/OIDC integration with corporate identity providers         |
| 29  | Multi-Region Support       | P2       | Support for GovCloud, China regions, and opt-in regions         |
| 30  | Bulk Operations            | P2       | Bulk account registration, role creation, policy sync           |

---

## Completed Tasks

| Date       | Task                                      | Notes                                              |
| ---------- | ----------------------------------------- | -------------------------------------------------- |
| 2026-03-09 | Project planning & requirements gathering | Analyzed Isengard documentation, defined MVP scope |
| 2026-03-09 | Documentation creation                    | Created all 6 docs/ files                          |
