# ToDo — Vercel + Full Database Rollout Plan

This checklist is updated to match the latest backend environment-variable and SSL/pooling changes.

Goal: deploy **frontend + backend on Vercel** backed by the **full PostgreSQL schema** in `db/schema.sql`.

---

## 1) Pre-flight checks (local + repo)

- [ ] Confirm you are on the expected branch and clean working tree:
  ```bash
  git status
  ```
- [ ] Confirm Node and npm:
  ```bash
  node -v
  npm -v
  ```
- [ ] Confirm `psql` is installed:
  ```bash
  psql --version
  ```
- [ ] Install dependencies for both apps:
  ```bash
  cd backend && npm install
  cd ../frontend && npm install
  cd ..
  ```

---

## 2) Provision production database (Supabase)

- [ ] Create/verify Supabase project.
- [ ] Copy the **Transaction Pooler** URL (port `6543`) as `DATABASE_URL`.
- [ ] Export locally for setup commands:
  ```bash
  export SUPABASE_DB_URL='postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres'
  ```

---

## 3) Apply the full database schema

Run from repo root:

- [ ] Apply full schema:
  ```bash
  psql "$SUPABASE_DB_URL" -f db/schema.sql
  ```
- [ ] (Optional) Seed sample data:
  ```bash
  psql "$SUPABASE_DB_URL" -f db/seed.sql
  ```
- [ ] Validate that **all key tables** exist:
  ```bash
  psql "$SUPABASE_DB_URL" -c "\dt"
  ```

### 3.1 Must-have tables to verify

- [ ] `users`
- [ ] `user_profiles`
- [ ] `employers`
- [ ] `jobs`
- [ ] `job_applications`
- [ ] `assessment_question_sets`
- [ ] `assessment_questions`
- [ ] `assessment_responses`
- [ ] `assessment_results`
- [ ] `training_courses`
- [ ] `training_enrollments`
- [ ] `messages`
- [ ] `notifications`
- [ ] `audit_logs`

Quick SQL check:
```bash
psql "$SUPABASE_DB_URL" -c "select tablename from pg_tables where schemaname='public' order by tablename;"
```

---

## 4) Configure backend for Vercel (critical)

Use `backend/.env.example` as reference for local and Vercel project settings.

### 4.1 Required Vercel backend environment variables

- [ ] `DATABASE_URL` = Supabase transaction pooler URL
- [ ] `JWT_SECRET` = strong random value (>= 32 chars)
- [ ] `CORS_ORIGIN` = comma-separated allowed frontend domains
- [ ] `DB_SSL` = `true`
- [ ] `DB_SSL_REJECT_UNAUTHORIZED` = `false`
- [ ] `DB_POOL_MAX` = `10`
- [ ] `DB_IDLE_TIMEOUT_MS` = `30000`
- [ ] `DB_CONNECT_TIMEOUT_MS` = `10000`
- [ ] `NODE_ENV` = `production`

Generate secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 4.2 Backend project settings on Vercel

- [ ] Root Directory: `backend`
- [ ] Framework preset: `Other`
- [ ] Build/deploy should use `backend/vercel.json`

### 4.3 Backend smoke tests after deploy

- [ ] Check health endpoint:
  ```bash
  curl -s https://<your-backend>.vercel.app/
  ```
- [ ] Check DB connectivity endpoint:
  ```bash
  curl -s https://<your-backend>.vercel.app/db-test
  ```

---

## 5) Configure frontend for Vercel

### 5.1 Frontend environment variable

- [ ] `VITE_API_URL` = `https://<your-backend>.vercel.app/api`

### 5.2 Frontend project settings on Vercel

- [ ] Root Directory: `frontend`
- [ ] Framework preset: `Vite`

### 5.3 Frontend validation

- [ ] Open deployed frontend URL
- [ ] Confirm login/register requests target deployed backend `/api/*`

---

## 6) End-to-end production validation (full DB flow)

- [ ] Register a candidate user
- [ ] Register/login an employer user
- [ ] Confirm rows created in `users`
- [ ] Confirm profile data persists in `user_profiles`
- [ ] Confirm employer profile persists in `employers`
- [ ] Confirm job post persists in `jobs`
- [ ] Confirm application persists in `job_applications`

SQL spot checks:
```bash
psql "$SUPABASE_DB_URL" -c "select id,email,role,created_at from users order by created_at desc limit 20;"
psql "$SUPABASE_DB_URL" -c "select id,user_id,full_name,updated_at from user_profiles order by updated_at desc limit 20;"
psql "$SUPABASE_DB_URL" -c "select id,employer_id,title,active,created_at from jobs order by created_at desc limit 20;"
psql "$SUPABASE_DB_URL" -c "select id,job_id,user_id,status,applied_at from job_applications order by applied_at desc limit 20;"
```

---

## 7) Final hardening before go-live

- [ ] Restrict `CORS_ORIGIN` to only production frontend domains.
- [ ] Keep secrets only in Vercel project env vars (never committed).
- [ ] Confirm no frontend variable contains `DATABASE_URL`.
- [ ] Add uptime checks for `/` and `/db-test`.
- [ ] Re-run frontend production build locally:
  ```bash
  cd frontend && npm run build
  ```

---

## 8) Quick execution order (copy/paste)

```bash
# 1) Apply full schema
psql "$SUPABASE_DB_URL" -f db/schema.sql

# 2) Deploy backend (Vercel project: backend root)
#    Set DATABASE_URL, JWT_SECRET, CORS_ORIGIN, DB_SSL, DB_SSL_REJECT_UNAUTHORIZED,
#    DB_POOL_MAX, DB_IDLE_TIMEOUT_MS, DB_CONNECT_TIMEOUT_MS, NODE_ENV

# 3) Deploy frontend (Vercel project: frontend root)
#    Set VITE_API_URL=https://<your-backend>.vercel.app/api

# 4) Validate production
curl -s https://<your-backend>.vercel.app/
curl -s https://<your-backend>.vercel.app/db-test
```
