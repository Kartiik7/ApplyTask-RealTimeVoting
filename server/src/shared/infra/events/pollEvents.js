const EventEmitter = require('events');

class PollEvents extends EventEmitter {}

const pollEvents = new PollEvents();

module.exports = pollEvents;
