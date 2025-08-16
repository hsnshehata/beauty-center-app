// server/routes/expenses.js
const express = require('express');
const router = express.Router();
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');
const Expense = require('../models/Expense');

// إضافة مصروف جديد (للأدمن والمشرف)
router.post('/', authMiddleware, restrictTo('admin', 'supervisor'), async (req, res) => {
  try {
    const { details, amount } = req.body;

    if (!details || !amount) {
      return res.status(400).json({ message: 'التفاصيل والمبلغ مطلوبين' });
    }

    const expense = new Expense({
      details,
      amount,
      createdBy: req.user.userId,
    });
    await expense.save();

    res.status(201).json({ message: 'تم إنشاء المصروف بنجاح', expense });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

// عرض كل المصروفات
router.get('/', authMiddleware, restrictTo('admin', 'supervisor'), async (req, res) => {
  try {
    const expenses = await Expense.find().populate('createdBy', 'username');
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

module.exports = router;