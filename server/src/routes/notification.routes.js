import { Router } from "express";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from "../controllers/notification.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = Router();

// Protect all notification routes
router.use(authenticateUser);

router.get("/", getNotifications);
router.put("/read-all", markAllNotificationsAsRead);
router.put("/:id/read", markNotificationAsRead);

export default router;
