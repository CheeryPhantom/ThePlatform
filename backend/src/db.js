import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const shouldUseSsl = process.env.DB_SSL !== "false";

const ssl = shouldUseSsl
  ? {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === "true",
    }
  : undefined;

export const db = new Pool({
  connectionString,
  ssl,
  max: Number(process.env.DB_POOL_MAX || 10),
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS || 30000),
  connectionTimeoutMillis: Number(process.env.DB_CONNECT_TIMEOUT_MS || 10000),
});
