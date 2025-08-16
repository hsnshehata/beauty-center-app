// server/server.js
const express = require('express');
const connectDB = require('./db');
const authRoutes = require('./routes/auth');
const app = express();
const port = 5000;

app.use(express.json());

// ربط الداتابيز
connectDB();

// Routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('سيرفر الباك إند شغال، وMongoDB Atlas متصل! 🚀');
});

app.listen(port, () => {
  console.log(`السيرفر شغال على بورت ${port}`);
});