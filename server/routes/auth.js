// server/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register (للأدمن بس بعدين هنضيف التحقق)
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // التأكد من إن كل الحقول موجودة
    if (!username || !password || !role) {
      return res.status(400).json({ message: 'كل الحقول مطلوبة' });
    }

    // التأكد من إن اليوزر مش موجود
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'اليوزر موجود بالفعل' });
    }

    // التأكد من إن الـ role صحيح
    if (!['admin', 'supervisor', 'worker'].includes(role)) {
      return res.status(400).json({ message: 'نوع المستخدم غير صحيح' });
    }

    // إنشاء يوزر جديد
    const user = new User({ username, password, role });
    await user.save();

    res.status(201).json({ message: 'تم إنشاء المستخدم بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // التأكد من إن الحقول موجودة
    if (!username || !password) {
      return res.status(400).json({ message: 'اليوزر وكلمة المرور مطلوبين' });
    }

    // البحث عن اليوزر
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'اليوزر أو كلمة المرور غلط' });
    }

    // التحقق من الـ password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'اليوزر أو كلمة المرور غلط' });
    }

    // إصدار JWT توكن
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // التوكن ينتهي بعد ساعة
    );

    res.json({ token, role: user.role, message: 'تم تسجيل الدخول بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

module.exports = router;