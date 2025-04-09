// models/notificationModel.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Người nhận thông báo (ID của user)
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Tham chiếu đến model User
    required: true,
  },

  // Người gửi thông báo (ID của user thực hiện hành động)
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Tham chiếu đến model User
    required: true,
  },

  // Loại thông báo (like, comment, follow, v.v.)
  type: {
    type: String,
    enum: ['like', 'comment', 'follow', 'message', 'mention'], // Các loại thông báo cho phép
    required: true,
  },

  // Nội dung thông báo
  message: {
    type: String,
    required: true,
    trim: true,
  },

  // Liên kết đến bài viết hoặc trang liên quan (nếu có)
  link: {
    type: String,
    trim: true,
    default: '',
  },

  // Trạng thái đã đọc hay chưa
  isRead: {
    type: Boolean,
    default: false,
  },

  // Thời gian tạo thông báo
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Tạo index để tối ưu hóa truy vấn
notificationSchema.index({ recipient: 1, createdAt: -1 }); // Sắp xếp theo thời gian giảm dần cho người nhận

// Middleware để tự động xóa các thông báo cũ (nếu cần)
// Ví dụ: Xóa thông báo sau 30 ngày
notificationSchema.pre('save', async function () {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  await this.model('Notification').deleteMany({ createdAt: { $lt: thirtyDaysAgo } });
});

// Export model
module.exports = mongoose.model('Notification', notificationSchema);