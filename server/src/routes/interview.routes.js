import { Router } from "express";
import {
  generateInterview,
  submitInterviewAnswer,
  finalizeInterview,
  getInterviewHistory,
  getInterviewById
} from "../controllers/interview.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticateUser);

router.post("/generate", generateInterview);
router.post("/submit-answer", submitInterviewAnswer);
router.post("/finalize", finalizeInterview);
router.get("/history", getInterviewHistory);
router.get("/:id", getInterviewById);

export default router;
