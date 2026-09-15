import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

export const authController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      // Check if any users exist in the system. If not, seed a default admin account.
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('admin123', salt);
        await User.create({
          name: 'Default Administrator',
          email: 'admin@first.org',
          role: 'ADMIN',
          passwordHash,
          status: 'ACTIVE'
        });
        console.log('Seeded default admin user: admin@first.org / admin123');
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      if (user.status !== 'ACTIVE') {
        return res.status(403).json({ error: 'Account is deactivated. Contact Administrator.' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET || 'superSecretJWTKeyForFirstAssist1772',
        { expiresIn: '12h' }
      );

      res.json({
        token,
        user: {
          _id: user._id,
          name: user.name,
          role: user.role,
          email: user.email,
          avatarIcon: user.avatarIcon || 'user',
          avatarColor: user.avatarColor || '#4F7F82',
          assignedEventCode: user.assignedEventCode || null,
          assignedEventCodes: user.assignedEventCodes || []
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  me: async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select('-passwordHash');
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({
        _id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
        status: user.status,
        avatarIcon: user.avatarIcon || 'user',
        avatarColor: user.avatarColor || '#4F7F82',
        assignedEventCode: user.assignedEventCode || null,
        assignedEventCodes: user.assignedEventCodes || []
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
