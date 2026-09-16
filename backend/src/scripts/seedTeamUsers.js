import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User.js';

dotenv.config();

const seedTeamUsers = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/first-assist';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('team123', salt);

    const testUsers = [
      {
        name: 'Team 1156 Lead Mentor',
        email: 'mentor1156@first.org',
        role: 'TEAM',
        teamNumber: 1156,
        teamRole: 'MENTOR',
        passwordHash: defaultPasswordHash,
        avatarIcon: 'user-tie',
        avatarColor: '#10B981',
        status: 'ACTIVE'
      },
      {
        name: 'Team 1156 Captain',
        email: 'captain1156@first.org',
        role: 'TEAM',
        teamNumber: 1156,
        teamRole: 'CAPTAIN',
        passwordHash: defaultPasswordHash,
        avatarIcon: 'user-shield',
        avatarColor: '#38BDF8',
        status: 'ACTIVE'
      },
      {
        name: 'Team 1156 Student Member',
        email: 'student1156@first.org',
        role: 'TEAM',
        teamNumber: 1156,
        teamRole: 'STUDENT_MEMBER',
        passwordHash: defaultPasswordHash,
        avatarIcon: 'user',
        avatarColor: '#DAAB52',
        status: 'ACTIVE'
      }
    ];

    for (const u of testUsers) {
      await User.findOneAndUpdate(
        { email: u.email },
        u,
        { upsert: true, new: true }
      );
      console.log(`Seeded team account: ${u.email} (${u.teamRole} for Team ${u.teamNumber})`);
    }

    console.log('Successfully seeded test team user accounts!');
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed test team users:', err);
    process.exit(1);
  }
};

seedTeamUsers();
