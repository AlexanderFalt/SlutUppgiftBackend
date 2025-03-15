import express from 'express';
import { createUser, validateUser } from '../controllers/user.controller.ts';

const router = express.Router();

router.post('/register', createUser);
router.post('/login', validateUser);

export default router;