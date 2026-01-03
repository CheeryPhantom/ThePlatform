# Deploying The Platform to Vercel

This guide outlines the steps to deploy both the Frontend and Backend of **The Platform** to Vercel.

## Prerequisites

1.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
2.  **GitHub Repository**: Push your code to a GitHub repository.

## 1. Database Setup (Vercel Postgres)

Since we are deploying to a serverless environment, we need a cloud-hosted database. Vercel Postgres is a convenient option.

1.  Go to your Vercel Dashboard.
2.  Click **Storage** -> **Create Database** -> **Postgres**.
3.  Give it a name (e.g., `the-platform-db`) and select a region.
4.  Once created, go to the **.env.local** tab in the database dashboard.
5.  Copy the connection details (specifically `POSTGRES_URL` or standard `DATABASE_URL`).
6.  You will need to run your `schema.sql` against this new database using a tool like TablePlus or `psql`, or by connecting from your local machine.

## 2. Backend Deployment

1.  Go to **Vercel Dashboard** -> **Add New...** -> **Project**.
2.  Import your GitHub repository.
3.  **Configure Project**:
    *   **Root Directory**: Click `Edit` and select `backend`.
    *   **Framework Preset**: Select `Other`.
    *   **Environment Variables**: Add the following:
        *   `DATABASE_URL`: The value from step 1.
        *   `JWT_SECRET`: Any long random string.
        *   `NODE_ENV`: `production`
4.  Click **Deploy**.
5.  Once deployed, note the **Domains** URL (e.g., `https://the-platform-backend.vercel.app`).

## 3. Frontend Deployment

1.  Go to **Vercel Dashboard** -> **Add New...** -> **Project**.
2.  Import the **same** GitHub repository again.
3.  **Configure Project**:
    *   **Root Directory**: Click `Edit` and select `frontend`.
    *   **Framework Preset**: Vercel should auto-detect `Vite`.
    *   **Environment Variables**: Add the following:
        *   `VITE_API_URL`: The Backend URL from Step 2 (e.g., `https://the-platform-backend.vercel.app`).
4.  Click **Deploy**.

## 4. Updates

When you push changes to `main`, Vercel will automatically redeploy the affected projects.
