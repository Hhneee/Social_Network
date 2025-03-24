// Import các module cần thiết
const express = require('express');
const path = require('path');
require('dotenv').config();

// Import các file cấu hình và các route
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();

// Kết nối đến cơ sở dữ liệu
connectDB();

// Sử dụng middleware để parse JSON
app.use(express.json());

// Phục vụ các tệp tĩnh trong thư mục 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Định nghĩa các route cho API authentication
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Route phục vụ tệp index.html tại đường dẫn gốc
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'auth/auth.html'));
});

// Khởi động server trên PORT được khai báo trong .env hoặc mặc định là 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});