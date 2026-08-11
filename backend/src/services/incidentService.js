import { incidentRepository } from '../repositories/incidentRepository.js';
import { aiSuggestionRepository } from '../repositories/aiSuggestionRepository.js';

export const incidentService = {
  getAllIncidents: async () => {
    return await incidentRepository.findAll();
  },

  createIncident: async (data) => {
    if (!data.teamNumber || !data.description) {
      throw new Error("teamNumber and description are required");
    }
    return await incidentRepository.create(data);
  },

  updateIncidentStatus: async (id, status) => {
    if (!['OPEN', 'INVESTIGATING', 'RESOLVED'].includes(status)) {
      throw new Error("Invalid status");
    }
    return await incidentRepository.updateStatus(id, status);
  },

  getAISuggestionsForIncident: async (incidentId) => {
    let suggestion = await aiSuggestionRepository.findByIncidentId(incidentId);
    
    if (!suggestion) {
      // Generate mock AI response
      suggestion = await aiSuggestionRepository.create({
        incidentId,
        suggestedCause: "Simulated AI Cause: Possible loose wire on the radio power module.",
        suggestedSolution: "Simulated AI Solution: Ensure the POE cable is fully seated and securely zip-tied."
      });
    }
    
    return [suggestion];
  }
};
