// server/routes/packageServices.js
const express = require('express');
const router = express.Router();
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');
const PackageService = require('../models/PackageService');

// إضافة خدمة باكدج جديدة (للأدمن بس)
router.post('/', authMiddleware, restrictTo('admin'), async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: 'الاسم والسعر مطلوبين' });
    }

    const service = new PackageService({ name, price: parseFloat(price) });
    await service.save();

    res.status(201).json({ message: 'تم إنشاء الخدمة بنجاح', service });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

// عرض كل خدمات الباكدجات
router.get('/', authMiddleware, restrictTo('admin', 'supervisor', 'worker'), async (req, res) => {
  try {
    const services = await PackageService.find();
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

// تعديل خدمة باكدج
router.put('/:id', authMiddleware, restrictTo('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: 'الاسم والسعر مطلوبين' });
    }

    const service = await PackageService.findByIdAndUpdate(
      id,
      { name, price: parseFloat(price) },
      { new: true }
    );
    if (!service) {
      return res.status(404).json({ message: 'الخدمة غير موجودة' });
    }

    res.json({ message: 'تم تعديل الخدمة بنجاح', service });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

// حذف خدمة باكدج
router.delete('/:id', authMiddleware, restrictTo('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const service = await PackageService.findByIdAndDelete(id);
    if (!service) {
      return res.status(404).json({ message: 'الخدمة غير موجودة' });
    }
    res.json({ message: 'تم حذف الخدمة بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

module.exports = router;