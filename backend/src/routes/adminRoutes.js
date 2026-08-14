import express from 'express';
import { AuditLog } from '../models/AuditLog.js';
import { requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Restrict all routes to ADMIN and FTA
router.use(requireRole(['ADMIN', 'FTA']));

// Retrieve scrolling list of all system audit logs
router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('userId', 'name role email')
      .populate('incidentId', 'teamNumber matchNumber')
      .sort({ timestamp: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
