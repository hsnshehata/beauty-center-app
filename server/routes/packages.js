// server/routes/packages.js
const express = require('express');
const router = express.Router();
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');
const Package = require('../models/Package');

// إضافة باكدج جديد (للأدمن بس)
router.post('/', authMiddleware, restrictTo('admin'), async (req, res) => {
  try {
    const { name, price, type } = req.body;

    if (!name || !price || !type) {
      return res.status(400).json({ message: 'كل الحقول مطلوبة' });
    }

    if (!['makeup', 'photo'].includes(type)) {
      return res.status(400).json({ message: 'نوع الباكدج غير صحيح' });
    }

    const package = new Package({ name, price, type, services: [] });
    await package.save();

    res.status(201).json({ message: 'تم إنشاء الباكدج بنجاح', package });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

module.exports = router;