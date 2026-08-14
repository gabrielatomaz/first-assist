import { Comment } from '../models/Comment.js';

export const commentController = {
  getComments: async (req, res) => {
    try {
      const comments = await Comment.find({ incidentId: req.params.id })
        .populate('authorId', 'name role')
        .sort({ createdAt: 1 });
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  createComment: async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'Comment text is required' });
      }

      const comment = await Comment.create({
        incidentId: req.params.id,
        authorId: req.user._id,
        text
      });

      const populated = await Comment.findById(comment._id)
        .populate('authorId', 'name role');

      res.status(201).json(populated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
