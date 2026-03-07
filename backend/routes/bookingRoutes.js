const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Define Routes
router.post('/', bookingController.createBookingHandler);
router.delete('/:pnr', bookingController.cancelBookingHandler);
router.get('/:pnr', bookingController.getBookingStatusHandler);

module.exports = router;
