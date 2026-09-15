import mongoose from 'mongoose';

const aiSuggestionSchema = new mongoose.Schema({
  incidentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident', required: true, index: true },
  suggestedCause: String,
  suggestedSolution: String,
  isRagGrounded: { type: Boolean, default: false },
  citedIncidents: [{
    incidentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident' },
    teamNumber: Number,
    matchNumber: String,
    eventCode: String,
    category: String,
    appliedSolution: String,
    similarityScore: Number
  }],
  rating: { type: String, enum: ['HELPFUL', 'NOT_HELPFUL', 'UNRATED'], default: 'UNRATED' }
}, { timestamps: true });

export const AISuggestion = mongoose.model('AISuggestion', aiSuggestionSchema);
