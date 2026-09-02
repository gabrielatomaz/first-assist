import { incidentRepository } from '../repositories/incidentRepository.js';
import { aiSuggestionRepository } from '../repositories/aiSuggestionRepository.js';
import { Incident } from '../models/Incident.js';
import { logIncidentChange, createAssignmentNotification } from '../utils/auditLogger.js';

export const incidentService = {
  getAllIncidents: async (filters = {}) => {
    const query = {};
    if (filters.status) query.status = filters.status;
    if (filters.category) query.category = filters.category;
    if (filters.priority) query.priority = filters.priority;
    if (filters.teamNumber) query.teamNumber = Number(filters.teamNumber);
    if (filters.eventCode) query.eventCode = filters.eventCode;
    return await incidentRepository.findAll(query);
  },

  getIncidentById: async (id) => {
    return await incidentRepository.findById(id);
  },

  createIncident: async (data, userId) => {
    if (!data.teamNumber || !data.description) {
      throw new Error("teamNumber and description are required");
    }
    const incidentData = {
      ...data,
      reportedBy: userId
    };
    const newIncident = await incidentRepository.create(incidentData);
    
    // Log creation
    await logIncidentChange({
      incidentId: newIncident._id,
      userId,
      action: 'INCIDENT_CREATED',
      newValue: 'OPEN',
      details: `Incident created for Team ${newIncident.teamNumber}`
    });

    return newIncident;
  },

  updateIncidentStatus: async (id, status, assignedTo, userId) => {
    const allowedStatuses = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED'];
    if (!allowedStatuses.includes(status)) {
      throw new Error("Invalid status state");
    }

    const previous = await Incident.findById(id);
    if (!previous) throw new Error("Incident not found");

    const updated = await incidentRepository.updateStatus(id, status, assignedTo);

    // Audit logs for status change
    if (previous.status !== updated.status) {
      await logIncidentChange({
        incidentId: id,
        userId,
        action: 'STATUS_UPDATE',
        oldValue: previous.status,
        newValue: updated.status,
        details: `Status transitioned from ${previous.status} to ${updated.status}`
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
    const query = { status: { $in: ['RESOLVED', 'CLOSED'] } };
    
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
      .populate('reportedBy', 'name role')
      .populate('assignedTo', 'name role')
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

    // Find resolved or closed incidents matching the category, excluding self
    return await Incident.find({
      _id: { $ne: incidentId },
      status: { $in: ['RESOLVED', 'CLOSED'] },
      category: currentIncident.category
    })
      .limit(3)
      .populate('reportedBy', 'name role')
      .populate('assignedTo', 'name role');
  },

  getAISuggestionsForIncident: async (incidentId) => {
    let suggestion = await aiSuggestionRepository.findByIncidentId(incidentId);
    
    if (!suggestion) {
      // Mock generate suggestions
      suggestion = await aiSuggestionRepository.create({
        incidentId,
        suggestedCause: 'Loose cable connector plug inside driver station enclosure.',
        suggestedSolution: 'Reconnect securely, tape or zip-tie connector logic to prevent event vibration drops.',
        rating: 'UNRATED'
      });
    }
    
    return [suggestion];
  }
};
