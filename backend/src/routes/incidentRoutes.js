import express from 'express';
import multer from 'multer';
import { incidentController } from '../controllers/incidentController.js';
import { commentController } from '../controllers/commentController.js';
import { requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', incidentController.getIncidents);
router.get('/search', incidentController.searchIncidents);
router.get('/:id', incidentController.getIncidentById);
router.post('/', incidentController.createIncident);
router.patch('/:id/status', incidentController.updateStatus);
router.patch('/:id/diagnosis', incidentController.updateDiagnosis);
router.post('/:id/resolve', incidentController.resolveIncident);
router.post('/:id/close', requireRole(['ADMIN', 'FTA']), incidentController.closeIncident);
router.get('/:id/ai-suggestions', incidentController.getAISuggestions);
router.post('/:id/ai-suggestions', incidentController.generateAISuggestions);
router.get('/:id/related', incidentController.getRelatedIncidents);
router.get('/:id/audit-logs', incidentController.getIncidentAuditLogs);
router.delete('/:id', incidentController.deleteIncident);

// Transcription route accepting binary audio file
router.post('/transcribe', upload.single('audio'), incidentController.transcribeAudio);

// Comments routes nested under incidents
router.get('/:id/comments', commentController.getComments);
router.post('/:id/comments', commentController.createComment);
router.put('/comments/:commentId', commentController.updateComment);
router.delete('/comments/:commentId', commentController.deleteComment);

export default router;
