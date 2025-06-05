const mongoose = require('mongoose');

const SpecialistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  specialization: {
    type: String,
    required: true,
    enum: ['Psychologist', 'Psychiatrist', 'Counselor', 'Therapist']
  },
  qualifications: [{
    degree: String,
    institution: String,
    year: Number
  }],
  languages: [{
    type: String,
    enum: ['Arabic', 'French', 'English', 'German']
  }],
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters']
  },
  experienceYears: {
    type: Number,
    min: 0
  },
  hourlyRate: {
    type: Number,
    required: true,
    min: 30 // Minimum 30 TND per hour
  },
  availability: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    slots: [{
      start: String, // Format: "HH:MM"
      end: String
    }]
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  ratingsAverage: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating must be at most 5'],
    set: val => Math.round(val * 10) / 10
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Populate user data when querying specialists
SpecialistSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'firstName lastName email phone avatar'
  });
  next();
});

// Virtual populate for reviews
SpecialistSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'specialist',
  localField: '_id'
});

module.exports = mongoose.model('Specialist', SpecialistSchema);