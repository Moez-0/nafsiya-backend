const ForumPost = require('../models/ForumPost');
const Reply = require('../models/Reply');
const Activity = require('../models/Activity');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all forum posts
// @route   GET /api/v1/forum
// @access  Public (or Private if you want to restrict)
exports.getPosts = async (req, res, next) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Filter by category if provided
    if (req.query.category) {
      reqQuery.category = req.query.category;
    }

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = ForumPost.find(JSON.parse(queryStr)).populate({
      path: 'replies',
      select: 'content isAnonymous createdAt'
    });

    // Select fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await ForumPost.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const posts = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: posts.length,
      pagination,
      data: posts
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single forum post
// @route   GET /api/v1/forum/:id
// @access  Public
exports.getPost = async (req, res, next) => {
  try {
    const post = await ForumPost.findById(req.params.id).populate({
      path: 'replies',
      select: 'content isAnonymous createdAt'
    });

    if (!post) {
      return next(
        new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new forum post
// @route   POST /api/v1/forum
// @access  Private or Anonymous
exports.createPost = async (req, res, next) => {

  
  try {
    // Add user to req.body if logged in
    if (req.user) {
      req.body.user = req.user.id;
    }
    
    const post = await ForumPost.create(req.body);
  // Log activity if user is logged in
  if (req.user) {
    await Activity.create({
      user: req.user.id,
      type: 'post',
      description: `Created a new post: ${post.title}`,
      relatedPost: post._id
    });
  }
    res.status(201).json({
      success: true,
      data: post
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update forum post
// @route   PUT /api/v1/forum/:id
// @access  Private (only post owner or admin)
exports.updatePost = async (req, res, next) => {
  try {
    let post = await ForumPost.findById(req.params.id);

    if (!post) {
      return next(
        new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is post owner
    if (post.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this post`,
          401
        )
      );
    }

    post = await ForumPost.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete forum post
// @route   DELETE /api/v1/forum/:id
// @access  Private (only post owner or admin)
exports.deletePost = async (req, res, next) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return next(
        new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is post owner
    if (post.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to delete this post`,
          401
        )
      );
    }

    // Delete all replies associated with the post
    await Reply.deleteMany({ post: post._id });

    await post.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create reply to post
// @route   POST /api/v1/forum/:id/replies
// @access  Private or Anonymous
exports.createReply = async (req, res, next) => {
  try {
    req.body.post = req.params.id;

    // Add user to req.body if logged in
    if (req.user) {
      req.body.user = req.user.id;
    }

    const reply = await Reply.create(req.body);

    // Add reply to post
    await ForumPost.findByIdAndUpdate(
      req.params.id,
      { $push: { replies: reply._id } },
      { new: true, runValidators: true }
    );
    // Log activity if user is logged in
    if (req.user) {
      await Activity.create({
        user: req.user.id,
        type: 'reply',
        description: `Replied to a post`,
        relatedPost: req.params.id,
        relatedReply: reply._id
      });
    }
    res.status(201).json({
      success: true,
      data: reply
    });
  } catch (err) {
    next(err);
  }
};