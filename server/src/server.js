import express, { json } from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import dotenv from 'dotenv';
import passport from 'passport';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import supplierRoutes from './routes/supplier.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import adminRoutes from './routes/admin.routes.js';
import userRoutes from './routes/user.routes.js';
import ReviewRoutes from './routes/review.routes.js';
import packageRoutes from './routes/package.routes.js';
import faqRoutes from './routes/faq.routes.js';
import deductionRoutes from './routes/deduction.routes.js';
import backupRoutes from './routes/backup.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import permissionRoutes from './routes/permission.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from server root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT;

// Server instance to manage shutdown
let server = null;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// API routes
app.use('/api/suppliers', supplierRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', ReviewRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/deductions', deductionRoutes);
//DB backup
app.use('/api/backup', backupRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/permissions', permissionRoutes);
// API routes
app.use('/api/auth', authRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, '../../client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

// Start server
server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle server listen errors
import { exec } from 'child_process';

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Trying to terminate existing process...`);

    // Try to find and kill existing process on Windows
    if (process.platform === 'win32') {
      exec(`netstat -ano | findstr :${PORT}`, (err, stdout) => {
        if (stdout) {
          const lines = stdout.split('\n');
          lines.forEach((line) => {
            const matches = line.match(/(\d+)$/);
            if (matches) {
              const pid = matches[1];
              console.log(`Killing process PID: ${pid}`);
              exec(`taskkill /PID ${pid} /F`, (killErr) => {
                if (killErr) {
                  console.error('Error killing process:', killErr);
                  process.exit(1);
                } else {
                  console.log('Process killed. Restarting server...');
                  setTimeout(() => {
                    process.exit(0); // Let nodemon restart
                  }, 1000);
                }
              });
            }
          });
        } else {
          console.error('Port is in use but could not find process');
          process.exit(1);
        }
      });
    } else {
      console.error('EADDRINUSE error - please manually kill the process using this port');
      process.exit(1);
    }
  } else {
    console.error('Server error:', error);
    process.exit(1);
  }
});

// Graceful shutdown handling
const handleShutdown = () => {
  console.log('\nReceived shutdown signal. Closing server...');
  if (server) {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);
