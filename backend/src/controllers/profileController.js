import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

export const profileController = {
  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user._id, '-passwordHash');
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { name, email } = req.body;
      if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
      }

      const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: req.user._id } });
      if (existingUser) {
        return res.status(409).json({ error: 'Email already in use' });
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { name, email: email.toLowerCase() },
        { new: true, select: '-passwordHash' }
      );

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current and new password are required' });
      }

      const user = await User.findById(req.user._id);
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ error: 'Incorrect current password' });
      }

      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(newPassword, salt);
      await user.save();

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
