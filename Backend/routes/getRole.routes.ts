import express from "express";
import { getUserRole } from "../controllers/getRole.controller.ts";
import authMiddleware from "../middleware/getRole.middleware.ts";

const router = express.Router();

router.get("/", authMiddleware, getUserRole);

export default router;