import express from 'express';
import { getUsers, deleteUser, updateRoleRaise, getRoleRaise } from '../controllers/admin.controller.ts';
import { authenticateToken } from '../middleware/authenticate.middleware.ts';
import { authorizeRole } from '../middleware/authorize.middleware.ts';

const router = express.Router();

router.get('/', authenticateToken, authorizeRole(["Admin"]), getUsers)
router.delete('/:id', authenticateToken, authorizeRole(["Admin"]), deleteUser)
router.get('/role-raise', authenticateToken, authorizeRole(["Admin"]), getRoleRaise)
router.put('/role-raise/:id', authenticateToken, authorizeRole(["Admin"]), updateRoleRaise)

export default router;