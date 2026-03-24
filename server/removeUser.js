import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/user.model.js';
import Supplier from './src/models/supplier.model.js';

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

// Function to remove user and supplier
const removeUserAndSupplier = async () => {
  try {
    console.log('Removing user with email ambwa@gmail.com...');

    // Remove the user
    const userResult = await User.deleteOne({ email: 'ambwa@gmail.com' });
    console.log(`User removal result: ${userResult.deletedCount} document(s) deleted`);

    // Remove the supplier
    const supplierResult = await Supplier.deleteOne({ 'contactInfo.email': 'ambwa@gmail.com' });
    console.log(`Supplier removal result: ${supplierResult.deletedCount} document(s) deleted`);

    console.log('Removal process completed successfully!');
  } catch (error) {
    console.error('Error during removal process:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await removeUserAndSupplier();
  await mongoose.connection.close();
};

// Run the script
main();
