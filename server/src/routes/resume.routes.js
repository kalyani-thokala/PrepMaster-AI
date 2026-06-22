import { Router } from "express";
import { analyzeResume, getResumeHistory, getResumeById } from "../controllers/resume.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(authenticateUser); // All resume routes require authentication

router.post("/analyze", upload.single("resume"), analyzeResume);
router.get("/history", getResumeHistory);
router.get("/:id", getResumeById);

export default router;
