const http = require('http');
const app = require('./app');
const config = require('./config');
const connectDB = require('./shared/infra/database/db');
const { initializeSocketIO } = require('./shared/infra/socket/socket');

connectDB();

const server = http.createServer(app);
initializeSocketIO(server);

const serverInstance = server.listen(config.port, () => {
    console.log(`Server running in ${config.env} mode on port ${config.port}`);
});

process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    serverInstance.close(() => {
        process.exit(1);
    });
});

process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    serverInstance.close(() => {
        console.log('💥 Process terminated!');
    });
});
