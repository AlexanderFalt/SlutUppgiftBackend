import express from 'express';
import { createRoom, getRooms, removeRoom } from '../controllers/room.controller.ts';
import { authenticateToken } from '../middleware/authenticate.middleware.ts';
import { authorizeRole } from '../middleware/authorize.middleware.ts';

const router = express.Router();

router.post('/', authenticateToken, authorizeRole(['Admin', 'Owner']), createRoom);
router.get('/', authenticateToken, getRooms);
router.delete('/:id', authenticateToken, authorizeRole(['Admin', 'Owner']), removeRoom);

export default router;