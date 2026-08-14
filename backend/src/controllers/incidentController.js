import { incidentService } from '../services/incidentService.js';

export const incidentController = {
  getIncidents: async (req, res) => {
    try {
      const { status, category, priority, teamNumber, eventCode } = req.query;
      const incidents = await incidentService.getAllIncidents({ status, category, priority, teamNumber, eventCode });
      res.json(incidents);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getIncidentById: async (req, res) => {
    try {
      const incident = await incidentService.getIncidentById(req.params.id);
      if (!incident) {
        return res.status(404).json({ error: 'Incident not found' });
      }
      res.json(incident);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  createIncident: async (req, res) => {
    try {
      const incident = await incidentService.createIncident(req.body, req.user._id);
      res.status(201).json(incident);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { status, assignedTo } = req.body;
      
      // If setting an assignee that is not self, verify the user is ADMIN or FTA
      if (assignedTo && assignedTo !== req.user._id.toString()) {
        const userRole = (req.user.role || '').toUpperCase();
        if (userRole !== 'ADMIN' && userRole !== 'FTA') {
          return res.status(403).json({ error: 'CSAs can only assign incidents to themselves' });
        }
      }

      const incident = await incidentService.updateIncidentStatus(req.params.id, status, assignedTo, req.user._id);
      res.json(incident);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  updateDiagnosis: async (req, res) => {
    try {
      const { diagnosis } = req.body;
      const incident = await incidentService.updateIncidentDiagnosis(req.params.id, diagnosis, req.user._id);
      res.json(incident);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  resolveIncident: async (req, res) => {
    try {
      const { rootCause, appliedSolution } = req.body;
      const incident = await incidentService.resolveIncident(req.params.id, rootCause, appliedSolution, req.user._id);
      res.json(incident);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  closeIncident: async (req, res) => {
    try {
      const incident = await incidentService.closeIncident(req.params.id, req.user._id);
      res.json(incident);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  searchIncidents: async (req, res) => {
    try {
      const { q, category, priority, teamNumber } = req.query;
      const results = await incidentService.searchResolvedIncidents(q, { category, priority, teamNumber });
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getAISuggestions: async (req, res) => {
    try {
      const suggestions = await incidentService.getAISuggestionsForIncident(req.params.id);
      res.json({ suggestions });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  transcribeAudio: async (req, res) => {
    try {
      const { simulate_error } = req.query;
      
      // Simulate network transcription failure (for testing retry flows)
      if (simulate_error === 'true' || Math.random() < 0.2) {
        return res.status(503).json({ error: 'Speech-to-Text transcription service timeout. Please try again.' });
      }

      // Return simulated text translation along with structured parameters
      res.json({
        text: 'Simulated Voice Transcription: Team 254 in match Q12 has a loose CAN bus connector causing code exceptions. This is critical!',
        teamNumber: 254,
        matchNumber: 'Q12',
        category: 'CAN_BUS',
        priority: 'CRITICAL'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getRelatedIncidents: async (req, res) => {
    try {
      const related = await incidentService.getRelatedIncidents(req.params.id);
      res.json(related);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getIncidentAuditLogs: async (req, res) => {
    try {
      const { AuditLog } = await import('../models/AuditLog.js');
      const logs = await AuditLog.find({ incidentId: req.params.id })
        .populate('userId', 'name role')
        .sort({ timestamp: 1 });
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
