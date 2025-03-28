import express from "express";
import { logout } from "../controllers/logout.controller.ts";
import authMiddleware from "../middleware/getRole.middleware.ts";

const router = express.Router();

router.post("/", authMiddleware, logout); // Loggar ut och tar bort JWT.

export default router;