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
      const { text, imageUrl } = req.body;
      if (!text && !imageUrl) {
        return res.status(400).json({ error: 'Comment text or image is required' });
      }

      const comment = await Comment.create({
        incidentId: req.params.id,
        authorId: req.user._id,
        text: text || '',
        imageUrl: imageUrl || null
      });

      const populated = await Comment.findById(comment._id)
        .populate('authorId', 'name role');

      res.status(201).json(populated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateComment: async (req, res) => {
    try {
      const { commentId } = req.params;
      const { text, imageUrl } = req.body;

      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      const isAuthor = comment.authorId.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'ADMIN';

      if (!isAuthor && !isAdmin) {
        return res.status(403).json({ error: 'Forbidden: Only the comment author or Admin can edit this comment' });
      }

      if (text !== undefined) comment.text = text;
      if (imageUrl !== undefined) comment.imageUrl = imageUrl;

      await comment.save();

      const populated = await Comment.findById(comment._id)
        .populate('authorId', 'name role');

      res.json(populated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteComment: async (req, res) => {
    try {
      const { commentId } = req.params;

      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      const isAuthor = comment.authorId.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'ADMIN';

      if (!isAuthor && !isAdmin) {
        return res.status(403).json({ error: 'Forbidden: Only the comment author or Admin can delete this comment' });
      }

      await Comment.findByIdAndDelete(commentId);
      res.json({ message: 'Comment deleted successfully', commentId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
