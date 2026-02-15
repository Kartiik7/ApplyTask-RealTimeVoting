const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true
    },
    votes: {
        type: Number,
        default: 0
    }
});

const PollSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, 'Please add a question'],
        trim: true
    },
    options: {
        type: [OptionSchema],
        validate: [arrayLimit, '{PATH} must have at least 2 options']
    },
    totalVotes: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

function arrayLimit(val) {
    return val.length >= 2;
}

module.exports = mongoose.model('Poll', PollSchema);
