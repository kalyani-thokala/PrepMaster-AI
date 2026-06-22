import { Router } from "express";
import { getLeaderboard, unlockAchievement } from "../controllers/leaderboard.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticateUser);

router.get("/", getLeaderboard);
router.post("/unlock", unlockAchievement);

export default router;
