import express from 'express';
import { Event } from '../models/Event.js';
import { requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Retrieve all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Retrieve the single active event context
router.get('/active', async (req, res) => {
  try {
    const activeEvent = await Event.findOne({ isActive: true });
    if (!activeEvent) {
      return res.status(404).json({ error: 'No active event context found' });
    }
    res.json(activeEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new event (Admin only)
router.post('/', requireRole(['ADMIN']), async (req, res) => {
  try {
    const { code, name, location, isActive } = req.body;
    if (!code || !name) {
      return res.status(400).json({ error: 'Event code and name are required' });
    }

    // If making this event active, deactivate other events
    if (isActive) {
      await Event.updateMany({}, { isActive: false });
    }

    const newEvent = await Event.create({ code, name, location, isActive: !!isActive });
    res.status(201).json(newEvent);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Event code already exists' });
    }
    res.status(400).json({ error: error.message });
  }
});

// Set event active (Admin only)
router.patch('/:code/active', requireRole(['ADMIN']), async (req, res) => {
  try {
    await Event.updateMany({}, { isActive: false });
    const event = await Event.findOneAndUpdate(
      { code: req.params.code },
      { isActive: true },
      { new: true }
    );
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
