import { Router } from "express";
import {
  generateAssessment,
  submitAssessment,
  getAssessmentHistory
} from "../controllers/assessment.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticateUser);

router.post("/generate", generateAssessment);
router.post("/submit", submitAssessment);
router.get("/history", getAssessmentHistory);

export default router;
