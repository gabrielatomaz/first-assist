import express from 'express';
import { Team } from '../models/Team.js';
import { Incident } from '../models/Incident.js';
import { requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Retrieve list of teams
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find().sort({ number: 1 });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search teams by number/name
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const isNum = !isNaN(Number(q));
    const filter = isNum 
      ? { number: Number(q) } 
      : { name: { $regex: q, $options: 'i' } };
    const teams = await Team.find(filter).limit(10);
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get team incident history logs
router.get('/:number/history', async (req, res) => {
  try {
    const num = Number(req.params.number);
    if (isNaN(num)) return res.status(400).json({ error: 'Invalid team number' });
    
    // Find previous incidents, populated with technicians and reporters
    const incidents = await Incident.find({ teamNumber: num })
      .populate('reportedBy', 'name role')
      .populate('assignedTo', 'name role')
      .sort({ createdAt: -1 });

    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register team (Admin only)
router.post('/', requireRole(['ADMIN']), async (req, res) => {
  try {
    const { number, name, rookieYear } = req.body;
    if (!number || !name) {
      return res.status(400).json({ error: 'Team number and name are required' });
    }

    const num = Number(number);
    if (isNaN(num)) {
      return res.status(400).json({ error: 'Valid team number is required' });
    }

    const existing = await Team.findOne({ number: num });
    if (existing) {
      return res.status(409).json({ error: `Team ${num} ("${existing.name}") is already registered in the system` });
    }

    const newTeam = await Team.create({ number: num, name: name.trim(), rookieYear: Number(rookieYear) || undefined });
    res.status(201).json(newTeam);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Team number already registered' });
    }
    res.status(400).json({ error: error.message });
  }
});

export default router;
