# Deploy The Platform with Supabase + Vercel

This guide configures a production-ready stack:
- **Frontend (Vite/React)** on Vercel
- **Backend (Express API)** on Vercel
- **Database (Supabase Postgres)** for user signup/login and profile persistence

## 1) Create a Supabase project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard) and create a new project.
2. Choose a strong database password and save it securely.
3. Wait for project provisioning to complete.

## 2) Get the correct Postgres connection string

In Supabase, open:
- **Project Settings → Database → Connection string**

Use the **Transaction Pooler** URL (port `6543`) for Vercel serverless functions, for example:

```bash
postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres
```

Set this as `DATABASE_URL` in backend environment variables.

## 3) Initialize database schema in Supabase

Run the schema once against your Supabase database:

```bash
psql "<SUPABASE_DATABASE_URL>" -f db/schema.sql
```

Optional seed data:

```bash
psql "<SUPABASE_DATABASE_URL>" -f db/seed.sql
```

## 4) Deploy backend to Vercel

1. In Vercel: **Add New → Project**.
2. Import this repository.
3. Set **Root Directory** to `backend`.
4. Framework: `Other`.
5. Add environment variables:
   - `DATABASE_URL` = Supabase transaction pooler URL
   - `JWT_SECRET` = long random secret (at least 32 chars)
   - `NODE_ENV` = `production`
   - `CORS_ORIGIN` = your frontend URL(s), comma-separated
   - `DB_SSL` = `true`
   - `DB_SSL_REJECT_UNAUTHORIZED` = `false`
6. Deploy and copy backend domain, for example:
   - `https://the-platform-api.vercel.app`

## 5) Deploy frontend to Vercel

1. In Vercel, add the same repository as a second project.
2. Set **Root Directory** to `frontend`.
3. Framework preset should auto-detect **Vite**.
4. Add environment variable:
   - `VITE_API_URL` = `https://the-platform-api.vercel.app/api`
5. Deploy.

## 6) Verify auth + profile data flow

After deployments:
1. Open frontend URL.
2. Register a new account.
3. Login with the same credentials.
4. Confirm backend handles `/api/auth/register`, `/api/auth/login`, and `/api/auth/me`.
5. In Supabase SQL editor, verify user record:

```sql
select id, email, name, role, created_at from users order by created_at desc;
```

## 7) Security checklist (recommended)

- Use a strong `JWT_SECRET` and rotate periodically.
- Restrict backend CORS via `CORS_ORIGIN` to known frontend domains.
- Keep `DATABASE_URL` only on backend, never expose it to frontend.
- Passwords are hashed with bcrypt before storage (never plaintext).
- Keep Supabase credentials in Vercel env vars, not in code.
- Enable branch protection and required reviews before production merges.

## 8) Local development env setup

Copy example files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Then fill values and run local apps.
