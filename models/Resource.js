const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: 500,
  },
  content: {
    type: String,
    required: [true, 'Please provide content'],
  },
  category: {
    type: String,
    enum: ['article', 'exercise', 'tool', 'video', 'guide'],
    required: true,
  },
  tags: [String],
  language: {
    type: String,
    enum: ['ar', 'fr', 'en'],
    default: 'ar',
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Resource', ResourceSchema);