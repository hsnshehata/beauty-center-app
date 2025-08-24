// server/routes/installments.js
const express = require('express');
const router = express.Router();
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');
const Installment = require('../models/Installment');
const Booking = require('../models/Booking');

router.post('/', authMiddleware, restrictTo('admin', 'supervisor'), async (req, res) => {
  try {
    const { bookingId, amount } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({ message: 'كل الحقول مطلوبة' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'الحجز غير موجود' });
    }

    const installmentAmount = parseFloat(amount);
    if (installmentAmount <= 0) {
      return res.status(400).json({ message: 'المبلغ يجب أن يكون أكبر من صفر' });
    }

    const installment = new Installment({
      bookingId,
      amount: installmentAmount,
    });

    await installment.save();

    // تحديث totalPaid و remainingBalance
    booking.totalPaid = (parseFloat(booking.totalPaid) || 0) + installmentAmount;
    booking.remainingBalance = parseFloat(booking.totalPrice) - parseFloat(booking.totalPaid);
    await booking.save();

    res.status(201).json({ message: 'تم إضافة القسط بنجاح', installment });
  } catch (error) {
    console.error('خطأ في إضافة القسط:', error);
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

router.get('/booking/:bookingId', authMiddleware, restrictTo('admin', 'supervisor', 'worker'), async (req, res) => {
  try {
    const { bookingId } = req.params;

    const installments = await Installment.find({ bookingId }).sort({ createdAt: -1 });
    res.json(installments);
  } catch (error) {
    console.error('خطأ في جلب الأقساط:', error);
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

module.exports = router;