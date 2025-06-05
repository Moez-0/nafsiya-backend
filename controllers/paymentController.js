
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const ErrorResponse = require('../utils/errorResponse');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Specialist = require('../models/Specialist');
console.log('Stripe Key:', process.env.STRIPE_SECRET_KEY);
// @desc    Create Stripe checkout session
// @route   POST /api/v1/payments/checkout-session
// @access  Private
exports.createCheckoutSession = async (req, res, next) => {
  try {
    const { sessionType, specialistId, sessionDate } = req.body;
    console.log(sessionType,specialistId,sessionDate);
    // Validate session type
    const validTypes = ['single', 'monthly', 'student'];
    if (!validTypes.includes(sessionType)) {
      return next(new ErrorResponse('Invalid session type', 400));
    }

    let price, specialist, productName, description;

    // Get base prices
    const basePrices = {
      single: 6000, // 60 TND in cents
      monthly: 20000, // 200 TND in cents
      student: 4500 // 45 TND in cents
    };

    // Handle specialist sessions
    if (specialistId) {
      specialist = await Specialist.findById(specialistId).populate('user');
      if (!specialist) {
        return next(new ErrorResponse('Specialist not found', 404));
      }

      // Specialist pricing overrides base pricing
      price = sessionType === 'single' 
        ? specialist.hourlyRate * 100 
        : basePrices[sessionType];

      productName = `Session with ${specialist.user.firstName} ${specialist.user.lastName}`;
      description = `${specialist.specialization} session`;
    } else {
      // General session pricing
      price = basePrices[sessionType];
      productName = `${sessionType === 'monthly' ? 'Monthly Package (4 sessions)' : 'Professional Session'}`;
      description = 'Mental health professional session';
    }

    // Create metadata for booking
    const metadata = {
      sessionType,
      userId: req.user.id,
      sessionDate: sessionDate || ''
    };

    if (specialistId) {
      metadata.specialistId = specialistId;
    }
    console.log(metadata);
    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/canceled`,
      customer_email: req.user.email,
      client_reference_id: req.user.id,
      metadata,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
              description: description,
              metadata: {
                sessionType,
                ...(specialistId && { specialistId })
              }
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
    });
    console.log("sesssion",session);

    res.status(200).json({
      success: true,
      sessionId: session.id,
      sessionUrl: session.url
      
    });

  } catch (err) {
    console.log(err);
    next(new ErrorResponse('Payment processing failed', 500));
  }
};

// @desc    Verify payment and create booking
// @route   POST /api/v1/payments/verify
// @access  Private
exports.verifyPayment = async (req, res, next) => {
  try {
    const { sessionId } = req.body;

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items']
    });

    // Verify payment was successful
    if (session.payment_status !== 'paid') {
      return next(new ErrorResponse('Payment not completed', 400));
    }

    // Check if booking already exists
    const existingBooking = await Booking.findOne({ sessionId });
    if (existingBooking) {
      return next(new ErrorResponse('Booking already exists', 400));
    }

    // Get specialist if exists
    let specialist = null;
    if (session.metadata.specialistId) {
      specialist = await Specialist.findById(session.metadata.specialistId);
      if (!specialist) {
        return next(new ErrorResponse('Specialist not found', 404));
      }
    }

    // Get price from Stripe
    const amount = session.amount_total / 100; // Convert back to TND

    // Create new booking
    const bookingData = {
      user: session.client_reference_id,
      sessionType: session.metadata.sessionType,
      amount,
      sessionId,
      paymentStatus: 'completed',
      status: 'pending',
      scheduledDate: session.metadata.sessionDate || null
    };

    if (specialist) {
      bookingData.specialist = specialist._id;
      bookingData.pricePerSession = specialist.hourlyRate;
    }

    const booking = await Booking.create(bookingData);

    // Add to user's bookings if monthly package
    if (session.metadata.sessionType === 'monthly') {
      await User.findByIdAndUpdate(session.client_reference_id, {
        $push: { sessions: { $each: Array(4).fill(booking._id) } }
      });
    }

    // TODO: Send confirmation email here

    res.status(200).json({
      success: true,
      data: booking
    });

  } catch (err) {
    next(new ErrorResponse('Payment verification failed', 500));
  }
};

// @desc    Get user bookings
// @route   GET /api/v1/payments/bookings
// @access  Private
exports.getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate({
        path: 'specialist',
        populate: {
          path: 'user',
          select: 'firstName lastName avatar'
        }
      })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    next(new ErrorResponse('Failed to retrieve bookings', 500));
  }
};

// @desc    Get specialist bookings
// @route   GET /api/v1/payments/specialist-bookings
// @access  Private (Specialist)
exports.getSpecialistBookings = async (req, res, next) => {
  try {
    // Check if user is a specialist
    const specialist = await Specialist.findOne({ user: req.user.id });
    if (!specialist) {
      return next(new ErrorResponse('Not authorized as a specialist', 401));
    }

    const bookings = await Booking.find({ specialist: specialist._id })
      .populate('user', 'firstName lastName email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    next(new ErrorResponse('Failed to retrieve bookings', 500));
  }
};
