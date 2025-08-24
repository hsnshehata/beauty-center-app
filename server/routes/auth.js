// server/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');

// Register (للأدمن بس)
router.post('/register', authMiddleware, restrictTo('admin'), async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: 'كل الحقول مطلوبة' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'اليوزر موجود بالفعل' });
    }

    if (!['admin', 'supervisor', 'worker'].includes(role)) {
      return res.status(400).json({ message: 'نوع المستخدم غير صحيح' });
    }

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

    if (!username || !password) {
      return res.status(400).json({ message: 'اليوزر وكلمة المرور مطلوبين' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'اليوزر أو كلمة المرور غلط' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'اليوزر أو كلمة المرور غلط' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    res.json({ token, role: user.role, message: 'تم تسجيل الدخول بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

// جلب بيانات المستخدم
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('username role points');
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

module.exports = router;