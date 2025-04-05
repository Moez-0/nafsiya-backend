const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Please provide content'],
    maxlength: 1000,
  },
  isAnonymous: {
    type: Boolean,
    default: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Optional for anonymous replies
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumPost',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Reply', ReplySchema);