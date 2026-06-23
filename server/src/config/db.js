import mongoose from "mongoose";
import { logger } from "../utils/logger.js";
import dotenv from "dotenv";

dotenv.config();

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY_MS = 1000; // 1 second

/**
 * Validates the MongoDB URI and checks for unsafe configurations.
 * Fail-fast mechanism to prevent deploying local databases to production.
 * @param {string} uri - The MongoDB URI to check.
 * @param {string} env - The execution environment.
 */
const validateConnectionURI = (uri, env) => {
  if (!uri) {
    const errorMsg = "Database initialization failed: MONGODB_URI environment variable is missing.";
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  // Phase 7: Error Prevention - Safeguard rejecting local database URLs in production
  if (env === "production") {
    const containsLocalhost = uri.includes("localhost") || uri.includes("127.0.0.1");
    if (containsLocalhost) {
      const errorMsg = "Production deployment cannot use localhost MongoDB. Configure MongoDB Atlas.";
      logger.error(`Database Failed: ${errorMsg}`);
      throw new Error(errorMsg);
    }
  }
};

/**
 * Establishes a connection to MongoDB with retry logic and connection monitoring.
 */
const connectDB = async () => {
  const env = process.env.NODE_ENV || "development";
  const MONGODB_URI = process.env.MONGODB_URI;

  try {
    // 1. Validate environment variables before connecting
    validateConnectionURI(MONGODB_URI, env);
  } catch (error) {
    console.error("Database connection validation failed:", error.message);
    process.exit(1);
    throw error; // Halt execution if process.exit is mocked
  }

  // 2. Setup connection monitoring listeners
  mongoose.connection.on("connected", () => {
    logger.info("Database Connected: Mongoose connection established successfully.");
    console.log("MongoDB connected successfully");
  });

  mongoose.connection.on("error", (err) => {
    logger.error(`Database Failed: Connection error occurred: ${err.message}`);
    console.error("MongoDB connection failed:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("Database Connected: Mongoose connection disconnected.");
  });

  mongoose.connection.on("reconnected", () => {
    logger.info("Database Connected: Mongoose connection reestablished successfully.");
  });

  // 3. Retry connection mechanism with exponential backoff
  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    try {
      attempt++;
      logger.info(`Database initialization: Attempting connection to MongoDB (Attempt ${attempt}/${MAX_RETRIES})...`);
      
      const conn = await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of hanging
      });

      const host = conn.connection.host;
      const isAtlas = host.includes("mongodb.net");
      if (isAtlas) {
        logger.info(`Atlas Connected: Connected to MongoDB Atlas cluster at ${host}`);
      } else {
        logger.info(`Database Connected: Connected to local/custom database host: ${host}`);
      }
      return; // Connection succeeded, exit retry loop
    } catch (error) {
      logger.error(`Database Failed: Connection attempt ${attempt}/${MAX_RETRIES} failed. Error: ${error.message}`);
      
      if (attempt >= MAX_RETRIES) {
        logger.error("Database Failed: Max connection retries reached. Exiting application.");
        process.exit(1);
        throw error;
      }

      const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
      logger.info(`Database initialization: Waiting ${delay}ms before next retry...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

/**
 * Handles graceful shutdown of MongoDB connection and process termination.
 * @param {string} signal - The termination signal received.
 */
const gracefulShutdown = async (signal) => {
  logger.info(`Received signal ${signal}. Starting graceful shutdown...`);
  try {
    await mongoose.connection.close();
    logger.info("Database connection closed successfully. Exiting process.");
    process.exit(0);
  } catch (error) {
    logger.error(`Database Failed: Error during graceful shutdown: ${error.message}`);
    process.exit(1);
  }
};

// 4. Graceful Shutdown Handlers
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

export default connectDB;
