import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  incidentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident', index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  action: { type: String, required: true }, // e.g., 'STATUS_UPDATE', 'ASSIGNMENT_CHANGE', 'COMMENT_ADDED'
  oldValue: { type: String },
  newValue: { type: String },
  details: { type: String },
  timestamp: { type: Date, default: Date.now }
});

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
