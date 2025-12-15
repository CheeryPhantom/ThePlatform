# The Platform

A modern job marketplace connecting job seekers with employers.

## Features

- **Job Search & Discovery** - Find relevant job opportunities
- **Profile Management** - Create and manage professional profiles
- **Employer Dashboard** - Post and manage job listings
- **Responsive Design** - Works seamlessly on all devices

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Deployment**: Docker

## Quick Start

### Prerequisites
- Docker Desktop
- Node.js 18+

### Installation

1. **Start the database:**
   ```bash
   docker-compose up -d
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **Database Admin**: http://localhost:8080

## Project Structure

```
ThePlatform/
├── backend/          # Express API server
├── frontend/         # React application
├── db/              # Database schema and seeds
└── docker-compose.yml
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
