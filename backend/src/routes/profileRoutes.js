import express from 'express';
import { profileController } from '../controllers/profileController.js';

const router = express.Router();

/**
 * @openapi
 * /api/profile:
 *   get:
 *     summary: Fetch current user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile object
 *   put:
 *     summary: Update profile details
 *     tags: [Profile]
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
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *       409:
 *         description: Email in use
 * 
 * /api/profile/password:
 *   post:
 *     summary: Update user password
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated
 *       400:
 *         description: Incorrect current password
 */
router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);
router.post('/password', profileController.changePassword);

export default router;
