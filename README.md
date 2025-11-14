# HJ Wedding Event Booking System

Simple full-stack wedding event booking application for couples, bookings, and basic auth flows.

## Summary

HJ Wedding Event Booking System is a two-tier (client + server) app:

- Client: React + Vite UI (pages: signup, login, forgot-password, reset-password, dashboard)
- Server: Node.js + Express + MongoDB (Mongoose models: User, Couple, Booking, auth routes)

It includes authentication, password reset (email/code + reset token stored in sessionStorage), booking management, and basic user flows.

## Tech stack

- Client: React, Vite, TypeScript (project patterns use import.meta.env for VITE\_\* vars), axios
- Server: Node.js, Express, Mongoose, dotenv
- Database: MongoDB
- UI: Tailwind / component primitives (Card, Input, Button, etc.)

## Repo layout

- `client/` — React + Vite frontend
- `server/` — Express API, Mongoose models

## Environment variables(development)

Create `.env` files in each project root and add them to `.gitignore`.

Client (`client/.env`):

```text
# Must include full URL with protocol (http:// or https://)
VITE_API_URL=http://localhost:3000/api
# reCAPTCHA v3 Site Key (get from https://www.google.com/recaptcha/admin)
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_v3_site_key
```

**Important:**

- `VITE_API_URL` must be a complete URL starting with `http://` or `https://`. Do not use relative paths like `/api` or paths without protocol like `localhost:3000/api`.
- This implementation uses **reCAPTCHA v3**, which runs invisibly in the background without user interaction. Make sure to register for reCAPTCHA v3 keys (not v2) at [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin).

Server (`server/.env`):

```env
# Database
MONGODB_URI=mongodb://localhost:27017/database

# JWT Secret
JWT_SECRET=secret-test-key

# Session Secret
SESSION_SECRET=your-test-key

# Client URL
CLIENT_URL=http://localhost:5173

# Email Configuration (Gmail)
EMAIL_USER=your_email
EMAIL_PASS=your_email_pass


# Google OAuth
GOOGLE_CLIENT_ID=your_oauth_client_id
GOOGLE_CLIENT_SECRET=your_oauth_client_secret

# reCAPTCHA v3 (optional but recommended)
RECAPTCHA_SECRET_KEY=your_recaptcha_v3_secret_key
# Score threshold for reCAPTCHA v3 (0.0 to 1.0, default: 0.5)
# Lower values are more permissive, higher values are stricter
RECAPTCHA_SCORE_THRESHOLD=0.5

# Client URL
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:3000

# Server
PORT=3000
NODE_ENV=development

```

Client code reads `import.meta.env.VITE_API_URL`. Server code reads `process.env.*` (use dotenv).

## Clone, install & run (development)

Follow these steps to clone the repository and run the app locally. The project has two folders: `server/` (Express + MongoDB) and `client/` (React + Vite). You can run them in two terminals.

1. Clone the repo

```bash
git clone https://github.com/kaya0s/HJ-EVENTS.git
cd HJ-EVENTS
```

2. Create env files

- `client/.env` should include at least:

```text
VITE_API_URL=http://localhost:3000
```

- `server/.env` should include required server secrets (see the "Environment variables(development)" section above). Example:

```text
MONGODB_URI=mongodb://localhost:27017/hj-wedding
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:3000
PORT=3000
NODE_ENV=development
# EMAIL_USER / EMAIL_PASS for password reset emails
```

3. Install dependencies and run the server

Open a terminal and run:

```bash
cd server
npm install
npm run dev
```

This starts the Express API (by default on port `3000`). Make sure MongoDB is running and `MONGODB_URI` points to a reachable database.

4. Install dependencies and run the client

Open another terminal and run:

```bash
cd client
npm install
npm run dev
```

Vite will show a local URL (usually `http://localhost:5173`). The client reads the API base URL from `import.meta.env.VITE_API_URL`.

Tips

- If you change `.env` files, restart the server/client so the new vars are loaded.
- To run both in one terminal you can use a process manager (`concurrently`, `npm-run-all`) or a terminal multiplexer.

## API routes

Common endpoints under `/api/auth` (server):

- `POST /api/auth/register` — register a new user
- `POST /api/auth/login` — login (sets cookie / returns token)
- `POST /api/auth/forgot-password` — request reset code (returns `{ message, resetToken }`)
- `POST /api/auth/reset-password` — submit code + new password + resetToken

Booking endpoints (example):

- `POST /api/bookings` — create a booking (body: couple, eventDate, eventType, ...)

Note: client uses axios with `withCredentials` where needed.
