import { Router } from "express";
import {
  generateCodingTest,
  submitCodingTest,
  getCodingHistory
} from "../controllers/coding.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticateUser);

router.post("/generate", generateCodingTest);
router.post("/submit", submitCodingTest);
router.get("/history", getCodingHistory);

export default router;
