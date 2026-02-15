const socketIO = require('socket.io');
const mongoose = require('mongoose');
const Poll = require('../../../modules/polls/models/Poll');
const config = require('../../../config');
const pollEvents = require('../events/pollEvents');

let socketServer;

const initializeSocketIO = (httpServer) => {
    socketServer = socketIO(httpServer, {
        cors: {
            origin: config.clientUrl,
            methods: ["GET", "POST"],
            credentials: true
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

    // Listen for domain events and broadcast
    pollEvents.on('voteUpdated', (updatedPoll) => {
        if (socketServer && updatedPoll && updatedPoll._id) {
            socketServer.to(updatedPoll._id.toString()).emit('updateResults', updatedPoll);
        }
    });

    return socketServer;
};

const getSocketIOInstance = () => {
    if (!socketServer) {
        throw new Error('Socket.io not initialized!');
    }
    return socketServer;
};

module.exports = { initializeSocketIO, getSocketIOInstance };
