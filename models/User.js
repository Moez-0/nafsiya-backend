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
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: true,
  },
  studentId: {
    type: String,
    required: [true, 'Please provide student ID'],
    unique: true,
  },
  phone: {
    type: String,
    required: [true, 'Please provide phone number'],
  },
  graduationYear: {
    type: Number,
    required: [true, 'Please provide graduation year'],
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
    darkMode: {
      type: Boolean,
      default: false
    },
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      app: {
        type: Boolean,
        default: true
      },
      reminders: {
        type: Boolean,
        default: false
      },
      updates: {
        type: Boolean,
        default: true
      }
    }
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

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};


// Generate verification token
UserSchema.methods.getVerificationToken = function() {
    const verificationToken = crypto.randomBytes(20).toString('hex');
  
    // Hash token and set to verificationToken field
    this.verificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
  
    // Set expire (10 minutes)
    this.verificationTokenExpires = Date.now() + 10 * 60 * 1000;
    console.log(verificationToken);
    return this.verificationToken;
  };
  
  // Generate and hash password token
  UserSchema.methods.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString('hex');
  
    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
  
    // Set expire (10 minutes)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  
    return resetToken;
  };
  
  // Sign JWT and return
  UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });
  };
module.exports = mongoose.model('User', UserSchema);