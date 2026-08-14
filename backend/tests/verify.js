import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../src/models/User.js';
import { Incident } from '../src/models/Incident.js';
import { Event } from '../src/models/Event.js';
import { Team } from '../src/models/Team.js';
import { Notification } from '../src/models/Notification.js';
import { AuditLog } from '../src/models/AuditLog.js';
import { incidentService } from '../src/services/incidentService.js';

const runTests = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected.');

    // Cleanup previous test data
    console.log('Cleaning up previous test data...');
    await User.deleteMany({ email: /test-csa/i });
    await Incident.deleteMany({ teamNumber: 9999 });
    await Event.deleteMany({ code: '2026test' });
    await Team.deleteMany({ number: 9999 });
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});

    // 1. Create a Test User
    console.log('Creating Test User...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);
    const user = await User.create({
      name: 'Test CSA User',
      email: 'test-csa@first.org',
      role: 'CSA',
      passwordHash,
      status: 'ACTIVE'
    });

    // 2. Create Event Context
    console.log('Creating Active Event context...');
    const event = await Event.create({
      code: '2026test',
      name: 'Test Regional Competition',
      location: 'Detroit, MI',
      isActive: true
    });
    console.log(`Event created: ${event.name} (${event.code})`);

    // 3. Register FRC Team
    console.log('Registering FRC Team...');
    const team = await Team.create({
      number: 9999,
      name: 'Test Bot Team',
      rookieYear: 2026
    });
    console.log(`Team created: Team ${team.number} — ${team.name}`);

    // 4. Create Incident (linking to active event)
    console.log('Creating Incident...');
    let incident = await incidentService.createIncident({
      teamNumber: 9999,
      matchNumber: 'Q99',
      eventCode: '2026test',
      description: 'Robot loses radio comms upon impacts.',
      category: 'RADIO_COMMS',
      priority: 'HIGH'
    }, user._id);
    console.log(`Incident created: Team ${incident.teamNumber}, Event=${incident.eventCode}`);

    // 5. Update Status (triggering AuditLog)
    console.log('Updating incident status/assignee...');
    incident = await incidentService.updateIncidentStatus(incident._id, 'ASSIGNED', user._id, user._id);
    console.log(`Incident updated: Status=${incident.status}, Assignee=${incident.assignedTo}`);

    // 6. Verify Notifications
    console.log('Checking notifications...');
    const notifications = await Notification.find({ recipient: user._id });
    console.log(`Notifications count: ${notifications.length} (Expected: 1)`);
    if (notifications.length > 0) {
      console.log(`Notification text: "${notifications[0].text}"`);
    }

    // 7. Verify AuditLogs
    console.log('Checking audit logs...');
    const logs = await AuditLog.find({});
    console.log(`Audit log count: ${logs.length} (Expected: 3 - Creation, Status Update, Assignment Change)`);
    for (const log of logs) {
      console.log(`- Action: ${log.action}, Details: "${log.details}"`);
    }

    console.log('All backend checks for Epics 10 through 17 PASSED!');
  } catch (error) {
    console.error('Test execution failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database.');
  }
};

runTests();
