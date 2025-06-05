const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  specialist: {
    type: mongoose.Schema.ObjectId,
    ref: 'Specialist'
  },
  sessionType: {
    type: String,
    enum: ['single', 'monthly', 'student'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  pricePerSession: {
    type: Number,
    required: function() { return this.specialist; }
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'completed', 'canceled', 'package'],
    default: 'pending'
  },
  scheduledDate: {
    type: Date
  },
  meetingLink: {
    type: String
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster querying
BookingSchema.index({ user: 1 });
BookingSchema.index({ specialist: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ scheduledDate: 1 });

module.exports = mongoose.model('Booking', BookingSchema);