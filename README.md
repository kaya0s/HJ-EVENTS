# HJ EVENTS

A full-stack event management application built with React, TypeScript, Node.js, Express, and MongoDB. This application allows users to create, manage, and attend events while also managing suppliers for various event services.

## 🚀 Features

### User Management
- User registration and authentication
- JWT-based secure login/logout
- User profile management
- Role-based access control (User/Admin)

### Event Management
- Create and manage events
- Event details (title, description, date, location)
- Attendee management
- Event creator tracking

### Supplier Management
- Supplier registration and management
- Multiple supplier categories:
  - Caterer
  - Decorator
  - Photographer
  - Musician
  - Venue
  - Other

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe server-side development
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
HJ EVENTS/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.tsx        # Main React component
│   │   ├── main.tsx       # React entry point
│   │   ├── services/
│   │   └── index.css      # Global styles
│   ├── public/            # Static assets
│   ├── package.json       # Frontend dependencies
│   └── vite.config.ts     # Vite configuration
│
├── server/                # Node.js backend
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── index.ts       # Server entry point
│   ├── dist/              # Compiled JavaScript
│   └── package.json       # Backend dependencies
│
└── README.md              # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "HJ EVENTS"
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Setup**
   
   Create a `.env` file in the `server` directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/hj-events
   JWT_SECRET=your-super-secret-jwt-key
   PORT=3000
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```
   The server will start on `http://localhost:3000`

2. **Start the frontend development server**
   ```bash
   cd client
   npm run dev
   ```
   The frontend will start on `http://localhost:5173`

3. **Build for production**
   ```bash
   # Backend
   cd server
   npm run build
   npm start
   
   # Frontend
   cd client
   npm run build
   ```



## 🔧 Available Scripts

### Backend Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint


## 🔐 Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- HTTP-only cookies for token storage
- CORS configuration
- Input validation and sanitization
- Protected routes with middleware

## 🚧 Development Status

This project is currently in development. The following features are implemented:
- ✅ User authentication system
- ✅ Database models and schemas
- ✅ Basic API structure
- ✅ Frontend setup with React and TypeScript

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 📞 Support

For support or questions, please open an issue in the repository or contact the development team.

---

**Happy Event Planning! 🎉**
