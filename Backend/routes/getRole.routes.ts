import express from "express";
import { getUserRole } from "../controllers/getRole.controller.ts";
import authMiddleware from "../middleware/getRole.middleware.ts";

const router = express.Router();

router.get("/", authMiddleware, getUserRole); // Hämtar användaren roll t.ex. Owner, Admin eller User.

export default router;