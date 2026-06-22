import { Router } from "express";
import {
  generateRoadmap,
  getRoadmap,
  updateMilestoneStatus,
  getPlacementReadiness
} from "../controllers/roadmap.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticateUser);

router.post("/generate", generateRoadmap);
router.get("/", getRoadmap);
router.put("/milestone", updateMilestoneStatus);
router.get("/readiness", getPlacementReadiness);

export default router;
