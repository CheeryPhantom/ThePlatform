# Full-Scale Full-Stack Integration Checklist (Vercel + Postgres)

## 1) Architecture and Environments
1. Create separate Vercel projects for `frontend/` and `backend/`.
2. Add environment tiers: Local, Preview, Production.
3. Define and enforce environment variables:
   - Backend: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `NODE_ENV`
   - Frontend: `VITE_API_URL`

## 2) Database and Schema
1. Run `db/schema.sql` in target Postgres.
2. Add migration tooling and baseline migration.
3. Add seed strategy for preview environments.
4. Add backup + restore policy.

## 3) Backend API Completion
1. Auth: register/login/me/refresh strategy.
2. Profiles: candidate + employer CRUD.
3. Jobs: list/search + apply + save job.
4. Messaging: conversation list, send/read, unread counts.
5. Notifications: create/list/read + trigger sources.
6. Settings: profile/privacy/notification preferences.

## 4) Frontend Integration
1. Centralize API client with auth headers and typed errors.
2. Replace all mock pages with API-backed requests.
3. Add loading, empty, and error states for each page.
4. Add route protection and role-aware redirects.
5. Add profile completeness and onboarding flow.

## 5) Security and Compliance
1. Lock CORS to known frontend domains.
2. Rate-limit auth and write-heavy endpoints.
3. Add input validation and output sanitization.
4. Encrypt secrets and rotate JWT secret regularly.
5. Add basic audit logs for critical actions.

## 6) Quality and CI/CD
1. Backend tests: auth, jobs, profiles, settings, notifications.
2. Frontend tests: route guards, forms, API error handling.
3. CI pipeline: lint + test + build.
4. Preview smoke tests on every PR.

## 7) Observability and Reliability
1. Add structured logging in backend.
2. Add error tracking (Sentry or equivalent).
3. Add uptime checks and latency alerts.
4. Track product metrics (signups, profile completion, job applies).
