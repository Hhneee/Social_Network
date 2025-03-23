const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');

class AuthService {
    async registerUser({ username, email, password }) {
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
          throw new Error('Username or email already exists');
        }
      
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
          username,
          email,
          password: hashedPassword,
        });
      
        console.log('User created:', user); // Thêm log
        return user;
      }

  async loginUser({ email, password }) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign({ id: user._id, username: user.username }, jwtSecret, {
      expiresIn: '1h',
    });

    return { user, token };
  }
}

module.exports = new AuthService();