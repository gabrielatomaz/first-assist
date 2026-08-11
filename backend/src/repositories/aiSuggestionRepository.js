import { AISuggestion } from '../models/AISuggestion.js';

export const aiSuggestionRepository = {
  findByIncidentId: async (incidentId) => {
    return await AISuggestion.findOne({ incidentId });
  },

  create: async (suggestionData) => {
    const suggestion = new AISuggestion(suggestionData);
    return await suggestion.save();
  }
};
