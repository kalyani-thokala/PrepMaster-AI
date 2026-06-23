import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import { errorHandler } from "./middlewares/error.middleware.js";
import { logger } from "../src/utils/logger.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. CORS configuration matching client origin (must run first for preflights)
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((url) => url.trim())
  : ["http://localhost:5173", "http://localhost:5174"];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true
  })
);

// 2. Security Middlewares
app.use(helmet());

// 3. Rate Limiting to prevent brute-force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 200, // Limit each IP to 200 requests per window
  message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use("/api/", limiter);

// General Runtimes Middlewares
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(compression());
app.use(morgan("dev"));

// Import Router Modules
import authRouter from "./routes/auth.routes.js";
import resumeRouter from "./routes/resume.routes.js";
import interviewRouter from "./routes/interview.routes.js";
import assessmentRouter from "./routes/assessment.routes.js";
import codingChallengeRouter from "./routes/codingChallenge.routes.js";
import chatRouter from "./routes/chat.routes.js";
import roadmapRouter from "./routes/roadmap.routes.js";
import adminRouter from "./routes/admin.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import leaderboardRouter from "./routes/leaderboard.routes.js";
import companyRouter from "./routes/company.routes.js";
import healthRouter from "./routes/health.routes.js";

// Map API Routes
app.use("/health", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/resumes", resumeRouter);
app.use("/api/v1/interviews", interviewRouter);
app.use("/api/v1/assessments", assessmentRouter);
app.use("/api/v1/coding-challenges", codingChallengeRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/roadmaps", roadmapRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/leaderboard", leaderboardRouter);
app.use("/api/v1/company", companyRouter);

// Global Error Handling Middleware
app.use(errorHandler);

// Establish database and start Express server listener
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`Server is running and listening on port: ${PORT}`);
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start the application server: ", error);
  }
};

if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default app; // export for testing purposes
