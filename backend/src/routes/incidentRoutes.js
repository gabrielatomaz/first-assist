import express from 'express';
import multer from 'multer';
import { incidentController } from '../controllers/incidentController.js';
import { commentController } from '../controllers/commentController.js';
import { authMiddleware, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Public routes (Guest Mode ticket submission, TBA team lookup & status checks)
router.get('/public/team-events', incidentController.lookupTeamEvents);
router.get('/public/team-matches', incidentController.lookupTeamMatches);
router.get('/public/status', incidentController.getPublicIncidentsStatus);
router.post('/public/status', incidentController.getPublicIncidentsStatus);
router.post('/public/:id/cancel', incidentController.cancelPublicIncident);
router.patch('/public/:id/cancel', incidentController.cancelPublicIncident);
router.post('/public', incidentController.createPublicIncident);

// Protected routes (Require Authentication)
router.get('/', authMiddleware, incidentController.getIncidents);
router.get('/search', authMiddleware, incidentController.searchIncidents);
router.get('/:id', authMiddleware, incidentController.getIncidentById);
router.post('/', authMiddleware, incidentController.createIncident);
router.patch('/:id/status', authMiddleware, incidentController.updateStatus);
router.patch('/:id/diagnosis', authMiddleware, incidentController.updateDiagnosis);
router.post('/:id/resolve', authMiddleware, incidentController.resolveIncident);
router.get('/:id/ai-suggestions', authMiddleware, incidentController.getAISuggestions);
router.post('/:id/ai-suggestions', authMiddleware, incidentController.generateAISuggestions);
router.get('/:id/related', authMiddleware, incidentController.getRelatedIncidents);
router.get('/:id/audit-logs', authMiddleware, incidentController.getIncidentAuditLogs);
router.delete('/:id', authMiddleware, incidentController.deleteIncident);

// Transcription route accepting binary audio file
router.post('/transcribe', authMiddleware, upload.single('audio'), incidentController.transcribeAudio);

// Comments routes nested under incidents
router.get('/:id/comments', authMiddleware, commentController.getComments);
router.post('/:id/comments', authMiddleware, commentController.createComment);
router.put('/comments/:commentId', authMiddleware, commentController.updateComment);
router.delete('/comments/:commentId', authMiddleware, commentController.deleteComment);

export default router;
