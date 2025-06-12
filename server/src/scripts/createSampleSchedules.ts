import mongoose from 'mongoose';
import { Schedule } from '../models/Schedule';
import { logger } from '../utils/logger';

const createSampleSchedules = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nexora-campus');
    logger.info('Connected to MongoDB');

    // Clear existing schedules
    await Schedule.deleteMany({});
    logger.info('Cleared existing schedules');

    // Get current day
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    logger.info(`Creating schedules for today: ${today}`);

    // Sample schedules for IT degree
    const itSchedules = [
      {
        className: 'Web Development',
        day: today,
        startTime: '09:00',
        endTime: '11:00',
        location: 'IT Lab 101',
        instructor: 'Dr. Sarah Johnson',
        degree: 'IT'
      },
      {
        className: 'Database Management',
        day: today,
        startTime: '11:30',
        endTime: '13:30',
        location: 'IT Lab 102',
        instructor: 'Prof. Michael Chen',
        degree: 'IT'
      },
      {
        className: 'Software Engineering',
        day: today,
        startTime: '14:00',
        endTime: '16:00',
        location: 'IT Lab 103',
        instructor: 'Dr. Emily Rodriguez',
        degree: 'IT'
      },
      {
        className: 'Network Security',
        day: today,
        startTime: '16:30',
        endTime: '18:30',
        location: 'IT Lab 104',
        instructor: 'Prof. David Kim',
        degree: 'IT'
      }
    ];

    // Sample schedules for AI degree
    const aiSchedules = [
      {
        className: 'Machine Learning',
        day: today,
        startTime: '09:00',
        endTime: '11:00',
        location: 'AI Lab 201',
        instructor: 'Dr. Alex Thompson',
        degree: 'AI'
      },
      {
        className: 'Neural Networks',
        day: today,
        startTime: '11:30',
        endTime: '13:30',
        location: 'AI Lab 202',
        instructor: 'Prof. Lisa Wang',
        degree: 'AI'
      },
      {
        className: 'Computer Vision',
        day: today,
        startTime: '14:00',
        endTime: '16:00',
        location: 'AI Lab 203',
        instructor: 'Dr. James Wilson',
        degree: 'AI'
      },
      {
        className: 'Natural Language Processing',
        day: today,
        startTime: '16:30',
        endTime: '18:30',
        location: 'AI Lab 204',
        instructor: 'Prof. Maria Garcia',
        degree: 'AI'
      }
    ];

    // Sample schedules for Design degree
    const designSchedules = [
      {
        className: 'UI/UX Design',
        day: today,
        startTime: '09:00',
        endTime: '11:00',
        location: 'Design Studio 301',
        instructor: 'Prof. Anna Lee',
        degree: 'Design'
      },
      {
        className: 'Graphic Design',
        day: today,
        startTime: '11:30',
        endTime: '13:30',
        location: 'Design Studio 302',
        instructor: 'Dr. Robert Brown',
        degree: 'Design'
      },
      {
        className: 'Digital Art',
        day: today,
        startTime: '14:00',
        endTime: '16:00',
        location: 'Design Studio 303',
        instructor: 'Prof. Jennifer Davis',
        degree: 'Design'
      },
      {
        className: 'Web Design',
        day: today,
        startTime: '16:30',
        endTime: '18:30',
        location: 'Design Studio 304',
        instructor: 'Dr. Christopher Miller',
        degree: 'Design'
      }
    ];

    // Create schedules for all degrees
    const allSchedules = [...itSchedules, ...aiSchedules, ...designSchedules];
    
    const createdSchedules = await Schedule.insertMany(allSchedules);
    
    logger.info(`Created ${createdSchedules.length} sample schedules`);
    logger.info('Sample schedules created successfully');
    
    // Log the created schedules
    createdSchedules.forEach(schedule => {
      logger.info(`Created: ${schedule.className} (${schedule.degree}) - ${schedule.startTime} to ${schedule.endTime} at ${schedule.location}`);
    });

    process.exit(0);
  } catch (error) {
    logger.error('Error creating sample schedules:', error);
    process.exit(1);
  }
};

createSampleSchedules(); 