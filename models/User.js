const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide first name'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Please provide last name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 8,
    select: false,
  },
  isNonStudent: {
    type: Boolean,
    default: false
  },
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',

    default: null, // allows null for non-students
  },
  studentId: {
    type: String,

    unique: true,
    default: null, // allows null for non-students
  },
  phone: {
    type: String,
    required: [true, 'Please provide phone number'],
  },
  graduationYear: {
    type: Number,

    default: null, // allows null for non-students
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  preferences: {
    darkMode: { type: Boolean, default: false },
    language: { type: String, default: 'en' },
    notifications: {
      email: { type: Boolean, default: true },
      app: { type: Boolean, default: true },
      reminders: { type: Boolean, default: false },
      updates: { type: Boolean, default: true }
    }
  },
  role: {
    type: String,
    enum: ['user', 'specialist', 'admin'],
    default: 'user'
  },
  bio: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Verification token
UserSchema.methods.getVerificationToken = function() {
  const verificationToken = crypto.randomBytes(20).toString('hex');
  this.verificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  this.verificationTokenExpires = Date.now() + 10 * 60 * 1000;
  return this.verificationToken;
};

// Reset password token
UserSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

// JWT
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

module.exports = mongoose.model('User', UserSchema);
