// server/cronJobs.js
const cron = require('node-cron');
const Booking = require('./models/Booking');
const ServiceExecution = require('./models/ServiceExecution');
const User = require('./models/User');
const WorkerPoints = require('./models/WorkerPoints');

// تحديث حالة الخدمات من in_progress إلى completed بعد نص ساعة
cron.schedule('*/30 * * * *', async () => {
  try {
    const halfHourAgo = new Date(Date.now() - 30 * 60 * 1000);

    // تحديث خدمات الحجوزات
    const bookings = await Booking.find({
      $or: [
        { packageStatus: 'in_progress', updatedAt: { $lte: halfHourAgo } },
        { hennaPackageStatus: 'in_progress', updatedAt: { $lte: halfHourAgo } },
        { photoPackageStatus: 'in_progress', updatedAt: { $lte: halfHourAgo } },
        { hairStraighteningStatus: 'in_progress', updatedAt: { $lte: halfHourAgo } },
        { 'additionalService.status': 'in_progress', updatedAt: { $lte: halfHourAgo } },
        { 'returnedServices.status': 'in_progress', updatedAt: { $lte: halfHourAgo } },
      ],
    });

    for (const booking of bookings) {
      let points = 0;
      if (booking.packageStatus === 'in_progress' && booking.updatedAt <= halfHourAgo) {
        booking.packageStatus = 'completed';
        points += booking.packageId.price;
      }
      if (booking.hennaPackageStatus === 'in_progress' && booking.updatedAt <= halfHourAgo) {
        booking.hennaPackageStatus = 'completed';
        points += booking.hennaPackageId.price;
      }
      if (booking.photoPackageStatus === 'in_progress' && booking.updatedAt <= halfHourAgo) {
        booking.photoPackageStatus = 'completed';
        points += booking.photoPackageId.price;
      }
      if (booking.hairStraighteningStatus === 'in_progress' && booking.updatedAt <= halfHourAgo) {
        booking.hairStraighteningStatus = 'completed';
        points += booking.hairStraighteningPrice;
      }
      if (booking.additionalService && booking.additionalService.status === 'in_progress' && booking.updatedAt <= halfHourAgo) {
        booking.additionalService.status = 'completed';
        points += booking.additionalService.price;
      }
      booking.returnedServices.forEach(rs => {
        if (rs.status === 'in_progress' && booking.updatedAt <= halfHourAgo) {
          rs.status = 'completed';
          points += rs.price;
        }
      });

      if (points > 0) {
        const user = await User.findById(booking.packageExecutedBy || booking.hennaPackageExecutedBy || booking.photoPackageExecutedBy || booking.hairStraighteningExecutedBy || booking.additionalService?.executedBy || booking.returnedServices.find(rs => rs.executedBy)?.executedBy);
        if (user) {
          user.points += points;
          await user.save();

          const currentMonth = new Date().getMonth() + 1;
          const currentYear = new Date().getFullYear();
          await WorkerPoints.findOneAndUpdate(
            { userId: user._id, month: currentMonth, year: currentYear },
            { $inc: { points }, $push: { services: { bookingId: booking._id, price: points, executedAt: new Date() } } },
            { upsert: true }
          );
        }
      }

      await booking.save();
    }

    // تحديث الخدمات الفورية
    const executions = await ServiceExecution.find({
      executionStatus: 'in_progress',
      updatedAt: { $lte: halfHourAgo },
    });

    for (const execution of executions) {
      execution.executionStatus = 'completed';
      const user = await User.findById(execution.executedBy);
      if (user) {
        user.points += execution.price;
        await user.save();

        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        await WorkerPoints.findOneAndUpdate(
          { userId: user._id, month: currentMonth, year: currentYear },
          { $inc: { points: execution.price }, $push: { services: { serviceId: execution.serviceId, price: execution.price, executedAt: new Date() } } },
          { upsert: true }
        );
      }
      await execution.save();
    }
  } catch (error) {
    console.error('خطأ في cron job:', error);
  }
});

// إعادة ضبط النقاط في بداية كل شهر
cron.schedule('0 0 1 * *', async () => {
  try {
    await User.updateMany({ role: 'worker' }, { points: 0 });
    console.log('تم إعادة ضبط النقاط للموظفين');
  } catch (error) {
    console.error('خطأ في إعادة ضبط النقاط:', error);
  }
});