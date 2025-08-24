// server/routes/workerPoints.js
const express = require('express');
const router = express.Router();
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');
const WorkerPoints = require('../models/WorkerPoints');

router.get('/', authMiddleware, restrictTo('worker'), async (req, res) => {
  try {
    const pointsHistory = await WorkerPoints.find({ userId: req.user.userId })
      .populate('services.serviceId', 'name')
      .populate('services.bookingId', 'clientName');
    res.json(pointsHistory);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
});

module.exports = router;