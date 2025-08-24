// server/routes/bookings.js
const express = require('express');
const router = express.Router();
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');
const Booking = require('../models/Booking');
const Package = require('../models/Package');
const PackageService = require('../models/PackageService');
const Installment = require('../models/Installment');
const User = require('../models/User');
const WorkerPoints = require('../models/WorkerPoints');

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
      deposit,
    } = req.body;

    if (!packageId || !clientName || !clientPhone || !city || !eventDate) {
      return res.status(400).json({ message: 'كل الحقول الأساسية مطلوبة' });
    }

    const package = await Package.findById(packageId).populate('services');
    if (!package) {
      return res.status(400).json({ message: 'الباكدج الرئيسي غير موجود' });
    }

    let totalPrice = parseFloat(package.price) || 0;

    let hennaPackage = null;
    if (hennaPackageId && hennaPackageId !== '') {
      hennaPackage = await Package.findById(hennaPackageId);
      if (!hennaPackage || hennaPackage.type !== 'makeup') {
        return res.status(400).json({ message: 'باكدج الحنة غير صالح' });
      }
      totalPrice += parseFloat(hennaPackage.price) || 0;
    }

    let photoPackage = null;
    if (photoPackageId && photoPackageId !== '') {
      photoPackage = await Package.findById(photoPackageId);
      if (!photoPackage || photoPackage.type !== 'photo') {
        return res.status(400).json({ message: 'باكدج التصوير غير صالح' });
      }
      totalPrice += parseFloat(photoPackage.price) || 0;
    }

    if (returnedServices && returnedServices.length > 0) {
      for (const returned of returnedServices) {
        const service = await PackageService.findById(returned.serviceId);
        if (!service) {
          return res.status(400).json({ message: `الخدمة المرتجعة ${returned.serviceId} غير موجودة` });
        }
        if (!package.services.some(s => s._id.toString() === returned.serviceId)) {
          return res.status(400).json({ message: `الخدمة ${returned.serviceId} غير موجودة في الباكدج المختار` });
        }
        totalPrice -= parseFloat(returned.price) || parseFloat(service.price) || 0;
      }
    }

    if (additionalService && additionalService.serviceId && additionalService.serviceId !== '') {
      const service = await PackageService.findById(additionalService.serviceId);
      if (!service) {
        return res.status(400).json({ message: 'الخدمة الإضافية غير موجودة' });
      }
      totalPrice += parseFloat(additionalService.price) || parseFloat(service.price) || 0;
    }

    if (hairStraightening && hairStraighteningPrice) {
      totalPrice += parseFloat(hairStraighteningPrice) || 0;
    }

    if (totalPrice < 0) {
      return res.status(400).json({ message: 'السعر الإجمالي لا يمكن أن يكون سالبًا' });
    }

    const depositAmount = parseFloat(deposit) || 0;
    const totalPaid = depositAmount;
    const remainingBalance = totalPrice - totalPaid;

    if (depositAmount > totalPrice) {
      return res.status(400).json({ message: 'العربون لا يمكن أن يكون أكبر من الإجمالي' });
    }

    const booking = new Booking({
      packageId,
      hennaPackageId: hennaPackageId && hennaPackageId !== '' ? hennaPackageId : null,
      photoPackageId: photoPackageId && photoPackageId !== '' ? photoPackageId : null,
      returnedServices: returnedServices || [],
      additionalService: additionalService && additionalService.serviceId && additionalService.serviceId !== '' ? additionalService : null,
      clientName,
      clientPhone,
      city,
      eventDate,
      hennaDate,
      hairStraightening: !!hairStraightening,
      hairStraighteningPrice: parseFloat(hairStraighteningPrice) || 0,
      hairStraighteningDate,
      deposit: depositAmount,
      totalPaid,
      remainingBalance,
      totalPrice,
      createdBy: req.user.userId,
    });

    await booking.save();

    res.status(201).json({ message: 'تم إنشاء الحجز بنجاح', booking });
  } catch (error) {
    console.error('خطأ في إنشاء الحجز:', error);
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

router.put('/:id', authMiddleware, restrictTo('admin', 'supervisor'), async (req, res) => {
  try {
    const { id } = req.params;
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
      deposit,
    } = req.body;

    if (!packageId || !clientName || !clientPhone || !city || !eventDate) {
      return res.status(400).json({ message: 'كل الحقول الأساسية مطلوبة' });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'الحجز غير موجود' });
    }

    const package = await Package.findById(packageId).populate('services');
    if (!package) {
      return res.status(400).json({ message: 'الباكدج الرئيسي غير موجود' });
    }

    let totalPrice = parseFloat(package.price) || 0;

    let hennaPackage = null;
    if (hennaPackageId && hennaPackageId !== '') {
      hennaPackage = await Package.findById(hennaPackageId);
      if (!hennaPackage || hennaPackage.type !== 'makeup') {
        return res.status(400).json({ message: 'باكدج الحنة غير صالح' });
      }
      totalPrice += parseFloat(hennaPackage.price) || 0;
    }

    let photoPackage = null;
    if (photoPackageId && photoPackageId !== '') {
      photoPackage = await Package.findById(photoPackageId);
      if (!photoPackage || photoPackage.type !== 'photo') {
        return res.status(400).json({ message: 'باكدج التصوير غير صالح' });
      }
      totalPrice += parseFloat(photoPackage.price) || 0;
    }

    if (returnedServices && returnedServices.length > 0) {
      for (const returned of returnedServices) {
        const service = await PackageService.findById(returned.serviceId);
        if (!service) {
          return res.status(400).json({ message: `الخدمة المرتجعة ${returned.serviceId} غير موجودة` });
        }
        if (!package.services.some(s => s._id.toString() === returned.serviceId)) {
          return res.status(400).json({ message: `الخدمة ${returned.serviceId} غير موجودة في الباكدج المختار` });
        }
        totalPrice -= parseFloat(returned.price) || parseFloat(service.price) || 0;
      }
    }

    if (additionalService && additionalService.serviceId && additionalService.serviceId !== '') {
      const service = await PackageService.findById(additionalService.serviceId);
      if (!service) {
        return res.status(400).json({ message: 'الخدمة الإضافية غير موجودة' });
      }
      totalPrice += parseFloat(additionalService.price) || parseFloat(service.price) || 0;
    }

    if (hairStraightening && hairStraighteningPrice) {
      totalPrice += parseFloat(hairStraighteningPrice) || 0;
    }

    if (totalPrice < 0) {
      return res.status(400).json({ message: 'السعر الإجمالي لا يمكن أن يكون سالبًا' });
    }

    const depositAmount = parseFloat(deposit) || 0;
    const installments = await Installment.find({ bookingId: id });
    const totalPaid = depositAmount + installments.reduce((sum, inst) => sum + parseFloat(inst.amount || 0), 0);
    const remainingBalance = totalPrice - totalPaid;

    if (depositAmount > totalPrice) {
      return res.status(400).json({ message: 'العربون لا يمكن أن يكون أكبر من الإجمالي' });
    }

    booking.packageId = packageId;
    booking.hennaPackageId = hennaPackageId && hennaPackageId !== '' ? hennaPackageId : null;
    booking.photoPackageId = photoPackageId && photoPackageId !== '' ? photoPackageId : null;
    booking.returnedServices = returnedServices || [];
    booking.additionalService = additionalService && additionalService.serviceId && additionalService.serviceId !== '' ? additionalService : null;
    booking.clientName = clientName;
    booking.clientPhone = clientPhone;
    booking.city = city;
    booking.eventDate = eventDate;
    booking.hennaDate = hennaDate;
    booking.hairStraightening = !!hairStraightening;
    booking.hairStraighteningPrice = parseFloat(hairStraighteningPrice) || 0;
    booking.hairStraighteningDate = hairStraighteningDate;
    booking.deposit = depositAmount;
    booking.totalPaid = totalPaid;
    booking.remainingBalance = remainingBalance;
    booking.totalPrice = totalPrice;

    await booking.save();

    res.json({ message: 'تم تعديل الحجز بنجاح', booking });
  } catch (error) {
    console.error('خطأ في تعديل الحجز:', error);
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

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
      .populate('hennaPackageId', 'name price type')
      .populate('photoPackageId', 'name price type')
      .populate('returnedServices.serviceId', 'name price')
      .populate('additionalService.serviceId', 'name price')
      .populate('createdBy', 'username');

    res.json(bookings);
  } catch (error) {
    console.error('خطأ في جلب الحجوزات:', error);
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

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
      .populate('hennaPackageId', 'name price type')
      .populate('photoPackageId', 'name price type')
      .populate('returnedServices.serviceId', 'name price')
      .populate('additionalService.serviceId', 'name price')
      .populate('createdBy', 'username');

    res.json(bookings);
  } catch (error) {
    console.error('خطأ في جلب الحجوزات:', error);
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

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
      .populate('hennaPackageId', 'name price type')
      .populate('photoPackageId', 'name price type')
      .populate('returnedServices.serviceId', 'name price')
      .populate('additionalService.serviceId', 'name price')
      .populate('createdBy', 'username');

    res.json(bookings);
  } catch (error) {
    console.error('خطأ في البحث عن الحجوزات:', error);
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

router.get('/:id/receipt', authMiddleware, restrictTo('admin', 'supervisor', 'worker'), async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('packageId', 'name price type services')
      .populate('hennaPackageId', 'name price type')
      .populate('photoPackageId', 'name price type')
      .populate('returnedServices.serviceId', 'name price')
      .populate('additionalService.serviceId', 'name price')
      .populate('createdBy', 'username')
      .populate('packageExecutedBy', 'username')
      .populate('hennaPackageExecutedBy', 'username')
      .populate('photoPackageExecutedBy', 'username')
      .populate('additionalService.executedBy', 'username')
      .populate('hairStraighteningExecutedBy', 'username')
      .populate('returnedServices.executedBy', 'username');

    if (!booking) {
      return res.status(404).json({ message: 'الحجز غير موجود' });
    }

    const receipt = {
      clientName: booking.clientName || '',
      clientPhone: booking.clientPhone || '',
      city: booking.city || '',
      eventDate: booking.eventDate ? booking.eventDate.toISOString().split('T')[0] : null,
      package: booking.packageId ? {
        _id: booking.packageId._id || '',
        name: booking.packageId.name || '',
        price: parseFloat(booking.packageId.price) || 0,
        type: booking.packageId.type || '',
      } : null,
      hennaPackage: booking.hennaPackageId ? {
        _id: booking.hennaPackageId._id || '',
        name: booking.hennaPackageId.name || '',
        price: parseFloat(booking.hennaPackageId.price) || 0,
        type: booking.hennaPackageId.type || '',
        date: booking.hennaDate ? booking.hennaDate.toISOString().split('T')[0] : null,
      } : null,
      photoPackage: booking.photoPackageId ? {
        _id: booking.photoPackageId._id || '',
        name: booking.photoPackageId.name || '',
        price: parseFloat(booking.photoPackageId.price) || 0,
        type: booking.photoPackageId.type || '',
      } : null,
      returnedServices: (booking.returnedServices || []).map(rs => ({
        serviceId: rs.serviceId ? {
          _id: rs.serviceId._id || '',
          name: rs.serviceId.name || '',
          price: parseFloat(rs.serviceId.price) || 0,
        } : null,
        price: parseFloat(rs.price) || 0,
        status: rs.status || 'pending',
        executedBy: rs.executedBy ? { username: rs.executedBy.username || '' } : null,
      })),
      additionalService: booking.additionalService && booking.additionalService.serviceId ? {
        serviceId: {
          _id: booking.additionalService.serviceId._id || '',
          name: booking.additionalService.serviceId.name || '',
          price: parseFloat(booking.additionalService.serviceId.price) || 0,
        },
        price: parseFloat(booking.additionalService.price) || 0,
        status: booking.additionalService.status || 'pending',
        executedBy: booking.additionalService.executedBy ? { username: booking.additionalService.executedBy.username || '' } : null,
      } : null,
      hairStraightening: !!booking.hairStraightening,
      hairStraighteningPrice: parseFloat(booking.hairStraighteningPrice) || 0,
      hairStraighteningDate: booking.hairStraighteningDate ? booking.hairStraighteningDate.toISOString().split('T')[0] : null,
      hairStraighteningStatus: booking.hairStraighteningStatus || 'pending',
      hairStraighteningExecutedBy: booking.hairStraighteningExecutedBy ? { username: booking.hairStraighteningExecutedBy.username || '' } : null,
      deposit: parseFloat(booking.deposit) || 0,
      totalPaid: parseFloat(booking.totalPaid) || 0,
      remainingBalance: parseFloat(booking.remainingBalance) || 0,
      totalPrice: parseFloat(booking.totalPrice) || 0,
      createdBy: booking.createdBy ? booking.createdBy.username || '' : '',
      createdAt: booking.createdAt ? booking.createdAt.toISOString().split('T')[0] : null,
    };

    res.json(receipt);
  } catch (error) {
    console.error('خطأ في جلب الوصل:', error);
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

router.delete('/:id', authMiddleware, restrictTo('admin', 'supervisor'), async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndDelete(id);
    if (!booking) {
      return res.status(404).json({ message: 'الحجز غير موجود' });
    }
    res.json({ message: 'تم حذف الحجز بنجاح' });
  } catch (error) {
    console.error('خطأ في حذف الحجز:', error);
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

// تنفيذ خدمة في الحجز
router.post('/:id/execute', authMiddleware, restrictTo('worker'), async (req, res) => {
  try {
    const { serviceType, serviceIndex } = req.body; // serviceType: 'package', 'hennaPackage', 'photoPackage', 'additionalService', 'hairStraightening', 'returnedService'
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'الحجز غير موجود' });
    }

    let price = 0;
    if (serviceType === 'package') {
      if (booking.packageStatus !== 'pending') {
        return res.status(400).json({ message: 'الخدمة تم تنفيذها أو قيد التنفيذ' });
      }
      booking.packageStatus = 'in_progress';
      booking.packageExecutedBy = req.user.userId;
      price = booking.packageId.price;
    } else if (serviceType === 'hennaPackage') {
      if (!booking.hennaPackageId || booking.hennaPackageStatus !== 'pending') {
        return res.status(400).json({ message: 'الخدمة غير موجودة أو تم تنفيذها' });
      }
      booking.hennaPackageStatus = 'in_progress';
      booking.hennaPackageExecutedBy = req.user.userId;
      price = booking.hennaPackageId.price;
    } else if (serviceType === 'photoPackage') {
      if (!booking.photoPackageId || booking.photoPackageStatus !== 'pending') {
        return res.status(400).json({ message: 'الخدمة غير موجودة أو تم تنفيذها' });
      }
      booking.photoPackageStatus = 'in_progress';
      booking.photoPackageExecutedBy = req.user.userId;
      price = booking.photoPackageId.price;
    } else if (serviceType === 'additionalService') {
      if (!booking.additionalService || booking.additionalService.status !== 'pending') {
        return res.status(400).json({ message: 'الخدمة غير موجودة أو تم تنفيذها' });
      }
      booking.additionalService.status = 'in_progress';
      booking.additionalService.executedBy = req.user.userId;
      price = booking.additionalService.price;
    } else if (serviceType === 'hairStraightening') {
      if (!booking.hairStraightening || booking.hairStraighteningStatus !== 'pending') {
        return res.status(400).json({ message: 'الخدمة غير موجودة أو تم تنفيذها' });
      }
      booking.hairStraighteningStatus = 'in_progress';
      booking.hairStraighteningExecutedBy = req.user.userId;
      price = booking.hairStraighteningPrice;
    } else if (serviceType === 'returnedService') {
      if (!booking.returnedServices[serviceIndex] || booking.returnedServices[serviceIndex].status !== 'pending') {
        return res.status(400).json({ message: 'الخدمة غير موجودة أو تم تنفيذها' });
      }
      booking.returnedServices[serviceIndex].status = 'in_progress';
      booking.returnedServices[serviceIndex].executedBy = req.user.userId;
      price = booking.returnedServices[serviceIndex].price;
    } else {
      return res.status(400).json({ message: 'نوع الخدمة غير صالح' });
    }

    await booking.save();
    res.json({ message: 'تم بدء تنفيذ الخدمة' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

// جلب خدمات الحجز
router.get('/:id/services', authMiddleware, restrictTo('worker'), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('packageId', 'name price')
      .populate('hennaPackageId', 'name price')
      .populate('photoPackageId', 'name price')
      .populate('returnedServices.serviceId', 'name')
      .populate('additionalService.serviceId', 'name')
      .populate('packageExecutedBy', 'username')
      .populate('hennaPackageExecutedBy', 'username')
      .populate('photoPackageExecutedBy', 'username')
      .populate('additionalService.executedBy', 'username')
      .populate('hairStraighteningExecutedBy', 'username')
      .populate('returnedServices.executedBy', 'username');

    if (!booking) {
      return res.status(404).json({ message: 'الحجز غير موجود' });
    }

    const services = [];
    if (booking.packageId) {
      services.push({
        type: 'package',
        name: booking.packageId.name,
        price: booking.packageId.price,
        status: booking.packageStatus,
        executedBy: booking.packageExecutedBy,
        bookingId: booking._id,
      });
    }
    if (booking.hennaPackageId) {
      services.push({
        type: 'hennaPackage',
        name: booking.hennaPackageId.name,
        price: booking.hennaPackageId.price,
        status: booking.hennaPackageStatus,
        executedBy: booking.hennaPackageExecutedBy,
        bookingId: booking._id,
      });
    }
    if (booking.photoPackageId) {
      services.push({
        type: 'photoPackage',
        name: booking.photoPackageId.name,
        price: booking.photoPackageId.price,
        status: booking.photoPackageStatus,
        executedBy: booking.photoPackageExecutedBy,
        bookingId: booking._id,
      });
    }
    if (booking.additionalService && booking.additionalService.serviceId) {
      services.push({
        type: 'additionalService',
        name: booking.additionalService.serviceId.name,
        price: booking.additionalService.price,
        status: booking.additionalService.status,
        executedBy: booking.additionalService.executedBy,
        bookingId: booking._id,
      });
    }
    if (booking.hairStraightening) {
      services.push({
        type: 'hairStraightening',
        name: 'فرد الشعر',
        price: booking.hairStraighteningPrice,
        status: booking.hairStraighteningStatus,
        executedBy: booking.hairStraighteningExecutedBy,
        bookingId: booking._id,
      });
    }
    booking.returnedServices.forEach((rs, index) => {
      if (rs.serviceId) {
        services.push({
          type: 'returnedService',
          index,
          name: rs.serviceId.name,
          price: rs.price,
          status: rs.status,
          executedBy: rs.executedBy,
          bookingId: booking._id,
        });
      }
    });

    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

module.exports = router;