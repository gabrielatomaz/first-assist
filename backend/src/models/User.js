import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  role: { type: String, enum: ['ADMIN', 'FTA', 'CSA', 'TEAM'], required: true },
  teamNumber: { type: Number, default: null },
  teamRole: { type: String, enum: ['MENTOR', 'CAPTAIN', 'STUDENT_MEMBER', null], default: null },
  passwordHash: { type: String, required: true },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  assignedEventCode: { type: String, default: null },
  assignedEventCodes: { type: [String], default: [] },
  avatarIcon: { type: String, default: 'user' },
  avatarColor: { type: String, default: '#4F7F82' }
}, { timestamps: true });

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = mongoose.model('User', userSchema);
