const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  createReply
} = require('../controllers/forumController');
const { protect, anonymousAccess } = require('../middlewares/auth');

router.route('/')
  .get(anonymousAccess, getPosts)
  .post(protect, createPost);

router.route('/:id')
  .get(anonymousAccess, getPost)
  .put(protect, updatePost)
  .delete(protect, deletePost);

router.route('/:id/replies')
  .post(protect, createReply);

module.exports = router;