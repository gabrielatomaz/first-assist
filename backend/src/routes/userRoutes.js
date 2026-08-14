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
router.post('/', requireRole(['ADMIN']), userController.createUser);
router.patch('/:id/status', requireRole(['ADMIN']), userController.updateStatus);

export default router;
