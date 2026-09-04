import mongoose from 'mongoose';

const accessRequestSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true },
  requestedEventCodes: { type: [String], default: [] },
  tbaEventKey: { type: String, trim: true },
  notes: { type: String, trim: true },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
    index: true
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  rejectionReason: String
}, { timestamps: true });

accessRequestSchema.index({ email: 1, status: 1 });

export const AccessRequest = mongoose.model('AccessRequest', accessRequestSchema);
