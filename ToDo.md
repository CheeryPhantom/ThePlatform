# ToDo - Next Steps to Fully Launch The Platform (Supabase + Vercel)

This document is an execution runbook you can follow from zero to production.

---

## 0) Prerequisites (install tools once)

### 0.1 Install Node.js 18+ and npm
```bash
node -v
npm -v
```
If Node is missing, install from: https://nodejs.org

### 0.2 Install PostgreSQL CLI (`psql`)
Check if installed:
```bash
psql --version
```
If not installed:
- macOS (Homebrew):
```bash
brew install postgresql
```
- Ubuntu/Debian:
```bash
sudo apt-get update && sudo apt-get install -y postgresql-client
```

### 0.3 Install Vercel CLI (optional but recommended)
```bash
npm install -g vercel
vercel --version
```

---

## 1) Create and configure Supabase project

### 1.1 Create Supabase project (dashboard)
1. Open: https://supabase.com/dashboard
2. Click **New project**
3. Choose organization, project name, region, and a strong DB password
4. Wait until the project is ready

### 1.2 Copy connection string
In Supabase dashboard:
- Go to **Project Settings → Database → Connection string**
- Select **Transaction pooler** URL (recommended for serverless)
- Copy the full URL, example format:
```text
postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres
```

### 1.3 Set local shell variable for convenience
```bash
export SUPABASE_DB_URL='postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres'
```

---

## 2) Initialize database schema in Supabase

From repo root (`/workspace/ThePlatform`):

### 2.1 Apply schema
```bash
psql "$SUPABASE_DB_URL" -f db/schema.sql
```

### 2.2 (Optional) Seed sample data
```bash
psql "$SUPABASE_DB_URL" -f db/seed.sql
```

### 2.3 Verify users table exists
```bash
psql "$SUPABASE_DB_URL" -c "\dt"
psql "$SUPABASE_DB_URL" -c "select id, email, role, created_at from users limit 5;"
```

---

## 3) Configure backend locally

### 3.1 Install dependencies
```bash
cd backend
npm install
```

### 3.2 Create `.env`
```bash
cp .env.example .env
```

### 3.3 Edit `.env` values
Set these exact variables:
```env
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres
JWT_SECRET=<generate-a-strong-random-secret-32+-chars>
CORS_ORIGIN=http://localhost:5173,https://<your-frontend-domain>.vercel.app
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
DB_POOL_MAX=10
DB_IDLE_TIMEOUT_MS=30000
DB_CONNECT_TIMEOUT_MS=10000
NODE_ENV=development
PORT=4000
```

### 3.4 Generate a strong JWT secret
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
Copy output into `JWT_SECRET`.

### 3.5 Start backend
```bash
npm run dev
```

### 3.6 Test backend routes quickly
In another terminal:
```bash
curl -s http://localhost:4000/
curl -s http://localhost:4000/db-test
```

---

## 4) Configure frontend locally

### 4.1 Install dependencies
```bash
cd ../frontend
npm install
```

### 4.2 Create `.env`
```bash
cp .env.example .env
```

### 4.3 Set backend API URL
```env
VITE_API_URL=http://localhost:4000/api
```

### 4.4 Start frontend
```bash
npm run dev
```

### 4.5 Build-check frontend
```bash
npm run build
```

---

## 5) End-to-end local auth verification

With frontend and backend running:

1. Open `http://localhost:5173`
2. Register a new account from UI
3. Login with same account
4. Open devtools → Network, confirm requests:
   - `POST /api/auth/register`
   - `POST /api/auth/login`
   - `GET /api/auth/me`

### 5.1 Verify user stored in Supabase
```bash
psql "$SUPABASE_DB_URL" -c "select id, email, name, role, created_at from users order by created_at desc limit 10;"
```

---

## 6) Deploy backend to Vercel

### 6.1 Create backend project on Vercel
- Import this repository
- Set **Root Directory** = `backend`
- Framework preset = **Other**

### 6.2 Add backend environment variables in Vercel
Set exactly:
- `DATABASE_URL` = Supabase transaction pooler URL
- `JWT_SECRET` = strong secret
- `CORS_ORIGIN` = `https://<frontend-domain>.vercel.app`
- `DB_SSL` = `true`
- `DB_SSL_REJECT_UNAUTHORIZED` = `false`
- `DB_POOL_MAX` = `10`
- `DB_IDLE_TIMEOUT_MS` = `30000`
- `DB_CONNECT_TIMEOUT_MS` = `10000`
- `NODE_ENV` = `production`

### 6.3 Deploy backend and capture URL
Example:
```text
https://the-platform-api.vercel.app
```

### 6.4 Validate deployed backend
```bash
curl -s https://the-platform-api.vercel.app/
curl -s https://the-platform-api.vercel.app/db-test
```

---

## 7) Deploy frontend to Vercel

### 7.1 Create frontend project on Vercel
- Import same repository
- Set **Root Directory** = `frontend`
- Framework preset = **Vite**

### 7.2 Add frontend env variable
- `VITE_API_URL` = `https://the-platform-api.vercel.app/api`

### 7.3 Deploy frontend and capture URL
Example:
```text
https://the-platform-web.vercel.app
```

---

## 8) Production verification checklist

### 8.1 Browser flow
1. Open frontend URL
2. Register user
3. Login user
4. Navigate to profile/dashboard
5. Refresh page and confirm session/user still loads

### 8.2 Database verification
```bash
psql "$SUPABASE_DB_URL" -c "select id, email, name, role, created_at from users order by created_at desc limit 20;"
```

### 8.3 Security verification
- Confirm passwords are not plaintext in DB (`password_hash` only)
- Confirm `JWT_SECRET` is not in git
- Confirm backend CORS only allows your frontend domain
- Confirm frontend has no `DATABASE_URL` or secrets

---

## 9) Operations and maintenance next steps

### 9.1 Add health check monitoring
- Keep `GET /` and `GET /db-test` monitored via uptime service

### 9.2 Add CI checks
From repo root, run in CI pipeline:
```bash
cd frontend && npm ci && npm run build
cd ../backend && npm ci && node --check src/index.js && node --check src/db.js && node --check src/models/User.js
```

### 9.3 Fix backend test runner (recommended)
Current Jest config has ESM issue. Migrate tests to proper ESM Jest setup or use Vitest for backend tests.

### 9.4 Add password reset + email verification
Planned API extensions:
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/verify-email`

### 9.5 Add rate limiting + brute-force protection
Recommended backend additions:
- `express-rate-limit`
- account lockout strategy for repeated failed logins

---

## 10) One-command quick command list

From repository root:
```bash
# 1) DB init
psql "$SUPABASE_DB_URL" -f db/schema.sql

# 2) Backend
cd backend && npm install && cp .env.example .env && npm run dev

# 3) Frontend (new terminal)
cd frontend && npm install && cp .env.example .env && npm run dev

# 4) Build check
cd frontend && npm run build
```
