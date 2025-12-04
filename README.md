# HJ Wedding Event Booking System

A full-stack wedding event booking application for managing bookings, packages, suppliers, and payments.

## Overview

HJ Wedding Event Booking System is a comprehensive platform that enables couples to book wedding packages, manage suppliers, make payments, and leave reviews. The system supports three user roles: **clients** (couples), **suppliers**, and **administrators**.

## Features

- **Authentication & Authorization**

  - Email/password registration and login
  - Google OAuth integration
  - Email verification
  - Password reset via email code
  - Role-based access control (user, admin, supplier)
  - Permission-based feature access
  - reCAPTCHA v3 protection

- **Booking Management**

  - Create bookings with packages and suppliers
  - Booking status workflow (pending → accepted → completed)
  - Date availability checking (15-day advance booking required)
  - Automatic booking expiration
  - External supplier selections with price deductions
  - Calendar view for availability

- **Package & Supplier Management**

  - Pre-configured wedding packages
  - Supplier categories: Food/Catering, Decoration, Photography, Videography, Music, Florist
  - Supplier availability management
  - Package pricing and customization

- **Payment Integration**

  - PayPal sandbox/live integration
  - Payment status tracking
  - Webhook support for payment events
  - Transaction history and audit trail

- **Reviews & Feedback**

  - Post-booking reviews
  - Rating system (1-5 stars)
  - Review management

- **Admin Features**

  - Dashboard with statistics and analytics
  - Booking management and calendar
  - Client and supplier management
  - Package management
  - FAQ management
  - Announcements system
  - Reports generation (PDF)
  - Database backup functionality
  - Activity logging

- **Additional Features**
  - Optimistic concurrency control for data integrity
  - Theme customization
  - Responsive UI with Tailwind CSS
  - Email notifications

## Tech Stack

**Frontend:**

- React + Vite
- TypeScript patterns
- Tailwind CSS
- Axios for API calls
- React Router for navigation
- Zustand for state management

**Backend:**

- Node.js + Express
- MongoDB with Mongoose
- JWT authentication
- Session management
- PayPal SDK integration

**Services:**

- MongoDB database
- Gmail SMTP for emails
- Google OAuth
- Google reCAPTCHA v3
- PayPal API
- Cloudinary (for image uploads)
- Google Drive (for backups)

## Project Structure

```
HJ-EVENTS/
├── client/          # React + Vite frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── routes/       # Route definitions
│   │   ├── store/        # Zustand state management
│   │   └── utils/        # Utility functions
│   └── package.json
├── server/          # Express API backend
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # API routes
│   │   ├── middlewares/  # Auth & validation
│   │   └── utils/        # Helper functions
│   └── package.json
└── package.json     # Root scripts (concurrently)
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/kaya0s/HJ-EVENTS.git
   cd HJ-EVENTS
   ```

2. **Install dependencies**

   ```bash
   # Install root dependencies
   npm install

   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Configure environment variables**

   Create `client/.env`:

   ```env
   VITE_API_URL=http://localhost:3000/api
   VITE_RECAPTCHA_SITE_KEY=your_recaptcha_v3_site_key
   VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
   ```

   Create `server/.env`:

   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/hj-wedding

   # Authentication
   JWT_SECRET=your_jwt_secret_key
   SESSION_SECRET=your_session_secret_key

   # Server Configuration
   PORT=3000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   SERVER_URL=http://localhost:3000

   # Email (Gmail SMTP)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # reCAPTCHA v3
   RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
   RECAPTCHA_SCORE_THRESHOLD=0.5

   # PayPal
   PAYPAL_MODE=sandbox
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret
   PAYPAL_WEBHOOK_ID=your_paypal_webhook_id
   ```

   **Important Notes:**

   - `VITE_API_URL` must be a complete URL with protocol (http:// or https://)
   - Use reCAPTCHA v3 keys (not v2) from [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
   - For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password

4. **Start MongoDB**
   Ensure MongoDB is running on your system or update `MONGODB_URI` to point to your cloud instance.

5. **Run the application**

   **Option 1: Run both server and client together (from root)**

   ```bash
   npm start
   ```

   **Option 2: Run separately (recommended for development)**

   Terminal 1 - Server:

   ```bash
   cd server
   npm run dev
   ```

   Terminal 2 - Client:

   ```bash
   cd client
   npm run dev
   ```

6. **Access the application**
   - Client: http://localhost:5173
   - Server API: http://localhost:3000/api

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/forgot-password` - Request password reset code
- `POST /api/auth/reset-password` - Reset password with code
- `POST /api/auth/verify-email` - Verify email with code
- `POST /api/auth/resend-verification` - Resend verification code

### Bookings

- `GET /api/bookings` - Get bookings (filtered by role)
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id` - Update booking (admin/supplier)
- `DELETE /api/bookings/:id` - Cancel booking
- `POST /api/bookings/:id/paypal/create-order` - Create PayPal order
- `POST /api/bookings/:id/paypal/capture` - Capture PayPal payment

### Packages

- `GET /api/packages` - Get all packages
- `POST /api/packages` - Create package (admin)
- `PUT /api/packages/:id` - Update package (admin)
- `DELETE /api/packages/:id` - Delete package (admin)

### Suppliers

- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Create supplier (admin)
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier (admin)

### Reviews

- `GET /api/reviews` - Get all reviews
- `POST /api/reviews` - Create review (user)
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Admin

- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `GET /api/admin/reports` - Generate reports
- `POST /api/admin/backup` - Create database backup

### Webhooks

- `POST /api/webhooks/paypal` - PayPal webhook handler

## Key Features Details

### Booking System

- Bookings must be made at least 15 days in advance
- Only one accepted booking per date
- Automatic expiration of pending bookings
- Support for prenuptial and wedding dates
- External supplier selections with price adjustments

### Payment Flow

1. User creates a booking (status: `pending`)
2. Admin accepts booking
3. User clicks "Pay Now" button
4. PayPal modal opens (client-side)
5. Order created via backend API
6. Payment captured server-side
7. Booking payment status updated to `paid`
8. Webhook confirms payment completion

### Concurrency Control

The system uses optimistic concurrency control to prevent data conflicts. When updating resources, include `lastKnownUpdatedAt` timestamp to ensure changes are only applied if the record hasn't been modified.

### User Roles

- **User**: Create bookings, make payments, leave reviews
- **Supplier**: View assigned bookings, update availability
- **Admin**: Full system access, manage all resources

## Development Notes

- Client uses `import.meta.env` for environment variables (Vite)
- Server uses `process.env` with dotenv
- All API requests use axios with `withCredentials: true` for cookies
- Session-based authentication with JWT tokens
- MongoDB models use optimistic concurrency for critical updates

## PayPal Setup (Sandbox)

1. Create a PayPal Developer account
2. Create a sandbox app and get credentials
3. Set up webhook in PayPal dashboard:
   - URL: `{SERVER_URL}/api/webhooks/paypal`
   - Events: `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.REFUNDED`
4. Add webhook ID to `server/.env`
5. For local testing, use ngrok to expose your server:
   ```bash
   ngrok http 3000
   ```
   Update `SERVER_URL` in `.env` to the ngrok HTTPS URL

## License

See [LICENSE](LICENSE) file for details.

## Support

For issues and questions, please open an issue on the GitHub repository.
