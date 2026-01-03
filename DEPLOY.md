# Deploying The Platform to Vercel

This guide outlines the steps to deploy both the Frontend and Backend of **The Platform** to Vercel.

## Prerequisites

1.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
2.  **GitHub Repository**: Push your code to a GitHub repository.

## 1. Database Setup (Vercel Postgres)

Since we are deploying to a serverless environment, we need a cloud-hosted database. Vercel Postgres is a convenient option.

1.  **Go to your Vercel Dashboard**: Navigate to [https://vercel.com/dashboard](https://vercel.com/dashboard).
2.  **Create Store**:
    *   Click on the **Storage** tab at the top of the page.
    *   Click the **Create Database** button.
    *   Select **Postgres** (Serverless SQL) and click **Continue**.
3.  **Configuration**:
    *   **Store Name**: Enter a name like `the-platform-db`.
    *   **Region**: Select a region close to your users (e.g., `Washington, D.C. (iad1)`).
    *   Click **Create**.
4.  **Get Connection Details**:
    *   Once the database is created, you will be taken to its specific page.
    *   On the left sidebar, click **.env.local**.
    *   Click the **Copy Snippet** button or manually copy the `POSTGRES_URL` value.
5.  **Initialize the Database** (Running the Schema):
    *   You need to create the tables in this new cloud database. The easiest way is to connect to it from your local machine.
    *   **Option A (Terminal)**: If you have `psql` installed, run:
        ```bash
        psql "YOUR_COPIED_POSTGRES_URL" -f db/schema.sql
        ```
    *   **Option B (GUI)**: Use a tool like [TablePlus](https://tableplus.com/). Create a new connection using the connection string (Import from URL), paste your `POSTGRES_URL`, connect, and then open the SQL editor. Copy-paste the content of `db/schema.sql` and run all.

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
