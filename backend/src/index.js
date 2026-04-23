import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { db } from "./db.js";
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import jobsRoutes from "./routes/jobs.js";
import employersRoutes from "./routes/employers.js";
import locationsRoutes from "./routes/locations.js";
import skillsRoutes from "./routes/skills.js";
import uploadsRoutes from "./routes/uploads.js";
import certificationsRoutes from "./routes/certifications.js";
import trainingRoutes from "./routes/training.js";

dotenv.config();

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.get("/db-test", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    res.json({ message: "DB Connected!", result: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/users/uploads", uploadsRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/employers", employersRoutes);
app.use("/api/locations", locationsRoutes);
app.use("/api/skills", skillsRoutes);
app.use("/api/certifications", certificationsRoutes);
app.use("/api/training", trainingRoutes);

const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
