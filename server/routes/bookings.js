// server/routes/bookings.js
const express = require('express');
const router = express.Router();
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');
const Booking = require('../models/Booking');
const Package = require('../models/Package');
const PackageService = require('../models/PackageService');

router.post('/', authMiddleware, restrictTo('admin', 'supervisor'), async (req, res) => {
  try {
    const {
      packageId,
      hennaPackageId,
      photoPackageId,
      returnedServices,
      additionalService,
      clientName,
      clientPhone,
      city,
      eventDate,
      hennaDate,
      hairStraightening,
      hairStraighteningPrice,
      hairStraighteningDate,
    } = req.body;

    // التحقق من الحقول المطلوبة
    if (!packageId || !clientName || !clientPhone || !city || !eventDate) {
      return res.status(400).json({ message: 'كل الحقول الأساسية مطلوبة' });
    }

    // التحقق من وجود الباكدج الرئيسي
    const package = await Package.findById(packageId).populate('services');
    if (!package) {
      return res.status(400).json({ message: 'الباكدج الرئيسي غير موجود' });
    }

    // حساب الإجمالي
    let totalPrice = package.price;

    // إضافة باكدج الحنة لو موجود
    if (hennaPackageId) {
      const hennaPackage = await Package.findById(hennaPackageId);
      if (!hennaPackage || hennaPackage.type !== 'makeup') {
        return res.status(400).json({ message: 'باكدج الحنة غير صالح' });
      }
      totalPrice += hennaPackage.price;
    }

    // إضافة باكدج التصوير لو موجود
    if (photoPackageId) {
      const photoPackage = await Package.findById(photoPackageId);
      if (!photoPackage || photoPackage.type !== 'photo') {
        return res.status(400).json({ message: 'باكدج التصوير غير صالح' });
      }
      totalPrice += photoPackage.price;
    }

    // خصم المرتجعات لو موجودة
    if (returnedServices && returnedServices.length > 0) {
      for (const returned of returnedServices) {
        const service = await PackageService.findById(returned.serviceId);
        if (!service) {
          return res.status(400).json({ message: `الخدمة المرتجعة ${returned.serviceId} غير موجودة` });
        }
        // التحقق من إن الخدمة المرتجعة موجودة في الباكدج
        if (!package.services.some(s => s._id.toString() === returned.serviceId)) {
          return res.status(400).json({ message: `الخدمة ${returned.serviceId} غير موجودة في الباكدج المختار` });
        }
        totalPrice -= parseFloat(returned.price) || service.price;
      }
    }

    // إضافة خدمة إضافية لو موجودة
    if (additionalService && additionalService.serviceId) {
      const service = await PackageService.findById(additionalService.serviceId);
      if (!service) {
        return res.status(400).json({ message: 'الخدمة الإضافية غير موجودة' });
      }
      totalPrice += parseFloat(additionalService.price) || service.price;
    }

    // إضافة فرد الشعر لو موجود
    if (hairStraightening && hairStraighteningPrice) {
      totalPrice += parseFloat(hairStraighteningPrice);
    }

    // إنشاء الحجز
    const booking = new Booking({
      packageId,
      hennaPackageId,
      photoPackageId,
      returnedServices,
      additionalService,
      clientName,
      clientPhone,
      city,
      eventDate,
      hennaDate,
      hairStraightening,
      hairStraighteningPrice,
      hairStraighteningDate,
      totalPrice,
      createdBy: req.user.userId,
    });

    await booking.save();

    res.status(201).json({ message: 'تم إنشاء الحجز بنجاح', booking });
  } catch (error) {
    console.error(error); // لتسجيل الإيرور في الـ server logs
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

// عرض حجوزات اليوم
router.get('/today', authMiddleware, restrictTo('admin', 'supervisor', 'worker'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const bookings = await Booking.find({
      $or: [
        { eventDate: { $gte: today, $lt: tomorrow } },
        { hennaDate: { $gte: today, $lt: tomorrow } },
        { hairStraighteningDate: { $gte: today, $lt: tomorrow } },
      ],
    })
      .populate('packageId', 'name price type services')
      .populate('hennaPackageId', 'name price')
      .populate('photoPackageId', 'name price')
      .populate('returnedServices.serviceId', 'name price')
      .populate('additionalService.serviceId', 'name price')
      .populate('createdBy', 'username');

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

// عرض كل الحجوزات مع باجينيشن
router.get('/', authMiddleware, restrictTo('admin', 'supervisor'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('packageId', 'name price type services')
      .populate('hennaPackageId', 'name price')
      .populate('photoPackageId', 'name price')
      .populate('returnedServices.serviceId', 'name price')
      .populate('additionalService.serviceId', 'name price')
      .populate('createdBy', 'username');

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

// البحث في الحجوزات
router.get('/search', authMiddleware, restrictTo('admin', 'supervisor'), async (req, res) => {
  try {
    const { clientName, clientPhone, eventDate } = req.query;
    const query = {};

    if (clientName) {
      query.clientName = { $regex: clientName, $options: 'i' };
    }
    if (clientPhone) {
      query.clientPhone = { $regex: clientPhone, $options: 'i' };
    }
    if (eventDate) {
      const start = new Date(eventDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 1);
      query.eventDate = { $gte: start, $lt: end };
    }

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('packageId', 'name price type services')
      .populate('hennaPackageId', 'name price')
      .populate('photoPackageId', 'name price')
      .populate('returnedServices.serviceId', 'name price')
      .populate('additionalService.serviceId', 'name price')
      .populate('createdBy', 'username');

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

// جلب بيانات الوصل للطباعة
router.get('/:id/receipt', authMiddleware, restrictTo('admin', 'supervisor', 'worker'), async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('packageId', 'name price type services')
      .populate('hennaPackageId', 'name price')
      .populate('photoPackageId', 'name price')
      .populate('returnedServices.serviceId', 'name price')
      .populate('additionalService.serviceId', 'name price')
      .populate('createdBy', 'username');

    if (!booking) {
      return res.status(404).json({ message: 'الحجز غير موجود' });
    }

    const receipt = {
      clientName: booking.clientName,
      clientPhone: booking.clientPhone,
      city: booking.city,
      eventDate: booking.eventDate.toISOString().split('T')[0],
      package: {
        name: booking.packageId.name,
        price: booking.packageId.price,
      },
      hennaPackage: booking.hennaPackageId ? {
        name: booking.hennaPackageId.name,
        price: booking.hennaPackageId.price,
        date: booking.hennaDate ? booking.hennaDate.toISOString().split('T')[0] : null,
      } : null,
      photoPackage: booking.photoPackageId ? {
        name: booking.photoPackageId.name,
        price: booking.photoPackageId.price,
      } : null,
      returnedServices: booking.returnedServices.map(rs => ({
        name: rs.serviceId.name,
        price: rs.price,
      })),
      additionalService: booking.additionalService?.serviceId ? {
        name: booking.additionalService.serviceId.name,
        price: booking.additionalService.price,
      } : null,
      hairStraightening: booking.hairStraightening ? {
        price: booking.hairStraighteningPrice,
        date: booking.hairStraighteningDate ? booking.hairStraighteningDate.toISOString().split('T')[0] : null,
      } : null,
      totalPrice: booking.totalPrice,
      createdBy: booking.createdBy.username,
      createdAt: booking.createdAt.toISOString().split('T')[0],
    };

    res.json(receipt);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

module.exports = router;