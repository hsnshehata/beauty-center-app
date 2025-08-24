// server/routes/services.js
const express = require('express');
const router = express.Router();
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');
const Service = require('../models/Service');
const ServiceExecution = require('../models/ServiceExecution');
const Employee = require('../models/Employee');
const User = require('../models/User');
const WorkerPoints = require('../models/WorkerPoints');

// إضافة خدمة فورية جديدة (للأدمن بس)
router.post('/', authMiddleware, restrictTo('admin'), async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: 'الاسم والسعر مطلوبين' });
    }

    const service = new Service({ name, price });
    await service.save();

    res.status(201).json({ message: 'تم إنشاء الخدمة بنجاح', service });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

// عرض كل الخدمات الفورية
router.get('/', authMiddleware, restrictTo('admin', 'supervisor', 'worker'), async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

// إضافة خدمة منفذة (للأدمن والمشرف)
router.post('/execute', authMiddleware, restrictTo('admin', 'supervisor'), async (req, res) => {
  try {
    const { serviceId, employeeId, price } = req.body;

    if (!serviceId || !employeeId || !price) {
      return res.status(400).json({ message: 'الخدمة، الموظف، والسعر مطلوبين' });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(400).json({ message: 'الخدمة غير موجودة' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(400).json({ message: 'الموظف غير موجود' });
    }

    const serviceExecution = new ServiceExecution({
      serviceId,
      employeeId,
      price,
      createdBy: req.user.userId,
    });
    await serviceExecution.save();

    res.status(201).json({ message: 'تم تسجيل الخدمة المنفذة بنجاح', serviceExecution });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

// عرض كل الخدمات المنفذة
router.get('/execute', authMiddleware, restrictTo('admin', 'supervisor', 'worker'), async (req, res) => {
  try {
    const executions = await ServiceExecution.find()
      .populate('serviceId', 'name price')
      .populate('employeeId', 'name')
      .populate('createdBy', 'username')
      .populate('executedBy', 'username');
    res.json(executions);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

// تنفيذ خدمة فورية
router.post('/execute/:id', authMiddleware, restrictTo('worker'), async (req, res) => {
  try {
    const execution = await ServiceExecution.findById(req.params.id);
    if (!execution) {
      return res.status(404).json({ message: 'الخدمة غير موجودة' });
    }
    if (execution.executionStatus !== 'pending') {
      return res.status(400).json({ message: 'الخدمة تم تنفيذها أو قيد التنفيذ' });
    }

    execution.executionStatus = 'in_progress';
    execution.executedBy = req.user.userId;
    await execution.save();

    res.json({ message: 'تم بدء تنفيذ الخدمة' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

module.exports = router;