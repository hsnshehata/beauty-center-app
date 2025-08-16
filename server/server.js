// server/server.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const packageRoutes = require('./routes/packages');
const serviceRoutes = require('./routes/services');
const employeeRoutes = require('./routes/employees');
const expenseRoutes = require('./routes/expenses');
const advanceRoutes = require('./routes/advances');
const reportRoutes = require('./routes/reports');
const app = express();
const port = 5000;

app.use(cors()); // إضافة CORS
app.use(express.json());

// ربط الداتابيز
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/advances', advanceRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => {
  res.send('سيرفر الباك إند شغال، وMongoDB Atlas متصل! 🚀');
});

app.listen(port, () => {
  console.log(`السيرفر شغال على بورت ${port}`);
});