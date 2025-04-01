import express from 'express';
import { createBooking, removeBooking, getBookings, updateBooking, getAllRoomBookings } from '../controllers/booking.controller.ts';
import { authenticateToken } from '../middleware/authenticate.middleware.ts';

const router = express.Router();

router.post('/', authenticateToken, createBooking); // Skapar en bookning.
router.get('/', authenticateToken, getBookings) // Hämtar användares bookningar eller alla bookningar för ägare/admin.
router.put('/:id', authenticateToken, updateBooking) // Updaterar en bookning (Endast skaparen eller admin).
router.delete('/:id', authenticateToken, removeBooking) // Updaterar en bookning (Endast skaparen eller admin).

router.get('/getBookings/:id', authenticateToken, getAllRoomBookings)

export default router;