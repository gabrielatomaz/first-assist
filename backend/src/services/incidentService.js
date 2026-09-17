import { incidentRepository } from '../repositories/incidentRepository.js';
import { aiSuggestionRepository } from '../repositories/aiSuggestionRepository.js';
import { Incident } from '../models/Incident.js';
import { Event } from '../models/Event.js';
import { User } from '../models/User.js';
import { logIncidentChange, createAssignmentNotification } from '../utils/auditLogger.js';
import { generateDiagnosticSuggestion } from './aiService.js';

export const incidentService = {
  getAllIncidents: async (filters = {}, pagination = {}) => {
    const query = {};
    if (filters.status && filters.status !== 'ALL') {
      if (filters.status === 'ALL_INCLUDING_PENDING') {
        // No status filter applied
      } else {
        query.status = filters.status;
      }
    } else {
      // Active board view: exclude PENDING_SCREENING tickets (which belong to In Triage queue)
      query.status = { $ne: 'PENDING_SCREENING' };
    }
    if (filters.category) query.category = filters.category;
    if (filters.priority) query.priority = filters.priority;
    if (filters.teamNumber) query.teamNumber = Number(filters.teamNumber);
    
    if (filters.eventCode && filters.eventCode !== 'ALL') {
      const targetEvent = await Event.findOne({ code: filters.eventCode });
      const eventTeams = targetEvent?.teams || [];
      query.$or = [
        { eventCode: filters.eventCode },
        {
          eventCode: { $in: [null, '', undefined] },
          teamNumber: { $in: eventTeams }
        }
      ];
    }

    if (pagination.page || pagination.limit) {
      const page = parseInt(pagination.page) || 1;
      const limit = parseInt(pagination.limit) || 9;
      const skip = (page - 1) * limit;

      const total = await Incident.countDocuments(query);
      const incidents = await incidentRepository.findAllPaginated(query, skip, limit);
      return {
        incidents,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1
      };
    }

    return await incidentRepository.findAll(query);
  },

  getIncidentById: async (id) => {
    return await incidentRepository.findById(id);
  },

  createIncident: async (data, userId) => {
    if (!data.teamNumber || !data.description) {
      throw new Error("teamNumber and description are required");
    }

    let resolvedEventCode = null;

    if (data.eventCode) {
      resolvedEventCode = data.eventCode;
    } else {
      const teamEv = await Event.findOne({ teams: Number(data.teamNumber) });
      if (teamEv) {
        resolvedEventCode = teamEv.code;
      }
    }

    if (!resolvedEventCode) {
      throw new Error(`Cannot create incident: Team ${data.teamNumber} is not registered for any active competition event.`);
    }

    // Determine initial status: PENDING_SCREENING for general reporters, OPEN if logged directly by CSA/FTA/Admin
    let initialStatus = data.status || 'PENDING_SCREENING';
    if (userId) {
      const reportingUser = await User.findById(userId);
      if (reportingUser && ['ADMIN', 'FTA', 'CSA'].includes(reportingUser.role)) {
        initialStatus = data.status || 'OPEN';
      }
    }

    const incidentData = {
      ...data,
      status: initialStatus,
      eventCode: resolvedEventCode,
      reportedBy: userId
    };
    const newIncident = await incidentRepository.create(incidentData);
    
    // Log creation
    await logIncidentChange({
      incidentId: newIncident._id,
      userId,
      action: 'INCIDENT_CREATED',
      newValue: newIncident.status,
      details: `Incident created for Team ${newIncident.teamNumber} (${newIncident.status})`
    });

    return newIncident;
  },

  updateIncidentStatus: async (id, status, assignedTo, userId) => {
    const allowedStatuses = ['PENDING_SCREENING', 'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED', 'REJECTED'];
    if (!allowedStatuses.includes(status)) {
      throw new Error("Invalid status state");
    }

    const previous = await Incident.findById(id);
    if (!previous) throw new Error("Incident not found");

    const extraUpdates = {};
    if (previous.status === 'PENDING_SCREENING' && status !== 'REJECTED' && userId) {
      extraUpdates.reportedBy = userId;
    }

    const updated = await incidentRepository.updateStatus(id, status, assignedTo, extraUpdates);

    // Audit logs for status change
    if (previous.status !== updated.status) {
      const detailsMsg = previous.status === 'PENDING_SCREENING' && extraUpdates.reportedBy
        ? `Incident accepted from Triage into ${updated.status}`
        : `Status transitioned from ${previous.status} to ${updated.status}`;

      await logIncidentChange({
        incidentId: id,
        userId,
        action: 'STATUS_UPDATE',
        oldValue: previous.status,
        newValue: updated.status,
        details: detailsMsg
      });
    }

    // Audit and Notification for assignment changes
    const prevAssigneeStr = previous.assignedTo ? previous.assignedTo.toString() : null;
    const newAssigneeStr = updated.assignedTo ? updated.assignedTo.toString() : null;

    if (prevAssigneeStr !== newAssigneeStr) {
      await logIncidentChange({
        incidentId: id,
        userId,
        action: 'ASSIGNMENT_CHANGE',
        oldValue: prevAssigneeStr,
        newValue: newAssigneeStr,
        details: newAssigneeStr ? `Assigned technician changed` : 'Technician unassigned'
      });

      // Dispatch assignment notification (US-NOTIF-001)
      if (newAssigneeStr) {
        await createAssignmentNotification({
          recipientId: updated.assignedTo,
          incidentId: id,
          text: `Incident for Team ${updated.teamNumber} has been assigned to you.`
        });
      }
    }

    return updated;
  },

  updateIncidentDiagnosis: async (id, diagnosis, userId) => {
    if (!diagnosis) {
      throw new Error("Diagnosis text is required");
    }
    const updated = await incidentRepository.updateDiagnosis(id, diagnosis, userId);
    
    await logIncidentChange({
      incidentId: id,
      userId,
      action: 'DIAGNOSIS_UPDATE',
      newValue: diagnosis,
      details: 'Recorded a new technical diagnosis entry'
    });

    return updated;
  },

  resolveIncident: async (id, rootCause, appliedSolution, userId) => {
    if (!rootCause || !appliedSolution) {
      throw new Error("rootCause and appliedSolution are required to resolve an incident");
    }
    const previous = await Incident.findById(id);
    const updated = await incidentRepository.resolve(id, rootCause, appliedSolution);

    await logIncidentChange({
      incidentId: id,
      userId,
      action: 'RESOLVED',
      oldValue: previous ? previous.status : 'UNKNOWN',
      newValue: 'RESOLVED',
      details: `Resolved with Root Cause: "${rootCause}"`
    });

    return updated;
  },

  closeIncident: async (id, userId) => {
    const previous = await Incident.findById(id);
    const updated = await incidentRepository.close(id, userId);

    await logIncidentChange({
      incidentId: id,
      userId,
      action: 'CLOSED',
      oldValue: previous ? previous.status : 'UNKNOWN',
      newValue: 'CLOSED',
      details: `Incident marked CLOSED`
    });

    return updated;
  },

  searchResolvedIncidents: async (keyword, filters = {}, pagination = {}) => {
    const query = { status: 'RESOLVED' };
    
    if (filters.category) query.category = filters.category;
    if (filters.priority) query.priority = filters.priority;
    if (filters.teamNumber) query.teamNumber = Number(filters.teamNumber);
    if (filters.eventCode) query.eventCode = filters.eventCode;

    if (keyword) {
      query.$text = { $search: keyword };
    }

    const page = parseInt(pagination.page) || 1;
    const limit = parseInt(pagination.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Incident.countDocuments(query);
    const incidents = await Incident.find(query)
      .populate('reportedBy', 'name role avatarIcon avatarColor')
      .populate('assignedTo', 'name role avatarIcon avatarColor')
      .sort(keyword ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      incidents,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1
    };
  },

  getRelatedIncidents: async (incidentId) => {
    const currentIncident = await Incident.findById(incidentId);
    if (!currentIncident) throw new Error('Incident not found');

    // Find resolved incidents matching the category, excluding self
    return await Incident.find({
      _id: { $ne: incidentId },
      status: 'RESOLVED',
      category: currentIncident.category
    })
      .limit(3)
      .populate('reportedBy', 'name role avatarIcon avatarColor')
      .populate('assignedTo', 'name role avatarIcon avatarColor');
  },

  getAISuggestionsForIncident: async (incidentId) => {
    let suggestion = await aiSuggestionRepository.findByIncidentId(incidentId);
    return suggestion ? [suggestion] : [];
  },

  generateAISuggestionsForIncident: async (incidentId) => {
    const incident = await incidentRepository.findById(incidentId);
    if (!incident) throw new Error('Incident not found');

    let relatedIncidents = [];
    try {
      relatedIncidents = await Incident.find({
        _id: { $ne: incidentId },
        status: 'RESOLVED',
        category: incident.category
      }).limit(3);
    } catch (err) {
      console.warn('Could not fetch related tickets for AI context:', err.message);
    }

    const aiResult = await generateDiagnosticSuggestion(incident, relatedIncidents);

    const suggestion = await aiSuggestionRepository.upsertByIncidentId(incidentId, {
      incidentId,
      suggestedCause: aiResult.suggestedCause,
      suggestedSolution: aiResult.suggestedSolution,
      isRagGrounded: aiResult.isRagGrounded,
      citedIncidents: aiResult.citedIncidents,
      rating: 'UNRATED'
    });

    return suggestion;
  },

  deleteIncident: async (incidentId, user) => {
    const incident = await Incident.findById(incidentId);
    if (!incident) throw new Error('Incident not found');

    const creatorId = incident.reportedBy ? (incident.reportedBy._id || incident.reportedBy).toString() : null;
    const isCreator = creatorId && creatorId === user._id.toString();
    const isFTA = user.role === 'FTA' || user.role === 'ADMIN';

    if (!isCreator && !isFTA) {
      throw new Error('Forbidden: Only an FTA or the incident creator can delete this incident');
    }

    // Clean up associated AI suggestions
    try {
      const { AISuggestion } = await import('../models/AISuggestion.js');
      await AISuggestion.deleteMany({ incidentId });
    } catch (e) {
      console.warn('Could not clean up AI suggestion on delete:', e.message);
    }

    await Incident.findByIdAndDelete(incidentId);

    // Audit log
    await logIncidentChange({
      incidentId,
      userId: user._id,
      action: 'INCIDENT_DELETED',
      newValue: 'DELETED',
      details: `Incident for Team ${incident.teamNumber} was deleted by ${user.name} (${user.role})`
    });

    return incident;
  }
};
