import mongoose from 'mongoose';
import { incidentService } from '../services/incidentService.js';
import { Event } from '../models/Event.js';

export const incidentController = {
  getIncidents: async (req, res) => {
    try {
      let { status, category, priority, teamNumber, eventCode, page, limit } = req.query;
      const userRole = (req.user?.role || '').toUpperCase();

      // Role-based event access scoping:
      // 1. CSA: Restricted to event assigned by FTA (req.user.assignedEventCode) if set and eventCode not specified
      if (userRole === 'CSA' && req.user?.assignedEventCode && !eventCode) {
        eventCode = req.user.assignedEventCode;
      }
      // 2. ADMIN: Full access to ALL events across system
      // 3. FTA: Full access to managed events / assigned events
      if (userRole === 'FTA' && !eventCode) {
        const assignedCodes = req.user?.assignedEventCodes || [];
        if (assignedCodes.length > 0) {
          eventCode = assignedCodes[0];
        }
      }

      const filters = { status, category, priority, teamNumber, eventCode };
      const incidents = await incidentService.getAllIncidents(filters, page, limit);
      res.json(incidents);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getIncidentById: async (req, res) => {
    try {
      const incident = await incidentService.getIncidentById(req.params.id);
      if (!incident) {
        return res.status(404).json({ error: 'Incident not found' });
      }
      res.json(incident);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  createPublicIncident: async (req, res) => {
    try {
      const incident = await incidentService.createIncident({
        ...req.body,
        status: 'PENDING_SCREENING'
      }, null);
      res.status(201).json(incident);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  getPublicIncidentsStatus: async (req, res) => {
    try {
      const { Incident } = await import('../models/Incident.js');
      const idsParam = req.query.ids || (req.body && req.body.ids);
      if (!idsParam) {
        return res.json([]);
      }
      const rawIds = Array.isArray(idsParam) ? idsParam : String(idsParam).split(',');
      const validIds = rawIds
        .map(id => String(id).trim())
        .filter(id => mongoose.Types.ObjectId.isValid(id));

      if (validIds.length === 0) {
        return res.json([]);
      }

      const incidents = await Incident.find({ _id: { $in: validIds } })
        .select('_id teamNumber eventCode matchNumber category priority status description createdAt updatedAt resolvedAt')
        .lean();

      res.json(incidents);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  cancelPublicIncident: async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid incident ID' });
      }

      const incident = await incidentService.getIncidentById(id);
      if (!incident) {
        return res.status(404).json({ error: 'Incident not found' });
      }

      if (['CLOSED', 'RESOLVED', 'REJECTED'].includes(incident.status)) {
        return res.status(400).json({
          error: `Incident cannot be canceled because it is already ${incident.status.toLowerCase()}`
        });
      }

      const updated = await incidentService.updateIncidentStatus(
        id,
        'CLOSED',
        null,
        null
      );

      updated.diagnosis = (updated.diagnosis ? updated.diagnosis + '\n' : '') + '[Guest Reporter]: Incident canceled by reporter.';
      await updated.save();

      res.json({
        message: 'Incident ticket canceled successfully.',
        incident: updated
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  lookupTeamEvents: async (req, res) => {
    try {
      const { teamNumber, year } = req.query;
      if (!teamNumber) {
        return res.status(400).json({ error: 'Team number is required' });
      }

      const num = Number(teamNumber);
      const seasonYear = year ? Number(year) : new Date().getFullYear();

      let teamInfo = null;
      let teamFound = false;

      // 1. Fetch team details from TBA
      try {
        const { getTeamFromTBA } = await import('../services/tbaService.js');
        teamInfo = await getTeamFromTBA(num);
        teamFound = true;
      } catch (tbaTeamErr) {
        // Fallback to local Team model if exists
        try {
          if (mongoose.connection.readyState === 1) {
            const { Team } = await import('../models/Team.js');
            const localTeam = await Team.findOne({ number: num });
            if (localTeam) {
              teamInfo = {
                number: localTeam.number,
                name: localTeam.name,
                city: localTeam.city || '',
                state: localTeam.state || '',
                country: localTeam.country || '',
                rookieYear: localTeam.rookieYear
              };
              teamFound = true;
            }
          }
        } catch (dbErr) {
          console.warn('Local team lookup fallback:', dbErr.message);
        }
      }

      const eventsList = [];

      // 2. Fetch from Local Database matching teamNumber if DB is connected
      if (mongoose.connection.readyState === 1) {
        try {
          const localTeamEvents = await Event.find({ teams: num });
          for (const e of localTeamEvents) {
            eventsList.push({
              code: e.code,
              name: e.name,
              key: `${seasonYear}${e.code.toLowerCase()}`,
              year: seasonYear,
              location: e.location || ''
            });
            teamFound = true;
          }
        } catch (dbErr) {
          console.warn('Local event find fallback:', dbErr.message);
        }
      }

      // 3. Fetch from TBA for team (specified season year events only)
      try {
        const { getTeamEventsFromTBA } = await import('../services/tbaService.js');
        const tbaEvents = await getTeamEventsFromTBA(num, seasonYear);
        for (const tbaEv of tbaEvents) {
          if (!eventsList.some(e => e.code.toLowerCase() === tbaEv.code.toLowerCase())) {
            eventsList.push(tbaEv);
          }
        }
        if (tbaEvents.length > 0) {
          teamFound = true;
        }
      } catch (tbaErr) {
        console.warn('TBA team events lookup fallback:', tbaErr.message);
      }

      // If team not found via TBA or DB, but events were found, default teamInfo
      if (!teamInfo && eventsList.length > 0) {
        teamInfo = { number: num, name: `Team ${num}` };
      }

      res.json({
        found: teamFound,
        team: teamInfo,
        events: eventsList,
        year: seasonYear
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  lookupTeamMatches: async (req, res) => {
    try {
      const { teamNumber, eventCode, eventKey } = req.query;
      if (!teamNumber) {
        return res.status(400).json({ error: 'Team number is required' });
      }

      const num = Number(teamNumber);
      const eKey = eventKey || (eventCode ? `${new Date().getFullYear()}${eventCode.toLowerCase()}` : '');

      let matchesList = [];

      // 1. Fetch from TBA if eventKey available
      if (eKey) {
        try {
          const { getTeamEventMatchesFromTBA } = await import('../services/tbaService.js');
          matchesList = await getTeamEventMatchesFromTBA(num, eKey);
        } catch (tbaErr) {
          console.warn('TBA team matches lookup fallback:', tbaErr.message);
        }
      }

      // 2. Fallback default matches if TBA yields no matches
      if (matchesList.length === 0) {
        for (let i = 1; i <= 15; i++) {
          matchesList.push({
            key: `Q${i}`,
            label: `Qualification ${i} (Q${i})`,
            compLevel: 'qm',
            matchNumber: i
          });
        }
        matchesList.push({ key: 'Playoffs', label: 'Playoffs', compLevel: 'po', matchNumber: 1 });
        matchesList.push({ key: 'Pit Prep', label: 'Pit / Practice', compLevel: 'pit', matchNumber: 0 });
      }

      res.json(matchesList);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  createIncident: async (req, res) => {
    try {
      const incident = await incidentService.createIncident(req.body, req.user?._id);
      res.status(201).json(incident);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { status, assignedTo } = req.body;
      const userRole = (req.user?.role || '').toUpperCase();
      
      if (!['ADMIN', 'FTA', 'CSA'].includes(userRole)) {
        return res.status(403).json({ error: 'Forbidden: Only CSAs, FTAs, and Administrators can manage incident screening and status transitions.' });
      }

      // If setting an assignee that is not self, verify the user is ADMIN or FTA
      if (assignedTo && assignedTo !== req.user._id.toString()) {
        if (userRole !== 'ADMIN' && userRole !== 'FTA') {
          return res.status(403).json({ error: 'CSAs can only assign incidents to themselves' });
        }
      }

      const incident = await incidentService.updateIncidentStatus(req.params.id, status, assignedTo, req.user._id);
      res.json(incident);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  updateDiagnosis: async (req, res) => {
    try {
      const { diagnosis } = req.body;
      const incident = await incidentService.updateIncidentDiagnosis(req.params.id, diagnosis, req.user._id);
      res.json(incident);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  resolveIncident: async (req, res) => {
    try {
      const { rootCause, appliedSolution } = req.body;
      const incident = await incidentService.resolveIncident(req.params.id, rootCause, appliedSolution, req.user._id);
      res.json(incident);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  closeIncident: async (req, res) => {
    try {
      const incident = await incidentService.closeIncident(req.params.id, req.user._id);
      res.json(incident);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  searchIncidents: async (req, res) => {
    try {
      const { q, category, priority, teamNumber, eventCode, page, limit } = req.query;
      const results = await incidentService.searchResolvedIncidents(
        q, 
        { category, priority, teamNumber, eventCode }, 
        { page, limit }
      );
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getAISuggestions: async (req, res) => {
    try {
      const suggestions = await incidentService.getAISuggestionsForIncident(req.params.id);
      res.json({ suggestions });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  generateAISuggestions: async (req, res) => {
    try {
      const suggestion = await incidentService.generateAISuggestionsForIncident(req.params.id);
      res.json({ suggestion, suggestions: [suggestion] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  transcribeAudio: async (req, res) => {
    try {
      const { simulate_error } = req.query;
      
      // Simulate network transcription failure (for testing retry flows)
      if (simulate_error === 'true' || Math.random() < 0.2) {
        return res.status(503).json({ error: 'Speech-to-Text transcription service timeout. Please try again.' });
      }

      // Return simulated text translation along with structured parameters
      res.json({
        text: 'Simulated Voice Transcription: Team 254 in match Q12 has a loose CAN bus connector causing code exceptions. This is critical!',
        teamNumber: 254,
        matchNumber: 'Q12',
        category: 'CAN_BUS',
        priority: 'CRITICAL'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getRelatedIncidents: async (req, res) => {
    try {
      const related = await incidentService.getRelatedIncidents(req.params.id);
      res.json(related);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getIncidentAuditLogs: async (req, res) => {
    try {
      const { AuditLog } = await import('../models/AuditLog.js');
      const logs = await AuditLog.find({ incidentId: req.params.id })
        .populate('userId', 'name role')
        .sort({ timestamp: 1 });
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteIncident: async (req, res) => {
    try {
      const deleted = await incidentService.deleteIncident(req.params.id, req.user);
      res.json({ message: 'Incident deleted successfully', incident: deleted });
    } catch (error) {
      if (error.message.includes('Forbidden') || error.message.includes('not authorized')) {
        return res.status(403).json({ error: error.message });
      }
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
};
