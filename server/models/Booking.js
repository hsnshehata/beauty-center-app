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
    required: false,
  },
  photoPackageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: false,
  },
  returnedServices: [{
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    price: Number,
  }],
  additionalService: {
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    price: Number,
  },
  clientName: {
    type: String,
    required: true,
  },
  clientPhone: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  eventDate: {
    type: Date,
    required: true,
  },
  hennaDate: {
    type: Date,
    required: false,
  },
  hairStraightening: {
    type: Boolean,
    default: false,
  },
  hairStraighteningPrice: {
    type: Number,
    required: false,
  },
  hairStraighteningDate: {
    type: Date,
    required: false,
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