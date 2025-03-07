import express from 'express';
import { createRoom, getRooms, removeRoom } from '../controllers/roomController.controller.ts';


const router = express.Router();

router.post('/', createRoom);
router.get('/', getRooms);
router.delete('/:id', removeRoom);

export default router;