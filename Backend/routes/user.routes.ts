import express from 'express';
import { createUser, validateUser, logout, getUserRole, refreshToken } from '../controllers/user.controller.ts';
import authMiddleware from "../middleware/getRole.middleware.ts";

const router = express.Router();

router.post('/register', createUser); // Skapar konto och får JWT.
router.post('/login', validateUser); // Loggar in och får en JWT.
router.post("/logout", authMiddleware, logout); // Loggar ut och tar bort JWT.
router.get("/getRole", authMiddleware, getUserRole);
router.post('/refresh-token', refreshToken)

export default router;