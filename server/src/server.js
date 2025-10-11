import express, { json } from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import userRoutes from './routes/auth.routes.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(json());

// Base sample route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to HJ Events API' });
});

// API routes
app.use('/api/auth', userRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
