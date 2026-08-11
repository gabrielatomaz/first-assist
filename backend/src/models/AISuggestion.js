import mongoose from 'mongoose';

const aiSuggestionSchema = new mongoose.Schema({
  incidentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident', required: true },
  suggestedCause: String,
  suggestedSolution: String,
  rating: { type: String, enum: ['HELPFUL', 'NOT_HELPFUL', 'UNRATED'], default: 'UNRATED' }
}, { timestamps: true });

export const AISuggestion = mongoose.model('AISuggestion', aiSuggestionSchema);
