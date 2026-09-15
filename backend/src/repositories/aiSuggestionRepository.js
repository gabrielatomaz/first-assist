import { AISuggestion } from '../models/AISuggestion.js';

export const aiSuggestionRepository = {
  findByIncidentId: async (incidentId) => {
    return await AISuggestion.findOne({ incidentId });
  },

  create: async (suggestionData) => {
    const suggestion = new AISuggestion(suggestionData);
    return await suggestion.save();
  },

  upsertByIncidentId: async (incidentId, suggestionData) => {
    return await AISuggestion.findOneAndUpdate(
      { incidentId },
      { $set: suggestionData },
      { new: true, upsert: true }
    );
  }
};
