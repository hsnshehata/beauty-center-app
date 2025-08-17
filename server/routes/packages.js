// server/routes/packages.js
const express = require('express');
const router = express.Router();
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');
const Package = require('../models/Package');
const PackageService = require('../models/PackageService');

// إضافة باكدج جديد (للأدمن بس)
router.post('/', authMiddleware, restrictTo('admin'), async (req, res) => {
  try {
    const { name, price, type, services } = req.body;

    if (!name || !price || !type) {
      return res.status(400).json({ message: 'الاسم، السعر، والنوع مطلوبين' });
    }

    if (services && services.length > 0) {
      for (const serviceId of services) {
        const service = await PackageService.findById(serviceId);
        if (!service) {
          return res.status(400).json({ message: `الخدمة ${serviceId} غير موجودة` });
        }
      }
    }

    const pkg = new Package({ name, price, type, services });
    await pkg.save();

    res.status(201).json({ message: 'تم إنشاء الباكدج بنجاح', package: pkg });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

// عرض كل الباكدجات
router.get('/', authMiddleware, restrictTo('admin', 'supervisor', 'worker'), async (req, res) => {
  try {
    const packages = await Package.find().populate('services', 'name price');
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

// تعديل باكدج
router.put('/:id', authMiddleware, restrictTo('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, type, services } = req.body;

    if (!name || !price || !type) {
      return res.status(400).json({ message: 'الاسم، السعر، والنوع مطلوبين' });
    }

    if (services && services.length > 0) {
      for (const serviceId of services) {
        const service = await PackageService.findById(serviceId);
        if (!service) {
          return res.status(400).json({ message: `الخدمة ${serviceId} غير موجودة` });
        }
      }
    }

    const pkg = await Package.findByIdAndUpdate(
      id,
      { name, price, type, services },
      { new: true }
    );
    if (!pkg) {
      return res.status(404).json({ message: 'الباكدج غير موجود' });
    }

    res.json({ message: 'تم تعديل الباكدج بنجاح', package: pkg });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

// حذف باكدج
router.delete('/:id', authMiddleware, restrictTo('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const pkg = await Package.findByIdAndDelete(id);
    if (!pkg) {
      return res.status(404).json({ message: 'الباكدج غير موجود' });
    }
    res.json({ message: 'تم حذف الباكدج بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

module.exports = router;