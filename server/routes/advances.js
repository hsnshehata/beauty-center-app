// server/routes/advances.js
const express = require('express');
const router = express.Router();
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');
const Advance = require('../models/Advance');
const Employee = require('../models/Employee');

// إضافة سلفة جديدة (للأدمن والمشرف)
router.post('/', authMiddleware, restrictTo('admin', 'supervisor'), async (req, res) => {
  try {
    const { employeeId, amount } = req.body;

    if (!employeeId || !amount) {
      return res.status(400).json({ message: 'اسم الموظف والمبلغ مطلوبين' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(400).json({ message: 'الموظف غير موجود' });
    }

    const advance = new Advance({
      employeeId,
      amount,
      createdBy: req.user.userId,
    });
    await advance.save();

    res.status(201).json({ message: 'تم إنشاء السلفة بنجاح', advance });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

// عرض كل السلف
router.get('/', authMiddleware, restrictTo('admin', 'supervisor'), async (req, res) => {
  try {
    const advances = await Advance.find()
      .populate('employeeId', 'name')
      .populate('createdBy', 'username');
    res.json(advances);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

module.exports = router;