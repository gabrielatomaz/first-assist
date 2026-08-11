import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const MONGODB_URI = "mongodb+srv://gabriela1772:1772firstassist4613@first-assist.u5mcavb.mongodb.net/?appName=first-assist";
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
