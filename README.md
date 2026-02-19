# The Platform

A modern job marketplace connecting job seekers with employers.

## Features

- **Job Search & Discovery** - Find relevant job opportunities
- **Profile Management** - Create and manage professional profiles
- **Employer Dashboard** - Post and manage job listings
- **Authentication** - Signup/login with JWT-based sessions
- **Responsive Design** - Works seamlessly on all devices

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (Supabase-compatible)
- **Deployment**: Vercel

## Quick Start (Local)

### Prerequisites
- Node.js 18+
- PostgreSQL or Supabase project

### Installation

1. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm run dev
   ```

2. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm run dev
   ```

3. **Initialize database schema:**
   ```bash
   psql "<DATABASE_URL>" -f db/schema.sql
   ```

### Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000

## Deployment

See [DEPLOY.md](./DEPLOY.md) for complete Supabase + Vercel setup.

## Project Structure

```
ThePlatform/
├── backend/          # Express API server
├── frontend/         # React application
├── db/               # Database schema and seeds
└── DEPLOY.md
```
