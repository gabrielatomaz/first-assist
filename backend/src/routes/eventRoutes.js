import express from 'express';
import { Event } from '../models/Event.js';
import { Team } from '../models/Team.js';
import { requireRole } from '../middleware/authMiddleware.js';
import { logIncidentChange } from '../utils/auditLogger.js';

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

// Create new event (Admin only - Epic 11 / TCC management)
router.post('/', requireRole(['ADMIN']), async (req, res) => {
  try {
    const { code, name, location, isActive } = req.body;
    if (!code || !name) {
      return res.status(400).json({ error: 'Event code and name are required' });
    }

    const cleanCode = code.trim().toLowerCase();
    const existing = await Event.findOne({ code: cleanCode });
    if (existing) {
      return res.status(409).json({ error: `Event "${existing.name}" (${cleanCode}) is already registered in the system` });
    }

    // If making this event active, deactivate other events
    if (isActive) {
      await Event.updateMany({}, { isActive: false });
    }

    const newEvent = await Event.create({ code: cleanCode, name: name.trim(), location, isActive: !!isActive });
    
    // Log audit timeline
    await logIncidentChange({
      userId: req.user._id,
      action: 'EVENT_CREATION',
      newValue: cleanCode,
      details: `Event "${name}" (${cleanCode}) created`
    });

    res.status(201).json(newEvent);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Event code already exists' });
    }
    res.status(400).json({ error: error.message });
  }
});

// Set event active (Admin and FTA allowed)
router.patch('/:code/active', requireRole(['ADMIN', 'FTA']), async (req, res) => {
  try {
    await Event.updateMany({}, { isActive: false });
    const event = await Event.findOneAndUpdate(
      { code: req.params.code },
      { isActive: true },
      { new: true }
    );
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    // Log audit timeline
    await logIncidentChange({
      userId: req.user._id,
      action: 'EVENT_ACTIVATION',
      newValue: event.code,
      details: `Event "${event.name}" (${event.code}) marked active`
    });

    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add Team to Event attendance list (Admin and FTA allowed)
router.post('/:code/teams', requireRole(['ADMIN', 'FTA']), async (req, res) => {
  try {
    const { teamNumber } = req.body;
    const num = Number(teamNumber);
    if (isNaN(num)) return res.status(400).json({ error: 'Valid team number is required' });

    // Verify team actually exists first
    const teamExists = await Team.findOne({ number: num });
    if (!teamExists) {
      return res.status(404).json({ error: `Team ${num} must be registered in the system first` });
    }

    const event = await Event.findOne({ code: req.params.code });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (event.teams.includes(num)) {
      return res.status(409).json({ error: `Team ${num} is already registered at this event` });
    }

    event.teams.push(num);
    await event.save();

    // Log audit timeline
    await logIncidentChange({
      userId: req.user._id,
      action: 'EVENT_TEAM_ADDED',
      newValue: `${req.params.code}:${num}`,
      details: `Team ${num} added to Event "${event.name}"`
    });

    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all Teams registered/attending this Event (with optional pagination & search)
router.get('/:code/teams', async (req, res) => {
  try {
    const event = await Event.findOne({ code: req.params.code });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const search = req.query.search ? String(req.query.search).trim() : '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    let query = { number: { $in: event.teams } };
    if (search) {
      if (!isNaN(Number(search))) {
        query.number = { $in: event.teams.filter(n => String(n).includes(search)) };
      } else {
        query.name = { $regex: search, $options: 'i' };
      }
    }

    const total = await Team.countDocuments(query);
    const teams = await Team.find(query)
      .sort({ number: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      teams,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove Team from Event attendance list (Admin and FTA allowed)
router.delete('/:code/teams/:teamNumber', requireRole(['ADMIN', 'FTA']), async (req, res) => {
  try {
    const num = Number(req.params.teamNumber);
    if (isNaN(num)) return res.status(400).json({ error: 'Valid team number is required' });

    const event = await Event.findOne({ code: req.params.code });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    event.teams = event.teams.filter(t => t !== num);
    await event.save();

    await logIncidentChange({
      userId: req.user._id,
      action: 'EVENT_TEAM_REMOVED',
      newValue: `${req.params.code}:${num}`,
      details: `Team ${num} removed from Event "${event.name}"`
    });

    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
