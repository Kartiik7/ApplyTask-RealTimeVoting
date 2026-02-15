const http = require('http');
const app = require('./app');
const config = require('./config');
const connectDB = require('./shared/infra/database/db');
const { initializeSocketIO } = require('./shared/infra/socket/socket');

// Connect to Database
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocketIO(server);

// Start Server
const serverInstance = server.listen(config.port, () => {
    console.log(`Server running in ${config.env} mode on port ${config.port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    serverInstance.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    serverInstance.close(() => {
        console.log('💥 Process terminated!');
    });
});
