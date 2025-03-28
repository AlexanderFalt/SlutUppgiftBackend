import express from 'express';
import { createUser, validateUser } from '../controllers/user.controller.ts';

const router = express.Router();

router.post('/register', createUser); // Skapar konto och får JWT.
router.post('/login', validateUser); // Loggar in och får en JWT.

export default router;