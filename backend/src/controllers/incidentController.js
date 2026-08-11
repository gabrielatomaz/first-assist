import { incidentService } from '../services/incidentService.js';

export const incidentController = {
  getIncidents: async (req, res) => {
    try {
      const incidents = await incidentService.getAllIncidents();
      res.json(incidents);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  createIncident: async (req, res) => {
    try {
      const incident = await incidentService.createIncident(req.body);
      res.status(201).json(incident);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  updateStatus: async (req, res) => {
    try {
      const incident = await incidentService.updateIncidentStatus(req.params.id, req.body.status);
      res.json(incident);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  getAISuggestions: async (req, res) => {
    try {
      const suggestions = await incidentService.getAISuggestionsForIncident(req.params.id);
      res.json({ suggestions });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
