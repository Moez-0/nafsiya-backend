const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const Activity = require('../models/Activity');


// @desc    Get user activity
// @route   GET /api/v1/users/activity
// @access  Private
exports.getUserActivity = async (req, res, next) => {
    
    const userId = req.params.id || req.user.id;
   
   
 
  

    const user = await User.findById(userId);
 
    
    const activities = await Activity.find({ user: userId })
  .sort('-createdAt')
  .limit(10);
  
  
    res.status(200).json({
      success: true,
      data: activities
    });
  };

// @desc    Update user mood
// @route   POST /api/v1/users/mood
// @access  Private
exports.updateMood = async (req, res, next) => {
    const { mood } = req.body;
  
    if (!mood || mood < 1 || mood > 5) {
      return next(new ErrorResponse('Please provide a valid mood value (1-5)', 400));
    }
  
    // Create mood activity
    await Activity.create({
      user: req.user.id,
      type: 'mood_update',
      description: `Updated mood to ${getMoodLabel(mood)}`,
      moodValue: mood
    });
  
    res.status(200).json({
      success: true,
      data: { mood }
    });
  };
  
  const getMoodLabel = (value) => {
    const moods = {
      1: 'Very Poor',
      2: 'Poor',
      3: 'Neutral',
      4: 'Good',
      5: 'Excellent'
    };
    return moods[value] || 'Unknown';
  };
// @desc    Get user profile
// @route   GET /api/v1/users/me
// @access  Private
exports.getMe = async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate('university')
    .select('-password -verificationToken -verificationTokenExpires -passwordResetToken -passwordResetExpires');

  res.status(200).json({
    success: true,
    data: user
  });
};

// @desc    Update user details
// @route   PUT /api/v1/users/me
// @access  Private
exports.updateUser = async (req, res, next) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phone: req.body.phone,
    graduationYear: req.body.graduationYear,
    bio: req.body.bio,
    preferences: req.body.preferences
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  }).select('-password');

  res.status(200).json({
    success: true,
    data: user
  });
};


// @desc    Get public user info by ID
// @route   GET /api/v1/users/:id
// @access  Public or Private (adjust middleware as needed)

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('firstName lastName _id role email phone graduationYear bio profilePicture preferences');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};