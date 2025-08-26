// server/routes/services.js
const express = require('express');
const router = express.Router();
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');
const Service = require('../models/Service');
const ServiceExecution = require('../models/ServiceExecution');
const Employee = require('../models/Employee');
const User = require('../models/User');
const WorkerPoints = require('../models/WorkerPoints');

// إضافة خدمة فورية جديدة
router.post('/', authMiddleware, restrictTo('admin'), async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: 'الاسم والسعر مطلوبين' });
    }

    const service = new Service({
      name,
      price: parseFloat(price),
      createdBy: req.user.userId,
    });
    await service.save();

    res.status(201).json({ message: 'تم إنشاء الخدمة بنجاح', service });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

// جلب كل الخدمات الفورية
router.get('/', authMiddleware, restrictTo('admin', 'supervisor', 'worker'), async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

// تعديل خدمة فورية
router.put('/:id', authMiddleware, restrictTo('admin', 'supervisor'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: 'الاسم والسعر مطلوبين' });
    }

    const service = await Service.findByIdAndUpdate(
      id,
      { name, price: parseFloat(price) },
      { new: true }
    );
    if (!service) {
      return res.status(404).json({ message: 'الخدمة غير موجودة' });
    }

    res.json({ message: 'تم تعديل الخدمة بنجاح', service });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

// حذف خدمة فورية
router.delete('/:id', authMiddleware, restrictTo('admin', 'supervisor'), async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByIdAndDelete(id);
    if (!service) {
      return res.status(404).json({ message: 'الخدمة غير موجودة' });
    }
    res.json({ message: 'تم حذف الخدمة بنجاح' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

// تسجيل خدمة منفذة
router.post('/execute', authMiddleware, restrictTo('admin', 'supervisor'), async (req, res) => {
  try {
    const { serviceIds, employeeId, price } = req.body;

    console.log('Received payload:', { serviceIds, employeeId, price });

    if (!serviceIds || !serviceIds.length || !employeeId || !price || price <= 0) {
      return res.status(400).json({ message: 'الخدمات، الموظف، والسعر الصحيح مطلوبين' });
    }

    // التحقق من الخدمات
    const services = await Service.find({ _id: { $in: serviceIds } });
    if (services.length !== serviceIds.length) {
      return res.status(400).json({ message: 'بعض الخدمات غير موجودة' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(400).json({ message: 'الموظف غير موجود' });
    }

    // توليد receiptNumber
    let receiptNumber;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      receiptNumber = Math.floor(100000 + Math.random() * 900000).toString();
      const existingExecution = await ServiceExecution.findOne({ receiptNumber }).exec();
      if (!existingExecution) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new Error('تعذر توليد رقم وصل فريد بعد عدة محاولات');
    }

    const serviceExecution = new ServiceExecution({
      serviceIds,
      employeeId,
      price: parseFloat(price),
      createdBy: req.user.userId,
      executionStatus: 'pending',
      receiptNumber,
    });

    await serviceExecution.save();

    console.log('Service execution created:', {
      _id: serviceExecution._id,
      serviceIds: serviceExecution.serviceIds,
      employeeId: serviceExecution.employeeId,
      price: serviceExecution.price,
      receiptNumber: serviceExecution.receiptNumber,
      executionStatus: serviceExecution.executionStatus,
    });

    res.status(201).json({ message: 'تم تسجيل الخدمة المنفذة بنجاح', serviceExecution });
  } catch (error) {
    console.error('Error executing service:', error);
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

// جلب الخدمات المنفذة
router.get('/execute', authMiddleware, restrictTo('admin', 'supervisor', 'worker'), async (req, res) => {
  try {
    const executions = await ServiceExecution.find()
      .populate('serviceIds', 'name price')
      .populate('employeeId', 'name')
      .populate('createdBy', 'username')
      .populate('executedBy', 'username');
    console.log('Fetched executions:', executions);
    res.json(executions);
  } catch (error) {
    console.error('Error fetching executions:', error);
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

// حذف خدمة منفذة
router.delete('/execute/:id', authMiddleware, restrictTo('admin', 'supervisor'), async (req, res) => {
  try {
    const { id } = req.params;
    const execution = await ServiceExecution.findByIdAndDelete(id);
    if (!execution) {
      return res.status(404).json({ message: 'الخدمة المنفذة غير موجودة' });
    }
    res.json({ message: 'تم حذف الخدمة المنفذة بنجاح' });
  } catch (error) {
    console.error('Error deleting execution:', error);
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

// تنفيذ خدمة منفذة بواسطة الموظف
router.post('/execute/:id', authMiddleware, restrictTo('worker'), async (req, res) => {
  try {
    const execution = await ServiceExecution.findById(req.params.id);
    if (!execution) {
      return res.status(404).json({ message: 'الخدمة غير موجودة' });
    }
    if (execution.executionStatus !== 'pending') {
      return res.status(400).json({ message: 'الخدمة تم تنفيذها أو قيد التنفيذ' });
    }

    execution.executionStatus = 'completed';
    execution.executedBy = req.user.userId;
    await execution.save();

    // إضافة النقاط
    const user = await User.findById(req.user.userId);
    if (user) {
      user.points += execution.price;
      await user.save();

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      await WorkerPoints.findOneAndUpdate(
        { userId: user._id, month: currentMonth, year: currentYear },
        { $inc: { points: execution.price }, $push: { services: { serviceIds: execution.serviceIds, price: execution.price, executedAt: new Date() } } },
        { upsert: true }
      );
    }

    res.json({ message: 'تم تنفيذ الخدمة بنجاح' });
  } catch (error) {
    console.error('Error executing service:', error);
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

// جلب وصل الخدمة المنفذة
router.get('/receipt/:id', authMiddleware, restrictTo('admin', 'supervisor', 'worker'), async (req, res) => {
  try {
    const { id } = req.params;
    const execution = await ServiceExecution.findById(id)
      .populate('serviceIds', 'name price')
      .populate('employeeId', 'name')
      .populate('createdBy', 'username')
      .populate('executedBy', 'username');

    if (!execution) {
      return res.status(404).json({ message: 'الخدمة المنفذة غير موجودة' });
    }

    const receipt = {
      receiptNumber: execution.receiptNumber || '',
      services: execution.serviceIds?.length > 0
        ? execution.serviceIds.map(s => ({
            name: s.name || 'خدمة غير معروفة',
            price: parseFloat(s.price) || 0,
          }))
        : [],
      employee: execution.employeeId?.name || 'غير محدد',
      price: parseFloat(execution.price) || 0,
      status: execution.executionStatus || 'pending',
      executedBy: execution.executedBy?.username || 'غير محدد',
      createdBy: execution.createdBy?.username || 'غير محدد',
      createdAt: execution.createdAt ? execution.createdAt.toLocaleDateString('ar-EG') : 'غير محدد',
    };

    console.log('Service receipt:', receipt);

    res.json(receipt);
  } catch (error) {
    console.error('Error fetching service receipt:', error);
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

// جلب خدمة منفذة برقم الوصل
router.get('/execute/:receiptNumber', authMiddleware, restrictTo('worker'), async (req, res) => {
  try {
    const execution = await ServiceExecution.findOne({ receiptNumber: req.params.receiptNumber })
      .populate('serviceIds', 'name price')
      .populate('employeeId', 'name')
      .populate('executedBy', 'username');
    if (!execution) {
      return res.status(404).json({ message: 'الخدمة غير موجودة' });
    }

    res.json([{
      type: 'serviceExecution',
      id: execution._id,
      name: execution.serviceIds?.length > 0
        ? execution.serviceIds.map(s => s.name).join(', ')
        : 'خدمة غير معروفة',
      price: execution.price,
      status: execution.executionStatus,
      executedBy: execution.executedBy,
      receiptNumber: execution.receiptNumber,
    }]);
  } catch (error) {
    console.error('Error fetching execution:', error);
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

module.exports = router;