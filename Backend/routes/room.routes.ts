import express from 'express';
import { createRoom, getRooms, removeRoom, updateRoom } from '../controllers/room.controller.ts';
import { authenticateToken } from '../middleware/authenticate.middleware.ts';
import { authorizeRole } from '../middleware/authorize.middleware.ts';

const router = express.Router();

router.post('/', authenticateToken, authorizeRole(['Admin', 'Owner']), createRoom); // Skapar ett rum.
router.get('/', authenticateToken, getRooms); // Hämtar rummen.
router.delete('/:id', authenticateToken, authorizeRole(['Admin', 'Owner']), removeRoom); // Tar bort ett rum.
router.put('/:id', authenticateToken, authorizeRole(['Admin', 'Owner']), updateRoom)

export default router;