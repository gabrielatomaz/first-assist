import { Incident } from '../models/Incident.js';

export const incidentRepository = {
  findAll: async () => {
    return await Incident.find().sort({ createdAt: -1 });
  },

  create: async (incidentData) => {
    const incident = new Incident(incidentData);
    return await incident.save();
  },

  updateStatus: async (id, status) => {
    return await Incident.findByIdAndUpdate(id, { status }, { new: true });
  }
};
