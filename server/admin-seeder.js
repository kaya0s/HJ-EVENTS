import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './src/models/user.model.js';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedAdmin = async () => {
  try {
    console.log('Seeding admin user...');
    const existingUser = await User.findOne({ email: 'admintest@example.com' });

    if (existingUser) {
      console.log('Admin user already exists, skipping...');
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const adminUser = new User({
      fullName: 'Admin User',
      email: 'admintest@example.com',
      password: hashedPassword,
      role: 'admin',
      isEmailVerified: true,
      phone: '123-456-7890',
      address: '123 Admin Street, Admin City, AC 12345',
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Email:', adminUser.email);
    console.log('Password:', 'password123');
    console.log('Full Name:', adminUser.fullName);
    console.log('Role:', adminUser.role);
  } catch (error) {
    console.error('Error seeding admin user:', error.message);
  }
};

const seed = async () => {
  await connectDB();
  await seedAdmin();
  await mongoose.connection.close();
};

seed();
