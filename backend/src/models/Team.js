import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true, index: true },
  name: { type: String, required: true },
  rookieYear: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

export const Team = mongoose.model('Team', teamSchema);
