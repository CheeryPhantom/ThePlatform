# TODO - The Platform

## Immediate (this sprint)
- [x] Fix JWT propagation from frontend to backend (`Authorization: Bearer ...`).
- [x] Add protected route guard for authenticated frontend pages.
- [x] Replace placeholder jobs endpoint with database-backed listing/search.
- [x] Add notifications API and notifications page.
- [x] Add public user profile page (`/users/:userId`).
- [x] Add persisted user settings endpoint and settings page integration.
- [x] Repair schema blockers (duplicate index and trailing comment marker).

## Next (high priority)
- [ ] Add database migration tooling (e.g. Drizzle/Knex/Prisma migrate or node-pg-migrate).
- [ ] Add automated integration tests for jobs, settings, and notifications APIs.
- [ ] Replace mock data in Assessment, TrainingHub, and Messages with backend APIs.
- [ ] Add pagination/filtering for jobs and notifications endpoints.
- [ ] Add centralized error middleware and request logging with correlation IDs.

## Later
- [ ] Add email provider integration for notification fanout.
- [ ] Add file upload provider for profile resumes (S3/Blob storage).
- [ ] Add observability stack (Sentry + structured logs + uptime checks).
- [ ] Add role-based admin moderation tools.
