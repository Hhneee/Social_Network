// Import các module cần thiết
const express = require('express');
const path = require('path');
const http = require('http'); // Thêm http để tạo server cho Socket.IO
const { Server } = require('socket.io'); // Thêm Socket.IO
require('dotenv').config();

// Import các file cấu hình và các route
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const messagesRoutes = require('./routes/messagesRoutes');
const notificationRouter = require('./routes/notificationRoutes');
// const commentRoutes = require('./routes/commentRoutes');
const app = express();
const server = http.createServer(app); // Tạo server HTTP từ app để dùng với Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // Cho phép tất cả origin (có thể giới hạn trong môi trường production)
    methods: ['GET', 'POST'],
  },
});

// Kết nối đến cơ sở dữ liệu
connectDB();

// Sử dụng middleware để parse JSON
app.use(express.json());

// Phục vụ các tệp tĩnh trong thư mục 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Lưu trữ các kết nối của người dùng
const userSockets = new Map(); // Map userId -> socketId

// Xử lý kết nối WebSocket
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Khi người dùng kết nối, gửi userId để lưu vào userSockets
  socket.on('register', (userId) => {
    console.log(`User ${userId} registered with socket ${socket.id}`);
    userSockets.set(userId, socket.id);
  });

  // Khi người dùng ngắt kết nối
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (let [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        break;
      }
    }
  });
});

// Lưu io và userSockets vào app để sử dụng trong controller
app.set('io', io);
app.set('userSockets', userSockets);

// Định nghĩa các route cho API authentication
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
// app.use('/api/comments', commentRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/notifications', notificationRouter);

// Route phục vụ tệp index.html tại đường dẫn gốc
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'auth/auth.html'));
});

app.get('/auth/auth.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'auth', 'auth.html'));
});

// Khởi động server trên PORT được khai báo trong .env hoặc mặc định là 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});