const Poll = require('../models/Poll');
const VoteTracking = require('../models/VoteTracking');
const { getIO } = require('../socket'); // Import getIO to emit events
const crypto = require('crypto');

// @desc    Create a new poll
// @route   POST /api/polls
// @access  Public
exports.createPoll = async (req, res) => {
    try {
        const { question, options } = req.body;

        if (!question || !options || options.length < 2) {
            return res.status(400).json({ success: false, error: 'Question and at least 2 options are required' });
        }

        // Clean options: trim and remove empty/duplicates
        const cleanedOptions = options
            .map(opt => opt.trim())
            .filter(opt => opt.length > 0);
        
        const uniqueOptions = [...new Set(cleanedOptions)];

        if (uniqueOptions.length < 2) {
            return res.status(400).json({ success: false, error: 'At least 2 unique non-empty options are required' });
        }

        const formattedOptions = uniqueOptions.map(opt => ({ text: opt, votes: 0 }));

        const poll = await Poll.create({
            question: question.trim(),
            options: formattedOptions
        });

        res.status(201).json({ success: true, link: `/poll/${poll._id}`, poll });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get poll by ID
// @route   GET /api/polls/:id
// @access  Public
exports.getPoll = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);

        if (!poll) {
            return res.status(404).json({ success: false, error: 'Poll not found' });
        }

        res.status(200).json({ success: true, poll });
    } catch (err) {
        // Check for CastError (invalid ObjectId)
        if (err.name === 'CastError') {
             return res.status(404).json({ success: false, error: 'Poll not found' });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Vote on a poll
// @route   POST /api/polls/:id/vote
// @access  Public
exports.votePoll = async (req, res) => {
    try {
        const { optionIndex, voteToken } = req.body;
        const pollId = req.params.id;
        
        // Strict validation: voteToken is required
        if (!voteToken || typeof voteToken !== 'string' || voteToken.trim().length === 0) {
            return res.status(400).json({ success: false, error: 'Valid vote token is required' });
        }

        // Hash the token for storage/comparison
        const tokenHash = crypto.createHash('sha256').update(voteToken.trim()).digest('hex');

        // Check if poll exists first
        const poll = await Poll.findById(pollId);
        if (!poll) {
            return res.status(404).json({ success: false, error: 'Poll not found' });
        }

        // Validate option index
        if (optionIndex < 0 || optionIndex >= poll.options.length) {
            return res.status(400).json({ success: false, error: 'Invalid option' });
        }

        // Record vote tracking first - let unique index prevent duplicates
        // This is race-condition safe and cleaner
        try {
            await VoteTracking.create({ pollId, tokenHash });
        } catch (trackingError) {
            // Handle duplicate key error (11000)
            if (trackingError.code === 11000) {
                return res.status(403).json({ success: false, error: 'You have already voted in this poll' });
            }
            throw trackingError; // Re-throw other errors
        }

        // Atomic update of Poll
        // Using $inc to ensure atomicity
        const updatedPoll = await Poll.findByIdAndUpdate(
            pollId,
            { 
                $inc: { 
                    [`options.${optionIndex}.votes`]: 1, 
                    totalVotes: 1 
                } 
            },
            { returnDocument: 'after' }
        );

        // Emit socket event
        try {
             getIO().to(pollId).emit('updateResults', updatedPoll); 
        } catch (socketErr) {
            console.error("Socket emit failed", socketErr);
            // Continue execution, don't fail request
        }

        res.status(200).json({ success: true, poll: updatedPoll });

    } catch (err) {
        console.error(err);
        if (err.code === 11000) { // Duplicate key error from VoteTracking despite check
             return res.status(403).json({ success: false, error: 'You have already voted' });
        }
        if (err.name === 'CastError') {
             return res.status(404).json({ success: false, error: 'Poll not found' });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
