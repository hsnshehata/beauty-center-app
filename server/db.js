// server/db.js
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Atlas متصل بنجاح! 😎');
  } catch (error) {
    console.error('خطأ في الاتصال بـ MongoDB Atlas:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;