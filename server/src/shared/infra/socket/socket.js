const socketIO = require('socket.io');
const mongoose = require('mongoose');
const Poll = require('../../../modules/polls/models/Poll');
const config = require('../../../config');

let socketServer;

/**
 * Initializes the Socket.IO server.
 * @param {Object} httpServer - The HTTP server instance.
 * @returns {Object} The Socket.IO server instance.
 */
const initializeSocketIO = (httpServer) => {
    socketServer = socketIO(httpServer, {
        cors: {
            origin: config.clientUrl,
            methods: ["GET", "POST"]
        }
    });

    socketServer.on('connection', (clientSocket) => {
        console.log('New client connected:', clientSocket.id);

        clientSocket.on('joinPoll', async (targetPollId) => {
            if (!mongoose.Types.ObjectId.isValid(targetPollId)) {
                console.warn(`Socket ${clientSocket.id} tried to join invalid poll ID: ${targetPollId}`);
                return;
            }

            try {
                const pollExists = await Poll.exists({ _id: targetPollId });
                if (!pollExists) {
                    console.warn(`Socket ${clientSocket.id} tried to join non-existent poll: ${targetPollId}`);
                    return;
                }
                
                clientSocket.join(targetPollId);
                console.log(`Socket ${clientSocket.id} joined poll ${targetPollId}`);
            } catch (error) {
                console.error('Error in joinPoll:', error);
            }
        });

        clientSocket.on('disconnect', (reason) => {
            console.log('Client disconnected:', clientSocket.id, 'Reason:', reason);
        });
    });

    return socketServer;
};

/**
 * Returns the initialized Socket.IO server instance.
 * @returns {Object} The Socket.IO server instance.
 * @throws {Error} If Socket.IO has not been initialized.
 */
const getSocketIOInstance = () => {
    if (!socketServer) {
        throw new Error('Socket.io not initialized!');
    }
    return socketServer;
};

module.exports = { initializeSocketIO, getSocketIOInstance };
