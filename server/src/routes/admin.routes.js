import { Router } from "express";
import {
  getAllUsers,
  blockOrUnblockUser,
  deleteUser,
  getSystemAnalytics,
  getAIPromptTemplates,
  updateAIPromptTemplates
} from "../controllers/admin.controller.js";
import { authenticateUser, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// Secure all admin endpoints
router.use(authenticateUser);
router.use(authorizeRoles("Admin", "Super Admin"));

router.get("/users", getAllUsers);
router.put("/users/:userId/block", blockOrUnblockUser);
router.delete("/users/:userId", deleteUser);
router.get("/analytics", getSystemAnalytics);
router.get("/prompts", getAIPromptTemplates);
router.put("/prompts", updateAIPromptTemplates);

export default router;
