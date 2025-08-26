// server/models/ServiceExecution.js
const mongoose = require('mongoose');

// تنظيف cache السكيما القديمة
delete mongoose.models['ServiceExecution'];

const serviceExecutionSchema = new mongoose.Schema({
  receiptNumber: {
    type: String,
    unique: true,
    required: true,
    match: /^\d{6}$/,
  },
  serviceIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  }],
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  executionStatus: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending',
  },
  executedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { strict: false });

// توليد رقم وصل عشوائي
serviceExecutionSchema.pre('validate', async function (next) {
  if (this.isNew && !this.receiptNumber) {
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      try {
        const receiptNumber = Math.floor(100000 + Math.random() * 900000).toString();
        const existingExecution = await this.constructor.findOne({ receiptNumber }).exec();
        if (!existingExecution) {
          this.receiptNumber = receiptNumber;
          isUnique = true;
        }
        attempts++;
      } catch (error) {
        console.error('Error generating receiptNumber:', error);
        return next(new Error(`فشل في توليد رقم وصل: ${error.message}`));
      }
    }

    if (!isUnique) {
      return next(new Error('تعذر توليد رقم وصل فريد بعد عدة محاولات'));
    }
  }
  next();
});

module.exports = mongoose.model('ServiceExecution', serviceExecutionSchema);