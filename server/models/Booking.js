// server/models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true,
  },
  packageStatus: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending',
  },
  packageExecutedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  hennaPackageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
  },
  hennaPackageStatus: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending',
  },
  hennaPackageExecutedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  photoPackageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
  },
  photoPackageStatus: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending',
  },
  photoPackageExecutedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  returnedServices: [{
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PackageService',
    },
    price: Number,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },
    executedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
  additionalService: {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PackageService',
    },
    price: Number,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },
    executedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  clientName: {
    type: String,
    required: true,
    trim: true,
  },
  clientPhone: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  eventDate: {
    type: Date,
    required: true,
  },
  hennaDate: {
    type: Date,
  },
  hairStraightening: {
    type: Boolean,
    default: false,
  },
  hairStraighteningPrice: {
    type: Number,
    default: 0,
  },
  hairStraighteningDate: {
    type: Date,
  },
  hairStraighteningStatus: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending',
  },
  hairStraighteningExecutedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  deposit: {
    type: Number,
    default: 0,
  },
  totalPaid: {
    type: Number,
    default: 0,
  },
  remainingBalance: {
    type: Number,
    default: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Booking', bookingSchema);