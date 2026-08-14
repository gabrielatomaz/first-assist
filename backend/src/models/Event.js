import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  location: { type: String },
  isActive: { type: Boolean, default: false },
  teams: { type: [Number], default: [] },
  createdAt: { type: Date, default: Date.now }
});

export const Event = mongoose.model('Event', eventSchema);
