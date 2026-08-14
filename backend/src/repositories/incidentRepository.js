import { Incident } from '../models/Incident.js';

export const incidentRepository = {
  findAll: async (query = {}) => {
    return await Incident.find(query)
      .populate('reportedBy', 'name role')
      .populate('assignedTo', 'name role')
      .populate('closedBy', 'name role')
      .populate('diagnosisHistory.updatedBy', 'name role')
      .sort({ createdAt: -1 });
  },

  findById: async (id) => {
    return await Incident.findById(id)
      .populate('reportedBy', 'name role')
      .populate('assignedTo', 'name role')
      .populate('closedBy', 'name role')
      .populate('diagnosisHistory.updatedBy', 'name role');
  },

  create: async (incidentData) => {
    const incident = new Incident(incidentData);
    await incident.save();
    return await Incident.findById(incident._id)
      .populate('reportedBy', 'name role');
  },

  updateStatus: async (id, status, assignedTo = undefined) => {
    const updates = { status };
    if (assignedTo !== undefined) {
      updates.assignedTo = assignedTo;
      // Automatically transition from OPEN to ASSIGNED when assignedTo is set
      if (status === 'OPEN' && assignedTo) {
        updates.status = 'ASSIGNED';
      }
    }
    return await Incident.findByIdAndUpdate(id, updates, { new: true })
      .populate('reportedBy', 'name role')
      .populate('assignedTo', 'name role')
      .populate('closedBy', 'name role');
  },

  updateDiagnosis: async (id, diagnosis, userId) => {
    return await Incident.findByIdAndUpdate(
      id,
      {
        diagnosis,
        $push: {
          diagnosisHistory: {
            text: diagnosis,
            updatedBy: userId,
            updatedAt: new Date()
          }
        }
      },
      { new: true }
    )
      .populate('reportedBy', 'name role')
      .populate('assignedTo', 'name role')
      .populate('closedBy', 'name role')
      .populate('diagnosisHistory.updatedBy', 'name role');
  },

  resolve: async (id, rootCause, appliedSolution) => {
    return await Incident.findByIdAndUpdate(
      id,
      {
        status: 'RESOLVED',
        rootCause,
        appliedSolution,
        resolvedAt: new Date()
      },
      { new: true }
    )
      .populate('reportedBy', 'name role')
      .populate('assignedTo', 'name role')
      .populate('closedBy', 'name role');
  },

  close: async (id, userId) => {
    return await Incident.findByIdAndUpdate(
      id,
      {
        status: 'CLOSED',
        closedAt: new Date(),
        closedBy: userId
      },
      { new: true }
    )
      .populate('reportedBy', 'name role')
      .populate('assignedTo', 'name role')
      .populate('closedBy', 'name role')
      .populate('diagnosisHistory.updatedBy', 'name role');
  }
};
