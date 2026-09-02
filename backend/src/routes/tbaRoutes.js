import express from 'express';
import { requireRole } from '../middleware/authMiddleware.js';
import { getTeamFromTBA, getEventFromTBA, getEventsByYearFromTBA, getEventTeamsFromTBA } from '../services/tbaService.js';
import { Team } from '../models/Team.js';
import { Event } from '../models/Event.js';
import { logIncidentChange } from '../utils/auditLogger.js';

const router = express.Router();

// Require FTA or Admin role for TBA imports
router.use(requireRole(['ADMIN', 'FTA']));

// GET /api/tba/teams/:teamNumber - Lookup team info from TBA
router.get('/teams/:teamNumber', async (req, res) => {
  try {
    const teamData = await getTeamFromTBA(req.params.teamNumber);
    res.json(teamData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/tba/events/:eventKey - Lookup single event info from TBA
router.get('/events/:eventKey', async (req, res) => {
  try {
    const eventData = await getEventFromTBA(req.params.eventKey);
    res.json(eventData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/tba/events/year/:year - Lookup all FRC events for a season year
router.get('/events/year/:year', async (req, res) => {
  try {
    const events = await getEventsByYearFromTBA(req.params.year);
    res.json(events);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/tba/import-event/:eventKey - One-click import event & participating team roster from TBA
router.post('/import-event/:eventKey', async (req, res) => {
  try {
    const eventKey = req.params.eventKey;
    const tbaEvent = await getEventFromTBA(eventKey);
    const tbaTeamNumbers = await getEventTeamsFromTBA(eventKey);

    // 1. Register or update teams in system
    for (const teamNum of tbaTeamNumbers) {
      const existing = await Team.findOne({ number: teamNum });
      if (!existing) {
        try {
          const tbaTeam = await getTeamFromTBA(teamNum);
          await Team.create({
            number: tbaTeam.number,
            name: tbaTeam.name,
            rookieYear: tbaTeam.rookieYear
          });
        } catch {
          // Fallback if individual team lookup fails
          await Team.create({
            number: teamNum,
            name: `Team ${teamNum}`,
            rookieYear: new Date().getFullYear()
          });
        }
      }
    }

    // 2. Create or update Event record with team numbers
    let event = await Event.findOne({ code: tbaEvent.code });
    if (!event) {
      event = await Event.create({
        code: tbaEvent.code,
        name: tbaEvent.name,
        location: tbaEvent.location,
        teams: tbaTeamNumbers,
        isActive: false
      });
    } else {
      // Merge teams
      const mergedTeams = Array.from(new Set([...(event.teams || []), ...tbaTeamNumbers]));
      event.teams = mergedTeams;
      await event.save();
    }

    await logIncidentChange({
      userId: req.user._id,
      action: 'TBA_EVENT_IMPORT',
      newValue: tbaEvent.code,
      details: `Imported FRC Event "${tbaEvent.name}" (${tbaEvent.code}) with ${tbaTeamNumbers.length} teams from TBA`
    });

    res.status(201).json({
      message: `Successfully imported event ${tbaEvent.name} (${tbaEvent.code}) with ${tbaTeamNumbers.length} teams`,
      event,
      teamsImportedCount: tbaTeamNumbers.length
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
