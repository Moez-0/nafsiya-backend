const Resource = require('../models/Resource');
const ErrorResponse = require('../utils/errorResponse');


// @desc    Get recommended resources
// @route   GET /api/v1/resources/recommended
// @access  Private
exports.getRecommendedResources = async (req, res, next) => {
  // In a real app, you would implement recommendation logic based on user preferences/activity
  const resources = await Resource.find({ isFeatured: true })
    .limit(3)
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: resources
  });
};

// @desc    Get all resources
// @route   GET /api/v1/resources
// @access  Public
exports.getResources = async (req, res, next) => {
  res.status(200).json(res);
};

// @desc    Get single resource
// @route   GET /api/v1/resources/:id
// @access  Public
exports.getResource = async (req, res, next) => {
  const resource = await Resource.findById(req.params.id);

  if (!resource) {
    return next(
      new ErrorResponse(`Resource not found with id of ${req.params.id}`, 404)
    );
  }
    // Log activity if user is logged in
    if (req.user) {
        await Activity.create({
        user: req.user.id,
        type: 'resource_view',
        description: `Viewed resource: ${resource.title}`,
        relatedResource: resource._id
        });
    }
  res.status(200).json({
    success: true,
    data: resource
  });
};

// @desc    Create new resource
// @route   POST /api/v1/resources
// @access  Private/Admin
exports.createResource =async (req, res, next) => {
  const resource = await Resource.create(req.body);

  res.status(201).json({
    success: true,
    data: resource
  });
};

// @desc    Update resource
// @route   PUT /api/v1/resources/:id
// @access  Private/Admin
exports.updateResource = async (req, res, next) => {
  const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!resource) {
    return next(
      new ErrorResponse(`Resource not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: resource
  });
};

// @desc    Delete resource
// @route   DELETE /api/v1/resources/:id
// @access  Private/Admin
exports.deleteResource = async (req, res, next) => {
  const resource = await Resource.findByIdAndDelete(req.params.id);

  if (!resource) {
    return next(
      new ErrorResponse(`Resource not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: {}
  });
};