const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['post', 'reply', 'resource_view', 'resource_download', 'login', 'mood_update'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  relatedPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumPost'
  },
  relatedReply: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reply'
  },
  relatedResource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  },
  moodValue: {
    type: Number,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Activity', ActivitySchema);