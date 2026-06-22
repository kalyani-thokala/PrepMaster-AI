import { Router } from "express";
import { sendMessageToCoach } from "../controllers/chat.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/send", authenticateUser, sendMessageToCoach);

export default router;
