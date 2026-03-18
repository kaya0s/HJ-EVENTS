import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/user.model.js';

// Load environment variables
dotenv.config();

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Function to check if user exists
const checkUserExists = async () => {
  try {
    console.log('Checking if user with email ambwa@gmail.com exists...');

    const user = await User.findOne({ email: 'ambwa@gmail.com' });

    if (user) {
      console.log('User exists:');
      console.log(user);
    } else {
      console.log('User does not exist');
    }
  } catch (error) {
    console.error('Error during check process:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await checkUserExists();
  await mongoose.connection.close();
};

// Run the script
main();
