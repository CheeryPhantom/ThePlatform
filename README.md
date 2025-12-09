# ThePlatform
An app that acts as a social media job platform
=======

## Project Structure
- `backend/` - Express API server (Node, ES modules)
- `frontend/` - Vite + React frontend
- `db/` - SQL schema and seed files used by Docker Postgres
- `docker-compose.yml` - Postgres + Adminer for local development

## What I changed so far
- Fixed a bug in `backend/src/index.js` where an undefined `pool` variable was used — consolidated DB test routes to use the exported `db` Pool.
- Added placeholder routers for API endpoints so routes can be mounted safely:
  - `backend/src/routes/auth.js`
  - `backend/src/routes/users.js`
  - `backend/src/routes/jobs.js`
  - `backend/src/routes/employers.js`
- Added `backend/.gitignore` and a repository-level `.gitignore` to avoid committing secrets and node modules.
- Updated `docker-compose.yml` to map Postgres to host port `5433` to avoid conflict with a local Postgres instance on `5432`.
- Updated `backend/.env` to use `DATABASE_URL=postgresql://theplatform:changeme@localhost:5433/theplatform_dev`.

## How to run (local development)
Prereqs: Docker Desktop, Node 18+ (or compatible), npm

1. Start the database and Adminer (project root):
```
docker-compose up -d
```

2. Backend (in a new terminal):
```
cd backend
npm install
npm run dev
```

3. Frontend (in another terminal):
```
cd frontend
npm install
npm run dev
```

4. Useful endpoints:
- API root: `http://localhost:4000/`
- DB test: `http://localhost:4000/db-test`
- Placeholder routes: `http://localhost:4000/api/auth`, `.../api/users`, `.../api/jobs`, `.../api/employers`
- Adminer UI: `http://localhost:8080/` (login with database `theplatform_dev`, user `theplatform`, password `changeme`, server `host.docker.internal` or `localhost:5433`)

Notes:
- The Postgres container host port was changed to `5433` to avoid conflicts with any local Postgres running on `5432`.
- `backend/.env` contains secrets and is ignored by `.gitignore`. Do not commit it.

## Git: push this repository to a remote
1. Initialize git (if not already):
```
git init
git add .
git commit -m "Initial project import with backend fixes and placeholders"
```

2. Create a remote repository (GitHub) and add remote, then push:
```
# replace <your-remote-url> with the HTTPS or SSH repo URL
git remote add origin <your-remote-url>
git branch -M main
git push -u origin main
```

If you use the GitHub CLI you can run:
```
gh repo create <repo-name> --public --source=. --push
```

## What remains to do (recommended next steps)
- Implement actual route handlers and controllers for auth, users, jobs, and employers.
- Add authentication middleware and JWT integration.
- Add tests for backend routes and database integration (use a test DB or Docker test compose).
- Add CI configuration (GitHub Actions) to run lint and tests on push.
- Consider dockerizing the backend for consistent development and to use Docker networking (then `DATABASE_URL` should use host `db`).
