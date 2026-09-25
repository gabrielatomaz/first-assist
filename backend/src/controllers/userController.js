import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

export const userController = {
  getUsers: async (req, res) => {
    try {
      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);

      if (page || limit) {
        const pageNum = page || 1;
        const limitNum = limit || 5;
        const skip = (pageNum - 1) * limitNum;

        const total = await User.countDocuments();
        const users = await User.find({}, '-passwordHash')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum);

        return res.json({
          users,
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        });
      }

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
        status: user.status,
        avatarIcon: user.avatarIcon || 'user',
        avatarColor: user.avatarColor || '#38A3A5'
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
        status: targetUser.status,
        avatarIcon: targetUser.avatarIcon || 'user',
        avatarColor: targetUser.avatarColor || '#4F7F82'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { hasCompletedOnboarding, avatarIcon, avatarColor, name } = req.body;
      if (hasCompletedOnboarding !== undefined) {
        user.hasCompletedOnboarding = Boolean(hasCompletedOnboarding);
      }
      if (avatarIcon !== undefined) user.avatarIcon = avatarIcon;
      if (avatarColor !== undefined) user.avatarColor = avatarColor;
      if (name !== undefined) user.name = name;

      await user.save();

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatarIcon: user.avatarIcon || 'user',
        avatarColor: user.avatarColor || '#38A3A5',
        teamNumber: user.teamNumber || null,
        teamRole: user.teamRole || null,
        assignedEventCode: user.assignedEventCode || null,
        assignedEventCodes: user.assignedEventCodes || [],
        hasCompletedOnboarding: user.hasCompletedOnboarding
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const reqUser = req.user;

      if (reqUser._id.toString() === id) {
        return res.status(400).json({ error: 'You cannot permanently delete your own account.' });
      }

      const targetUser = await User.findById(id);
      if (!targetUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      const reqRole = (reqUser?.role || '').toUpperCase();
      if (reqRole === 'FTA' && (targetUser.role === 'FTA' || targetUser.role === 'ADMIN')) {
        return res.status(403).json({ error: 'FTAs are only permitted to delete CSA user accounts.' });
      }

      await User.findByIdAndDelete(id);
      res.json({ message: 'User permanently deleted successfully', _id: targetUser._id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
