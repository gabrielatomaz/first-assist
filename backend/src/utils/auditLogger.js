import { AuditLog } from '../models/AuditLog.js';
import { Notification } from '../models/Notification.js';

export const logIncidentChange = async ({ incidentId, userId, action, oldValue, newValue, details }) => {
  try {
    await AuditLog.create({
      incidentId,
      userId,
      action,
      oldValue,
      newValue,
      details
    });
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
};

export const createAssignmentNotification = async ({ recipientId, incidentId, text }) => {
  try {
    await Notification.create({
      recipient: recipientId,
      text,
      link: `/incidents/${incidentId}`
    });
  } catch (error) {
    console.error('Notification creation failed:', error);
  }
};
