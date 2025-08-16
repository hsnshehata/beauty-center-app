// server/routes/employees.js
const express = require('express');
const router = express.Router();
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');
const Employee = require('../models/Employee');

// إضافة موظف جديد (للأدمن والمشرف)
router.post('/', authMiddleware, restrictTo('admin', 'supervisor'), async (req, res) => {
  try {
    const { name, phone, salary } = req.body;

    if (!name || !phone || !salary) {
      return res.status(400).json({ message: 'الاسم، الهاتف، والمرتب مطلوبين' });
    }

    const employee = new Employee({ name, phone, salary });
    await employee.save();

    res.status(201).json({ message: 'تم إنشاء الموظف بنجاح', employee });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

// عرض كل الموظفين
router.get('/', authMiddleware, restrictTo('admin', 'supervisor', 'worker'), async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

module.exports = router;