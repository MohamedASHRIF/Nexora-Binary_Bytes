import mongoose from 'mongoose';
import { Location } from '../models/Location';
import dotenv from 'dotenv';

dotenv.config();

const campusLocations = [
  {
    name: 'IT Faculty',
    description: 'Faculty of Information Technology - Home to Computer Science and IT programs',
    position: {
      lat: 6.7953,
      lng: 79.9008
    },
    type: 'building',
    category: 'academic',
    openingHours: {
      monday: { open: '8:00 AM', close: '6:00 PM' },
      tuesday: { open: '8:00 AM', close: '6:00 PM' },
      wednesday: { open: '8:00 AM', close: '6:00 PM' },
      thursday: { open: '8:00 AM', close: '6:00 PM' },
      friday: { open: '8:00 AM', close: '6:00 PM' },
      saturday: { open: '9:00 AM', close: '4:00 PM' },
      sunday: { open: 'Closed', close: 'Closed' }
    },
    contact: {
      phone: '+94-11-2650301',
      email: 'it@uom.lk'
    },
    amenities: ['Computer Labs', 'Lecture Halls', 'Faculty Offices', 'Study Areas']
  },
  {
    name: 'Engineering Faculty',
    description: 'Faculty of Engineering - Home to various engineering disciplines',
    position: {
      lat: 6.7955,
      lng: 79.9010
    },
    type: 'building',
    category: 'academic',
    openingHours: {
      monday: { open: '8:00 AM', close: '6:00 PM' },
      tuesday: { open: '8:00 AM', close: '6:00 PM' },
      wednesday: { open: '8:00 AM', close: '6:00 PM' },
      thursday: { open: '8:00 AM', close: '6:00 PM' },
      friday: { open: '8:00 AM', close: '6:00 PM' },
      saturday: { open: '9:00 AM', close: '4:00 PM' },
      sunday: { open: 'Closed', close: 'Closed' }
    },
    contact: {
      phone: '+94-11-2650302',
      email: 'engineering@uom.lk'
    },
    amenities: ['Engineering Labs', 'Workshops', 'Lecture Halls', 'Faculty Offices']
  },
  {
    name: 'Architecture Faculty',
    description: 'Faculty of Architecture - Home to architecture and design programs',
    position: {
      lat: 6.7948,
      lng: 79.9005
    },
    type: 'building',
    category: 'academic',
    openingHours: {
      monday: { open: '8:00 AM', close: '6:00 PM' },
      tuesday: { open: '8:00 AM', close: '6:00 PM' },
      wednesday: { open: '8:00 AM', close: '6:00 PM' },
      thursday: { open: '8:00 AM', close: '6:00 PM' },
      friday: { open: '8:00 AM', close: '6:00 PM' },
      saturday: { open: '9:00 AM', close: '4:00 PM' },
      sunday: { open: 'Closed', close: 'Closed' }
    },
    contact: {
      phone: '+94-11-2650303',
      email: 'architecture@uom.lk'
    },
    amenities: ['Design Studios', 'Model Making Labs', 'Lecture Halls', 'Faculty Offices']
  },
  {
    name: 'Library',
    description: 'University Library - Main study and research facility',
    position: {
      lat: 6.7949,
      lng: 79.9006
    },
    type: 'facility',
    category: 'academic',
    openingHours: {
      monday: { open: '8:00 AM', close: '10:00 PM' },
      tuesday: { open: '8:00 AM', close: '10:00 PM' },
      wednesday: { open: '8:00 AM', close: '10:00 PM' },
      thursday: { open: '8:00 AM', close: '10:00 PM' },
      friday: { open: '8:00 AM', close: '10:00 PM' },
      saturday: { open: '9:00 AM', close: '6:00 PM' },
      sunday: { open: '10:00 AM', close: '6:00 PM' }
    },
    contact: {
      phone: '+94-11-2650304',
      email: 'library@uom.lk'
    },
    amenities: ['Study Rooms', 'Computer Access', 'Printing Services', 'Quiet Areas']
  },
  {
    name: 'Cafeteria',
    description: 'Main Cafeteria - Food and dining facility',
    position: {
      lat: 6.7952,
      lng: 79.9009
    },
    type: 'facility',
    category: 'dining',
    openingHours: {
      monday: { open: '7:00 AM', close: '8:00 PM' },
      tuesday: { open: '7:00 AM', close: '8:00 PM' },
      wednesday: { open: '7:00 AM', close: '8:00 PM' },
      thursday: { open: '7:00 AM', close: '8:00 PM' },
      friday: { open: '7:00 AM', close: '8:00 PM' },
      saturday: { open: '9:00 AM', close: '6:00 PM' },
      sunday: { open: '9:00 AM', close: '6:00 PM' }
    },
    contact: {
      phone: '+94-11-2650305',
      email: 'cafeteria@uom.lk'
    },
    amenities: ['Dining Area', 'Food Counters', 'Vending Machines', 'Outdoor Seating']
  },
  {
    name: 'Main Building',
    description: 'Main Administrative Building - University administration offices',
    position: {
      lat: 6.7951,
      lng: 79.9007
    },
    type: 'building',
    category: 'administration',
    openingHours: {
      monday: { open: '8:00 AM', close: '5:00 PM' },
      tuesday: { open: '8:00 AM', close: '5:00 PM' },
      wednesday: { open: '8:00 AM', close: '5:00 PM' },
      thursday: { open: '8:00 AM', close: '5:00 PM' },
      friday: { open: '8:00 AM', close: '5:00 PM' },
      saturday: { open: '9:00 AM', close: '1:00 PM' },
      sunday: { open: 'Closed', close: 'Closed' }
    },
    contact: {
      phone: '+94-11-2650300',
      email: 'admin@uom.lk'
    },
    amenities: ['Administrative Offices', 'Student Services', 'Meeting Rooms', 'Reception']
  }
];

async function populateLocations() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexora-campus';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing locations
    await Location.deleteMany({});
    console.log('Cleared existing locations');

    // Insert new locations
    const insertedLocations = await Location.insertMany(campusLocations);
    console.log(`Successfully inserted ${insertedLocations.length} locations`);

    // Display inserted locations
    insertedLocations.forEach(location => {
      console.log(`- ${location.name}: ${location.position.lat}, ${location.position.lng}`);
    });

    console.log('Location population completed successfully!');
  } catch (error) {
    console.error('Error populating locations:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
populateLocations(); 