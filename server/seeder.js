import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './src/models/user.model.js';
import Category from './src/models/category.model.js';
import Package from './src/models/package.model.js';
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

// Realistic category data
const categories = [
  // Supplier categories
  { name: 'Catering', type: 'supplier', isActive: true, displayOrder: 1 },
  { name: 'Venue', type: 'supplier', isActive: true, displayOrder: 2 },
  { name: 'Photography', type: 'supplier', isActive: true, displayOrder: 3 },
  { name: 'Videography', type: 'supplier', isActive: true, displayOrder: 4 },
  { name: 'Decoration', type: 'supplier', isActive: true, displayOrder: 5 },
  { name: 'Entertainment', type: 'supplier', isActive: true, displayOrder: 6 },
  { name: 'Transportation', type: 'supplier', isActive: true, displayOrder: 7 },
  { name: 'Makeup & Hair', type: 'supplier', isActive: true, displayOrder: 8 },

  // Package categories
  { name: 'Wedding Packages', type: 'package', isActive: true, displayOrder: 1 },
  { name: 'Birthday Packages', type: 'package', isActive: true, displayOrder: 2 },
  { name: 'Corporate Event Packages', type: 'package', isActive: true, displayOrder: 3 },
  { name: 'Anniversary Packages', type: 'package', isActive: true, displayOrder: 4 },

  // Event categories
  { name: 'Weddings', type: 'event', isActive: true, displayOrder: 1 },
  { name: 'Birthdays', type: 'event', isActive: true, displayOrder: 2 },
  { name: 'Corporate Events', type: 'event', isActive: true, displayOrder: 3 },
  { name: 'Anniversaries', type: 'event', isActive: true, displayOrder: 4 },
  { name: 'Baby Showers', type: 'event', isActive: true, displayOrder: 5 },
  { name: 'Graduation Parties', type: 'event', isActive: true, displayOrder: 6 },
];

// Realistic package data
const packages = [
  // Wedding Packages
  {
    name: 'Classic Wedding Package',
    description:
      'Perfect for traditional weddings. Includes venue, catering for 100 guests, basic decorations, and photography coverage.',
    price: 12000,
    imageURL: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&h=400&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Premium Wedding Package',
    description:
      'Luxury wedding experience. Includes premium venue, gourmet catering, full decorations, photography + videography, and entertainment.',
    price: 25000,
    imageURL: 'https://images.unsplash.com/photo-1519225421980-715cb0202751?w=600&h=400&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Intimate Wedding Package',
    description:
      'For small, intimate weddings. Includes cozy venue, catering for 30 guests, minimalist decorations, and photography.',
    price: 6500,
    imageURL: 'https://images.unsplash.com/photo-1522673607200-229f4671f716?w=600&h=400&fit=crop',
    isAvailable: true,
  },

  // Birthday Packages
  {
    name: "Children's Birthday Package",
    description:
      'Fun-filled birthday party for kids. Includes venue, decorations, entertainment, food, and party favors.',
    price: 2500,
    imageURL: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&h=400&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Adult Birthday Package',
    description:
      'Elegant celebration for adults. Includes venue, catering, decorations, and entertainment.',
    price: 4500,
    imageURL: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=400&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Milestone Birthday Package',
    description:
      'Premium package for milestone birthdays (30th, 40th, 50th, etc.). Includes luxury venue, gourmet catering, live entertainment, and photography.',
    price: 8000,
    imageURL: 'https://images.unsplash.com/photo-1464366400600-ef70cd14c575?w=600&h=400&fit=crop',
    isAvailable: true,
  },

  // Corporate Event Packages
  {
    name: 'Business Meeting Package',
    description:
      'Professional meeting setup. Includes conference room, AV equipment, catering, and support staff.',
    price: 3500,
    imageURL: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Corporate Gala Package',
    description:
      'Elegant corporate event. Includes ballroom, catering, decorations, entertainment, and photography.',
    price: 15000,
    imageURL: 'https://images.unsplash.com/photo-1553877616-1013126d9613?w=600&h=400&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Team Building Package',
    description:
      'Fun team building event. Includes outdoor venue, activities, catering, and entertainment.',
    price: 5000,
    imageURL: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&h=400&fit=crop',
    isAvailable: true,
  },

  // Anniversary Packages
  {
    name: 'Romantic Anniversary Package',
    description:
      'Intimate celebration for couples. Includes romantic dinner, decorations, and photography.',
    price: 1500,
    imageURL: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=600&h=400&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Silver Anniversary Package',
    description:
      'Special package for 25th anniversaries. Includes premium venue, catering, decorations, and entertainment.',
    price: 10000,
    imageURL: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&h=400&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Golden Anniversary Package',
    description:
      'Luxury package for 50th anniversaries. Includes top-tier venue, gourmet catering, and special entertainment.',
    price: 18000,
    imageURL: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=400&fit=crop',
    isAvailable: true,
  },
];

// Realistic supplier data (for testing relationships)
const suppliers = [
  {
    name: 'Gourmet Delights Catering',
    category: 'Catering',
    description: 'Professional catering service with a wide range of cuisines.',
    contactInfo: {
      phone: '123-456-7891',
      email: 'catering@gourmetdelights.com',
      address: '123 Food Street, Culinary City',
      facebookPage: 'facebook.com/gourmetdelightscatering',
    },
    priceRange: '$$$',
    imageURL: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600&h=400&fit=crop',
  },
  {
    name: 'Elegant Events Venue',
    category: 'Venue',
    description: 'Stunning event venue with modern facilities.',
    contactInfo: {
      phone: '123-456-7892',
      email: 'info@elegantevents.com',
      address: '456 Event Boulevard, Celebration City',
      facebookPage: 'facebook.com/eleganteventsvenue',
    },
    priceRange: '$$$$',
    imageURL: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&h=400&fit=crop',
  },
  {
    name: 'Capture Moments Photography',
    category: 'Photography',
    description: 'Professional photography service capturing beautiful moments.',
    contactInfo: {
      phone: '123-456-7893',
      email: 'hello@capturemoments.com',
      address: '789 Photo Lane, Picture City',
      facebookPage: 'facebook.com/capturemomentsphoto',
    },
    priceRange: '$$$',
    imageURL: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=400&fit=crop',
  },
  {
    name: 'Dream Decorations',
    category: 'Decoration',
    description: 'Creative decoration services for all types of events.',
    contactInfo: {
      phone: '123-456-7894',
      email: 'decorate@dreamdecor.com',
      address: '321 Decor Street, Design City',
      facebookPage: 'facebook.com/dreamdecorations',
    },
    priceRange: '$$',
    imageURL: 'https://images.unsplash.com/photo-1464366400600-ef70cd14c575?w=600&h=400&fit=crop',
  },
  {
    name: 'Star Entertainment',
    category: 'Entertainment',
    description: 'Live entertainment with bands, DJs, and performers.',
    contactInfo: {
      phone: '123-456-7895',
      email: 'entertain@stargroup.com',
      address: '654 Music Avenue, Entertainment City',
      facebookPage: 'facebook.com/starentertainment',
    },
    priceRange: '$$$',
    imageURL: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=400&fit=crop',
  },
];

// Seeder function for categories
const seedCategories = async () => {
  try {
    console.log('Seeding categories...');
    const count = await Category.countDocuments();

    if (count > 0) {
      console.log('Categories already exist, skipping...');
      return;
    }

    await Category.insertMany(categories);
    console.log(`Successfully seeded ${categories.length} categories`);
  } catch (error) {
    console.error('Error seeding categories:', error);
  }
};

// Seeder function for suppliers
const seedSuppliers = async () => {
  try {
    console.log('Seeding suppliers...');
    const count = await Supplier.countDocuments();

    if (count > 0) {
      console.log('Suppliers already exist, skipping...');
      return;
    }

    await Supplier.insertMany(suppliers);
    console.log(`Successfully seeded ${suppliers.length} suppliers`);
  } catch (error) {
    console.error('Error seeding suppliers:', error);
  }
};

// Seeder function for packages
const seedPackages = async () => {
  try {
    console.log('Seeding packages...');
    const count = await Package.countDocuments();

    if (count > 0) {
      console.log('Packages already exist, skipping...');
      return;
    }

    // Get all suppliers to associate with packages
    const allSuppliers = await Supplier.find();

    // Associate random suppliers with each package
    const packagesWithSuppliers = packages.map((pkg) => ({
      ...pkg,
      suppliers: allSuppliers
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 3) + 1)
        .map((supplier) => supplier._id),
    }));

    await Package.insertMany(packagesWithSuppliers);
    console.log(`Successfully seeded ${packagesWithSuppliers.length} packages`);
  } catch (error) {
    console.error('Error seeding packages:', error);
  }
};

// Seeder function for test user
const seedUser = async () => {
  try {
    console.log('Seeding test user...');
    const existingUser = await User.findOne({ email: 'testuser@example.com' });

    if (existingUser) {
      console.log('Test user already exists, skipping...');
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create test user
    const testUser = new User({
      fullName: 'Test User',
      email: 'testuser@example.com',
      password: hashedPassword,
      role: 'user',
      isEmailVerified: true,
      phone: '123-456-7890',
      address: '123 Test Street, Test City, TS 12345',
    });

    // Save user to database
    await testUser.save();
    console.log('Test user created successfully!');
    console.log('Email:', testUser.email);
    console.log('Password:', 'password123');
    console.log('Full Name:', testUser.fullName);
    console.log('Role:', testUser.role);
  } catch (error) {
    console.error('Error seeding user:', error.message);
  }
};

// Main seeder function
const seedAll = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('Starting database seeding...');

    // Check if we should clear existing data
    const shouldClearData = process.argv.includes('--clear') || process.argv.includes('-c');

    if (shouldClearData) {
      console.log('Clearing existing data...');
      await Promise.all([
        Category.deleteMany(),
        Supplier.deleteMany(),
        Package.deleteMany(),
        User.deleteMany({ email: 'testuser@example.com' }),
      ]);
      console.log('Existing data cleared successfully');
    }

    // Seed data in order (categories first, then suppliers, then packages)
    await seedCategories();
    await seedSuppliers();
    await seedPackages();
    await seedUser();

    console.log('\nSeeding completed successfully!');

    // Close database connection
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error in seeding process:', error);
    process.exit(1);
  }
};

// Run the seeder
seedAll();
