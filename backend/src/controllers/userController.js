import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

export const userController = {
  getUsers: async (req, res) => {
    try {
      const users = await User.find({}, '-passwordHash').sort({ createdAt: -1 });
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  createUser: async (req, res) => {
    try {
      const { name, email, role, password } = req.body;
      if (!name || !email || !role || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      // FTAs can ONLY register CSA users
      const reqRole = (req.user?.role || '').toUpperCase();
      if (reqRole === 'FTA' && role.toUpperCase() !== 'CSA') {
        return res.status(403).json({ error: 'FTAs are only permitted to register CSA users' });
      }

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        role: role.toUpperCase(),
        passwordHash,
        status: 'ACTIVE'
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { status } = req.body;
      if (!['ACTIVE', 'INACTIVE'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const targetUser = await User.findById(req.params.id);
      if (!targetUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // FTAs cannot deactivate FTA or ADMIN users
      const reqRole = (req.user?.role || '').toUpperCase();
      if (reqRole === 'FTA' && (targetUser.role === 'FTA' || targetUser.role === 'ADMIN')) {
        return res.status(403).json({ error: 'FTAs cannot deactivate or modify FTA or ADMIN user accounts' });
      }

      targetUser.status = status;
      await targetUser.save();

      res.json({
        _id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        status: targetUser.status
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
