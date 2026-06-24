import { Router } from "express";
import { getUserPerformanceAnalytics } from "../controllers/analytics.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticateUser);

router.get("/", getUserPerformanceAnalytics);

export default router;
