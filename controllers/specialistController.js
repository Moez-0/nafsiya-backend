const Specialist = require('../models/Specialist');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all specialists
// @route   GET /api/v1/specialists
// @access  Public
exports.getSpecialists = async (req, res, next) => {
  try {
    // Filtering
    const queryObj = { ...req.query, isVerified: true };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    let query = Specialist.find(queryObj);

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-ratingsAverage');
    }

    // Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    const specialists = await query;
    const count = await Specialist.countDocuments(queryObj);

    res.status(200).json({
      success: true,
      count: specialists.length,
      total: count,
      data: specialists
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single specialist
// @route   GET /api/v1/specialists/:id
// @access  Public
exports.getSpecialist = async (req, res, next) => {
  try {
    const specialist = await Specialist.findById(req.params.id);

    if (!specialist) {
      return next(new ErrorResponse(`Specialist not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: specialist
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create specialist profile
// @route   POST /api/v1/specialists
// @access  Private (Admin or Specialist)
exports.createSpecialist = async (req, res, next) => {
  try {
    // Verify user exists and is not already a specialist
    const user = await User.findById(req.body.user);
    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.body.user}`, 404));
    }
    if (user.role !== 'user') {
      return next(new ErrorResponse('User is already registered as specialist or admin', 400));
    }

    // Update user role
    user.role = 'specialist';
    await user.save();

    const specialist = await Specialist.create(req.body);

    res.status(201).json({
      success: true,
      data: specialist
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update specialist profile
// @route   PUT /api/v1/specialists/:id
// @access  Private (Admin or Specialist owner)
exports.updateSpecialist = async (req, res, next) => {
  try {
    let specialist = await Specialist.findById(req.params.id);

    if (!specialist) {
      return next(new ErrorResponse(`Specialist not found with id of ${req.params.id}`, 404));
    }

    // Check if user is admin or specialist owner
    if (req.user.role !== 'admin' && specialist.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to update this specialist profile', 401));
    }

    specialist = await Specialist.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: specialist
    });
  } catch (err) {
    next(err);
  }
};