const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, bio } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      firstName,
      lastName,
      phone,
      bio
    },
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Change password
// @route   PUT /api/v1/auth/password
// @access  Private
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password updated successfully'
  });
});

// @desc    Update user preferences
// @route   PUT /api/v1/auth/preferences
// @access  Private
exports.updatePreferences = asyncHandler(async (req, res) => {
  const { darkMode, language, notifications } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      preferences: {
        darkMode,
        language,
        notifications
      }
    },
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user account 
// @route   DELETE /api/v1/auth/account
// @access  Private
exports.deleteAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user.id);

  res.status(200).json({
    success: true,
    data: {},
    message: 'Account deleted successfully'
  });
});