// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // خد التوكن من الـ Header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'ممنوع الدخول، لازم توكن' });
  }

  try {
    // التحقق من التوكن
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // إضافة بيانات اليوزر (userId, role) للـ request
    next();
  } catch (error) {
    res.status(401).json({ message: 'التوكن غير صحيح' });
  }
};

// Middleware للتحقق من الـ role
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'مش مسموح ليك تدخل هنا' });
    }
    next();
  };
};

module.exports = { authMiddleware, restrictTo };