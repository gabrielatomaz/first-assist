import express from 'express';
import { AISuggestion } from '../models/AISuggestion.js';

const router = express.Router();

/**
 * @openapi
 * /api/ai-suggestions/{id}/rating:
 *   patch:
 *     summary: Rate an AI diagnostic suggestion
 *     tags: [AI Suggestions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: string
 *                 enum: [HELPFUL, NOT_HELPFUL, UNRATED]
 *     responses:
 *       200:
 *         description: Rating updated successfully
 *       404:
 *         description: AI suggestion not found
 */
router.patch('/:id/rating', async (req, res) => {
  try {
    const { rating } = req.body;
    if (!['HELPFUL', 'NOT_HELPFUL', 'UNRATED'].includes(rating)) {
      return res.status(400).json({ error: 'Invalid rating status' });
    }

    const suggestion = await AISuggestion.findByIdAndUpdate(
      req.params.id,
      { rating },
      { new: true }
    );

    if (!suggestion) {
      return res.status(404).json({ error: 'AI suggestion not found' });
    }

    res.json(suggestion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
