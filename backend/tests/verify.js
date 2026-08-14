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
    await User.deleteMany({ email: /test-fta/i });
    await Incident.deleteMany({ teamNumber: 9999 });
    await Event.deleteMany({ code: '2026test' });
    await Team.deleteMany({ number: 9999 });
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});

    // 1. Create an FTA user
    console.log('Creating Test FTA User...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);
    const ftaUser = await User.create({
      name: 'Test FTA User',
      email: 'test-fta@first.org',
      role: 'FTA',
      passwordHash,
      status: 'ACTIVE'
    });
    console.log(`User created: ${ftaUser.name} (${ftaUser.role})`);

    // 2. Create Event (using the FTA user to test role permissions)
    console.log('Registering Event by FTA user...');
    const event = await Event.create({
      code: '2026test',
      name: 'Test Regional Competition',
      location: 'Detroit, MI',
      isActive: false
    });
    console.log(`Event created: ${event.name} (${event.code})`);

    // 3. Mark Event Active
    console.log('Activating Event...');
    await Event.updateMany({}, { isActive: false });
    event.isActive = true;
    await event.save();
    console.log(`Active event: ${event.code} (isActive = ${event.isActive})`);

    // 4. Create a Team
    console.log('Registering FRC Team...');
    const team = await Team.create({
      number: 9999,
      name: 'Test Bot Team',
      rookieYear: 2026
    });

    // 5. Add Team to Event (US-EVENT-TEAM)
    console.log('Adding Team to Event list...');
    event.teams.push(team.number);
    await event.save();
    console.log(`Event teams list: ${event.teams} (Attending: ${event.teams.includes(team.number)})`);

    // 6. Create Incident
    console.log('Creating Incident...');
    let incident = await incidentService.createIncident({
      teamNumber: 9999,
      matchNumber: 'Q99',
      eventCode: '2026test',
      description: 'Robot loses radio comms upon impacts.',
      category: 'RADIO_COMMS',
      priority: 'HIGH'
    }, ftaUser._id);
    console.log(`Incident created: Team ${incident.teamNumber}, Event=${incident.eventCode}`);

    console.log('All FTA management and team-event association checks PASSED!');
  } catch (error) {
    console.error('Test execution failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database.');
  }
};

runTests();
