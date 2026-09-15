import 'dotenv/config';
import { connectDB } from '../config/database.js';
import { Incident } from '../models/Incident.js';
import { User } from '../models/User.js';

async function createTestIncident() {
  try {
    await connectDB();
    console.log('Connected to DB...');

    const adminUser = await User.findOne({ role: 'ADMIN' }) || await User.findOne();

    // Create a new OPEN incident for Team 1156 matching the RADIO_COMMS category
    const testIncident = await Incident.create({
      teamNumber: 1156,
      matchNumber: 'Q48',
      eventCode: 'brba',
      category: 'RADIO_COMMS',
      priority: 'HIGH',
      status: 'OPEN',
      description: 'Robot radio lost communication and dropped connection 40 seconds into Teleop match during bumper collision.',
      reportedBy: adminUser?._id || null
    });

    console.log('Successfully created OPEN Test Incident for RAG testing:');
    console.log(`ID: ${testIncident._id}`);
    console.log(`Team: ${testIncident.teamNumber} | Category: ${testIncident.category} | Event: ${testIncident.eventCode}`);
    process.exit(0);
  } catch (err) {
    console.error('Error creating test incident:', err);
    process.exit(1);
  }
}

createTestIncident();
