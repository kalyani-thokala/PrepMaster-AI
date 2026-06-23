import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Get application health status
 *     description: Returns the status of the server and the database connection, environment, uptime, and timestamp.
 *     responses:
 *       200:
 *         description: Health status details.
 */
router.get("/", (req, res) => {
  const dbState = mongoose.connection.readyState;
  let databaseStatus = "disconnected";

  switch (dbState) {
    case 0:
      databaseStatus = "disconnected";
      break;
    case 1:
      databaseStatus = "connected";
      break;
    case 2:
      databaseStatus = "connecting";
      break;
    case 3:
      databaseStatus = "disconnecting";
      break;
  }

  res.status(200).json({
    status: "ok",
    database: databaseStatus,
    environment: process.env.NODE_ENV || "development",
    uptime: `${process.uptime().toFixed(2)}s`,
    timestamp: new Date().toISOString()
  });
});

/**
 * @openapi
 * /health/db:
 *   get:
 *     summary: Get database connection status only
 *     description: Returns 200 if database is connected, or 503 if disconnected.
 *     responses:
 *       200:
 *         description: Database is connected.
 *       503:
 *         description: Database is disconnected.
 */
router.get("/db", (req, res) => {
  const dbState = mongoose.connection.readyState;
  if (dbState === 1) {
    return res.status(200).json({
      database: "connected"
    });
  } else {
    return res.status(503).json({
      database: "disconnected"
    });
  }
});

export default router;
