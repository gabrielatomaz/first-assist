import express from 'express';
import { incidentController } from '../controllers/incidentController.js';

const router = express.Router();

router.get('/', incidentController.getIncidents);
router.post('/', incidentController.createIncident);
router.patch('/:id/status', incidentController.updateStatus);
router.get('/:id/ai-suggestions', incidentController.getAISuggestions);

export default router;
