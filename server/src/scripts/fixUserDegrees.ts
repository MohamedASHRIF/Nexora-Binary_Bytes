import mongoose from 'mongoose';
import { User } from '../models/User';

const fixUserDegrees = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nexora-campus');
    console.log('Connected to MongoDB');

    // Find all students without degree information
    const studentsWithoutDegree = await User.find({ 
      role: 'student', 
      $or: [
        { degree: { $exists: false } },
        { degree: null },
        { degree: '' }
      ]
    });

    console.log(`Found ${studentsWithoutDegree.length} students without degree information:`);
    
    studentsWithoutDegree.forEach(student => {
      console.log(`- ${student.name} (${student.email}): degree = ${student.degree}`);
    });

    // Update students to have a default degree (IT)
    if (studentsWithoutDegree.length > 0) {
      const result = await User.updateMany(
        { 
          role: 'student', 
          $or: [
            { degree: { $exists: false } },
            { degree: null },
            { degree: '' }
          ]
        },
        { $set: { degree: 'IT' } }
      );

      console.log(`Updated ${result.modifiedCount} students with default degree 'IT'`);
    }

    // Show all students and their degrees
    const allStudents = await User.find({ role: 'student' });
    console.log('\nAll students and their degrees:');
    allStudents.forEach(student => {
      console.log(`- ${student.name} (${student.email}): ${student.degree || 'NO DEGREE'}`);
    });

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error fixing user degrees:', error);
    await mongoose.disconnect();
  }
};

// Run the script
fixUserDegrees(); 