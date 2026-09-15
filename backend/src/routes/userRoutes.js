import express from 'express';
import { userController } from '../controllers/userController.js';
import { requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Retrieve list of users (Admin and FTA only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user objects
 *       403:
 *         description: Forbidden - Insufficient permissions
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, FTA, CSA]
 *     responses:
 *       201:
 *         description: User created successfully
 *       409:
 *         description: Email already in use
 * 
 * /api/users/{id}/status:
 *   patch:
 *     summary: Toggle user active status (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *     responses:
 *       200:
 *         description: Status updated
 *       404:
 *         description: User not found
 */
router.get('/', requireRole(['ADMIN', 'FTA']), userController.getUsers);
router.post('/', requireRole(['ADMIN', 'FTA']), userController.createUser);
router.patch('/:id/status', requireRole(['ADMIN', 'FTA']), userController.updateStatus);

// Setting active event context per CSA (Admin/FTA) or multi-regionals for FTA (Admin only)
router.patch('/:id/assigned-event', requireRole(['ADMIN', 'FTA']), async (req, res) => {
  try {
    const { assignedEventCode, assignedEventCodes } = req.body;
    const { User } = await import('../models/User.js');
    
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    // Restrict assigning FTA multi-regionals to ADMIN role only
    const reqRole = (req.user?.role || '').toUpperCase();
    if (assignedEventCodes !== undefined && reqRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Only Administrators can assign regional events to FTAs' });
    }

    if (assignedEventCode !== undefined) {
      const isSelf = targetUser._id.toString() === req.user._id.toString();
      // FTAs can assign CSAs or update their own active event context
      if (reqRole === 'FTA') {
        if (!isSelf && targetUser.role !== 'CSA') {
          return res.status(403).json({ error: 'FTAs can only assign competition events to CSAs' });
        }
        if (assignedEventCode) {
          const ftaAssignedCodes = req.user?.assignedEventCodes || (req.user?.assignedEventCode ? [req.user.assignedEventCode] : []);
          if (ftaAssignedCodes.length > 0 && !ftaAssignedCodes.includes(assignedEventCode)) {
            return res.status(403).json({ error: 'FTAs can only assign or select competition events they are registered for' });
          }
        }
      }
      targetUser.assignedEventCode = assignedEventCode || null;
    }
    if (assignedEventCodes !== undefined) targetUser.assignedEventCodes = Array.isArray(assignedEventCodes) ? assignedEventCodes : [];

    await targetUser.save();
    res.json({
      _id: targetUser._id,
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role,
      assignedEventCode: targetUser.assignedEventCode,
      assignedEventCodes: targetUser.assignedEventCodes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
