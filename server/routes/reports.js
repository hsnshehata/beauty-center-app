// server/routes/reports.js
const express = require('express');
const router = express.Router();
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Expense = require('../models/Expense');
const Advance = require('../models/Advance');

// التقارير اليومية
router.get('/daily', authMiddleware, restrictTo('admin', 'supervisor'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // الحجوزات اليوم
    const bookings = await Booking.find({
      $or: [
        { eventDate: { $gte: today, $lt: tomorrow } },
        { hennaDate: { $gte: today, $lt: tomorrow } },
        { hairStraighteningDate: { $gte: today, $lt: tomorrow } },
      ],
    })
      .populate('packageId', 'name price type')
      .populate('hennaPackageId', 'name price')
      .populate('photoPackageId', 'name price')
      .populate('returnedServices.serviceId', 'name price')
      .populate('additionalService.serviceId', 'name price')
      .populate('createdBy', 'username');

    // الخدمات الفورية اليوم (افترض إن الخدمات الفورية ليها مودل منفصل لتسجيلها)
    const services = await Service.find({ createdAt: { $gte: today, $lt: tomorrow } });

    // المصروفات اليوم
    const expenses = await Expense.find({ createdAt: { $gte: today, $lt: tomorrow } })
      .populate('createdBy', 'username');

    // السلف اليوم
    const advances = await Advance.find({ createdAt: { $gte: today, $lt: tomorrow } })
      .populate('employeeId', 'name')
      .populate('createdBy', 'username');

    // ملخص للأدمن
    const summary = req.user.role === 'admin' ? {
      totalBookings: bookings.reduce((sum, booking) => sum + booking.totalPrice, 0),
      totalServices: services.reduce((sum, service) => sum + service.price, 0),
      totalExpenses: expenses.reduce((sum, expense) => sum + expense.amount, 0),
      totalAdvances: advances.reduce((sum, advance) => sum + advance.amount, 0),
      net: bookings.reduce((sum, booking) => sum + booking.totalPrice, 0) +
            services.reduce((sum, service) => sum + service.price, 0) -
            expenses.reduce((sum, expense) => sum + expense.amount, 0) -
            advances.reduce((sum, advance) => sum + advance.amount, 0),
    } : null;

    res.json({
      bookings,
      services,
      expenses,
      advances,
      summary,
    });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

module.exports = router;