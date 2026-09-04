import express from 'express';
import { accessRequestController } from '../controllers/accessRequestController.js';
import { authMiddleware, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes: Submit FTA access request & fetch registered events from login screen
router.get('/events', accessRequestController.getPublicEvents);
router.post('/', accessRequestController.createRequest);

// Protected routes (ADMIN only)
router.get('/', authMiddleware, requireRole(['ADMIN']), accessRequestController.getRequests);
router.patch('/:id/approve', authMiddleware, requireRole(['ADMIN']), accessRequestController.approveRequest);
router.patch('/:id/reject', authMiddleware, requireRole(['ADMIN']), accessRequestController.rejectRequest);

export default router;
