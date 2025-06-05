const express = require('express');
const {
  createCheckoutSession,
  verifyPayment,
  getUserBookings,
  getSpecialistBookings
} = require('../controllers/paymentController');
const { protect } = require('../middlewares/auth');
const router = express.Router();

router.route('/checkout-session')
  .post(protect, createCheckoutSession);

router.route('/verify')
  .post(protect, verifyPayment);

router.route('/bookings')
  .get(protect, getUserBookings);

router.route('/specialist-bookings')
  .get(protect, getSpecialistBookings);

module.exports = router;