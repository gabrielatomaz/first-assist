import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  incidentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident', required: true, index: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  imageUrl: { type: String, default: null }
}, { timestamps: true });

export const Comment = mongoose.model('Comment', commentSchema);
