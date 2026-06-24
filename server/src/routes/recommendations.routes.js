import { Router } from "express";
import { getUserRecommendations } from "../controllers/recommendations.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticateUser);

router.get("/", getUserRecommendations);

export default router;
