import express from 'express';
const router = express.Router();
import bookingController from '../controllers/booking.controller.js';

// Define Routes
router.post('/', bookingController.createBookingHandler);
router.delete('/:pnr', bookingController.cancelBookingHandler);
router.get('/:pnr', bookingController.getBookingStatusHandler);

export default router;
