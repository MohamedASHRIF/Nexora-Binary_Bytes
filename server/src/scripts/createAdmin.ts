import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { logger } from '../utils/logger';

// Load environment variables
dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nexora-campus');
    logger.info('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@nexora.com' });
    if (existingAdmin) {
      logger.info('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@nexora.com',
      password: 'admin123',
      role: 'admin',
      language: 'en'
    });

    logger.info('Admin user created successfully:', admin.email);
    process.exit(0);
  } catch (error) {
    logger.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin(); 