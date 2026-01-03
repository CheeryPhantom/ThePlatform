import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { db } from "./db.js";
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import jobsRoutes from "./routes/jobs.js";
import employersRoutes from "./routes/employers.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// DB test route
app.get("/db-test", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    res.json({ message: "DB Connected!", result: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mount API routes (placeholders until implemented)
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/employers", employersRoutes);

const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
