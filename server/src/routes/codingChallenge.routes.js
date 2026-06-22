import { Router } from "express";
import {
  createCodingChallenge,
  getCodingChallenges,
  getCodingChallengeById,
  runChallengeCode
} from "../controllers/codingChallenge.controller.js";
import { authenticateUser, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// Student accessible routes
router.get("/", authenticateUser, getCodingChallenges);
router.get("/:id", authenticateUser, getCodingChallengeById);
router.post("/:id/run", authenticateUser, runChallengeCode);

// Admin-only route
router.post("/", authenticateUser, authorizeRoles("Admin", "Super Admin"), createCodingChallenge);

export default router;
