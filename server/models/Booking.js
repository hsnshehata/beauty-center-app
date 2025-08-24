// server/models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true,
  },
  hennaPackageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
  },
  photoPackageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
  },
  returnedServices: [{
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PackageService',
    },
    price: Number,
  }],
  additionalService: {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PackageService',
    },
    price: Number,
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