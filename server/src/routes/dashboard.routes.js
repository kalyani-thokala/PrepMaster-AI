import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticateUser);

router.get("/stats", getDashboardStats);

export default router;
