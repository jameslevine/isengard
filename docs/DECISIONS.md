# Isengard — Architecture Decision Records

## ADR-001: SaaS-First Deployment Model

- **Date**: 2026-03-09
- **Status**: Accepted
- **Context**: We needed to decide whether Isengard should be a self-hosted tool (deployed in the user's own AWS account), a centrally-hosted SaaS product, or both. The target users are DevOps teams, MSPs, and enterprises who want a managed solution without operational overhead.
- **Decision**: Build as a SaaS product first. Self-hosted option will be offered in Phase 3.
- **Alternatives considered**:
  - **Self-hosted only**: Lower trust barrier (users keep all data), but higher operational burden on customers and harder to iterate/update.
  - **Both simultaneously**: Too much scope for MVP; would split engineering effort.
- **Consequences**:
  - We host all infrastructure (Lambda, DynamoDB, Cognito, etc.) in our own AWS account
  - Multi-tenancy is required from day one (organization-based data isolation in DynamoDB)
  - We need strong security posture since we handle cross-account access to customer AWS accounts
  - Customers must trust our platform with IAM role access to their accounts
  - Simpler deployment and update process for us
  - Phase 3 will require extracting infrastructure into reusable CloudFormation/Terraform templates

---

## ADR-002: Cross-Account Access via Control Roles with External IDs

- **Date**: 2026-03-09
- **Status**: Accepted
- **Context**: Isengard needs to perform operations (federation, role management, security scanning) in customer AWS accounts. We need a secure, scalable mechanism for cross-account access that prevents confused deputy attacks.
- **Decision**: Each registered account gets an `IsengardControlRole` IAM role that trusts the Isengard platform account, secured with a unique `ExternalId` per account. This mirrors the real AWS Isengard's approach.
- **Alternatives considered**:
  - **Direct IAM user credentials**: Insecure, requires long-lived credentials, doesn't scale.
  - **AWS SSO/Identity Center integration**: More complex setup, not all customers use Identity Center.
  - **OAuth-based access**: Not native to AWS IAM, would require additional abstraction.
- **Consequences**:
  - Every account registration requires deploying a CloudFormation stack with the control role
  - ExternalIds must be stored securely and never exposed to end users
  - Control role permissions must follow least-privilege principle
  - Federation uses a two-hop AssumeRole chain: Platform → ControlRole → ConsoleRole
  - If the control role is deleted or modified, Isengard loses access (need detection and remediation)

---

## ADR-003: Automatic Account Onboarding via CloudFormation StackSets

- **Date**: 2026-03-09
- **Status**: Accepted
- **Context**: When a user registers an AWS account, we need to deploy the `IsengardControlRole` into that account. The user should not have to manually create IAM roles or run CloudFormation templates — the goal is zero manual setup.
- **Decision**: Use CloudFormation StackSets to automatically deploy the control role into customer accounts. For accounts within AWS Organizations, StackSets can deploy to member accounts from the management account. For standalone accounts, we provide a one-click CloudFormation launch URL as a fallback.
- **Alternatives considered**:
  - **Manual role creation**: Poor UX, error-prone, doesn't match our "zero manual setup" goal.
  - **Terraform**: Not all customers use Terraform; CloudFormation is native to AWS.
  - **AWS Service Catalog**: Overkill for deploying a single role.
  - **Custom Lambda-based deployment**: More flexible but more complex to maintain.
- **Consequences**:
  - Requires the customer's management account to have StackSets enabled (for Organizations-based deployment)
  - Standalone accounts need a fallback mechanism (one-click CFN launch URL)
  - StackSet operations are asynchronous — we need to poll for completion and handle failures
  - The control role CloudFormation template must be versioned and updatable

---

## ADR-004: DynamoDB with Domain-Separated Tables

- **Date**: 2026-03-09
- **Status**: Accepted
- **Context**: We need a database for storing accounts, roles, users, groups, audit logs, policy templates, and violations. The data model has clear domain boundaries with different access patterns per domain.
- **Decision**: Use 7 separate DynamoDB tables (one per domain) with composite primary keys (`pk`/`sk`) and GSIs for secondary access patterns. All tables use `ORG#<orgId>` or `ACCOUNT#<accountId>` as partition keys for multi-tenant isolation.
- **Alternatives considered**:
  - **Single-table design**: More complex to maintain, harder to reason about, but fewer tables to manage. Rejected because the domains are distinct enough to warrant separation.
  - **RDS/Aurora**: Relational database would work but adds VPC complexity, connection management, and higher cost for serverless workloads.
  - **MongoDB/DocumentDB**: Additional managed service cost, less native AWS integration.
- **Consequences**:
  - 7 tables to create and manage in CloudFormation
  - Each table has its own capacity settings (using on-demand mode)
  - Cross-table queries require application-level joins
  - Point-in-time recovery enabled on all tables
  - Encryption at rest enabled by default
  - Clear separation of concerns makes it easier to scale individual domains

---

## ADR-005: Amazon Cognito for Authentication

- **Date**: 2026-03-09
- **Status**: Accepted
- **Context**: The platform needs user authentication with signup, login, email verification, password reset, and JWT token issuance. The real Isengard uses Amazon's internal Midway/YubiKey system, which is not available externally.
- **Decision**: Use Amazon Cognito User Pools for authentication. Cognito provides managed user directory, JWT tokens, password policies, MFA support, and integrates natively with API Gateway.
- **Alternatives considered**:
  - **Auth0**: Feature-rich but adds external dependency and cost.
  - **Firebase Auth**: Not AWS-native, adds cross-cloud dependency.
  - **Custom JWT implementation**: More control but significant security risk and maintenance burden.
  - **AWS IAM Identity Center (SSO)**: Better for enterprise SSO but overkill for initial MVP; can be added in Phase 3.
- **Consequences**:
  - Cognito User Pool manages all user credentials and tokens
  - API Gateway can use Cognito Authorizer for request validation
  - Custom attributes can store organization/tenant mapping
  - MFA can be enabled per-user or enforced organization-wide
  - Future SSO integration (SAML/OIDC) can be added via Cognito Identity Providers
  - Cognito has some limitations (e.g., 50 custom attributes max, limited customization of hosted UI)

---

## ADR-006: Web-Only for MVP (No Mobile App)

- **Date**: 2026-03-09
- **Status**: Accepted
- **Context**: The project rules include both web (React) and mobile (Expo/React Native) stacks. We needed to decide whether to build both platforms for MVP.
- **Decision**: Build web-only for MVP. Mobile app will be considered for a future phase based on user demand.
- **Alternatives considered**:
  - **Web + Mobile simultaneously**: Doubles the frontend effort, slows MVP delivery.
  - **Mobile-first**: AWS account management is primarily a desktop activity (console access, credential copying, etc.).
- **Consequences**:
  - Faster MVP delivery (single frontend codebase)
  - API is designed to be platform-agnostic, so mobile can be added later without backend changes
  - Some features (like credential copying, console federation) are inherently desktop-oriented
  - Mobile app could be valuable for on-call scenarios (quick federation, violation alerts)

---

## ADR-007: STS AssumeRole for Federation (Matching Isengard's Approach)

- **Date**: 2026-03-09
- **Status**: Accepted
- **Context**: Federation — the ability to access the AWS Console without a password — is the core feature of Isengard. We need to implement this securely and reliably.
- **Decision**: Use the same federation mechanism as the real Isengard:
  1. AssumeRole into the control role (with ExternalId)
  2. AssumeRole into the target console role (using control role credentials)
  3. Call `https://signin.aws.amazon.com/federation` to get a SigninToken
  4. Construct a console login URL with the SigninToken
  5. Redirect the user to the AWS Console
- **Alternatives considered**:
  - **Direct AssumeRole (single hop)**: Simpler but less secure; the platform account would need direct trust from every console role.
  - **AWS SSO/Identity Center**: More enterprise-friendly but requires customers to set up Identity Center.
  - **SAML federation**: More complex setup, requires identity provider configuration.
- **Consequences**:
  - Two-hop AssumeRole chain provides defense in depth
  - Control role acts as a security boundary between the platform and customer accounts
  - Federation URLs are time-limited (SigninToken expires)
  - Session duration is configurable per role (900-43200 seconds)
  - Deep linking to specific console pages is supported via the `destination` parameter
  - Temporary credentials for CLI/SDK use follow the same AssumeRole chain

---

## ADR-008: Express Monolith on Lambda (Not Microservices)

- **Date**: 2026-03-09
- **Status**: Accepted
- **Context**: We need to decide the backend architecture — whether to use a single Lambda function running Express (monolith) or separate Lambda functions per API endpoint (microservices).
- **Decision**: Use a single Lambda function running Express behind API Gateway, wrapped with `serverless-http`. All routes are handled by the same Lambda function.
- **Alternatives considered**:
  - **Lambda per endpoint**: Better isolation and scaling per endpoint, but significantly more infrastructure complexity, cold start multiplication, and harder local development.
  - **ECS/Fargate**: Always-on compute, no cold starts, but higher cost for a SaaS MVP and more infrastructure to manage.
  - **App Runner**: Simpler than ECS but less control over scaling and networking.
- **Consequences**:
  - Single Lambda function to deploy and monitor
  - All routes share the same cold start (mitigated by provisioned concurrency if needed)
  - Simpler local development (just run Express locally)
  - Lambda package size must stay within limits (use Lambda layers for large dependencies)
  - If specific endpoints need different scaling, they can be extracted to separate functions later
  - `serverless-http` handles the API Gateway → Express translation seamlessly
