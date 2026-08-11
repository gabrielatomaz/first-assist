import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  teamNumber: { type: Number, required: true },
  matchNumber: String,
  description: { type: String, required: true },
  status: { type: String, enum: ['OPEN', 'INVESTIGATING', 'RESOLVED'], default: 'OPEN' }
}, { timestamps: true });

export const Incident = mongoose.model('Incident', incidentSchema);
