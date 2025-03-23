const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const path = require('path');

const app = express();

// Kết nối database
connectDB();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
// Routes
app.use('/api/auth', authRoutes);

// Thêm route để phục vụ index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public', 'index.html'));
  });
// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});