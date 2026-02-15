# Real-Time Polling Application

A full-stack implementation of a live polling system where users can create questions and vote in real-time. Built with a focus on modular architecture, clean code practices, and production-readiness.

## 🚀 Overview

This application enables instant feedback loops through live polls. Users can generate a unique poll link, share it, and watch results update instantly as votes come in. The system handles concurrent connections and ensures data integrity through robust validation and error handling.

### Key Features
- **Real-Time Updates**: Instant result synchronization across all connected clients using Socket.IO.
- **Anonymous Voting**: Secure voting mechanism using unique tokens and IP-based rate limiting.
- **Responsive Design**: Mobile-first UI built with React.
- **Production-Ready**: Implements graceful shutdowns, centralized error handling, and security middlewares.

---

## 🏗 Architecture

The project follows a **Feature-Based (Vertical Slice) Architecture** rather than a traditional Layered Architecture.

### Why Feature-Based?
Instead of grouping files by type (Controllers, Services), code is grouped by **Domain** (e.g., `modules/polls`).
- **Cohesion**: Related code sits together. Changing the "Poll" feature only requires touching the `polls` module.
- **Scalability**: New features (e.g., "Comments", "Analytics") can be added as new modules without cluttering shared folders.
- **Maintainability**: Clear boundaries between different parts of the system.

### Tech Stack
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.IO
- **Frontend**: React (Vite), CSS Modules, Socket.IO Client
- **Infrastructure**: Express Rate Limit, Helmet, CORS

---

## 📂 Folder Structure

### Server (`/server`)
```
src/
├── modules/                  # Feature Modules
│   └── polls/
│       ├── controllers/      # Request handlers
│       ├── services/         # Business logic
│       ├── models/           # Database schema
│       └── routes/           # API definitions
├── shared/                   # Shared Infrastructure
│   ├── infra/
│   │   ├── database/         # DB connection logic
│   │   ├── socket/           # Socket.IO setup
│   │   └── http/             # Middleware (Global Error Handler)
│   └── utils/                # Helpers (AppError, asyncHandler)
└── app.js                    # Express app setup
```

### Client (`/client`)
```
src/
├── features/                 # Feature Components
│   └── polls/
│       ├── components/       # Presentational components
│       ├── hooks/            # Custom hooks (Logic layer)
│       └── services/         # API integration
├── shared/                   # Shared UI & Utils
└── app/                      # App-wide setup (Router)
```

---

## 🛠 Technical Decisions & Tradeoffs

### 1. Custom Hooks for Logic Separation
**Decision**: Extracted form logic and socket management into `useCreatePoll` and `usePollRoom`.
**Reasoning**: This follows the "Headless UI" pattern. The components (`CreatePoll.jsx`, `PollRoom.jsx`) focus purely on rendering, while the hooks handle state, side effects, and validation. This makes the code easier to test and read.

### 2. Centralized Error Handling
**Decision**: Implemented a global `AppError` class and middleware on the backend.
**Reasoning**: Prevents repetitive `try-catch` blocks in controllers. Operational errors (e.g., "Invalid Input") are distinguished from programming errors (e.g., "Database Down"), ensuring the client receives clean, consistent error messages without leaking sensitive stack traces in production.

### 3. Socket.IO vs Polling
**Decision**: Used WebSockets (Socket.IO).
**Tradeoff**: Higher server resource usage compared to long-polling, but provides a significantly better user experience with true real-time updates, which is critical for a "live" polling app.

### 4. Voting Constraints
**Decision**: Used a combination of Client-generated Tokens (UUID) and IP Rate Limiting.
**Tradeoff**: A full User Auth system (Passport/Auth0) would be more secure but would add significant friction. The Token+IP approach balances security with usability for anonymous polls.

---

## 🚀 Scalability Considerations

- **State Management**: The current Socket.IO implementation uses in-memory adapters. To scale to multiple server instances, a **Redis Adapter** would be added to synchronize events across nodes.
- **Database**: MongoDB is schema-less and horizontal scalable. Indexes are used on `_id` and poll lookups to ensure fast reads.
- **Rate Limiting**: Implemented on the API level to prevent abuse and DoS attacks.

---

## 🔮 Future Improvements

1.  **TypeScript Migration**: To add static typing and improve developer experience.
2.  **Persistent User Accounts**: To allow users to manage their history of polls.
3.  **End-to-End Testing**: Adding Cypress/Playwright for critical user flows.
4.  **Expire Polls**: Automated cleanup jobs for old polls.

---

## 🚦 Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas URI)

### 1. Server Setup
```bash
cd server
npm install
# Create .env file with:
# MONGO_URI=your_mongo_uri
# PORT=5000
# CLIENT_URL=http://localhost:5173
npm start
```

### 2. Client Setup
```bash
cd client
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.
