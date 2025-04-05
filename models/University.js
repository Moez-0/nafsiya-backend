const mongoose = require('mongoose');

const UniversitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide university name'],
    unique: true,
  },
  emailDomain: {
    type: String,
    required: [true, 'Please provide email domain'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model('University', UniversitySchema);