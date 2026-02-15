const mongoose = require('mongoose');

const VoteTrackingSchema = new mongoose.Schema({
    pollId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Poll',
        required: true
    },
    tokenHash: {
        type: String,
        required: true,
        index: true
    },
    ipAddress: {
        type: String,
        required: true
    },
    deviceHash: {
        type: String,
        required: false
    },
    votedAt: {
        type: Date,
        default: Date.now
    }
});

VoteTrackingSchema.index({ pollId: 1, ipAddress: 1 }, { unique: true });
VoteTrackingSchema.index({ pollId: 1, tokenHash: 1 }, { unique: true });

VoteTrackingSchema.index({ pollId: 1, deviceHash: 1, votedAt: 1 });

module.exports = mongoose.model('VoteTracking', VoteTrackingSchema);
