import { AccessRequest } from '../models/AccessRequest.js';
import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';

export const accessRequestController = {
  // Public endpoint: Fetch registered competition events for access request form
  getPublicEvents: async (req, res) => {
    try {
      const { Event } = await import('../models/Event.js');
      const events = await Event.find({}, 'code name location isActive').sort({ name: 1 });
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Public endpoint: Submit new FTA event access request
  createRequest: async (req, res) => {
    try {
      const { name, email, password, requestedEventCodes, tbaEventKey, notes } = req.body;
      const eventsList = Array.isArray(requestedEventCodes) ? requestedEventCodes : [];

      if (!name || !email || !password || (eventsList.length === 0 && !tbaEventKey)) {
        return res.status(400).json({ error: 'Name, email, password, and at least one requested event code (or TBA Event Key) are required.' });
      }

      const formattedEmail = email.toLowerCase().trim();

      // Check for duplicate pending request for same email
      const existingPending = await AccessRequest.findOne({
        email: formattedEmail,
        status: 'PENDING'
      });

      if (existingPending) {
        return res.status(400).json({ error: 'A pending FTA access request for this email address is already under administrator review.' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const newRequest = await AccessRequest.create({
        name: name.trim(),
        email: formattedEmail,
        passwordHash,
        requestedEventCodes: eventsList,
        tbaEventKey: tbaEventKey ? tbaEventKey.trim() : '',
        notes: notes ? notes.trim() : ''
      });

      res.status(201).json({
        message: 'FTA access request submitted successfully. An administrator will review your request shortly.',
        request: newRequest
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Admin endpoint: Fetch all access requests
  getRequests: async (req, res) => {
    try {
      const { status } = req.query;
      const query = {};
      if (status) query.status = status.toUpperCase();

      const requests = await AccessRequest.find(query)
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 });

      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Admin endpoint: Approve an FTA access request
  approveRequest: async (req, res) => {
    try {
      const request = await AccessRequest.findById(req.params.id);
      if (!request) return res.status(404).json({ error: 'Access request not found' });
      if (request.status !== 'PENDING') {
        return res.status(400).json({ error: `Request has already been ${request.status.toLowerCase()}` });
      }

      // If a TBA Event Key was requested, import the event and team roster from TBA
      if (request.tbaEventKey) {
        try {
          const { getEventFromTBA, getEventTeamsFromTBA, getTeamFromTBA } = await import('../services/tbaService.js');
          const { Event } = await import('../models/Event.js');
          const { Team } = await import('../models/Team.js');

          const cleanKey = request.tbaEventKey.trim().toLowerCase();
          const tbaEvent = await getEventFromTBA(cleanKey);
          const tbaTeamNumbers = await getEventTeamsFromTBA(cleanKey);

          for (const teamNum of tbaTeamNumbers) {
            const existing = await Team.findOne({ number: teamNum });
            if (!existing) {
              try {
                const tbaTeam = await getTeamFromTBA(teamNum);
                await Team.create({ number: tbaTeam.number, name: tbaTeam.name, rookieYear: tbaTeam.rookieYear });
              } catch {
                await Team.create({ number: teamNum, name: `Team ${teamNum}`, rookieYear: new Date().getFullYear() });
              }
            }
          }

          let eventObj = await Event.findOne({ code: tbaEvent.code });
          if (!eventObj) {
            eventObj = await Event.create({
              code: tbaEvent.code,
              name: tbaEvent.name,
              location: tbaEvent.location,
              teams: tbaTeamNumbers,
              isActive: false
            });
          } else {
            eventObj.teams = Array.from(new Set([...(eventObj.teams || []), ...tbaTeamNumbers]));
            await eventObj.save();
          }

          if (!request.requestedEventCodes.includes(tbaEvent.code)) {
            request.requestedEventCodes.push(tbaEvent.code);
          }
        } catch (err) {
          console.error('TBA import during access request approval failed:', err.message);
        }
      }

      // Check if user exists with this email
      let targetUser = await User.findOne({ email: request.email });

      if (targetUser) {
        if (targetUser.role !== 'ADMIN') {
          targetUser.role = 'FTA';
        }
        if (request.passwordHash) {
          targetUser.passwordHash = request.passwordHash;
        }
        targetUser.status = 'ACTIVE';

        const currentEvents = targetUser.assignedEventCodes || [];
        const updatedEvents = Array.from(new Set([...currentEvents, ...request.requestedEventCodes]));
        targetUser.assignedEventCodes = updatedEvents;
        
        if (!targetUser.assignedEventCode && updatedEvents.length > 0) {
          targetUser.assignedEventCode = updatedEvents[0];
        }

        await targetUser.save();
      } else {
        targetUser = await User.create({
          name: request.name,
          email: request.email,
          role: 'FTA',
          status: 'ACTIVE',
          passwordHash: request.passwordHash,
          assignedEventCode: request.requestedEventCodes[0] || null,
          assignedEventCodes: request.requestedEventCodes
        });
      }

      request.status = 'APPROVED';
      request.reviewedBy = req.user._id;
      request.reviewedAt = new Date();
      await request.save();

      res.json({
        message: `Access request approved for ${request.name}. Role updated to FTA with assigned events.`,
        request,
        user: {
          _id: targetUser._id,
          name: targetUser.name,
          email: targetUser.email,
          role: targetUser.role,
          assignedEventCodes: targetUser.assignedEventCodes
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Admin endpoint: Reject an FTA access request
  rejectRequest: async (req, res) => {
    try {
      const { rejectionReason } = req.body;
      const request = await AccessRequest.findById(req.params.id);
      if (!request) return res.status(404).json({ error: 'Access request not found' });
      if (request.status !== 'PENDING') {
        return res.status(400).json({ error: `Request has already been ${request.status.toLowerCase()}` });
      }

      request.status = 'REJECTED';
      request.rejectionReason = rejectionReason || 'Request unverified or denied by administrator';
      request.reviewedBy = req.user._id;
      request.reviewedAt = new Date();
      await request.save();

      res.json({
        message: 'Access request rejected',
        request
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
