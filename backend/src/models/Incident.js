import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  teamNumber: { type: Number, required: true, index: true },
  matchNumber: String,
  eventCode: { type: String, index: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['RADIO_COMMS', 'ROBOTIC_POWER', 'CAN_BUS', 'MECHANICAL', 'CODE_EXCEPTION', 'OTHER'],
    default: 'OTHER'
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  status: {
    type: String,
    enum: ['PENDING_SCREENING', 'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED', 'REJECTED'],
    default: 'PENDING_SCREENING'
  },
  audioUrl: String,
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  diagnosis: String,
  diagnosisHistory: [{
    text: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: Date.now }
  }],
  rootCause: String,
  appliedSolution: String,
  resolvedAt: Date,
  closedAt: Date,
  closedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Compound text index for Search and Knowledge Base querying
incidentSchema.index({
  description: 'text',
  category: 'text',
  rootCause: 'text',
  appliedSolution: 'text',
  diagnosis: 'text'
});

export const Incident = mongoose.model('Incident', incidentSchema);
