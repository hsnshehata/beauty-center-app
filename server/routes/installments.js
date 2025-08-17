// server/routes/installments.js
const express = require('express');
const router = express.Router();
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');
const Installment = require('../models/Installment');
const Booking = require('../models/Booking');

// إضافة قسط جديد (للأدمن والمشرف)
router.post('/', authMiddleware, restrictTo('admin', 'supervisor'), async (req, res) => {
  try {
    const { bookingId, amount } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({ message: 'معرف الحجز والمبلغ مطلوبين' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(400).json({ message: 'الحجز غير موجود' });
    }

    const installment = new Installment({
      bookingId,
      amount: parseFloat(amount),
      createdBy: req.user.userId,
    });
    await installment.save();

    res.status(201).json({ message: 'تم إنشاء القسط بنجاح', installment });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

// عرض أقساط حجز معين
router.get('/booking/:bookingId', authMiddleware, restrictTo('admin', 'supervisor'), async (req, res) => {
  try {
    const { bookingId } = req.params;
    const installments = await Installment.find({ bookingId })
      .populate('bookingId', 'clientName')
      .populate('createdBy', 'username');
    res.json(installments);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

module.exports = router;