import { Router } from "express";
import { getCompanyPrepData } from "../controllers/company.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/:name", authenticateUser, getCompanyPrepData);

export default router;
