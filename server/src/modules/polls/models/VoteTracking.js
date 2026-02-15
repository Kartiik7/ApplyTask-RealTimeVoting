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
    votedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to ensure unique vote per user per poll
VoteTrackingSchema.index({ pollId: 1, tokenHash: 1 }, { unique: true });

module.exports = mongoose.model('VoteTracking', VoteTrackingSchema);
