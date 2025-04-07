const User = require('../models/User');
const University = require('../models/University');
const ErrorResponse = require('../utils/errorResponse');
const {sendEmail , generateVerificationEmail} = require('../utils/emailService');
const Activity = require('../models/Activity');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');


// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  const { firstName, lastName, email, password, university, studentId, phone, graduationYear } = req.body;
 console.log(firstName + lastName + email + password + university + studentId + phone + graduationYear);
 console.log(req.body);
  try {
    // Check if university exists
    const uni = await University.findOne({ name: university });
    if (!uni) {
      return next(new ErrorResponse('Invalid university', 400));
    }

    // Verify university email domain
    // const emailDomain = email.split('@')[1];
    // if (emailDomain !== uni.emailDomain) {
    //   return next(new ErrorResponse(`Please use your ${uni.name} email`, 400));
    // }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      university: uni._id,
      studentId,
      phone,
      graduationYear
    });

    // Create verification token
    const verificationToken = user.getVerificationToken();
    await user.save({ validateBeforeSave: false });
    console.log(verificationToken);

    // Send verification email
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify/${verificationToken}`;
    const message = `Please verify your account by clicking on the link: ${verificationUrl}`;
    try {
      await sendEmail({
        email: user.email,
        subject: 'Nafsiya Account Verification',
        message: message, // Plain text fallback
        html: generateVerificationEmail(user.firstName +' ' + user.lastName, verificationUrl) // HTML content
      });

      res.status(200).json({
        success: true,
        data: 'Verification email sent'
      });
    } catch (err) {
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;
      console.error(err);

      await user.save({ validateBeforeSave: false });
      
      return next(new ErrorResponse('Email could not be sent', 500));
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  try {
    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if account is verified
    if (!user.isVerified) {
      return next(new ErrorResponse('Please verify your email first', 401));
    }

    // Create token
    const token = user.getSignedJwtToken();
     // Log login activity
  await Activity.create({
    user: user._id,
    type: 'login',
    description: 'Logged in to the system'
  });
    res.status(200).json({
      success: true,
      token
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify user account
// @route   GET /api/v1/auth/verify/:verificationToken
// @access  Public
exports.verifyAccount = async (req, res, next) => {
  const { verificationToken } = req.params;
  

  try {
    const user = await User.findOne({
      verificationToken,
      
    });

    if (!user) {
      return next(new ErrorResponse('Invalid or expired token', 400));
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
    
    // res.status(200).json({
    //   success: true,
    //   data: 'Account verified successfully'
    // });
    //redirect to login page
    res.redirect(`https://nafsiya.tn/login?verified=true`);
  } catch (err) {

    next(err);
    
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('university');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Anonymous login
// @route   POST /api/v1/auth/anonymous
// @access  Public
exports.anonymousLogin = async (req, res, next) => {
  try {
    // Create a temporary anonymous token with limited access
    const token = jwt.sign(
      { anonymous: true },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      success: true,
      token
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorResponse('No user with that email', 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested a password reset. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Token',
        message
      });

      res.status(200).json({
        success: true,
        data: 'Email sent'
      });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new ErrorResponse('Email could not be sent', 500));
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return next(new ErrorResponse('Invalid token', 400));
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Create token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token
    });
  } catch (err) {
    next(err);
  }
};