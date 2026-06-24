import { Router } from "express";
import {
  generateAptitudeTest,
  submitAptitudeTest,
  getAptitudeHistory
} from "../controllers/aptitude.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticateUser);

router.post("/generate", generateAptitudeTest);
router.post("/submit", submitAptitudeTest);
router.get("/history", getAptitudeHistory);

export default router;
